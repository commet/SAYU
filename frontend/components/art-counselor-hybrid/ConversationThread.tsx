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
    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 bg-neutral-50">
      {messages.length === 0 ? (
        <div className="border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          감정과 예술을 이어줄 첫 대화를 준비하고 있어요
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
