'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Users,
  Camera,
  BookOpen,
  Heart
} from 'lucide-react';
import { SAYU_TYPES, SAYUTypeCode } from '@sayu/shared/SAYUTypeDefinitions';
import { RecommendedArtwork, MMCAExhibition } from '@/types/mmca-tour';

export default function MMCATourPage() {
  const router = useRouter();
  const [aptType, setAptType] = useState<SAYUTypeCode | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedArtwork[]>([]);
  const [exhibitions, setExhibitions] = useState<MMCAExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // APT 타입 선택 모드 (퀴즈 완료 전용)
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedType, setSelectedType] = useState<SAYUTypeCode | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedType
        ? `/api/mmca-tour/recommendations?aptType=${selectedType}&count=5`
        : '/api/mmca-tour/recommendations?count=5';

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setAptType(data.data.aptType as SAYUTypeCode);
        setRecommendations(data.data.recommendations);
        setExhibitions(data.data.exhibitions);
      } else {
        // APT 타입이 없으면 선택 모드 표시
        if (data.error?.includes('APT type is required')) {
          setShowTypeSelector(true);
        } else {
          setError(data.error);
        }
      }
    } catch {
      setError('추천 작품을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleTypeSelect = (type: SAYUTypeCode) => {
    setSelectedType(type);
    setShowTypeSelector(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white/70">당신을 위한 작품을 찾고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (showTypeSelector) {
    return <APTTypeSelector onSelect={handleTypeSelect} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/quiz/narrative')}
            className="px-6 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
          >
            Art Persona 진단받기
          </button>
        </div>
      </div>
    );
  }

  const typeInfo = aptType ? SAYU_TYPES[aptType] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">MMCA Tour</h1>
            <p className="text-sm text-white/60">국립현대미술관 서울</p>
          </div>
          <Link
            href="/mmca-tour/record"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition"
          >
            <Camera className="w-4 h-4" />
            감상 기록
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* User Type Banner */}
        {typeInfo && (
          <section className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{typeInfo.emoji}</div>
              <div className="flex-1">
                <p className="text-amber-400 text-sm mb-1">당신의 Art Persona</p>
                <h2 className="text-xl font-bold text-white mb-2">
                  {typeInfo.name} ({aptType})
                </h2>
                <p className="text-white/70 text-sm">{typeInfo.description}</p>
              </div>
              <button
                onClick={() => setShowTypeSelector(true)}
                className="text-amber-400 text-sm hover:underline"
              >
                변경
              </button>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link
            href="/mmca-tour/record"
            className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <Heart className="w-6 h-6 text-rose-400" />
            <span className="text-white text-sm">감상 기록</span>
          </Link>
          <Link
            href="/mmca-tour/team"
            className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-white text-sm">팀 현황</span>
          </Link>
        </section>

        {/* Recommended Artworks */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">당신을 위한 추천 작품</h2>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <RecommendedArtworkCard
                key={rec.artwork.id}
                recommendation={rec}
                index={index + 1}
              />
            ))}
          </div>
        </section>

        {/* Exhibitions Overview */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">전시 안내</h2>
          </div>
          <div className="space-y-3">
            {exhibitions.map(exhibition => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// APT 타입 선택기 컴포넌트
function APTTypeSelector({ onSelect }: { onSelect: (type: SAYUTypeCode) => void }) {
  const types = Object.entries(SAYU_TYPES) as [SAYUTypeCode, typeof SAYU_TYPES[SAYUTypeCode]][];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-bold text-white mb-2">Art Persona 선택</h1>
          <p className="text-white/60">
            당신의 예술 감상 유형을 선택해주세요.
            <br />
            <Link href="/quiz/narrative" className="text-amber-400 hover:underline">
              정확한 진단을 원하시면 퀴즈를 진행해주세요
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {types.map(([code, info]) => (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition"
            >
              <span className="text-3xl mb-2">{info.emoji}</span>
              <span className="text-white font-medium text-sm">{code}</span>
              <span className="text-white/50 text-xs mt-1">{info.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 추천 작품 카드 컴포넌트
function RecommendedArtworkCard({
  recommendation,
  index
}: {
  recommendation: RecommendedArtwork;
  index: number;
}) {
  const { artwork, exhibition, artist, recommendationReason, viewingTips } = recommendation;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-white/5 transition"
      >
        {/* Number Badge */}
        <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
          {index}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{artwork.title}</h3>
          <p className="text-white/60 text-sm">{artist.name} · {artwork.year}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
            <MapPin className="w-3 h-3" />
            <span>{exhibition.title} · {artwork.floor} {artwork.room}</span>
          </div>
        </div>

        <ChevronRight className={`w-5 h-5 text-white/50 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
          {/* Recommendation Reason */}
          <div className="bg-amber-500/10 rounded-xl p-4">
            <p className="text-amber-400 text-sm font-medium mb-2">왜 이 작품을 추천하나요?</p>
            <p className="text-white/80 text-sm">{recommendationReason}</p>
          </div>

          {/* Artwork Description */}
          <div>
            <p className="text-white/80 text-sm">{artwork.description}</p>
          </div>

          {/* Artist Context */}
          {artwork.artistContext && (
            <div>
              <p className="text-white/50 text-xs mb-1">작가 맥락</p>
              <p className="text-white/70 text-sm">{artwork.artistContext}</p>
            </div>
          )}

          {/* Viewing Tips */}
          {viewingTips && viewingTips.length > 0 && (
            <div>
              <p className="text-white/50 text-xs mb-2">감상 질문</p>
              <ul className="space-y-2">
                {viewingTips.map((tip, i) => (
                  <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                    <span className="text-amber-400">Q.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-white/60 bg-white/5 rounded-lg p-3">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>{artwork.floor} {artwork.room}</span>
            {artwork.locationNote && (
              <span className="text-white/40">· {artwork.locationNote}</span>
            )}
          </div>

          {/* Quick Record Button */}
          <Link
            href={`/mmca-tour/record?artworkId=${artwork.id}`}
            className="block w-full py-3 bg-amber-500 text-white text-center rounded-xl font-medium hover:bg-amber-600 transition"
          >
            이 작품 감상 기록하기
          </Link>
        </div>
      )}
    </div>
  );
}

// 전시 카드 컴포넌트
function ExhibitionCard({ exhibition }: { exhibition: MMCAExhibition }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold">{exhibition.title}</h3>
          <p className="text-white/60 text-sm mt-1">{exhibition.location}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(exhibition.startDate).toLocaleDateString('ko-KR')} ~
              {new Date(exhibition.endDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {exhibition.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">
              {tag}
            </span>
          ))}
        </div>
      </div>
      {exhibition.curatorNote && (
        <p className="text-white/50 text-xs mt-3 italic">
          &quot;{exhibition.curatorNote.slice(0, 100)}...&quot;
        </p>
      )}
    </div>
  );
}
