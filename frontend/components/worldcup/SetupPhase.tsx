'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Upload, Search, Image as ImageIcon, Trophy, Loader2 } from 'lucide-react';
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

const ROUND_OPTIONS: { value: RoundType; label: string; description: string }[] = [
  { value: 8, label: '8강', description: '8개 작품, 7번 선택' },
  { value: 16, label: '16강', description: '16개 작품, 15번 선택' },
  { value: 32, label: '32강', description: '32개 작품, 31번 선택' },
  { value: 64, label: '64강', description: '64개 작품, 63번 선택' },
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

  // 이미지 업로드 처리
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
            // 참가자 추가
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

  // 작품 검색
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

  // 검색 결과에서 작품 추가
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

  // 참가자 삭제
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

  // 라운드 선택 (세션 미생성 상태)
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl font-bold mb-2">전시 월드컵</h1>
          <p className="text-gray-400">내가 가장 좋아하는 작품을 찾아보세요</p>
        </motion.div>

        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-gray-400 mb-6">토너먼트 규모를 선택하세요</p>

          {ROUND_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => {
                setSelectedRound(option.value);
                onCreateSession(option.value);
              }}
              className={cn(
                'w-full p-4 rounded-xl border-2 transition-all',
                'flex items-center justify-between',
                'hover:border-blue-500 hover:bg-blue-500/10',
                selectedRound === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-left">
                <div className="text-lg font-semibold">{option.label}</div>
                <div className="text-sm text-gray-400">{option.description}</div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{option.value}</div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // 참가자 추가 단계
  return (
    <div className="min-h-screen p-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">작품 추가하기</h1>
        <p className="text-gray-400">
          {currentCount} / {targetCount} 작품
        </p>
        <div className="w-full max-w-xs mx-auto mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentCount / targetCount) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 작품 추가 방법 */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 이미지 업로드 */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            사진 업로드
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            전시에서 찍은 사진을 업로드하세요. (24시간 후 자동 삭제)
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
              'w-full py-4 rounded-xl border-2 border-dashed transition-all',
              'flex items-center justify-center gap-2',
              isUploading || currentCount >= targetCount
                ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                : 'border-gray-600 hover:border-blue-500 hover:text-blue-400'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                이미지 선택 (최대 {targetCount - currentCount}장)
              </>
            )}
          </button>
        </div>

        {/* 작품 검색 */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            작품 검색
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            작품명이나 작가명으로 검색하세요.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="작품명 또는 작가명..."
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : '검색'}
            </button>
          </div>

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((artwork) => (
                <div
                  key={artwork.id}
                  className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg"
                >
                  {artwork.image_url && (
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{artwork.title}</div>
                    <div className="text-sm text-gray-400 truncate">
                      {artwork.artist}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFromSearch(artwork)}
                    disabled={currentCount >= targetCount}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 추가된 참가자 목록 */}
        {participants.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">추가된 작품</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="relative aspect-square rounded-lg overflow-hidden group"
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
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 시작 버튼 */}
        <motion.button
          onClick={onStartTournament}
          disabled={!canStart || isProcessing}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-lg transition-all',
            canStart
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
          whileHover={canStart ? { scale: 1.02 } : {}}
          whileTap={canStart ? { scale: 0.98 } : {}}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              준비 중...
            </span>
          ) : canStart ? (
            '토너먼트 시작!'
          ) : (
            `${targetCount - currentCount}개 더 추가하세요`
          )}
        </motion.button>
      </div>
    </div>
  );
}
