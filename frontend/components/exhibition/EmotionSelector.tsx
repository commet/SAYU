'use client';

/**
 * EmotionSelector Component
 * 작품 감상 후 감정 선택 UI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EmotionSelectorProps } from '@sayu/shared/exhibition-recording-types';
import { EMOTIONS } from '@sayu/shared/exhibition-recording-types';

export default function EmotionSelector({
  selectedEmotions,
  onEmotionsChange,
  maxSelections = 3,
  userAPT,
  className = '',
}: EmotionSelectorProps) {
  const [customEmotion, setCustomEmotion] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // APT에 따른 추천 감정 (Smart Suggestions)
  const getRecommendedEmotions = (): string[] => {
    if (!userAPT) return [];

    // APT 유형별 선호 감정 패턴
    const aptEmotionMap: Record<string, string[]> = {
      // L (Lone) - 평온, 몽환적 감정 선호
      LAEF: ['평온', '몽환', '부드러움'],
      LAEC: ['평온', '차가움', '부드러움'],
      LAMF: ['강렬', '날카로움', '몽환'],
      LAMC: ['날카로움', '차가움', '강렬'],
      LREF: ['평온', '따뜻함', '부드러움'],
      LREC: ['평온', '따뜻함', '차가움'],
      LRMF: ['강렬', '날카로움', '따뜻함'],
      LRMC: ['따뜻함', '차가움', '강렬'],

      // S (Social) - 강렬, 역동적 감정 선호
      SAEF: ['강렬', '몽환', '혼란'],
      SAEC: ['강렬', '날카로움', '몽환'],
      SAMF: ['강렬', '날카로움', '혼란'],
      SAMC: ['날카로움', '차가움', '강렬'],
      SREF: ['따뜻함', '강렬', '부드러움'],
      SREC: ['따뜻함', '차가움', '강렬'],
      SRMF: ['강렬', '따뜻함', '혼란'],
      SRMC: ['따뜻함', '날카로움', '차가움'],
    };

    return aptEmotionMap[userAPT] || [];
  };

  const recommendedEmotions = getRecommendedEmotions();

  // 감정 선택/해제 토글
  const toggleEmotion = (emotionId: string) => {
    const isSelected = selectedEmotions.includes(emotionId);

    if (isSelected) {
      // 선택 해제
      onEmotionsChange(selectedEmotions.filter((e) => e !== emotionId));
    } else {
      // 선택 추가 (최대 개수 제한)
      if (selectedEmotions.length < maxSelections) {
        onEmotionsChange([...selectedEmotions, emotionId]);
      }
    }
  };

  // 커스텀 감정 추가
  const addCustomEmotion = () => {
    if (customEmotion.trim() && selectedEmotions.length < maxSelections) {
      onEmotionsChange([...selectedEmotions, customEmotion.trim()]);
      setCustomEmotion('');
      setShowCustomInput(false);
    }
  };

  // 감정 버튼 색상
  const getEmotionColor = (emotionId: string): string => {
    const colorMap: Record<string, string> = {
      calm: 'bg-blue-500 hover:bg-blue-600',
      intense: 'bg-red-500 hover:bg-red-600',
      dreamy: 'bg-purple-500 hover:bg-purple-600',
      sharp: 'bg-orange-500 hover:bg-orange-600',
      warm: 'bg-amber-500 hover:bg-amber-600',
      cool: 'bg-cyan-500 hover:bg-cyan-600',
      soft: 'bg-pink-500 hover:bg-pink-600',
      chaotic: 'bg-gray-500 hover:bg-gray-600',
    };
    return colorMap[emotionId] || 'bg-gray-500 hover:bg-gray-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-neutral-900">
          이 작품을 보고 느낀 감정은?
        </h3>
        <p className="text-sm text-neutral-500">
          최대 {maxSelections}개까지 선택할 수 있어요
          {selectedEmotions.length > 0 && (
            <span className="ml-2 text-neutral-900 font-medium">
              ({selectedEmotions.length}/{maxSelections})
            </span>
          )}
        </p>
      </div>

      {/* 감정 버튼 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EMOTIONS.map((emotion, index) => {
          const isSelected = selectedEmotions.includes(emotion.label);
          const isRecommended = recommendedEmotions.includes(emotion.label);
          const isDisabled = !isSelected && selectedEmotions.length >= maxSelections;

          return (
            <motion.button
              key={emotion.id}
              onClick={() => toggleEmotion(emotion.label)}
              disabled={isDisabled}
              className={`
                relative px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? `${getEmotionColor(emotion.id)} text-white shadow-lg scale-105`
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isRecommended && !isSelected ? 'ring-2 ring-offset-2 ring-neutral-400' : ''}
              `}
              whileTap={{ scale: isDisabled ? 1 : 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* 추천 뱃지 */}
              {isRecommended && !isSelected && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                  ★
                </span>
              )}

              <div className="flex items-center justify-center gap-2">
                {emotion.emoji && <span className="text-lg">{emotion.emoji}</span>}
                <span>{emotion.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 직접 입력 옵션 */}
      <div className="pt-4 border-t border-neutral-200">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={selectedEmotions.length >= maxSelections}
            className={`
              w-full px-4 py-3 rounded-xl text-sm font-medium
              border-2 border-dashed border-neutral-300
              text-neutral-600 hover:border-neutral-400 hover:text-neutral-800
              transition-all duration-200
              ${
                selectedEmotions.length >= maxSelections
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }
            `}
          >
            + 직접 입력
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={customEmotion}
                onChange={(e) => setCustomEmotion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomEmotion()}
                placeholder="느낀 감정을 자유롭게 써보세요"
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none"
                maxLength={20}
                autoFocus
              />
              <button
                onClick={addCustomEmotion}
                disabled={!customEmotion.trim()}
                className="px-6 py-2 rounded-lg bg-black text-white font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                추가
              </button>
            </div>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomEmotion('');
              }}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* 선택된 감정 태그 */}
      <AnimatePresence>
        {selectedEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 pt-4 border-t border-neutral-200"
          >
            <span className="text-sm text-neutral-600">선택된 감정:</span>
            {selectedEmotions.map((emotion) => {
              // 기본 감정인지 커스텀 감정인지 확인
              const emotionData = EMOTIONS.find((e) => e.label === emotion);

              return (
                <motion.span
                  key={emotion}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-sm"
                >
                  {emotionData?.emoji}
                  {emotion}
                  <button
                    onClick={() => toggleEmotion(emotion)}
                    className="ml-1 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </motion.span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
