'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Users,
  Heart,
  Clock,
  Trophy,
  RefreshCw,
  UserCircle
} from 'lucide-react';
import { SAYU_TYPES, SAYUTypeCode } from '@/shared/SAYUTypeDefinitions';
import { MMCATourMemberStatus } from '@/types/mmca-tour';

// 데모 데이터 (DB 연결 전 테스트용)
const DEMO_MEMBERS: MMCATourMemberStatus[] = [
  {
    oderId: '1',
    username: '동료 A',
    personalityType: 'LAEF',
    impressionCount: 3,
    recommendedArtworksViewed: 2,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: '물방울',
      action: 'recorded',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    },
    isOnline: true
  },
  {
    oderId: '2',
    username: '동료 B',
    personalityType: 'SREC',
    impressionCount: 5,
    recommendedArtworksViewed: 4,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: '어디서 무엇이 되어 다시 만나랴',
      action: 'recorded',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString()
    },
    isOnline: true
  },
  {
    oderId: '3',
    username: '동료 C',
    personalityType: 'LAMF',
    impressionCount: 1,
    recommendedArtworksViewed: 1,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: '묘법 No. 071025',
      action: 'recorded',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    },
    isOnline: true
  },
  {
    oderId: '4',
    username: '동료 D',
    personalityType: 'SAEF',
    impressionCount: 2,
    recommendedArtworksViewed: 2,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: '회귀',
      action: 'recorded',
      timestamp: new Date(Date.now() - 8 * 60000).toISOString()
    },
    isOnline: true
  },
  {
    oderId: '5',
    username: '동료 E',
    personalityType: 'LRMC',
    impressionCount: 4,
    recommendedArtworksViewed: 3,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: '다다익선',
      action: 'recorded',
      timestamp: new Date(Date.now() - 1 * 60000).toISOString()
    },
    isOnline: true
  },
  {
    oderId: '6',
    username: '나',
    personalityType: 'LAEF',
    impressionCount: 2,
    recommendedArtworksViewed: 2,
    totalRecommended: 5,
    lastActivity: {
      artworkTitle: '천자문',
      action: 'recorded',
      timestamp: new Date().toISOString()
    },
    isOnline: true
  }
];

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MMCATourMemberStatus[]>(DEMO_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      // 실제로는 API 호출
      // const res = await fetch('/api/mmca-tour/team-status?oderId=xxx');
      // const data = await res.json();
      // if (data.success) setMembers(data.data.members);

      // 데모 모드: 랜덤하게 업데이트
      setMembers(prev => prev.map(m => ({
        ...m,
        impressionCount: m.impressionCount + (Math.random() > 0.7 ? 1 : 0)
      })));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산
  const totalImpressions = members.reduce((sum, m) => sum + m.impressionCount, 0);
  const activeMembers = members.filter(m => m.isOnline).length;
  const topRecorder = [...members].sort((a, b) => b.impressionCount - a.impressionCount)[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white flex-1">팀 현황</h1>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <RefreshCw className={`w-5 h-5 text-white/70 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-amber-400">{totalImpressions}</div>
            <div className="text-xs text-white/50 mt-1">총 감상 기록</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-green-400">{activeMembers}</div>
            <div className="text-xs text-white/50 mt-1">활동 중</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-blue-400">{members.length}</div>
            <div className="text-xs text-white/50 mt-1">팀원</div>
          </div>
        </section>

        {/* Top Recorder */}
        {topRecorder && (
          <section className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-400" />
              <div className="flex-1">
                <p className="text-amber-400 text-xs">가장 많이 기록한 팀원</p>
                <p className="text-white font-semibold">
                  {topRecorder.username} ({topRecorder.impressionCount}개)
                </p>
              </div>
              <span className="text-2xl">{SAYU_TYPES[topRecorder.personalityType].emoji}</span>
            </div>
          </section>
        )}

        {/* Team Members */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              팀원들
            </h2>
            <span className="text-xs text-white/40">
              {formatTimeAgo(lastRefresh)} 업데이트
            </span>
          </div>

          <div className="space-y-3">
            {members.map(member => (
              <MemberCard key={member.oderId} member={member} />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            최근 활동
          </h2>
          <div className="space-y-2">
            {members
              .filter(m => m.lastActivity)
              .sort((a, b) =>
                new Date(b.lastActivity!.timestamp).getTime() -
                new Date(a.lastActivity!.timestamp).getTime()
              )
              .slice(0, 5)
              .map(member => (
                <div
                  key={member.oderId}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="text-lg">{SAYU_TYPES[member.personalityType].emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      <span className="font-medium">{member.username}</span>
                      <span className="text-white/50">님이 </span>
                      <span className="text-amber-400">"{member.lastActivity!.artworkTitle}"</span>
                      <span className="text-white/50"> 감상을 남겼어요</span>
                    </p>
                  </div>
                  <span className="text-xs text-white/40">
                    {formatTimeAgo(new Date(member.lastActivity!.timestamp))}
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="pt-4 space-y-3">
          <Link
            href="/mmca-tour/record"
            className="block w-full py-4 bg-amber-500 text-white text-center rounded-xl font-semibold hover:bg-amber-600 transition"
          >
            감상 기록하러 가기
          </Link>
          <Link
            href="/mmca-tour"
            className="block w-full py-4 bg-white/10 text-white text-center rounded-xl font-semibold hover:bg-white/20 transition"
          >
            추천 작품 보기
          </Link>
        </section>
      </main>
    </div>
  );
}

// 멤버 카드 컴포넌트
function MemberCard({ member }: { member: MMCATourMemberStatus }) {
  const typeInfo = SAYU_TYPES[member.personalityType];
  const progress = Math.round((member.impressionCount / member.totalRecommended) * 100);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-white/50" />
            </div>
          )}
          {member.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{member.username}</span>
            <span className="text-lg">{typeInfo.emoji}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-white/50">{typeInfo.name}</span>
            <span className="text-white/30">·</span>
            <span className="text-xs text-amber-400">{member.personalityType}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-rose-400">
            <Heart className="w-4 h-4 fill-current" />
            <span className="font-bold">{member.impressionCount}</span>
          </div>
          <p className="text-xs text-white/40 mt-1">감상 기록</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/50">추천 작품 진행도</span>
          <span className="text-amber-400">{member.recommendedArtworksViewed}/{member.totalRecommended}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Last Activity */}
      {member.lastActivity && (
        <p className="text-xs text-white/40 mt-3">
          마지막: "{member.lastActivity.artworkTitle}" · {formatTimeAgo(new Date(member.lastActivity.timestamp))}
        </p>
      )}
    </div>
  );
}

// 시간 포맷 함수
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}
