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
        'flex w-full flex-col gap-1.5 text-sm leading-relaxed',
        isUser ? 'items-end text-right' : 'items-start text-left'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 rounded-sm',
          isSystem
            ? 'border border-amber-500/20 bg-amber-500/10 text-amber-200/90'
            : isUser
            ? 'bg-white/10 text-white/90 border border-white/10'
            : 'bg-white/[0.03] text-white/80 border border-white/5'
        )}
      >
        {message.emoji ? (
          <span className="mr-1.5 text-base leading-none">{message.emoji}</span>
        ) : null}
        <span className="font-light">{message.content}</span>
        {message.subtitle ? (
          <p className={cn(
            "mt-2 text-xs font-light",
            isUser ? "text-white/50" : "text-white/40"
          )}>{message.subtitle}</p>
        ) : null}
      </div>
      <span className="text-[9px] uppercase tracking-widest text-white/20 px-1">
        {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </motion.div>
  );
});
