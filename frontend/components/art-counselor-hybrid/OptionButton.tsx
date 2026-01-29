'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CounselorOption } from '@/lib/art-counselor/types';
import { cn } from '@/lib/utils';

interface OptionButtonProps {
  option: CounselorOption;
  disabled?: boolean;
  onSelect: (option: CounselorOption) => void;
  isSelected?: boolean;
}

export const OptionButton = memo(function OptionButton({
  option,
  disabled,
  onSelect,
  isSelected,
}: OptionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      disabled={disabled}
      onClick={() => onSelect(option)}
      className={cn(
        'flex w-full flex-col rounded-sm px-4 py-3.5 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30',
        disabled
          ? 'cursor-not-allowed bg-white/[0.02] text-white/20 border border-white/5'
          : isSelected
          ? 'bg-white/15 text-white border border-white/20'
          : 'bg-white/[0.03] text-white/80 border border-white/10 hover:bg-white/[0.06] hover:border-white/15'
      )}
    >
      <span className="text-sm font-light">{option.label}</span>
      {option.description ? (
        <span className={cn(
          "mt-1 text-xs font-light",
          isSelected ? "text-white/60" : "text-white/40"
        )}>
          {option.description}
        </span>
      ) : null}
    </motion.button>
  );
});
