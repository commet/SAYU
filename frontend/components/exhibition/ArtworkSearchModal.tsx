'use client';

/**
 * ArtworkSearchModal Component
 * 작품 검색 및 기록 모달
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import EmotionSelector from './EmotionSelector';
import type {
  ArtworkSearchModalProps,
  ExhibitionArtwork,
} from '@sayu/shared/exhibition-recording-types';

export default function ArtworkSearchModal({
  isOpen,
  onClose,
  exhibitionId,
  visitId,
  onArtworkSelected,
}: ArtworkSearchModalProps) {
  const { personalityType } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExhibitionArtwork[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<ExhibitionArtwork | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 검색 (디바운스)
  const searchArtworks = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        // 타임아웃 5초
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `/api/artworks/search?exhibitionId=${exhibitionId}&query=${encodeURIComponent(query)}&limit=10`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setSearchResults(data.data || []);
        } else {
          console.error('Search failed:', data.error);
          setSearchResults([]);
          // 사용자에게 알림 (조용한 실패)
          if (query.length > 2) {
            toast.error('작품을 찾을 수 없습니다', {
              duration: 2000,
            });
          }
        }
      } catch (error: any) {
        console.error('Search error:', error);
        setSearchResults([]);

        // 에러 알림 (네트워크 에러만)
        if (error.name === 'AbortError') {
          toast.error('검색 시간이 초과되었습니다', {
            duration: 3000,
          });
        } else if (error.message?.includes('Failed to fetch')) {
          toast.error('네트워크 연결을 확인해주세요', {
            duration: 3000,
          });
        }
      } finally {
        setIsSearching(false);
      }
    },
    [exhibitionId]
  );

  // 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      searchArtworks(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchArtworks]);

  // 작품 선택
  const handleSelectArtwork = (artwork: ExhibitionArtwork) => {
    setSelectedArtwork(artwork);
  };

  // 뒤로 가기 (작품 선택 취소)
  const handleBack = () => {
    setSelectedArtwork(null);
    setSelectedEmotions([]);
    setNote('');
  };

  // 기록 저장
  const handleSubmit = async () => {
    if (!selectedArtwork || selectedEmotions.length === 0) {
      toast.error('감정을 하나 이상 선택해주세요', {
        duration: 2000,
        icon: '😊',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 타임아웃 10초
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/visits/${visitId}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artworkId: selectedArtwork.id,
          emotions: selectedEmotions,
          note: note.trim() || undefined,
          recognitionMethod: 'search',
          recordedAt: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // 성공 알림
        toast.success(
          `"${selectedArtwork.title}" 기록 완료!`,
          {
            duration: 2000,
            icon: '🎨',
          }
        );

        // 성공 시 콜백 호출 및 모달 닫기
        onArtworkSelected(selectedArtwork);
        handleClose();
      } else {
        throw new Error(data.error || '기록 저장에 실패했습니다');
      }
    } catch (error: any) {
      console.error('Submit error:', error);

      // 에러 타입별 처리
      if (error.name === 'AbortError') {
        toast.error('요청 시간이 초과되었습니다. 다시 시도해주세요.', {
          duration: 4000,
        });
      } else if (error.message?.includes('Failed to fetch')) {
        toast.error('네트워크 연결을 확인해주세요', {
          duration: 4000,
        });
      } else {
        toast.error(error.message || '기록 저장 중 오류가 발생했습니다', {
          duration: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 (초기화)
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedArtwork(null);
    setSelectedEmotions([]);
    setNote('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                {selectedArtwork && (
                  <button
                    onClick={handleBack}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    ← 뒤로
                  </button>
                )}
                <h2 className="text-xl font-medium text-neutral-900">
                  {selectedArtwork ? '감정 기록' : '작품 검색'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!selectedArtwork ? (
                /* 검색 화면 */
                <div className="p-6 space-y-4">
                  {/* 검색 입력 */}
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="작품 제목 또는 작가 이름을 입력하세요"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin"
                        size={20}
                      />
                    )}
                  </div>

                  {/* 검색 결과 */}
                  {searchQuery.trim() && (
                    <div className="space-y-2">
                      {searchResults.length > 0 ? (
                        <>
                          <p className="text-sm text-neutral-600">
                            {searchResults.length}개의 작품을 찾았어요
                          </p>
                          <div className="space-y-2">
                            {searchResults.map((artwork) => (
                              <button
                                key={artwork.id}
                                onClick={() => handleSelectArtwork(artwork)}
                                className="w-full p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all text-left"
                              >
                                <div className="flex gap-4">
                                  {/* 썸네일 */}
                                  {artwork.thumbnail_url && (
                                    <div className="flex-shrink-0 w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden">
                                      <img
                                        src={artwork.thumbnail_url}
                                        alt={artwork.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}

                                  {/* 정보 */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-neutral-900 truncate">
                                      {artwork.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 truncate">
                                      {artwork.artist}
                                      {artwork.year && ` · ${artwork.year}`}
                                    </p>
                                    {artwork.medium && (
                                      <p className="text-xs text-neutral-500 truncate mt-1">
                                        {artwork.medium}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        !isSearching && (
                          <div className="text-center py-12 text-neutral-500">
                            <p>검색 결과가 없습니다</p>
                            <p className="text-sm mt-2">다른 키워드로 검색해보세요</p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* 안내 메시지 */}
                  {!searchQuery.trim() && (
                    <div className="text-center py-12 text-neutral-500">
                      <Search size={48} className="mx-auto mb-4 opacity-30" />
                      <p>작품 제목이나 작가 이름을 검색하세요</p>
                      <p className="text-sm mt-2">예: "별이 빛나는 밤", "반 고흐"</p>
                    </div>
                  )}
                </div>
              ) : (
                /* 감정 선택 화면 */
                <div className="p-6 space-y-6">
                  {/* 선택된 작품 정보 */}
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex gap-4">
                      {selectedArtwork.image_url && (
                        <div className="flex-shrink-0 w-20 h-20 bg-neutral-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedArtwork.image_url}
                            alt={selectedArtwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">{selectedArtwork.title}</h3>
                        <p className="text-sm text-neutral-600">
                          {selectedArtwork.artist}
                          {selectedArtwork.year && ` · ${selectedArtwork.year}`}
                        </p>
                        {selectedArtwork.medium && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {selectedArtwork.medium}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 감정 선택 */}
                  <EmotionSelector
                    selectedEmotions={selectedEmotions}
                    onEmotionsChange={setSelectedEmotions}
                    maxSelections={3}
                    userAPT={personalityType}
                  />

                  {/* 메모 (선택사항) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      메모 (선택사항)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="작품을 보며 떠오른 생각을 자유롭게 적어보세요"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 outline-none transition-all resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-neutral-500 text-right">{note.length}/500</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer (감정 선택 화면에만 표시) */}
            {selectedArtwork && (
              <div className="px-6 py-4 border-t border-neutral-200">
                <button
                  onClick={handleSubmit}
                  disabled={selectedEmotions.length === 0 || isSubmitting}
                  className="w-full px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      저장 중...
                    </span>
                  ) : (
                    '기록 완료'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
