'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  X,
  Upload,
  Search,
  Image as ImageIcon,
  Trophy,
  Loader2,
  History,
  Calendar,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type {
  WorldcupSession,
  WorldcupParticipant,
  RoundType,
} from '@sayu/shared/exhibition-worldcup-types';

type WorldcupMode = 'my' | 'all';

interface SetupPhaseProps {
  mode: WorldcupMode;
  session: WorldcupSession | null;
  participants: WorldcupParticipant[];
  onCreateSession: (roundType: RoundType) => void;
  onAddParticipant: (participant: WorldcupParticipant) => void;
  onRemoveParticipant: (participantId: string) => void;
  onStartTournament: () => void;
  isProcessing: boolean;
}

interface Exhibition {
  id: string;
  title: string;
  venue: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ongoing' | 'upcoming' | 'ended';
  visited_at?: string;
}

// Translations
const t = {
  en: {
    selectRound: 'Select Tournament Size',
    selectRoundDesc: 'Choose how many exhibitions to compare',
    rounds: {
      8: { label: 'Quarter Finals', desc: '8 exhibitions, 7 matches' },
      16: { label: 'Round of 16', desc: '16 exhibitions, 15 matches' },
      32: { label: 'Round of 32', desc: '32 exhibitions, 31 matches' },
    },
    addExhibitions: 'Add Exhibitions',
    progress: (current: number, total: number) => `${current} / ${total} exhibitions`,
    myVisits: 'My Exhibition History',
    myVisitsDesc: 'Select from exhibitions you\'ve visited',
    allExhibitions: 'All Exhibitions',
    allExhibitionsDesc: 'Browse ongoing and upcoming exhibitions',
    uploadPhotos: 'Upload Photos',
    uploadDesc: 'Upload photos from exhibitions (auto-deleted after 24h)',
    selectImages: (max: number) => `Select images (max ${max})`,
    uploading: 'Uploading...',
    searchExhibitions: 'Search Exhibitions',
    searchPlaceholder: 'Search by title or venue...',
    searching: 'Searching...',
    addedExhibitions: 'Selected Exhibitions',
    startTournament: 'Start Tournament!',
    needMore: (n: number) => `Add ${n} more`,
    preparing: 'Preparing...',
    noVisitsYet: 'No visits recorded yet',
    visitSome: 'Visit some exhibitions first!',
    browseExhibitions: 'Browse Exhibitions',
    loading: 'Loading...',
    back: 'Back',
  },
  ko: {
    selectRound: '토너먼트 규모 선택',
    selectRoundDesc: '몇 개의 전시를 비교할지 선택하세요',
    rounds: {
      8: { label: '8강', desc: '8개 전시, 7번 선택' },
      16: { label: '16강', desc: '16개 전시, 15번 선택' },
      32: { label: '32강', desc: '32개 전시, 31번 선택' },
    },
    addExhibitions: '전시 추가하기',
    progress: (current: number, total: number) => `${current} / ${total} 전시`,
    myVisits: '내 관람 기록',
    myVisitsDesc: '관람했던 전시 중에서 선택하세요',
    allExhibitions: '전체 전시',
    allExhibitionsDesc: '진행중 및 예정 전시를 탐색하세요',
    uploadPhotos: '사진 업로드',
    uploadDesc: '전시에서 찍은 사진을 업로드하세요 (24시간 후 자동 삭제)',
    selectImages: (max: number) => `이미지 선택 (최대 ${max}장)`,
    uploading: '업로드 중...',
    searchExhibitions: '전시 검색',
    searchPlaceholder: '전시명 또는 장소로 검색...',
    searching: '검색 중...',
    addedExhibitions: '선택된 전시',
    startTournament: '토너먼트 시작!',
    needMore: (n: number) => `${n}개 더 추가하세요`,
    preparing: '준비 중...',
    noVisitsYet: '아직 관람 기록이 없어요',
    visitSome: '먼저 전시를 관람해보세요!',
    browseExhibitions: '전시 둘러보기',
    loading: '로딩 중...',
    back: '뒤로',
  },
};

const ROUND_OPTIONS: RoundType[] = [8, 16, 32];

