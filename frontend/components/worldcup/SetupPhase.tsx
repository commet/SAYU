'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, Search, Image as ImageIcon, Trophy, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  WorldcupSession,
  WorldcupParticipant,
  RoundType,
} from '@sayu/shared/exhibition-worldcup-types';

interface SetupPhaseProps {
  session: WorldcupSession | null;
  participants: WorldcupParticipant[];
  onCreateSession: (roundType: RoundType) => void;
  onAddParticipant: (participant: WorldcupParticipant) => void;
  onRemoveParticipant: (participantId: string) => void;
  onStartTournament: () => void;
  isProcessing: boolean;
}

const ROUND_OPTIONS: { value: RoundType; label: string; description: string; matches: number }[] = [
  { value: 8, label: '8강', description: '빠른 토너먼트', matches: 7 },
  { value: 16, label: '16강', description: '균형 잡힌 선택', matches: 15 },
  { value: 32, label: '32강', description: '깊이 있는 탐색', matches: 31 },
  { value: 64, label: '64강', description: '완전한 컬렉션', matches: 63 },
];

export function SetupPhase({
  session,
  participants,
  onCreateSession,
  onAddParticipant,
  onRemoveParticipant,
  onStartTournament,
  isProcessing,
}: SetupPhaseProps) {
  const [selectedRound, setSelectedRound] = useState<RoundType>(16);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetCount = session?.round_type || selectedRound;
  const currentCount = participants.length;
  const canStart = currentCount === targetCount;

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
                  title: image.original_filename?.replace(/\.[^/.]+$/, '') || '업로드 이미지',
                }),
              }
            );

            const participantData = await participantResponse.json();
            if (participantData.success && participantData.data?.participant) {
              onAddParticipant(participantData.data.participant);
            }
          }
        }

        if (data.errors?.length > 0) {
          console.error('Upload errors:', data.errors);
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [session?.id, onAddParticipant]
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/artworks?search=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleAddFromSearch = useCallback(
    async (artwork: any) => {
      if (!session?.id) return;

      try {
        const response = await fetch(
          `/api/worldcup/sessions/${session.id}/participants`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source_type: 'artwork',
              artwork_id: artwork.id,
              title: artwork.title,
              artist: artwork.artist,
              image_url: artwork.image_url || artwork.thumbnail_url,
            }),
          }
        );

        const data = await response.json();
        if (data.success && data.data?.participant) {
          onAddParticipant(data.data.participant);
          setSearchResults((prev) => prev.filter((a) => a.id !== artwork.id));
        }
      } catch (error) {
        console.error('Add from search error:', error);
      }
    },
    [session?.id, onAddParticipant]
  );

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

  // Round Selection Screen
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-600/20 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
          </motion.div>

          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">
            Exhibition Worldcup
          </p>
          <h1
            className="text-2xl md:text-3xl text-white/90 font-light leading-relaxed mb-3"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            나의 최애 작품 찾기
          </h1>
          <p className="text-white/40 text-sm font-light max-w-sm mx-auto">
            전시에서 만난 작품들 중<br />
            가장 마음에 드는 작품을 골라보세요
          </p>
        </motion.div>

        <div className="w-full max-w-md space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-4">
            토너먼트 규모 선택
          </p>

          {ROUND_OPTIONS.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => {
                setSelectedRound(option.value);
                onCreateSession(option.value);
              }}
              className={cn(
                'w-full p-5 rounded-sm transition-all duration-300',
                'flex items-center justify-between',
                'border border-white/10 bg-white/[0.02]',
                'hover:bg-white/[0.05] hover:border-white/20',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30'
              )}
            >
              <div className="text-left">
                <div className="text-base font-light text-white/90">{option.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{option.description}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-light text-amber-400/80">{option.value}</div>
                <div className="text-[10px] text-white/30">{option.matches}회 선택</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Participant Adding Screen
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-2">
          작품 추가
        </p>
        <h1
          className="text-xl font-light text-white/90 mb-4"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          {currentCount} / {targetCount}
        </h1>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500/80 to-yellow-400/80"
            initial={{ width: 0 }}
            animate={{ width: `${(currentCount / targetCount) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 bg-white/[0.02] rounded-sm p-5"
        >
          <h3 className="text-sm font-light text-white/80 mb-1 flex items-center gap-2">
            <Upload className="w-4 h-4 text-white/40" />
            사진 업로드
          </h3>
          <p className="text-xs text-white/40 mb-4 font-light">
            전시에서 찍은 사진을 업로드하세요
          </p>

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
              'w-full py-4 rounded-sm border border-dashed transition-all',
              'flex items-center justify-center gap-2 text-sm font-light',
              isUploading || currentCount >= targetCount
                ? 'border-white/10 text-white/30 cursor-not-allowed'
                : 'border-white/20 text-white/60 hover:border-white/30 hover:text-white/80 hover:bg-white/[0.02]'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                이미지 선택 (최대 {targetCount - currentCount}장)
              </>
            )}
          </button>
        </motion.div>

        {/* Artwork Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-white/10 bg-white/[0.02] rounded-sm p-5"
        >
          <h3 className="text-sm font-light text-white/80 mb-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-white/40" />
            작품 검색
          </h3>
          <p className="text-xs text-white/40 mb-4 font-light">
            작품명이나 작가명으로 검색하세요
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="작품명 또는 작가명..."
              className={cn(
                "flex-1 px-4 py-3 text-sm font-light rounded-sm",
                "bg-white/[0.03] border border-white/10",
                "text-white/90 placeholder:text-white/30",
                "focus:outline-none focus:border-white/20 transition-colors"
              )}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className={cn(
                "px-5 py-3 rounded-sm text-sm font-light transition-all",
                "bg-white/10 border border-white/20 text-white/80",
                "hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
            </button>
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2 max-h-60 overflow-y-auto"
              >
                {searchResults.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-sm"
                  >
                    {artwork.image_url && (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-12 h-12 object-cover rounded-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-light text-white/80 truncate">{artwork.title}</div>
                      <div className="text-xs text-white/40 truncate">{artwork.artist}</div>
                    </div>
                    <button
                      onClick={() => handleAddFromSearch(artwork)}
                      disabled={currentCount >= targetCount}
                      className="p-2 text-amber-400/80 hover:bg-amber-400/10 rounded-sm disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Added Participants */}
        <AnimatePresence>
          {participants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.3 }}
              className="border border-white/10 bg-white/[0.02] rounded-sm p-5"
            >
              <h3 className="text-sm font-light text-white/80 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400/60" />
                추가된 작품
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative aspect-square rounded-sm overflow-hidden group"
                  >
                    <img
                      src={
                        participant.image_url ||
                        participant.temp_image_url ||
                        '/images/placeholder-artwork.png'
                      }
                      alt={participant.title || '작품'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onStartTournament}
          disabled={!canStart || isProcessing}
          className={cn(
            'w-full py-4 rounded-sm font-light text-base transition-all',
            canStart
              ? 'bg-gradient-to-r from-amber-500/80 to-yellow-500/80 text-white hover:from-amber-500 hover:to-yellow-500'
              : 'bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/10'
          )}
          whileHover={canStart ? { scale: 1.01 } : {}}
          whileTap={canStart ? { scale: 0.99 } : {}}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              준비 중...
            </span>
          ) : canStart ? (
            '토너먼트 시작'
          ) : (
            `${targetCount - currentCount}개 더 추가하세요`
          )}
        </motion.button>
      </div>
    </div>
  );
}
