'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CounselorOption } from '@/lib/art-counselor/types';
import { OptionButton } from './OptionButton';

interface OpeningStepProps {
  options: CounselorOption[];
  isLoading: boolean;
  onSelectOption: (option: CounselorOption) => Promise<void> | void;
}

export function OpeningStep({
  options,
  isLoading,
  onSelectOption,
}: OpeningStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = async (option: CounselorOption) => {
    setSelectedId(option.id);
    await onSelectOption(option);
  };

  return (
    <div className="space-y-2 p-5">
      {options.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-4 text-center"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-white/30 mx-auto"
          />
          <p className="text-white/30 text-xs mt-3 font-light">
            대화를 준비하고 있어요
          </p>
        </motion.div>
      ) : (
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 px-1">
            오늘의 느낌을 선택해주세요
          </p>
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <OptionButton
                option={option}
                disabled={isLoading}
                isSelected={selectedId === option.id}
                onSelect={handleSelect}
              />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
