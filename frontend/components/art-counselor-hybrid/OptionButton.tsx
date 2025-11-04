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

const toneToGradient: Record<
  NonNullable<CounselorOption['tone']>,
  string
> = {
  gentle: 'from-sayu-peppermint-pink/70 to-sayu-lime-cream/70',
  curious: 'from-sayu-lavender-dream/70 to-sayu-pearl/60',
  grounding: 'from-sayu-dusty-jupiter/70 to-sayu-fern-green/60',
  playful: 'from-sayu-match-point/70 to-sayu-double-bounce/60',
};

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
        'flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sayu-lavender-dream/70',
        disabled
          ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/40'
          : isSelected
          ? 'border-transparent bg-gradient-to-r text-sayu-dark-purple shadow-lg shadow-sayu-peppermint-pink/30'
          : 'border-white/10 bg-white/8 text-white hover:border-white/20 hover:bg-white/12',
        option.tone
          ? isSelected
            ? toneToGradient[option.tone]
            : ''
          : isSelected
          ? 'from-sayu-apricot-whisper/70 to-sayu-lavender-dream/60'
          : ''
      )}
    >
      <span className="text-sm font-semibold">{option.label}</span>
      {option.description ? (
        <span className="mt-1 text-xs text-white/70">
          {option.description}
        </span>
      ) : null}
    </motion.button>
  );
});
