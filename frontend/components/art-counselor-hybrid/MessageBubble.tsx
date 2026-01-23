'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ConversationMessage } from '@/lib/art-counselor/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ConversationMessage;
}

export const MessageBubble = memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex w-full flex-col gap-2 text-sm leading-relaxed',
        isUser ? 'items-end text-right' : 'items-start text-left'
      )}
    >
      <div
        className={cn(
          'max-w-[88%] px-4 py-3',
          isSystem
            ? 'border border-amber-200 bg-amber-50 text-amber-900'
            : isUser
            ? 'border border-neutral-900 bg-neutral-900 text-white'
            : 'border border-neutral-200 bg-white text-neutral-900'
        )}
      >
        {message.emoji ? (
          <span className="mr-1 text-lg leading-none">{message.emoji}</span>
        ) : null}
        <span>{message.content}</span>
        {message.subtitle ? (
          <p className={cn(
            "mt-1 text-xs",
            isUser ? "text-neutral-300" : "text-neutral-500"
          )}>{message.subtitle}</p>
        ) : null}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-neutral-400">
        {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </motion.div>
  );
});
