import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type FeedbackType = 'rating' | 'suggestion' | 'bug' | 'general';
type FeedbackStatus = 'new' | 'in_review' | 'resolved' | 'dismissed';

interface FeedbackRow {
  id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  rating: number | null;
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
}

interface CategoryRule {
  id: string;
  label: string;
  recommendation: string;
  patterns: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    id: 'auth',
    label: 'Authentication & Access',
    recommendation: 'Audit login/session flow and add targeted error recovery for failed auth states.',
    patterns: [
      'login',
      'log in',
      'sign in',
      'signin',
      'auth',
      'token',
      'session',
      'logout',
      'password',
      'permission',
      'access',
      '\ub85c\uadf8\uc778',
      '\ub85c\uadf8\uc544\uc6c3',
      '\ube44\ubc00\ubc88\ud638',
      '\uad8c\ud55c',
      '\uc138\uc158',
      '\uc778\uc99d',
      '\uc811\uadfc',
    ],
  },
  {
    id: 'performance',
    label: 'Performance & Speed',
    recommendation: 'Profile slow endpoints and optimize top latency contributors first.',
    patterns: [
      'slow',
      'lag',
      'latency',
      'loading',
      'delay',
      'timeout',
      'speed',
      'performance',
      '\ub290\ub9bc',
      '\ub85c\ub529',
      '\uc18d\ub3c4',
      '\uc9c0\uc5f0',
      '\uc131\ub2a5',
      '\ubc84\ubc85',
      '\ub809',
    ],
  },
  {
    id: 'recommendation',
    label: 'Recommendation Quality',
    recommendation: 'Tune recommendation weights and add explanation labels for transparency.',
    patterns: [
      'recommend',
      'recommendation',
      'reco',
      'match',
      'matching',
      'relevance',
      'personalized',
      '\ucd94\ucc9c',
      '\ub9e4\uce6d',
      '\uac1c\uc778\ud654',
      '\uc815\ud655\ub3c4',
      '\ub9de\ucda4\ud615',
    ],
  },
  {
    id: 'ui',
    label: 'UI & Usability',
    recommendation: 'Prioritize UI fixes on the most affected pages and validate with quick usability checks.',
    patterns: [
      'ui',
      'ux',
      'button',
      'layout',
      'design',
      'screen',
      'flow',
      'navigation',
      'confusing',
      '\ub514\uc790\uc778',
      '\ubc84\ud2bc',
      '\ud654\uba74',
      '\ub808\uc774\uc544\uc6c3',
      '\ub124\ube44\uac8c\uc774\uc158',
      '\uc778\ud130\ud398\uc774\uc2a4',
      '\uba54\ub274',
    ],
  },
  {
    id: 'data',
    label: 'Data Quality',
    recommendation: 'Add validation and fallback handling for missing or stale exhibition metadata.',
    patterns: [
      'data',
      'wrong',
      'incorrect',
      'empty',
      'null',
      'date',
      'missing',
      'stale',
      'sync',
      '\ub370\uc774\ud130',
      '\uc624\ub958',
      '\ud2c0\ub9bc',
      '\ub0a0\uc9dc',
      '\ube44\uc5b4\uc788\uc74c',
      '\ub3d9\uae30\ud654',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile Experience',
    recommendation: 'Validate responsive breakpoints and interaction behavior on high-traffic mobile flows.',
    patterns: [
      'mobile',
      'ios',
      'android',
      'responsive',
      'tablet',
      'viewport',
      'touch',
      'gesture',
      '\ubaa8\ubc14\uc77c',
      '\uc2a4\ub9c8\ud2b8\ud3f0',
      '\ud130\uce58',
      '\uc2a4\ud06c\ub9b0',
      '\uc544\uc774\ud3f0',
      '\uc548\ub4dc\ub85c\uc774\ub4dc',
    ],
  },
];

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toSearchableText(row: FeedbackRow) {
  const page = typeof row.context?.page === 'string' ? row.context.page : '';
  const feature = typeof row.context?.feature === 'string' ? row.context.feature : '';
  return `${row.message} ${page} ${feature}`.toLowerCase();
}

function classifyFeedback(row: FeedbackRow): CategoryRule {
  const searchable = toSearchableText(row);
  const matched = CATEGORY_RULES.find((rule) =>
    rule.patterns.some((pattern) => searchable.includes(pattern.toLowerCase()))
  );
  if (matched) return matched;
  return {
    id: 'other',
    label: 'Other',
    recommendation: 'Review manually and map to a stable category for future triage.',
    patterns: [],
  };
}

