'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Download, Eye, MessageSquare, RefreshCw, Search, Star, Wand2 } from 'lucide-react';

type FeedbackType = 'rating' | 'suggestion' | 'bug' | 'general';
type FeedbackStatus = 'new' | 'in_review' | 'resolved' | 'dismissed';
type NoteTemplateId = 'bug_fix' | 'ux_fix' | 'data_fix' | 'need_info' | 'resolved';

interface FeedbackItem {
  id: string;
  user_id?: string | null;
  type: FeedbackType;
  rating?: number | null;
  message: string;
  email?: string | null;
  context?: Record<string, unknown> | null;
  url?: string | null;
  status: FeedbackStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    username?: string;
    email?: string;
    personality_type?: string;
  };
  reviewer?: {
    username?: string;
    email?: string;
  };
}

interface FeedbackStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageRating: number;
}

interface FeedbackInsights {
  unresolved: number;
  bugRate: number;
  activeFeedbackUsers: number;
  repeatFeedbackUsers: number;
  topPages: Array<{ name: string; count: number }>;
  topFeatures: Array<{ name: string; count: number }>;
  topActivityTypes: Array<{ name: string; count: number }>;
  trend14d: Array<{ date: string; count: number }>;
  pipeline30d?: {
    windowDays: number;
    newUsers: number;
    activeUsers: number;
    feedbackUsers: number;
    repeatFeedbackUsers: number;
    activationRate: number;
    feedbackRate: number;
    repeatRate: number;
  };
}

interface FeedbackResponse {
  success: boolean;
  data: FeedbackItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: FeedbackStats;
  insights: FeedbackInsights;
}

interface WeeklyIssue {
  categoryId: string;
  category: string;
  count: number;
  unresolved: number;
  bugCount: number;
  averageRating: number | null;
  score: number;
  priority: 'P1' | 'P2' | 'P3';
  recommendation: string;
}

interface WeeklyAction {
  priority: 'P1' | 'P2' | 'P3';
  title: string;
  why: string;
  how: string;
  order: number;
}

interface WeeklySummaryResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  totals: {
    feedbackCount: number;
    unresolvedCount: number;
    resolvedCount: number;
    bugCount: number;
    averageRating: number;
    weekOverWeekChange: number;
  };
  topIssues: WeeklyIssue[];
  topPages: Array<{ name: string; count: number }>;
  topFeatures: Array<{ name: string; count: number }>;
  trend: Array<{ date: string; count: number }>;
  summaryText: string;
  actionPlan: WeeklyAction[];
}

interface FiltersState {
  type: 'all' | FeedbackType;
  status: 'all' | FeedbackStatus;
  search: string;
  startDate: string;
  endDate: string;
}

const statusLabels: Record<FeedbackStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

const typeLabels: Record<FeedbackType, string> = {
  rating: 'Rating',
  suggestion: 'Suggestion',
  bug: 'Bug',
  general: 'General',
};

const statusBadgeClass: Record<FeedbackStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dismissed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const noteTemplateLabels: Record<NoteTemplateId, string> = {
  bug_fix: 'Bug Fix Template',
  ux_fix: 'UX Template',
  data_fix: 'Data Template',
  need_info: 'Need Info Template',
  resolved: 'Resolved Template',
};

