'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Clock, Heart, RefreshCw, Trophy, UserCircle, Users } from 'lucide-react';
import { SAYU_TYPES } from '@sayu/shared/SAYUTypeDefinitions';
import { MMCATourMemberStatus } from '@/types/mmca-tour';

interface TeamStatusApiResponse {
  success: boolean;
  data?: {
    members: MMCATourMemberStatus[];
    totalImpressions: number;
  };
  error?: string;
}

const DEMO_MEMBERS: MMCATourMemberStatus[] = [
  {
    memberId: '1',
    oderId: '1',
    username: 'Member A',
    personalityType: 'LAEF',
    impressionCount: 3,
    recommendedArtworksViewed: 2,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: 'Water Drop Study',
      action: 'recorded',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    isOnline: true,
  },
  {
    memberId: '2',
    oderId: '2',
    username: 'Member B',
    personalityType: 'SREC',
    impressionCount: 5,
    recommendedArtworksViewed: 4,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: 'Night Reflection',
      action: 'recorded',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    isOnline: true,
  },
  {
    memberId: '3',
    oderId: '3',
    username: 'Member C',
    personalityType: 'LAMF',
    impressionCount: 1,
    recommendedArtworksViewed: 1,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: 'No. 071025',
      action: 'recorded',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    isOnline: false,
  },
];

function getMemberKey(member: MMCATourMemberStatus) {
  return member.memberId || member.oderId || member.username;
}

export default function TeamPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <TeamPage />
    </Suspense>
  );
}

function TeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams?.get('tourId') || searchParams?.get('oderId') || null;

  const [members, setMembers] = useState<MMCATourMemberStatus[]>(DEMO_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshData = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      if (!tourId) {
        // Demo mode when tour id is missing.
        setMembers((prev) =>
          prev.map((member) => ({
            ...member,
            impressionCount: member.impressionCount + (Math.random() > 0.75 ? 1 : 0),
          }))
        );
        setLastRefresh(new Date());
        return;
      }

      const res = await fetch(`/api/mmca-tour/team-status?tourId=${encodeURIComponent(tourId)}`, {
        cache: 'no-store',
      });
      const data = (await res.json()) as TeamStatusApiResponse;

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Failed to load team status');
      }

      setMembers(data.data.members);
      setLastRefresh(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh team status';
      setApiError(message);
      console.error('Failed to refresh team page:', error);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const totalImpressions = useMemo(
    () => members.reduce((sum, member) => sum + member.impressionCount, 0),
    [members]
  );
  const activeMembers = useMemo(
    () => members.filter((member) => member.isOnline).length,
    [members]
  );
  const topRecorder = useMemo(
    () => [...members].sort((a, b) => b.impressionCount - a.impressionCount)[0],
    [members]
  );

  const recordHref = tourId
    ? `/mmca-tour/record?tourId=${encodeURIComponent(tourId)}`
    : '/mmca-tour/record';

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full transition hover:bg-neutral-100"
          >
            <ChevronLeft className="w-5 h-5 text-black" aria-hidden />
          </button>
          <h1 className="text-lg font-semibold flex-1">Team Exchange</h1>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 rounded-full transition hover:bg-neutral-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-neutral-600 ${loading ? 'animate-spin' : ''}`} aria-hidden />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {apiError && (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">{totalImpressions}</div>
            <div className="text-xs text-neutral-600 mt-1">Total Impressions</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
            <div className="text-xs text-neutral-600 mt-1">Active Members</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{members.length}</div>
            <div className="text-xs text-neutral-600 mt-1">Members</div>
          </div>
        </section>

        {topRecorder && (
          <section className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-600" aria-hidden />
              <div className="flex-1">
                <p className="text-amber-700 text-xs">Most Active Recorder</p>
                <p className="text-black font-semibold">
                  {topRecorder.username} ({topRecorder.impressionCount})
                </p>
              </div>
              <span className="text-2xl" aria-hidden>{SAYU_TYPES[topRecorder.personalityType].emoji}</span>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-black font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" aria-hidden />
              Members
            </h2>
            <span className="text-xs text-neutral-500">
              Updated {formatTimeAgo(lastRefresh)}
            </span>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard key={getMemberKey(member)} member={member} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-black font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" aria-hidden />
            Recent Activity
          </h2>
          <div className="space-y-2">
            {members
              .filter((member) => member.lastActivity)
              .sort(
                (a, b) =>
                  new Date(b.lastActivity!.timestamp).getTime() -
                  new Date(a.lastActivity!.timestamp).getTime()
              )
              .slice(0, 5)
              .map((member) => (
                <div
                  key={`activity-${getMemberKey(member)}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-200 shadow-sm"
                >
                  <span className="text-lg" aria-hidden>{SAYU_TYPES[member.personalityType].emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-black text-sm truncate">
                      <span className="font-medium">{member.username}</span>
                      <span className="text-neutral-600"> recorded </span>
                      <span className="text-amber-700">&quot;{member.lastActivity!.artworkTitle}&quot;</span>
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {formatTimeAgo(new Date(member.lastActivity!.timestamp))}
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section className="pt-4 space-y-3">
          <Link
            href={recordHref}
            className="block w-full py-4 bg-black text-white text-center rounded-xl font-semibold hover:bg-neutral-800 transition"
          >
            Record Impression
          </Link>
          <Link
            href="/mmca-tour"
            className="block w-full py-4 bg-white text-center rounded-xl font-semibold border border-neutral-200 hover:bg-neutral-100 transition"
          >
            View Recommendations
          </Link>
        </section>
      </main>
    </div>
  );
}

function MemberCard({ member }: { member: MMCATourMemberStatus }) {
  const typeInfo = SAYU_TYPES[member.personalityType];
  const progress = Math.round((member.recommendedArtworksViewed / Math.max(1, member.totalRecommended)) * 100);

  return (
    <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          {member.avatarUrl ? (
            <Image
              src={member.avatarUrl}
              alt={member.username}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
              <UserCircle className="w-8 h-8 text-neutral-500" aria-hidden />
            </div>
          )}
          {member.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-black">{member.username}</span>
            <span className="text-lg" aria-hidden>{typeInfo.emoji}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-neutral-600">{typeInfo.name}</span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-amber-700">{member.personalityType}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-rose-600">
            <Heart className="w-4 h-4" aria-hidden />
            <span className="font-bold">{member.impressionCount}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Impressions</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-neutral-600">Progress</span>
          <span className="text-amber-700">{member.recommendedArtworksViewed}/{member.totalRecommended}</span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {member.lastActivity && (
        <p className="text-xs text-neutral-600 mt-3">
          Last: &quot;{member.lastActivity.artworkTitle}&quot; • {formatTimeAgo(new Date(member.lastActivity.timestamp))}
        </p>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}
