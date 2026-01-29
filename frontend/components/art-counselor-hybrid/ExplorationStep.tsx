'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CounselorOption } from '@/lib/art-counselor/types';
import { OptionButton } from './OptionButton';
import { cn } from '@/lib/utils';

interface ExplorationStepProps {
  options: CounselorOption[];
  isLoading: boolean;
  onSelectOption: (option: CounselorOption) => Promise<void> | void;
  onSubmitFreeText: (value: string) => Promise<void> | void;
}

export function ExplorationStep({
  options,
  isLoading,
  onSelectOption,
  onSubmitFreeText,
}: ExplorationStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [useFreeText, setUseFreeText] = useState(false);

  const handleSelect = async (option: CounselorOption) => {
    if (option.id === 'free_input') {
      setUseFreeText(true);
      setSelectedId(option.id);
      return;
    }

    setUseFreeText(false);
    setSelectedId(option.id);
    await onSelectOption(option);
  };

  const handleSubmit = async () => {
    if (!freeText.trim()) return;
    await onSubmitFreeText(freeText.trim());
    setFreeText('');
  };

  return (
    <div className="space-y-2 p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 px-1">
        감정의 깊이를 탐색해요
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

      {useFreeText ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/10 bg-white/[0.02] p-4 mt-3 rounded-sm"
        >
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            자유롭게 감정을 적어볼까요?
          </label>
          <textarea
            value={freeText}
            disabled={isLoading}
            onChange={(event) => setFreeText(event.target.value)}
            placeholder="이 순간 떠오른 생각이나 감정을 들려주세요."
            className={cn(
              "min-h-[120px] w-full resize-none px-3 py-3 text-sm font-light",
              "bg-white/[0.03] border border-white/10 rounded-sm",
              "text-white/90 outline-none placeholder:text-white/30",
              "focus:border-white/20 transition-colors"
            )}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setUseFreeText(false);
                setSelectedId(null);
              }}
              className="border border-white/10 px-4 py-2 text-xs text-white/50 hover:border-white/20 hover:text-white/70 transition-colors rounded-sm"
            >
              취소
            </button>
            <button
              type="button"
              disabled={isLoading || !freeText.trim()}
              onClick={handleSubmit}
              className={cn(
                'px-5 py-2 text-xs font-light text-white/90 transition-all rounded-sm',
                'bg-white/10 border border-white/20 hover:bg-white/15',
                (isLoading || !freeText.trim()) && 'opacity-40 cursor-not-allowed'
              )}
            >
              전송하기
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
