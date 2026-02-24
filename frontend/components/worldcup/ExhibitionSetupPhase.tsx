'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Clock, Layers, Loader2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoundType, ExhibitionWorldcupTheme } from '@sayu/shared/exhibition-worldcup-types';

interface ExhibitionSetupPhaseProps {
  onStart: (round: RoundType, theme: ExhibitionWorldcupTheme, city?: string) => Promise<void>;
  onBack?: () => void;
  isProcessing: boolean;
}

interface CategoryOption {
  id: string;
  theme: ExhibitionWorldcupTheme;
  city?: string;
  label: string;
  labelEn: string;
  description: string;
  icon: typeof MapPin;
  color: string;
}

const CITY_OPTIONS: CategoryOption[] = [
  {
    id: 'seoul',
    theme: 'korean',
    city: 'Seoul',
    label: '서울',
    labelEn: 'Seoul',
    description: '한국 미술관 & 갤러리',
    icon: MapPin,
    color: 'text-rose-400',
  },
  {
    id: 'nyc',
    theme: 'international',
    city: 'New York',
    label: '뉴욕',
    labelEn: 'NYC',
    description: 'MET, 휘트니 등',
    icon: MapPin,
    color: 'text-blue-400',
  },
  {
    id: 'london',
    theme: 'international',
    city: 'London',
    label: '런던',
    labelEn: 'London',
    description: '테이트, 내셔널 등',
    icon: MapPin,
    color: 'text-emerald-400',
  },
  {
    id: 'paris',
    theme: 'international',
    city: 'Paris',
    label: '파리',
    labelEn: 'Paris',
    description: '루브르, 오르세 등',
    icon: MapPin,
    color: 'text-amber-400',
  },
  {
    id: 'berlin',
    theme: 'international',
    city: 'Berlin',
    label: '베를린',
    labelEn: 'Berlin',
    description: '베를린 갤러리 등',
    icon: MapPin,
    color: 'text-orange-400',
  },
  {
    id: 'tokyo',
    theme: 'international',
    city: 'Tokyo',
    label: '도쿄',
    labelEn: 'Tokyo',
    description: '모리, 국립미술관 등',
    icon: MapPin,
    color: 'text-pink-400',
  },
];

const THEME_OPTIONS: CategoryOption[] = [
  {
    id: 'ongoing',
    theme: 'ongoing',
    label: '진행중인 전시',
    labelEn: 'Ongoing',
    description: '지금 방문 가능한 전시',
    icon: Clock,
    color: 'text-green-400',
  },
  {
    id: 'all',
    theme: 'all',
    label: '전체 전시',
    labelEn: 'All',
    description: '9,300+ 전시 랜덤',
    icon: Layers,
    color: 'text-white/60',
  },
];

const ROUND_OPTIONS: { value: RoundType; label: string; matchCount: number }[] = [
  { value: 8, label: '8강', matchCount: 7 },
  { value: 16, label: '16강', matchCount: 15 },
  { value: 32, label: '32강', matchCount: 31 },
];

export function ExhibitionSetupPhase({ onStart, onBack, isProcessing }: ExhibitionSetupPhaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedRound, setSelectedRound] = useState<RoundType>(16);

  const handleStart = useCallback(async () => {
    if (!selectedCategory) return;
    await onStart(selectedRound, selectedCategory.theme, selectedCategory.city);
  }, [selectedCategory, selectedRound, onStart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Back button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="fixed top-6 left-6 z-30 p-2 text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/20 mb-5">
          <Globe className="w-7 h-7 text-white/60" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-3">
          Exhibition Worldcup
        </p>
        <h1
          className="text-2xl md:text-3xl text-white/90 font-light leading-relaxed mb-2"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          나의 이상형 전시 찾기
        </h1>
        <p className="text-white/40 text-sm font-light max-w-sm mx-auto">
          도시 또는 테마를 선택해 이상형 전시를 골라보세요
        </p>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        {/* City Selection */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-3">
            도시별
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CITY_OPTIONS.map((option, index) => {
              const isSelected = selectedCategory?.id === option.id;
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.04 }}
                  onClick={() => setSelectedCategory(isSelected ? null : option)}
                  className={cn(
                    'p-3 rounded-sm transition-all duration-200 text-center',
                    'border',
                    isSelected
                      ? 'bg-white/[0.08] border-white/30 ring-1 ring-white/10'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                  )}
                >
                  <div
                    className={cn(
                      'text-base font-light mb-0.5',
                      isSelected ? 'text-white/90' : 'text-white/70'
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-[10px] text-white/30">
                    {option.labelEn}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-3">
            테마별
          </p>
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedCategory?.id === option.id;
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => setSelectedCategory(isSelected ? null : option)}
                  className={cn(
                    'p-4 rounded-sm transition-all duration-200 text-left',
                    'border',
                    isSelected
                      ? 'bg-white/[0.08] border-white/30 ring-1 ring-white/10'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 mb-2',
                      isSelected ? 'text-white/80' : 'text-white/40'
                    )}
                  />
                  <div
                    className={cn(
                      'text-sm font-light',
                      isSelected ? 'text-white/90' : 'text-white/70'
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-[10px] text-white/30 mt-0.5">{option.description}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Round Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-3">
            토너먼트 규모
          </p>
          <div className="flex gap-2">
            {ROUND_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRound(option.value)}
                className={cn(
                  'flex-1 py-3 rounded-sm transition-all duration-200 text-center',
                  'border',
                  selectedRound === option.value
                    ? 'bg-white/[0.08] border-white/30'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                )}
              >
                <div
                  className={cn(
                    'text-lg font-light',
                    selectedRound === option.value ? 'text-white/90' : 'text-white/60'
                  )}
                >
                  {option.label}
                </div>
                <div className="text-[10px] text-white/30">{option.matchCount}회 선택</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleStart}
          disabled={!selectedCategory || isProcessing}
          className={cn(
            'w-full py-4 rounded-sm font-light text-base transition-all',
            selectedCategory
              ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/20 hover:from-white/25 hover:to-white/15'
              : 'bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/10'
          )}
          whileHover={selectedCategory && !isProcessing ? { scale: 1.01 } : {}}
          whileTap={selectedCategory && !isProcessing ? { scale: 0.99 } : {}}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              전시 데이터 준비 중...
            </span>
          ) : selectedCategory ? (
            <span>
              {selectedCategory.label} {selectedRound}강 시작
            </span>
          ) : (
            '도시 또는 테마를 선택하세요'
          )}
        </motion.button>
      </div>
    </div>
  );
}
