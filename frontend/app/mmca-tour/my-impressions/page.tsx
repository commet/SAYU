'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Star,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import { SAYU_TYPES, SAYUTypeCode } from '@sayu/shared/SAYUTypeDefinitions';
import { MMCAArtwork, MMCAExhibition, MMCAArtist, EMOTION_TAG_PRESETS } from '@/types/mmca-tour';

interface EnrichedImpression {
  id: string;
  artwork_id: string;
  rating: 'love' | 'like' | 'neutral' | 'dislike';
  emotion_tags: string[];
  memo?: string;
  is_best_pick: boolean;
  created_at: string;
  artwork?: MMCAArtwork;
  exhibition?: MMCAExhibition;
  artist?: MMCAArtist;
}

// 데모 데이터
const DEMO_IMPRESSIONS: EnrichedImpression[] = [
  {
    id: '1',
    artwork_id: 'kty-1',
    rating: 'love',
    emotion_tags: ['calm', 'nostalgic', 'comforting'],
    memo: '물방울 하나하나에서 작가의 치유를 향한 여정이 느껴졌다.',
    is_best_pick: true,
    created_at: new Date().toISOString(),
    artwork: {
      id: 'kty-1',
      exhibitionId: 'kim-tschang-yeul',
      artistId: 'kim-tschang-yeul',
      title: '회귀',
      year: '1970',
      medium: '캔버스에 유채',
      description: '물방울 시리즈의 초기 대표작',
      floor: '3층',
      room: '3전시실',
      styleTags: [],
      moodTags: [],
      themeTags: []
    }
  },
  {
    id: '2',
    artwork_id: 'kmh-5',
    rating: 'love',
    emotion_tags: ['nostalgic', 'inspiring', 'melancholic'],
    memo: '점 하나하나가 그리움이라는 걸 알 것 같았다.',
    is_best_pick: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    artwork: {
      id: 'kmh-5',
      exhibitionId: 'korean-modern-highlights',
      artistId: 'kim-whanki',
      title: '어디서 무엇이 되어 다시 만나랴',
      year: '1970',
      medium: '캔버스에 유채',
      description: '김환기의 뉴욕 시기 대표작',
      floor: '2층',
      room: '2전시실',
      styleTags: [],
      moodTags: [],
      themeTags: []
    }
  },
  {
    id: '3',
    artwork_id: 'kap2025-jung-1',
    rating: 'like',
    emotion_tags: ['mysterious', 'questioning', 'energetic'],
    is_best_pick: false,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    artwork: {
      id: 'kap2025-jung-1',
      exhibitionId: 'artist-of-year-2025',
      artistId: 'jung-heeyoon',
      title: '들리지 않는 주파수',
      year: '2024',
      medium: '사운드 설치',
      description: '몰입형 사운드 설치',
      floor: '6층',
      room: '6전시실',
      styleTags: [],
      moodTags: [],
      themeTags: []
    }
  }
];

