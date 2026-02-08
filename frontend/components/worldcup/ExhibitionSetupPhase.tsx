'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Clock, Layers, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoundType, ExhibitionWorldcupTheme } from '@sayu/shared/exhibition-worldcup-types';

interface ExhibitionSetupPhaseProps {
  onStart: (round: RoundType, theme: ExhibitionWorldcupTheme) => Promise<void>;
  isProcessing: boolean;
}

const THEME_OPTIONS: {
  value: ExhibitionWorldcupTheme;
  icon: typeof MapPin;
  label: string;
  description: string;
}[] = [
  {
    value: 'korean',
    icon: MapPin,
    label: '국내 전시',
    description: '한국에서 열리는 전시들',
  },
  {
    value: 'international',
    icon: Globe,
    label: '해외 전시',
    description: '글로벌 미술관의 전시들',
  },
  {
    value: 'ongoing',
    icon: Clock,
    label: '현재 진행중',
    description: '지금 방문할 수 있는 전시',
  },
  {
    value: 'all',
    icon: Layers,
    label: '전체',
    description: '모든 전시 데이터에서 선택',
  },
];

const ROUND_OPTIONS: { value: RoundType; label: string; matches: number }[] = [
  { value: 8, label: '8강', matches: 7 },
  { value: 16, label: '16강', matches: 15 },
  { value: 32, label: '32강', matches: 31 },
];

export function ExhibitionSetupPhase({ onStart, isProcessing }: ExhibitionSetupPhaseProps) {
  const [selectedTheme, setSelectedTheme] = useState<ExhibitionWorldcupTheme | null>(null);
  const [selectedRound, setSelectedRound] = useState<RoundType>(16);

  const handleStart = useCallback(async () => {
    if (!selectedTheme) return;
    await onStart(selectedRound, selectedTheme);
  }, [selectedTheme, selectedRound, onStart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-600/20 flex items-center justify-center border border-violet-500/30 mb-6">
          <MapPin className="w-8 h-8 text-violet-400" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">
          Exhibition Worldcup
        </p>
        <h1
          className="text-2xl md:text-3xl text-white/90 font-light leading-relaxed mb-3"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          나의 이상형 전시 찾기
        </h1>
        <p className="text-white/40 text-sm font-light max-w-sm mx-auto">
          다양한 전시 중 가장 끌리는 전시를 골라보세요
        </p>
      </motion.div>

      <div className="w-full max-w-md space-y-6">
        {/* Theme Selection */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-4">
            테마 선택
          </p>
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => setSelectedTheme(option.value)}
                  className={cn(
                    'p-4 rounded-sm transition-all duration-200 text-left',
                    'border',
                    selectedTheme === option.value
                      ? 'bg-violet-500/10 border-violet-500/40'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 mb-2',
                      selectedTheme === option.value ? 'text-violet-400' : 'text-white/40'
                    )}
                  />
                  <div className="text-sm font-light text-white/90">{option.label}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{option.description}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Round Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-4">
            토너먼트 규모
          </p>
          <div className="flex gap-3">
            {ROUND_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRound(option.value)}
                className={cn(
                  'flex-1 py-3 rounded-sm transition-all duration-200 text-center',
                  'border',
                  selectedRound === option.value
                    ? 'bg-violet-500/10 border-violet-500/40'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                )}
              >
                <div
                  className={cn(
                    'text-lg font-light',
                    selectedRound === option.value ? 'text-violet-400' : 'text-white/60'
                  )}
                >
                  {option.label}
                </div>
                <div className="text-[10px] text-white/30">{option.matches}회 선택</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleStart}
          disabled={!selectedTheme || isProcessing}
          className={cn(
            'w-full py-4 rounded-sm font-light text-base transition-all',
            selectedTheme
              ? 'bg-gradient-to-r from-violet-500/80 to-indigo-500/80 text-white hover:from-violet-500 hover:to-indigo-500'
              : 'bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/10'
          )}
          whileHover={selectedTheme && !isProcessing ? { scale: 1.01 } : {}}
          whileTap={selectedTheme && !isProcessing ? { scale: 0.99 } : {}}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              전시 데이터 준비 중...
            </span>
          ) : selectedTheme ? (
            '전시 월드컵 시작'
          ) : (
            '테마를 선택하세요'
          )}
        </motion.button>
      </div>
    </div>
  );
}
