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
      <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
        <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-white/50">
          지금 떠오르는 생각이나 기억이 있다면 적어주세요
        </label>
        <textarea
          value={value}
          disabled={isLoading}
          onChange={(event) => setValue(event.target.value)}
          placeholder="이 작품이 건네준 감정, 기억, 이야기를 자유롭게 적어주세요."
          className="min-h-[150px] w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={isLoading || !value.trim()}
            onClick={handleSubmit}
            className={cn(
              'rounded-full px-5 py-2 text-xs font-semibold text-sayu-dark-purple transition',
              'bg-gradient-to-r from-sayu-lime-cream/80 to-sayu-pearl/80 shadow-lg shadow-sayu-lime-cream/30',
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
