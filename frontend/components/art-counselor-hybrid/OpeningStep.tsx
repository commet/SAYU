'use client';

import { useState } from 'react';
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
    <div className="space-y-3 p-6">
      {options.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/70">
          안내를 준비하고 있어요...
        </div>
      ) : null}

      {options.map((option) => (
        <OptionButton
          key={option.id}
          option={option}
          disabled={isLoading}
          isSelected={selectedId === option.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