export default function MyImpressionsPage() {
  const router = useRouter();
  const [impressions, setImpressions] = useState<EnrichedImpression[]>(DEMO_IMPRESSIONS);
  const [loading, setLoading] = useState(false);
  const [bestPick, setBestPick] = useState<EnrichedImpression | null>(null);

  useEffect(() => {
    // 실제로는 API에서 로드
    // fetchImpressions();
    const best = impressions.find(imp => imp.is_best_pick);
    setBestPick(best || null);
  }, [impressions]);

  const handleSetBestPick = async (impressionId: string) => {
    setImpressions(prev => prev.map(imp => ({
      ...imp,
      is_best_pick: imp.id === impressionId
    })));
    // 실제로는 API 호출
  };

  const ratingIcons = {
    love: <Heart className="w-4 h-4 fill-current text-rose-400" />,
    like: <ThumbsUp className="w-4 h-4 text-amber-400" />,
    neutral: <Meh className="w-4 h-4 text-blue-400" />,
    dislike: <ThumbsDown className="w-4 h-4 text-slate-400" />
  };

  const ratingLabels = {
    love: '최고',
    like: '좋아요',
    neutral: '보통',
    dislike: '별로'
  };

  // 통계
  const stats = {
    total: impressions.length,
    love: impressions.filter(i => i.rating === 'love').length,
    like: impressions.filter(i => i.rating === 'like').length
  };

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
          <h1 className="text-lg font-semibold text-white">내 감상 기록</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-white/50 mt-1">총 기록</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-rose-400">{stats.love}</div>
            <div className="text-xs text-white/50 mt-1">최고</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-amber-400">{stats.like}</div>
            <div className="text-xs text-white/50 mt-1">좋아요</div>
          </div>
        </section>

        {/* Best Pick */}
        {bestPick && (
          <section className="bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-2xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <span className="text-amber-400 font-semibold">오늘의 Best 작품</span>
            </div>
            <h3 className="text-white font-bold text-lg">{bestPick.artwork?.title}</h3>
            {bestPick.memo && (
              <p className="text-white/70 text-sm mt-2 italic">"{bestPick.memo}"</p>
            )}
          </section>
        )}

        {/* Select Best Pick Prompt */}
        {!bestPick && impressions.length > 0 && (
          <section className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-white/70 text-sm">
              오늘 가장 인상 깊었던 작품을 선택해주세요
            </p>
          </section>
        )}

        {/* Impressions List */}
        <section>
          <h2 className="text-white font-semibold mb-4">감상 기록 ({impressions.length})</h2>
          <div className="space-y-3">
            {impressions.map(impression => (
              <ImpressionCard
                key={impression.id}
                impression={impression}
                onSetBestPick={() => handleSetBestPick(impression.id)}
                ratingIcon={ratingIcons[impression.rating]}
                ratingLabel={ratingLabels[impression.rating]}
              />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {impressions.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">아직 기록한 감상이 없습니다</p>
            <Link
              href="/mmca-tour/record"
              className="inline-block mt-4 px-6 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
            >
              감상 기록하러 가기
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        {impressions.length > 0 && (
          <section className="pt-4 space-y-3">
            <Link
              href="/mmca-tour/record"
              className="block w-full py-4 bg-amber-500 text-white text-center rounded-xl font-semibold hover:bg-amber-600 transition"
            >
              더 기록하기
            </Link>
            <Link
              href="/mmca-tour/team"
              className="block w-full py-4 bg-white/10 text-white text-center rounded-xl font-semibold hover:bg-white/20 transition"
            >
              팀 현황 보기
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

// 감상 기록 카드 컴포넌트
function ImpressionCard({
  impression,
  onSetBestPick,
  ratingIcon,
  ratingLabel
}: {
  impression: EnrichedImpression;
  onSetBestPick: () => void;
  ratingIcon: React.ReactNode;
  ratingLabel: string;
}) {
  const emotionLabels = EMOTION_TAG_PRESETS.reduce((acc, e) => {
    acc[e.id] = { label: e.label, emoji: e.emoji };
    return acc;
  }, {} as Record<string, { label: string; emoji: string }>);

  return (
    <div className={`bg-white/5 rounded-xl p-4 border ${
      impression.is_best_pick ? 'border-amber-500/50' : 'border-white/10'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold">{impression.artwork?.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
            <MapPin className="w-3 h-3" />
            <span>{impression.artwork?.floor} {impression.artwork?.room}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ratingIcon}
          <span className="text-sm text-white/70">{ratingLabel}</span>
        </div>
      </div>

      {/* Emotion Tags */}
      {impression.emotion_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {impression.emotion_tags.map(tagId => {
            const tag = emotionLabels[tagId];
            return tag ? (
              <span
                key={tagId}
                className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70"
              >
                {tag.emoji} {tag.label}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Memo */}
      {impression.memo && (
        <p className="text-white/60 text-sm mt-3 italic">"{impression.memo}"</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <span className="text-xs text-white/40 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(impression.created_at).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>

        {!impression.is_best_pick && (
          <button
            onClick={onSetBestPick}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            <Star className="w-3 h-3" />
            Best로 선택
          </button>
        )}

        {impression.is_best_pick && (
          <span className="text-xs text-amber-400 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Best 작품
          </span>
        )}
      </div>
    </div>
  );
}