function getDateWithOffset(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function buildNoteTemplate(templateId: NoteTemplateId, item: FeedbackItem) {
  const page = typeof item.context?.page === 'string' ? item.context.page : 'unknown';
  const feature = typeof item.context?.feature === 'string' ? item.context.feature : 'unknown';
  const dueDate = getDateWithOffset(7);

  if (templateId === 'bug_fix') {
    return [
      '[Root Cause]',
      `- Related page/feature: ${page} / ${feature}`,
      '- Problem detail:',
      '',
      '[Action Taken]',
      '- Fix implemented:',
      '',
      '[Verification]',
      '- Reproduced before fix: yes/no',
      '- Verified after fix: yes/no',
      '',
      '[Follow-up]',
      '- Owner:',
      `- Due Date: ${dueDate}`,
    ].join('\n');
  }

  if (templateId === 'ux_fix') {
    return [
      '[User Friction]',
      `- Context: ${page} / ${feature}`,
      '- Pain point:',
      '',
      '[UX Change]',
      '- Planned improvement:',
      '',
      '[Success Metric]',
      '- Target metric (CTR, completion rate, etc.):',
      `- Check Date: ${dueDate}`,
    ].join('\n');
  }

  if (templateId === 'data_fix') {
    return [
      '[Data Issue]',
      `- Affected scope: ${page} / ${feature}`,
      '- Wrong/missing field:',
      '',
      '[Correction Plan]',
      '- Source of truth:',
      '- Backfill needed: yes/no',
      '',
      '[Verification]',
      '- Recheck query completed:',
      `- Due Date: ${dueDate}`,
    ].join('\n');
  }

  if (templateId === 'need_info') {
    return [
      '[Need More Info]',
      '- Additional user detail required:',
      '- Reproduction steps required:',
      '',
      '[Requested Follow-up]',
      '- Contact channel:',
      `- Follow-up Date: ${dueDate}`,
    ].join('\n');
  }

  return [
    '[Resolution Summary]',
    '- Final resolution:',
    '- User impact:',
    '',
    '[Validation]',
    '- Regression check:',
    '- Monitoring plan:',
    '',
    '[Closeout]',
    `- Closed Date: ${new Date().toISOString().slice(0, 10)}`,
  ].join('\n');
}

export function FeedbackManager() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [insights, setInsights] = useState<FeedbackInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({
    type: 'all',
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const sortBy = 'created_at';
  const sortOrder: 'asc' | 'desc' = 'desc';

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.search.trim()) params.set('search', filters.search.trim());
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);
      const result: FeedbackResponse | { error: string } = await response.json();

      if (!response.ok || !('success' in result) || !result.success) {
        throw new Error('error' in result ? result.error : 'Failed to load feedback');
      }

      setFeedback(result.data);
      setPagination(result.pagination);
      setStats(result.statistics);
      setInsights(result.insights);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to load feedback';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

  const fetchWeeklySummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const response = await fetch('/api/admin/feedback/weekly-summary?days=7');
      const result: WeeklySummaryResponse | { error: string } = await response.json();

      if (!response.ok || !('success' in result) || !result.success) {
        throw new Error('error' in result ? result.error : 'Failed to load weekly summary');
      }

      setWeeklySummary(result);
    } catch (summaryError) {
      const message = summaryError instanceof Error ? summaryError.message : 'Failed to load weekly summary';
      setError(message);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    fetchWeeklySummary();
  }, [fetchWeeklySummary]);

  const unresolvedCount = useMemo(() => {
    if (!stats) return 0;
    return (stats.byStatus.new || 0) + (stats.byStatus.in_review || 0);
  }, [stats]);

  const onFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openDetail = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setNotesDraft(item.admin_notes || '');
  };

  const closeDetail = () => {
    setSelectedFeedback(null);
    setNotesDraft('');
  };

  const insertTemplate = (templateId: NoteTemplateId) => {
    if (!selectedFeedback) return;
    const template = buildNoteTemplate(templateId, selectedFeedback);
    setNotesDraft((prev) => (prev.trim() ? `${prev}\n\n${template}` : template));
  };

  const updateFeedbackStatus = async (status: FeedbackStatus) => {
    if (!selectedFeedback) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFeedback.id,
          status,
          admin_notes: notesDraft,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update feedback');
      }

      await fetchFeedback();
      await fetchWeeklySummary();
      closeDetail();
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Failed to update feedback';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams({ export: 'csv', sortBy, sortOrder });
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.search.trim()) params.set('search', filters.search.trim());
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export CSV');

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `feedback-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      const message = exportError instanceof Error ? exportError.message : 'Failed to export CSV';
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold inline-flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Weekly Auto Summary
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Last 7 days issue ranking and recommended action order.
            </p>
          </div>
          <button
            onClick={fetchWeeklySummary}
            disabled={summaryLoading}
            className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${summaryLoading ? 'animate-spin' : ''}`} />
            Refresh Summary
          </button>
        </div>

        {summaryLoading && <p className="text-sm text-gray-300">Building summary...</p>}

        {weeklySummary && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <StatCard label="Weekly Feedback" value={weeklySummary.totals.feedbackCount} tone="slate" />
              <StatCard label="Unresolved" value={weeklySummary.totals.unresolvedCount} tone="amber" />
              <StatCard label="Bugs" value={weeklySummary.totals.bugCount} tone="blue" />
              <StatCard label="Avg Rating" value={weeklySummary.totals.averageRating.toFixed(2)} tone="emerald" />
              <StatCard
                label="WoW Change"
                value={`${weeklySummary.totals.weekOverWeekChange > 0 ? '+' : ''}${weeklySummary.totals.weekOverWeekChange}%`}
                tone={weeklySummary.totals.weekOverWeekChange > 0 ? 'amber' : 'emerald'}
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-sm text-gray-100">{weeklySummary.summaryText}</p>
              <p className="text-xs text-gray-400 mt-2">
                Period: {weeklySummary.period.startDate} to {weeklySummary.period.endDate}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <h3 className="text-sm text-gray-200 mb-2">Top Issues</h3>
                <div className="space-y-3">
                  {weeklySummary.topIssues.length === 0 && (
                    <p className="text-xs text-gray-400">No issues detected this week.</p>
                  )}
                  {weeklySummary.topIssues.map((issue) => (
                    <div key={issue.categoryId} className="border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-white font-medium">{issue.category}</p>
                        <PriorityBadge priority={issue.priority} />
                      </div>
                      <p className="text-xs text-gray-300">
                        Reports {issue.count} / Unresolved {issue.unresolved} / Bugs {issue.bugCount}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{issue.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <h3 className="text-sm text-gray-200 mb-2">Recommended Action Order</h3>
                <div className="space-y-3">
                  {weeklySummary.actionPlan.length === 0 && (
                    <p className="text-xs text-gray-400">No action items generated.</p>
                  )}
                  {weeklySummary.actionPlan.map((action) => (
                    <div key={`${action.order}-${action.title}`} className="border border-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-300">#{action.order}</span>
                        <PriorityBadge priority={action.priority} />
                        <p className="text-sm text-white">{action.title}</p>
                      </div>
                      <p className="text-xs text-gray-300">{action.why}</p>
                      <p className="text-xs text-gray-400 mt-1">{action.how}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Feedback" value={stats?.total ?? 0} tone="slate" />
        <StatCard label="Unresolved" value={unresolvedCount} tone="amber" />
        <StatCard label="Resolved" value={stats?.byStatus.resolved || 0} tone="emerald" />
        <StatCard
          label="Average Rating"
          value={stats?.averageRating ? stats.averageRating.toFixed(2) : '0.00'}
          tone="blue"
        />
      </section>

      {insights && (
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {insights.pipeline30d ? <PipelineCard pipeline={insights.pipeline30d} /> : null}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm text-gray-300 mb-2">Quality Signals</h3>
            <p className="text-white text-2xl font-semibold mb-2">{insights.bugRate}%</p>
            <p className="text-xs text-gray-400">Bug report ratio in current filter scope.</p>
            <p className="text-xs text-gray-400 mt-2">
              Repeat feedback users: {insights.repeatFeedbackUsers} / {insights.activeFeedbackUsers}
            </p>
          </div>
          <TopListCard title="Top Pages" items={insights.topPages} />
          <TopListCard title="Top Features" items={insights.topFeatures} />
          <TopListCard title="Top Activity Types (30d)" items={insights.topActivityTypes} />
        </section>
      )}

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value as FiltersState['type'])}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white"
          >
            <option value="all">All Types</option>
            <option value="rating">Rating</option>
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug</option>
            <option value="general">General</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value as FiltersState['status'])}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white"
          />

          <div className="md:col-span-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                placeholder="Search message or email"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={fetchFeedback}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-xl border border-red-300/30 bg-red-500/10 text-red-100 px-4 py-3">
          {error}
        </section>
      )}

      <section className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white/10 text-xs uppercase tracking-wider text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">Context</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-300">
                    Loading feedback...
                  </td>
                </tr>
              )}

              {!loading && feedback.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-300">
                    No feedback found for current filters.
                  </td>
                </tr>
              )}

              {!loading && feedback.map((item) => {
                const page = typeof item.context?.page === 'string' ? item.context.page : 'unknown';
                const feature = typeof item.context?.feature === 'string' ? item.context.feature : 'unknown';
                return (
                  <tr key={item.id} className="hover:bg-white/10">
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm text-white">{typeLabels[item.type]}</div>
                      {item.rating ? (
                        <div className="text-xs text-amber-300 inline-flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-current" />
                          {item.rating}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-sm text-white line-clamp-2">{item.message}</p>
                      {item.email ? (
                        <p className="text-xs text-gray-400 mt-1">{item.email}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-xs text-gray-300">Page: {page}</p>
                      <p className="text-xs text-gray-400">Feature: {feature}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs ${statusBadgeClass[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-gray-300">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        onClick={() => openDetail(item)}
                        className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-sm text-gray-300">
          <div>
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} / ${pagination.total}`
              : '0'}
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="px-3 py-1 rounded bg-white/10 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-1 rounded bg-white/10 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selectedFeedback && (
        <section className="fixed inset-0 bg-black/50 z-50 p-4 md:p-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto rounded-xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white inline-flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Feedback Detail
                </h3>
                <p className="text-sm text-gray-400 mt-1">{selectedFeedback.id}</p>
              </div>
              <button
                onClick={closeDetail}
                className="text-sm px-3 py-1 rounded bg-white/10 text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Type" value={typeLabels[selectedFeedback.type]} />
                <InfoRow label="Status" value={statusLabels[selectedFeedback.status]} />
                <InfoRow label="Rating" value={selectedFeedback.rating ? String(selectedFeedback.rating) : '-'} />
                <InfoRow label="Created" value={new Date(selectedFeedback.created_at).toLocaleString()} />
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-1">Message</p>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-1">Context</p>
                <pre className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-gray-200 overflow-x-auto">
                  {JSON.stringify(selectedFeedback.context || {}, null, 2)}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-300">Admin Notes</p>
                  <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    Template Insert
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(Object.keys(noteTemplateLabels) as NoteTemplateId[]).map((templateId) => (
                    <button
                      key={templateId}
                      onClick={() => insertTemplate(templateId)}
                      className="px-2 py-1 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-xs text-white"
                    >
                      {noteTemplateLabels[templateId]}
                    </button>
                  ))}
                  <button
                    onClick={() => setNotesDraft('')}
                    className="px-2 py-1 rounded border border-white/20 bg-slate-700 hover:bg-slate-600 text-xs text-white"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={9}
                  className="w-full rounded-lg border border-white/15 bg-white/10 text-white px-3 py-2"
                  placeholder="Add notes about root cause, decision, and action item."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  disabled={saving}
                  onClick={() => updateFeedbackStatus('in_review')}
                  className="px-3 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                >
                  Mark In Review
                </button>
                <button
                  disabled={saving}
                  onClick={() => updateFeedbackStatus('resolved')}
                  className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                  Mark Resolved
                </button>
                <button
                  disabled={saving}
                  onClick={() => updateFeedbackStatus('dismissed')}
                  className="px-3 py-2 rounded bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: 'P1' | 'P2' | 'P3' }) {
  const colorClass = {
    P1: 'bg-red-500/20 text-red-200 border-red-300/30',
    P2: 'bg-amber-500/20 text-amber-200 border-amber-300/30',
    P3: 'bg-blue-500/20 text-blue-200 border-blue-300/30',
  }[priority];

  return <span className={`text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>{priority}</span>;
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone: 'slate' | 'amber' | 'emerald' | 'blue' }) {
  const toneClass = {
    slate: 'border-slate-300/20 bg-slate-500/15 text-slate-100',
    amber: 'border-amber-300/20 bg-amber-500/15 text-amber-100',
    emerald: 'border-emerald-300/20 bg-emerald-500/15 text-emerald-100',
    blue: 'border-blue-300/20 bg-blue-500/15 text-blue-100',
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function TopListCard({ title, items }: { title: string; items: Array<{ name: string; count: number }> }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm text-gray-300 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-gray-500">No data yet.</p>}
        {items.map((item) => (
          <div key={`${title}-${item.name}`} className="flex items-center justify-between text-sm">
            <span className="text-gray-200 truncate pr-3">{item.name}</span>
            <span className="text-white font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineCard({
  pipeline,
}: {
  pipeline: {
    windowDays: number;
    newUsers: number;
    activeUsers: number;
    feedbackUsers: number;
    repeatFeedbackUsers: number;
    activationRate: number;
    feedbackRate: number;
    repeatRate: number;
  };
}) {
  const maxValue = Math.max(1, pipeline.newUsers, pipeline.activeUsers, pipeline.feedbackUsers, pipeline.repeatFeedbackUsers);
  const rows = [
    { label: 'New Users', value: pipeline.newUsers, sub: '100.0%' },
    { label: 'Active Users', value: pipeline.activeUsers, sub: `${pipeline.activationRate.toFixed(1)}% of new` },
    { label: 'Feedback Users', value: pipeline.feedbackUsers, sub: `${pipeline.feedbackRate.toFixed(1)}% of active` },
    { label: 'Repeat Feedback', value: pipeline.repeatFeedbackUsers, sub: `${pipeline.repeatRate.toFixed(1)}% of feedback` },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
      <h3 className="text-sm text-gray-300 mb-1">30d Funnel Snapshot</h3>
      <p className="text-xs text-gray-500 mb-3">Last {pipeline.windowDays} days</p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-300">{row.label}</span>
              <span className="text-white font-medium">{row.value}</span>
            </div>
            <div className="h-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-blue-500/80"
                style={{ width: `${Math.max(4, (row.value / maxValue) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">{row.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-white mt-1">{value}</p>
    </div>
  );
}
