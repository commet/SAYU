'use client';

import { useState } from 'react';
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
    <div className="space-y-3 p-6">
      {options.map((option) => (
        <OptionButton
          key={option.id}
          option={option}
          disabled={isLoading}
          isSelected={selectedId === option.id}
          onSelect={handleSelect}
        />
      ))}

      {useFreeText ? (
        <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">
            자유롭게 감정을 적어볼까요?
          </label>
          <textarea
            value={freeText}
            disabled={isLoading}
            onChange={(event) => setFreeText(event.target.value)}
            placeholder="이 순간 떠오른 생각이나 감정을 들려주세요."
            className="min-h-[120px] w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setUseFreeText(false);
                setSelectedId(null);
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60 hover:border-white/20 hover:text-white"
            >
              취소
            </button>
            <button
              type="button"
              disabled={isLoading || !freeText.trim()}
              onClick={handleSubmit}
              className={cn(
                'rounded-full px-5 py-2 text-xs font-semibold text-sayu-dark-purple transition',
                'bg-gradient-to-r from-sayu-apricot-whisper/90 to-sayu-lavender-dream/80 shadow-lg shadow-sayu-apricot-whisper/30',
                (isLoading || !freeText.trim()) && 'opacity-60'
              )}
            >
              전송하기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
