'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ConversationMessage } from '@/lib/art-counselor/types';
import { MessageBubble } from './MessageBubble';

interface ConversationThreadProps {
  messages: ConversationMessage[];
}

export function ConversationThread({ messages }: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 bg-transparent">
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <p className="text-white/40 text-sm font-light">
            작품과의 대화를 준비하고 있어요
          </p>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-white/30 mx-auto mt-4"
          />
        </motion.div>
      ) : (
        messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <MessageBubble message={message} />
          </motion.div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
