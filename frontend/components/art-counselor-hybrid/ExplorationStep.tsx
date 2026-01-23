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
        <div className="border border-neutral-200 bg-neutral-50 p-4">
          <label className="mb-2 block text-xs uppercase tracking-widest text-neutral-500">
            자유롭게 감정을 적어볼까요?
          </label>
          <textarea
            value={freeText}
            disabled={isLoading}
            onChange={(event) => setFreeText(event.target.value)}
            placeholder="이 순간 떠오른 생각이나 감정을 들려주세요."
            className="min-h-[120px] w-full resize-none border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setUseFreeText(false);
                setSelectedId(null);
              }}
              className="border border-neutral-200 px-4 py-2 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
            >
              취소
            </button>
            <button
              type="button"
              disabled={isLoading || !freeText.trim()}
              onClick={handleSubmit}
              className={cn(
                'px-5 py-2 text-xs font-medium text-white transition',
                'bg-neutral-900 hover:bg-neutral-800',
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