function parseRange(params: URLSearchParams) {
  const rawDays = Number.parseInt(params.get('days') || '7', 10);
  const days = Number.isNaN(rawDays) ? 7 : Math.min(Math.max(rawDays, 3), 30);

  const now = new Date();
  const end = endOfDay(now);
  const start = startOfDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));

  const prevEnd = endOfDay(new Date(start.getTime() - 24 * 60 * 60 * 1000));
  const prevStart = startOfDay(new Date(prevEnd.getTime() - (days - 1) * 24 * 60 * 60 * 1000));

  return { days, start, end, prevStart, prevEnd };
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

  return { ok: true as const };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await requireAdmin(supabase);
    if (!auth.ok) return auth.response;

    const { searchParams } = request.nextUrl;
    const range = parseRange(searchParams);

    const [currentResult, previousResult] = await Promise.all([
      supabase
        .from('feedback')
        .select('id, type, status, rating, message, context, created_at')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('feedback')
        .select('id')
        .gte('created_at', range.prevStart.toISOString())
        .lte('created_at', range.prevEnd.toISOString()),
    ]);

    if (currentResult.error) throw currentResult.error;
    if (previousResult.error) throw previousResult.error;

    const rows = (currentResult.data || []) as FeedbackRow[];
    const previousCount = previousResult.data?.length || 0;

    const byCategory: Record<string, {
      label: string;
      count: number;
      unresolved: number;
      bugCount: number;
      ratingSum: number;
      ratingCount: number;
      recommendation: string;
    }> = {};

    const pageCount: Record<string, number> = {};
    const featureCount: Record<string, number> = {};
    const dailyCount: Record<string, number> = {};

    let unresolvedTotal = 0;
    let bugTotal = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    rows.forEach((row) => {
      const category = classifyFeedback(row);
      if (!byCategory[category.id]) {
        byCategory[category.id] = {
          label: category.label,
          count: 0,
          unresolved: 0,
          bugCount: 0,
          ratingSum: 0,
          ratingCount: 0,
          recommendation: category.recommendation,
        };
      }

      const bucket = byCategory[category.id];
      bucket.count += 1;

      if (row.status === 'new' || row.status === 'in_review') {
        bucket.unresolved += 1;
        unresolvedTotal += 1;
      }

      if (row.type === 'bug') {
        bucket.bugCount += 1;
        bugTotal += 1;
      }

      if (row.rating && row.rating > 0) {
        bucket.ratingSum += row.rating;
        bucket.ratingCount += 1;
        ratingSum += row.rating;
        ratingCount += 1;
      }

      const page = typeof row.context?.page === 'string' ? row.context.page.trim() : '';
      const feature = typeof row.context?.feature === 'string' ? row.context.feature.trim() : '';
      if (page) pageCount[page] = (pageCount[page] || 0) + 1;
      if (feature) featureCount[feature] = (featureCount[feature] || 0) + 1;

      const dayKey = row.created_at.slice(0, 10);
      dailyCount[dayKey] = (dailyCount[dayKey] || 0) + 1;
    });

    const topIssues = Object.entries(byCategory)
      .map(([id, value]) => {
        const avgRating = value.ratingCount > 0 ? value.ratingSum / value.ratingCount : 0;
        const score =
          value.count * 2.2 +
          value.unresolved * 1.8 +
          value.bugCount * 1.6 +
          (avgRating > 0 ? Math.max(0, 5 - avgRating) * 0.8 : 0);

        const priority = score >= 12 ? 'P1' : score >= 7 ? 'P2' : 'P3';
        return {
          categoryId: id,
          category: value.label,
          count: value.count,
          unresolved: value.unresolved,
          bugCount: value.bugCount,
          averageRating: value.ratingCount > 0 ? Number(avgRating.toFixed(2)) : null,
          score: Number(score.toFixed(2)),
          priority,
          recommendation: value.recommendation,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topFeatures = Object.entries(featureCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const trend = Array.from({ length: range.days }).map((_, index) => {
      const date = new Date(range.start);
      date.setDate(range.start.getDate() + index);
      const key = getDateKey(date);
      return { date: key, count: dailyCount[key] || 0 };
    });

    const weekOverWeek = previousCount > 0
      ? Number((((rows.length - previousCount) / previousCount) * 100).toFixed(1))
      : rows.length > 0
        ? 100
        : 0;

    const actionPlan = topIssues.slice(0, 3).map((issue, index) => ({
      priority: issue.priority,
      title: `${issue.category} stabilization`,
      why: `${issue.count} reports, ${issue.unresolved} unresolved in selected week.`,
      how: issue.recommendation,
      order: index + 1,
    }));

    const summaryText = rows.length === 0
      ? 'No feedback was recorded in this period.'
      : `Received ${rows.length} feedback items with ${unresolvedTotal} unresolved cases. Top risk area is ${topIssues[0]?.category || 'N/A'}.`;

    return NextResponse.json({
      success: true,
      period: {
        startDate: getDateKey(range.start),
        endDate: getDateKey(range.end),
        days: range.days,
      },
      totals: {
        feedbackCount: rows.length,
        unresolvedCount: unresolvedTotal,
        resolvedCount: rows.length - unresolvedTotal,
        bugCount: bugTotal,
        averageRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0,
        weekOverWeekChange: weekOverWeek,
      },
      topIssues,
      topPages,
      topFeatures,
      trend,
      summaryText,
      actionPlan,
    });
  } catch (error) {
    console.error('Failed to generate weekly summary:', error);
    return NextResponse.json({ error: 'Failed to generate weekly summary' }, { status: 500 });
  }
}

