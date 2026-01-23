'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ConnectionStepProps {
  isLoading: boolean;
  onSubmit: (reflection: string) => Promise<void> | void;
}

export function ConnectionStep({ isLoading, onSubmit }: ConnectionStepProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await onSubmit(value.trim());
    setValue('');
  };

  return (
    <div className="space-y-3 p-6">
      <div className="border border-neutral-200 bg-neutral-50 p-4">
        <label className="mb-3 block text-xs uppercase tracking-widest text-neutral-500">
          지금 떠오르는 생각이나 기억이 있다면 적어주세요
        </label>
        <textarea
          value={value}
          disabled={isLoading}
          onChange={(event) => setValue(event.target.value)}
          placeholder="이 작품이 건네준 감정, 기억, 이야기를 자유롭게 적어주세요."
          className="min-h-[150px] w-full resize-none border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={isLoading || !value.trim()}
            onClick={handleSubmit}
            className={cn(
              'px-5 py-2 text-xs font-medium text-white transition',
              'bg-neutral-900 hover:bg-neutral-800',
              (isLoading || !value.trim()) && 'opacity-60'
            )}
          >
            감정을 담아 보내기
          </button>
        </div>
      </div>
    </div>
  );
}