export function SetupPhase({
  mode,
  session,
  participants,
  onCreateSession,
  onAddParticipant,
  onRemoveParticipant,
  onStartTournament,
  isProcessing,
}: SetupPhaseProps) {
  const { language } = useLanguage();
  const texts = t[language];

  const [selectedRound, setSelectedRound] = useState<RoundType>(16);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Exhibition lists
  const [myVisits, setMyVisits] = useState<Exhibition[]>([]);
  const [allExhibitions, setAllExhibitions] = useState<Exhibition[]>([]);
  const [isLoadingExhibitions, setIsLoadingExhibitions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetCount = session?.round_type || selectedRound;
  const currentCount = participants.length;
  const canStart = currentCount === targetCount;

  // Fetch exhibitions on mount
  useEffect(() => {
    if (session) {
      fetchExhibitions();
    }
  }, [session, mode]);

  const fetchExhibitions = async () => {
    setIsLoadingExhibitions(true);
    try {
      if (mode === 'my') {
        // Fetch user's exhibition visits
        const response = await fetch('/api/exhibitions/visits?limit=100');
        if (response.ok) {
          const data = await response.json();
          setMyVisits(data.data || data.visits || []);
        }
      } else {
        // Fetch all exhibitions
        const response = await fetch('/api/exhibitions?limit=100&status=ongoing,upcoming');
        if (response.ok) {
          const data = await response.json();
          setAllExhibitions(data.data || data.exhibitions || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch exhibitions:', error);
    } finally {
      setIsLoadingExhibitions(false);
    }
  };

  // Search exhibitions
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchExhibitions();
      return;
    }

    setIsSearching(true);
    try {
      const endpoint = mode === 'my'
        ? `/api/exhibitions/visits?search=${encodeURIComponent(searchQuery)}`
        : `/api/exhibitions?search=${encodeURIComponent(searchQuery)}&limit=50`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (mode === 'my') {
          setMyVisits(data.data || data.visits || []);
        } else {
          setAllExhibitions(data.data || data.exhibitions || []);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, mode]);

  // Add exhibition as participant
  const handleAddExhibition = useCallback(
    async (exhibition: Exhibition) => {
      if (!session?.id) return;

      // Check if already added
      if (participants.some((p) => p.exhibition_id === exhibition.id)) {
        return;
      }

      try {
        const response = await fetch(
          `/api/worldcup/sessions/${session.id}/participants`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source_type: 'exhibition',
              exhibition_id: exhibition.id,
              title: exhibition.title,
              venue: exhibition.venue,
              image_url: exhibition.image,
            }),
          }
        );

        const data = await response.json();
        if (data.success && data.data?.participant) {
          onAddParticipant(data.data.participant);
        }
      } catch (error) {
        console.error('Add exhibition error:', error);
      }
    },
    [session?.id, participants, onAddParticipant]
  );

  // Image upload
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!session?.id) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('session_id', session.id);

        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });

        const response = await fetch('/api/worldcup/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.data?.uploaded) {
          for (const image of data.data.uploaded) {
            const participantResponse = await fetch(
              `/api/worldcup/sessions/${session.id}/participants`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  source_type: 'uploaded',
                  temp_image_url: image.storage_url,
                  temp_image_path: image.storage_path,
                  title: image.original_filename?.replace(/\.[^/.]+$/, '') || 'Uploaded',
                }),
              }
            );

            const participantData = await participantResponse.json();
            if (participantData.success && participantData.data?.participant) {
              onAddParticipant(participantData.data.participant);
            }
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [session?.id, onAddParticipant]
  );

  // Remove participant
  const handleRemoveParticipant = useCallback(
    async (participantId: string) => {
      if (!session?.id) return;

      try {
        await fetch(`/api/worldcup/sessions/${session.id}/participants`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participant_id: participantId }),
        });

        onRemoveParticipant(participantId);
      } catch (error) {
        console.error('Remove participant error:', error);
      }
    },
    [session?.id, onRemoveParticipant]
  );

  const exhibitions = mode === 'my' ? myVisits : allExhibitions;
  const addedExhibitionIds = new Set(participants.map((p) => p.exhibition_id).filter(Boolean));

  // ========================================
  // Round Selection (no session yet)
  // ========================================
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50">
        <Link
          href="/worldcup"
          className="absolute top-4 left-4 flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {texts.back}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-neutral-900 rounded-2xl flex items-center justify-center">
            <Trophy className="w-10 h-10 text-[#D4A520]" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">{texts.selectRound}</h1>
          <p className="text-neutral-600">{texts.selectRoundDesc}</p>
        </motion.div>

        <div className="w-full max-w-md space-y-4">
          {ROUND_OPTIONS.map((roundValue) => {
            const roundInfo = texts.rounds[roundValue as keyof typeof texts.rounds];
            return (
              <motion.button
                key={roundValue}
                onClick={() => {
                  setSelectedRound(roundValue);
                  onCreateSession(roundValue);
                }}
                className={cn(
                  'w-full p-5 rounded-xl border-2 transition-all',
                  'flex items-center justify-between',
                  'hover:border-neutral-900 hover:bg-neutral-100',
                  'border-neutral-200 bg-white shadow-sm'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-left">
                  <div className="text-lg font-semibold text-neutral-900">
                    {roundInfo.label}
                  </div>
                  <div className="text-sm text-neutral-500">{roundInfo.desc}</div>
                </div>
                <div className="text-3xl font-bold text-neutral-900">{roundValue}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ========================================
  // Participant Selection
  // ========================================
  return (
    <div className="min-h-screen p-6 bg-neutral-50">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <Link
          href="/worldcup"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          {texts.back}
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{texts.addExhibitions}</h1>
          <p className="text-neutral-600">{texts.progress(currentCount, targetCount)}</p>
          <div className="w-full max-w-xs mx-auto mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-neutral-900"
              initial={{ width: 0 }}
              animate={{ width: `${(currentCount / targetCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={texts.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : language === 'ko' ? '검색' : 'Search'}
            </button>
          </div>
        </div>

        {/* Exhibition List */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm mb-6">
          <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
            {mode === 'my' ? (
              <>
                <History className="w-5 h-5 text-neutral-600" />
                <span className="font-medium text-neutral-900">{texts.myVisits}</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 text-neutral-600" />
                <span className="font-medium text-neutral-900">{texts.allExhibitions}</span>
              </>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoadingExhibitions ? (
              <div className="p-8 text-center text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                {texts.loading}
              </div>
            ) : exhibitions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-neutral-600 mb-2">{texts.noVisitsYet}</p>
                <p className="text-neutral-500 text-sm mb-4">{texts.visitSome}</p>
                <Link
                  href="/exhibitions"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  {texts.browseExhibitions}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {exhibitions.map((exhibition) => {
                  const isAdded = addedExhibitionIds.has(exhibition.id);
                  const isFull = currentCount >= targetCount;

                  return (
                    <button
                      key={exhibition.id}
                      onClick={() => !isAdded && !isFull && handleAddExhibition(exhibition)}
                      disabled={isAdded || isFull}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 text-left transition-colors',
                        isAdded
                          ? 'bg-neutral-50 cursor-default'
                          : isFull
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-neutral-50 cursor-pointer'
                      )}
                    >
                      <div className="relative w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {exhibition.image ? (
                          <Image
                            src={exhibition.image}
                            alt={exhibition.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🖼️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 truncate">
                          {exhibition.title}
                        </h4>
                        <p className="text-sm text-neutral-500 truncate">{exhibition.venue}</p>
                      </div>
                      {isAdded ? (
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 border-2 border-neutral-300 rounded-full flex items-center justify-center hover:border-neutral-900 transition-colors">
                          <Plus className="w-4 h-4 text-neutral-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 mb-6">
          <h3 className="font-medium text-neutral-900 mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {texts.uploadPhotos}
          </h3>
          <p className="text-sm text-neutral-500 mb-4">{texts.uploadDesc}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || currentCount >= targetCount}
            className={cn(
              'w-full py-4 rounded-xl border-2 border-dashed transition-all',
              'flex items-center justify-center gap-2',
              isUploading || currentCount >= targetCount
                ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'border-neutral-300 hover:border-neutral-900 hover:text-neutral-900 text-neutral-600'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {texts.uploading}
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                {texts.selectImages(targetCount - currentCount)}
              </>
            )}
          </button>
        </div>

        {/* Selected Participants */}
        {participants.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 mb-6">
            <h3 className="font-medium text-neutral-900 mb-4">{texts.addedExhibitions}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="relative aspect-square rounded-lg overflow-hidden group bg-neutral-100"
                >
                  <Image
                    src={
                      participant.image_url ||
                      participant.temp_image_url ||
                      '/images/placeholder-exhibition.png'
                    }
                    alt={participant.title || 'Exhibition'}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        <motion.button
          onClick={onStartTournament}
          disabled={!canStart || isProcessing}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-lg transition-all',
            canStart
              ? 'bg-neutral-900 text-white hover:bg-[#D4A520]'
              : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
          )}
          whileHover={canStart ? { scale: 1.02 } : {}}
          whileTap={canStart ? { scale: 0.98 } : {}}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {texts.preparing}
            </span>
          ) : canStart ? (
            texts.startTournament
          ) : (
            texts.needMore(targetCount - currentCount)
          )}
        </motion.button>
      </div>
    </div>
  );
}
