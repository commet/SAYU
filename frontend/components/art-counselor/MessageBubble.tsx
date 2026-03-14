'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/art-counselor/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  streamingContent?: string;
}

export function MessageBubble({
  message,
  isStreaming,
  streamingContent,
}: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const displayContent =
    isStreaming && isAssistant ? streamingContent || '' : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'w-full',
        isAssistant ? 'flex justify-start' : 'flex justify-end'
      )}
    >
      {isAssistant ? (
        <div className="max-w-[88%] md:max-w-[80%]">
          <p
            className="text-white/80 text-[15px] leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            {displayContent}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-block w-[2px] h-[0.85em] bg-white/50 ml-0.5 align-middle"
              />
            )}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            'max-w-[85%] md:max-w-[75%]',
            'bg-white/[0.06] rounded-lg',
            'px-4 py-2.5'
          )}
        >
          <p className="text-white/70 text-[15px] leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
        </div>
      )}
    </motion.div>
  );
}
