'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="space-y-3 p-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 bg-white/[0.02] p-4 rounded-sm"
      >
        <label className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-white/40">
          지금 떠오르는 생각이나 기억이 있다면 적어주세요
        </label>
        <textarea
          value={value}
          disabled={isLoading}
          onChange={(event) => setValue(event.target.value)}
          placeholder="이 작품이 건네준 감정, 기억, 이야기를 자유롭게 적어주세요."
          className={cn(
            "min-h-[150px] w-full resize-none px-3 py-3 text-sm font-light",
            "bg-white/[0.03] border border-white/10 rounded-sm",
            "text-white/90 outline-none placeholder:text-white/30",
            "focus:border-white/20 transition-colors"
          )}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={isLoading || !value.trim()}
            onClick={handleSubmit}
            className={cn(
              'px-5 py-2.5 text-xs font-light text-white/90 transition-all rounded-sm',
              'bg-white/10 border border-white/20 hover:bg-white/15',
              (isLoading || !value.trim()) && 'opacity-40 cursor-not-allowed'
            )}
          >
            감정을 담아 보내기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
