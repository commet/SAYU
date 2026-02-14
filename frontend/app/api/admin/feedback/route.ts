import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type FeedbackType = 'rating' | 'suggestion' | 'bug' | 'general';
type FeedbackStatus = 'new' | 'in_review' | 'resolved' | 'dismissed';

interface FeedbackRow {
  id: string;
  user_id: string | null;
  type: FeedbackType;
  rating: number | null;
  message: string;
  email: string | null;
  context: Record<string, unknown> | null;
  user_agent?: string | null;
  url?: string | null;
  client_ip?: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityRow {
  user_id: string;
  activity_type: string;
}

interface UserIdRow {
  user_id: string | null;
}

interface FeedbackFilters {
  type?: FeedbackType;
  status?: FeedbackStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface PipelineSnapshot {
  windowDays: number;
  newUsers: number;
  activeUsers: number;
  feedbackUsers: number;
  repeatFeedbackUsers: number;
  activationRate: number;
  feedbackRate: number;
  repeatRate: number;
}

const ALLOWED_SORT_COLUMNS = ['created_at', 'updated_at', 'type', 'status', 'rating'] as const;
const ALLOWED_STATUS: FeedbackStatus[] = ['new', 'in_review', 'resolved', 'dismissed'];
const MAX_LIMIT = 100;
type ServerSupabase = Awaited<ReturnType<typeof createClient>>;
interface QueryChain {
  eq: (column: string, value: unknown) => QueryChain;
  gte: (column: string, value: string) => QueryChain;
  lte: (column: string, value: string) => QueryChain;
  or: (condition: string) => QueryChain;
}

function normalizeDateBoundary(rawDate: string | null, mode: 'start' | 'end'): string | undefined {
  if (!rawDate) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return undefined;

  const time = mode === 'start' ? 'T00:00:00.000Z' : 'T23:59:59.999Z';
  const parsed = new Date(`${rawDate}${time}`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function normalizeSearchKeyword(rawSearch: string | null): string | undefined {
  if (!rawSearch) return undefined;
  const trimmed = rawSearch.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 120);
}

function normalizeFilters(searchParams: URLSearchParams): FeedbackFilters {
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  return {
    type: type && type !== 'all' ? (type as FeedbackType) : undefined,
    status: status && status !== 'all' ? (status as FeedbackStatus) : undefined,
    startDate: normalizeDateBoundary(searchParams.get('startDate'), 'start'),
    endDate: normalizeDateBoundary(searchParams.get('endDate'), 'end'),
    search: normalizeSearchKeyword(searchParams.get('search')),
  };
}

function applyFeedbackFilters<T>(query: T, filters: FeedbackFilters): T {
  let nextQuery = query as unknown as QueryChain;

  if (filters.type) nextQuery = nextQuery.eq('type', filters.type);
  if (filters.status) nextQuery = nextQuery.eq('status', filters.status);
  if (filters.startDate) nextQuery = nextQuery.gte('created_at', filters.startDate);
  if (filters.endDate) nextQuery = nextQuery.lte('created_at', filters.endDate);
  if (filters.search) {
    const s = filters.search.replace(/[%_\\]/g, '\\$&').replace(/,/g, ' ');
    nextQuery = nextQuery.or(`message.ilike.%${s}%,email.ilike.%${s}%`);
  }
  return nextQuery as unknown as T;
}

function extractContextValue(context: Record<string, unknown> | null, key: string): string {
  const value = context?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : 'unknown';
}

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

async function requireAdmin(supabase: ServerSupabase) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true as const, userId: user.id };
}

async function fetchFeedbackRows(supabase: ServerSupabase, filters: FeedbackFilters, options: {
  includeRelations: boolean;
  orderBy: string;
  ascending: boolean;
  page?: number;
  limit?: number;
  count?: boolean;
  selectColumns?: string;
}) {
  const selectWithRelations = `
    id,
    user_id,
    type,
    rating,
    message,
    email,
    context,
    url,
    status,
    admin_notes,
    reviewed_by,
    reviewed_at,
    created_at,
    updated_at,
    user:profiles!feedback_user_id_fkey(username, email, personality_type),
    reviewer:profiles!feedback_reviewed_by_fkey(username, email)
  `;

  const selectFallback = '*';
  const selectColumns = options.selectColumns || (options.includeRelations ? selectWithRelations : selectFallback);
  let query = supabase
    .from('feedback')
    .select(selectColumns, { count: options.count ? 'exact' : undefined });

  query = applyFeedbackFilters(query, filters);
  query = query.order(options.orderBy, { ascending: options.ascending });

  if (options.page && options.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const result = await query;

  if (result.error && options.includeRelations) {
    let fallbackQuery = supabase
      .from('feedback')
      .select(selectFallback, { count: options.count ? 'exact' : undefined });
    fallbackQuery = applyFeedbackFilters(fallbackQuery, filters);
    fallbackQuery = fallbackQuery.order(options.orderBy, { ascending: options.ascending });

    if (options.page && options.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      fallbackQuery = fallbackQuery.range(from, to);
    }

    return fallbackQuery;
  }

  return result;
}

function buildInsights(rows: FeedbackRow[], activityRows: ActivityRow[]) {
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byPage: Record<string, number> = {};
  const byFeature: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};
  const userFeedbackCount: Record<string, number> = {};
  const activityTypeCount: Record<string, number> = {};

  let ratingSum = 0;
  let ratingCount = 0;

  rows.forEach((row) => {
    byType[row.type] = (byType[row.type] || 0) + 1;
    byStatus[row.status] = (byStatus[row.status] || 0) + 1;

    const page = extractContextValue(row.context, 'page');
    const feature = extractContextValue(row.context, 'feature');
    if (page !== 'unknown') {
      byPage[page] = (byPage[page] || 0) + 1;
    }
    if (feature !== 'unknown') {
      byFeature[feature] = (byFeature[feature] || 0) + 1;
    }

    if (row.rating && row.rating > 0) {
      ratingSum += row.rating;
      ratingCount += 1;
    }

    if (row.user_id) {
      userFeedbackCount[row.user_id] = (userFeedbackCount[row.user_id] || 0) + 1;
    }

    const dayKey = row.created_at.slice(0, 10);
    dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
  });

  activityRows.forEach((row) => {
    activityTypeCount[row.activity_type] = (activityTypeCount[row.activity_type] || 0) + 1;
  });

  const now = new Date();
  const last14Days: Array<{ date: string; count: number }> = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last14Days.push({ date: key, count: dailyCounts[key] || 0 });
  }

