'use client';

/**
 * FloatingRecordButton Component
 * 플로팅 작품 기록 버튼
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { FloatingRecordButtonProps } from '@/shared/exhibition-recording-types';

export default function FloatingRecordButton({
  visitId,
  onClick,
  disabled = false,
  recordCount = 0,
}: FloatingRecordButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed bottom-6 right-6 z-40
        w-16 h-16 rounded-full
        bg-black text-white
        shadow-2xl
        flex items-center justify-center
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Plus size={28} />

      {/* 기록 수 뱃지 */}
      {recordCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
        >
          {recordCount}
        </motion.div>
      )}
    </motion.button>
  );
}
