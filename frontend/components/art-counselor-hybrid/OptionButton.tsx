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
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      onClick={() => onSelect(option)}
      className={cn(
        'flex w-full flex-col border px-4 py-3 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400',
        disabled
          ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
          : isSelected
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50'
      )}
    >
      <span className="text-sm font-medium">{option.label}</span>
      {option.description ? (
        <span className={cn(
          "mt-1 text-xs",
          isSelected ? "text-neutral-300" : "text-neutral-500"
        )}>
          {option.description}
        </span>
      ) : null}
    </motion.button>
  );
});