  const unresolved = (byStatus.new || 0) + (byStatus.in_review || 0);
  const bugCount = byType.bug || 0;

  const topPages = Object.entries(byPage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topFeatures = Object.entries(byFeature)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topActivityTypes = Object.entries(activityTypeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const activeFeedbackUsers = Object.keys(userFeedbackCount).length;
  const repeatFeedbackUsers = Object.values(userFeedbackCount).filter((count) => count >= 2).length;

  return {
    total: rows.length,
    byType,
    byStatus,
    averageRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0,
    unresolved,
    bugRate: rows.length > 0 ? Number(((bugCount / rows.length) * 100).toFixed(1)) : 0,
    activeFeedbackUsers,
    repeatFeedbackUsers,
    topPages,
    topFeatures,
    topActivityTypes,
    trend14d: last14Days,
  };
}

function buildCsv(rows: FeedbackRow[]) {
  const header = [
    'id',
    'created_at',
    'type',
    'status',
    'rating',
    'message',
    'email',
    'context_page',
    'context_feature',
    'url',
    'admin_notes',
    'reviewed_at',
  ];

  const lines = rows.map((row) => [
    row.id,
    row.created_at,
    row.type,
    row.status,
    row.rating,
    row.message,
    row.email,
    extractContextValue(row.context, 'page'),
    extractContextValue(row.context, 'feature'),
    row.url,
    row.admin_notes,
    row.reviewed_at,
  ].map(toCsvValue).join(','));

  return [header.join(','), ...lines].join('\n');
}

async function buildPipelineSnapshot(supabase: ServerSupabase, windowDays = 30): Promise<PipelineSnapshot> {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  const sinceIso = since.toISOString();

  const [newUsersResult, activeUsersResult, feedbackUsersResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sinceIso),
    supabase
      .from('user_activities')
      .select('user_id')
      .gte('created_at', sinceIso)
      .not('user_id', 'is', null),
    supabase
      .from('feedback')
      .select('user_id')
      .gte('created_at', sinceIso)
      .not('user_id', 'is', null),
  ]);

  const newUsers = newUsersResult.error ? 0 : (newUsersResult.count || 0);

  const activeUserSet = new Set(
    ((activeUsersResult.data || []) as UserIdRow[])
      .map((row) => row.user_id)
      .filter((value): value is string => Boolean(value))
  );

