'use client';

import { useState, useEffect, useCallback, Suspense, type ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  X,
  ChevronLeft,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Check,
  Loader2
} from 'lucide-react';
import {
  MMCAArtwork,
  MMCAExhibition,
  MMCAArtist,
  EMOTION_TAG_PRESETS,
  MMCAImpression
} from '@/types/mmca-tour';

type Rating = MMCAImpression['rating'];

type SearchResultItem = {
  artwork: MMCAArtwork;
  exhibition: MMCAExhibition;
  artist: MMCAArtist;
};

// Wrapper component for Suspense
export default function RecordPage() {
  return (
    <Suspense fallback={<RecordPageLoading />}>
      <RecordPageContent />
    </Suspense>
  );
}

function RecordPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  );
}

function RecordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedArtworkId = searchParams.get('artworkId');
  const tourId = searchParams.get('tourId') ?? searchParams.get('oderId');

  const [step, setStep] = useState<'search' | 'record' | 'done'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedArtwork, setSelectedArtwork] = useState<SearchResultItem | null>(null);

  const [rating, setRating] = useState<Rating | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchArtworkById = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/mmca-tour/search?q=${encodeURIComponent(id)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const match = data.data.find((item: SearchResultItem) => item.artwork.id === id);
        if (match) {
          setSelectedArtwork(match);
          setStep('record');
        }
      }
    } catch (err) {
      console.error('Failed to fetch artwork:', err);
    }
  }, []);

  // Pre-load selected artwork from query.
  useEffect(() => {
    if (preselectedArtworkId) {
      void fetchArtworkById(preselectedArtworkId);
    }
  }, [fetchArtworkById, preselectedArtworkId]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      void searchArtworks(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchArtworks = async (query: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/mmca-tour/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectArtwork = (item: SearchResultItem) => {
    setSelectedArtwork(item);
    setStep('record');
  };

  const handleEmotionToggle = (emotionId: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(e => e !== emotionId)
        : [...prev, emotionId]
    );
  };

  const handleSave = async () => {
    if (!selectedArtwork || !rating) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/mmca-tour/impressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkId: selectedArtwork.artwork.id,
          tourId: tourId ?? undefined,
          rating,
          emotionTags: selectedEmotions,
          memo: memo.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setStep('done');
      } else {
        alert(data.error || '저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleRecordAnother = () => {
    setSelectedArtwork(null);
    setRating(null);
    setSelectedEmotions([]);
    setMemo('');
    setSearchQuery('');
    setStep('search');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => (step === 'search' ? router.back() : setStep('search'))}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">
            {step === 'search' && '작품 찾기'}
            {step === 'record' && '감상 기록'}
            {step === 'done' && '기록 완료'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {step === 'search' && (
          <SearchStep
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            searching={searching}
            onSelect={handleSelectArtwork}
          />
        )}

        {step === 'record' && selectedArtwork && (
          <RecordStep
            artwork={selectedArtwork.artwork}
            artist={selectedArtwork.artist}
            exhibition={selectedArtwork.exhibition}
            rating={rating}
            setRating={setRating}
            selectedEmotions={selectedEmotions}
            onEmotionToggle={handleEmotionToggle}
            memo={memo}
            setMemo={setMemo}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {step === 'done' && selectedArtwork && (
          <DoneStep
            artwork={selectedArtwork.artwork}
            onRecordAnother={handleRecordAnother}
            tourId={tourId}
          />
        )}
      </main>
    </div>
  );
}

function SearchStep({
  searchQuery,
  setSearchQuery,
  searchResults,
  searching,
  onSelect
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResultItem[];
  searching: boolean;
  onSelect: (item: SearchResultItem) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="작품명 또는 작가명을 검색하세요"
          className="w-full pl-12 pr-10 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        )}
      </div>

      {!searchQuery && (
        <div className="text-center py-8">
          <p className="text-white/50 text-sm">
            감상한 작품명이나 작가명을 입력해보세요.
          </p>
          <p className="text-white/30 text-xs mt-2">
            예: 물방울, 김창열, 조각
          </p>
        </div>
      )}

      {searching && (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
        </div>
      )}

      {!searching && searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map(item => (
            <button
              key={item.artwork.id}
              onClick={() => onSelect(item)}
              className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-left hover:bg-white/10 transition"
            >
              <div className="font-medium text-white">{item.artwork.title}</div>
              <div className="text-sm text-white/60 mt-1">
                {item.artist.name} · {item.artwork.year}
              </div>
              <div className="text-xs text-white/40 mt-1">
                {item.exhibition.title} · {item.artwork.floor}
              </div>
            </button>
          ))}
        </div>
      )}

      {!searching && searchQuery.length >= 1 && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/50 text-sm">검색 결과가 없습니다.</p>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          href="/mmca-tour"
          className="text-amber-400 text-sm hover:underline"
        >
          전시 작품 목록 보기
        </Link>
      </div>
    </div>
  );
}

function RecordStep({
  artwork,
  artist,
  exhibition,
  rating,
  setRating,
  selectedEmotions,
  onEmotionToggle,
  memo,
  setMemo,
  onSave,
  saving
}: {
  artwork: MMCAArtwork;
  artist: MMCAArtist;
  exhibition: MMCAExhibition;
  rating: Rating | null;
  setRating: (r: Rating) => void;
  selectedEmotions: string[];
  onEmotionToggle: (id: string) => void;
  memo: string;
  setMemo: (m: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const ratings: { value: Rating; icon: ReactNode; label: string; color: string }[] = [
    { value: 'love', icon: <Heart className="w-6 h-6" />, label: '최고', color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' },
    { value: 'like', icon: <ThumbsUp className="w-6 h-6" />, label: '좋아요', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
    { value: 'neutral', icon: <Meh className="w-6 h-6" />, label: '보통', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
    { value: 'dislike', icon: <ThumbsDown className="w-6 h-6" />, label: '별로', color: 'text-slate-400 bg-slate-500/20 border-slate-500/30' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <h2 className="font-semibold text-white">{artwork.title}</h2>
        <p className="text-sm text-white/60 mt-1">{artist.name} · {artwork.year}</p>
        <p className="text-xs text-white/40 mt-1">{exhibition.title}</p>
      </div>

      <div>
        <p className="text-white/70 text-sm mb-3">이 작품, 어땠나요?</p>
        <div className="grid grid-cols-4 gap-2">
          {ratings.map(r => (
            <button
              key={r.value}
              onClick={() => setRating(r.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                rating === r.value ? r.color : 'border-white/10 text-white/50 hover:bg-white/5'
              }`}
            >
              {r.icon}
              <span className="text-xs">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-white/70 text-sm mb-3">느낀 감정을 선택해주세요 (복수 선택)</p>
        <div className="flex flex-wrap gap-2">
          {EMOTION_TAG_PRESETS.map(emotion => (
            <button
              key={emotion.id}
              onClick={() => onEmotionToggle(emotion.id)}
              className={`px-3 py-2 rounded-full text-sm border transition ${
                selectedEmotions.includes(emotion.id)
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'border-white/20 text-white/60 hover:bg-white/5'
              }`}
            >
              {emotion.emoji} {emotion.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-white/70 text-sm mb-3">한 줄 감상 (선택)</p>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="작품을 보며 떠오른 생각이나 감정을 자유롭게 적어보세요."
          rows={3}
          maxLength={200}
          className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
        />
        <p className="text-right text-white/30 text-xs mt-1">{memo.length}/200</p>
      </div>

      <button
        onClick={onSave}
        disabled={!rating || saving}
        className={`w-full py-4 rounded-xl font-semibold text-white transition ${
          rating && !saving
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-white/10 text-white/30 cursor-not-allowed'
        }`}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '감상 저장하기'}
      </button>
    </div>
  );
}

function DoneStep({
  artwork,
  onRecordAnother,
  tourId
}: {
  artwork: MMCAArtwork;
  onRecordAnother: () => void;
  tourId: string | null;
}) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-400" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">감상 기록 완료!</h2>
        <p className="text-white/60">&quot;{artwork.title}&quot; 작품 감상이 저장되었습니다.</p>
      </div>

      <div className="space-y-3 pt-4">
        <button
          onClick={onRecordAnother}
          className="w-full py-4 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
        >
          다른 작품 기록하기
        </button>

        <Link
          href="/mmca-tour"
          className="block w-full py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
        >
          추천 작품 보기
        </Link>

        <Link
          href={tourId ? `/mmca-tour/team?tourId=${encodeURIComponent(tourId)}` : '/mmca-tour/team'}
          className="block w-full py-4 border border-white/20 text-white/70 rounded-xl font-semibold hover:bg-white/5 transition"
        >
          팀 현황 보기
        </Link>
      </div>
    </div>
  );
}
