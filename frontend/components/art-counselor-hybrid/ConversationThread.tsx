'use client';

import { useEffect, useRef } from 'react';
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
    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
      {messages.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/6 p-6 text-sm text-white/60">
          감정과 예술을 이어줄 첫 대화를 준비하고 있어요 ✨
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
