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
        <div className="border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
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
