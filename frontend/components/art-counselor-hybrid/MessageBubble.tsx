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
          'max-w-[88%] rounded-2xl px-4 py-3 shadow-sm shadow-black/10',
          isSystem
            ? 'bg-amber-100/80 text-amber-950 dark:bg-amber-200/30 dark:text-amber-100'
            : isUser
            ? 'bg-gradient-to-r from-sayu-lavender-dream/80 to-sayu-peach-breeze/80 text-sayu-dark-purple'
            : 'bg-white/80 text-sayu-text-primary backdrop-blur'
        )}
      >
        {message.emoji ? (
          <span className="mr-1 text-lg leading-none">{message.emoji}</span>
        ) : null}
        <span>{message.content}</span>
        {message.subtitle ? (
          <p className="mt-1 text-xs text-white/70">{message.subtitle}</p>
        ) : null}
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
        {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </motion.div>
  );
});