  const feedbackUserIds = ((feedbackUsersResult.data || []) as UserIdRow[])
    .map((row) => row.user_id)
    .filter((value): value is string => Boolean(value));
  const feedbackUserSet = new Set(feedbackUserIds);

  const feedbackCountByUser: Record<string, number> = {};
  feedbackUserIds.forEach((userId) => {
    feedbackCountByUser[userId] = (feedbackCountByUser[userId] || 0) + 1;
  });

  const activeUsers = activeUserSet.size;
  const feedbackUsers = feedbackUserSet.size;
  const repeatFeedbackUsers = Object.values(feedbackCountByUser).filter((count) => count >= 2).length;

  const activationRate = newUsers > 0 ? Number(((activeUsers / newUsers) * 100).toFixed(1)) : 0;
  const feedbackRate = activeUsers > 0 ? Number(((feedbackUsers / activeUsers) * 100).toFixed(1)) : 0;
  const repeatRate = feedbackUsers > 0 ? Number(((repeatFeedbackUsers / feedbackUsers) * 100).toFixed(1)) : 0;

  return {
    windowDays,
    newUsers,
    activeUsers,
    feedbackUsers,
    repeatFeedbackUsers,
    activationRate,
    feedbackRate,
    repeatRate,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (!auth.ok) return auth.response;

    const searchParams = request.nextUrl.searchParams;
    const filters = normalizeFilters(searchParams);
    const exportFormat = searchParams.get('export');

    const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const rawLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), MAX_LIMIT);

    const rawSortBy = searchParams.get('sortBy') || 'created_at';
    const sortBy = ALLOWED_SORT_COLUMNS.includes(rawSortBy as (typeof ALLOWED_SORT_COLUMNS)[number])
      ? rawSortBy
      : 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    if (exportFormat === 'csv') {
      const exportResult = await fetchFeedbackRows(supabase, filters, {
        includeRelations: false,
        orderBy: sortBy,
        ascending: sortOrder === 'asc',
        selectColumns: 'id, created_at, type, status, rating, message, email, context, url, admin_notes, reviewed_at',
      });

      if (exportResult.error) throw exportResult.error;

      const csv = buildCsv((exportResult.data || []) as FeedbackRow[]);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const pageResult = await fetchFeedbackRows(supabase, filters, {
      includeRelations: true,
      orderBy: sortBy,
      ascending: sortOrder === 'asc',
      page,
      limit,
      count: true,
    });

    if (pageResult.error) throw pageResult.error;

    const statsResult = await fetchFeedbackRows(supabase, filters, {
      includeRelations: false,
      orderBy: 'created_at',
      ascending: false,
      selectColumns: 'id, user_id, type, status, rating, context, created_at',
    });

    if (statsResult.error) throw statsResult.error;

    const fullRows = (statsResult.data || []) as FeedbackRow[];
    const feedbackUserIds = Array.from(
      new Set(fullRows.map((row) => row.user_id).filter((value): value is string => Boolean(value)))
    );

    let activityRows: ActivityRow[] = [];
    if (feedbackUserIds.length > 0) {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const activitiesResult = await supabase
        .from('user_activities')
        .select('user_id, activity_type')
        .in('user_id', feedbackUserIds)
        .gte('created_at', since.toISOString());

      if (!activitiesResult.error) {
        activityRows = (activitiesResult.data || []) as ActivityRow[];
      }
    }

    const insights = buildInsights(fullRows, activityRows);
    const pipeline30d = await buildPipelineSnapshot(supabase, 30);
    const total = pageResult.count || 0;

    return NextResponse.json({
      success: true,
      data: pageResult.data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      statistics: {
        total: insights.total,
        byType: insights.byType,
        byStatus: insights.byStatus,
        averageRating: insights.averageRating,
      },
      insights: {
        unresolved: insights.unresolved,
        bugRate: insights.bugRate,
        activeFeedbackUsers: insights.activeFeedbackUsers,
        repeatFeedbackUsers: insights.repeatFeedbackUsers,
        topPages: insights.topPages,
        topFeatures: insights.topFeatures,
        topActivityTypes: insights.topActivityTypes,
        trend14d: insights.trend14d,
        pipeline30d,
      },
    });
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const id = body.id as string | undefined;
    const status = body.status as FeedbackStatus | undefined;
    const adminNotes = (body.admin_notes ?? body.adminNotes) as string | undefined;

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      updateData.reviewed_by = auth.userId;
      updateData.reviewed_at = new Date().toISOString();
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to update feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (!auth.ok) return auth.response;

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete feedback:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
