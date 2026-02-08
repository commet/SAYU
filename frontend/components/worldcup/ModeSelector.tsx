'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorldcupMode } from '@sayu/shared/exhibition-worldcup-types';

interface ModeSelectorProps {
  onSelectMode: (mode: WorldcupMode) => void;
}

const MODE_OPTIONS: {
  mode: WorldcupMode;
  icon: typeof Trophy;
  title: string;
  description: string;
  accent: string;
}[] = [
  {
    mode: 'artwork',
    icon: Trophy,
    title: '작품 월드컵',
    description: '전시에서 만난 작품 중 최애를 찾아보세요',
    accent: 'from-amber-500/20 to-yellow-600/20 border-amber-500/30',
  },
  {
    mode: 'exhibition',
    icon: MapPin,
    title: '전시 월드컵',
    description: '5,800+ 전시 중 나의 이상형 전시를 골라보세요',
    accent: 'from-violet-500/20 to-indigo-600/20 border-violet-500/30',
  },
];

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">
          Exhibition Worldcup
        </p>
        <h1
          className="text-2xl md:text-3xl text-white/90 font-light leading-relaxed mb-3"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          어떤 월드컵을 시작할까요?
        </h1>
        <p className="text-white/40 text-sm font-light max-w-sm mx-auto">
          작품 또는 전시를 선택해 이상형 월드컵을 즐겨보세요
        </p>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        {MODE_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => onSelectMode(option.mode)}
              className={cn(
                'w-full p-6 rounded-sm transition-all duration-300',
                'flex items-center gap-5',
                'border bg-white/[0.02]',
                'hover:bg-white/[0.05] hover:scale-[1.01]',
                'focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30',
                option.mode === 'artwork'
                  ? 'border-amber-500/20 hover:border-amber-500/40'
                  : 'border-violet-500/20 hover:border-violet-500/40'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center border shrink-0',
                  option.accent
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6',
                    option.mode === 'artwork' ? 'text-amber-400' : 'text-violet-400'
                  )}
                />
              </div>
              <div className="text-left">
                <div className="text-base font-light text-white/90">{option.title}</div>
                <div className="text-xs text-white/40 mt-1">{option.description}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
