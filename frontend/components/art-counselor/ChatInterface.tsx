'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { SessionSummary } from './SessionSummary';
import type { ChatMessage, ChatOption, SessionStage } from '@/lib/art-counselor/types';

interface ChatInterfaceProps {
  stage: SessionStage;
  messages: ChatMessage[];
  streamingContent: string;
  isStreaming: boolean;
  options: ChatOption[];
  summary: string | null;
  moodTags: string[];
  onSendMessage: (content: string, optionId?: string) => void;
  onNewSession: () => void;
  onViewTimeline: () => void;
}

export function ChatInterface({
  stage,
  messages,
  streamingContent,
  isStreaming,
  options,
  summary,
  moodTags,
  onSendMessage,
  onNewSession,
  onViewTimeline,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingContent, stage]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto overscroll-contain',
          'px-4 pt-4 pb-2',
          'space-y-5'
        )}
      >
        {messages.map((msg, index) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming message (not yet committed to messages array) */}
        {isStreaming && streamingContent && (
          <MessageBubble
            message={{
              id: '__streaming__',
              role: 'assistant',
              content: '',
              timestamp: new Date().toISOString(),
            }}
            isStreaming
            streamingContent={streamingContent}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom area: input or summary */}
      {stage === 'complete' && summary ? (
        <SessionSummary
          summary={summary}
          moodTags={moodTags}
          onNewSession={onNewSession}
          onViewTimeline={onViewTimeline}
        />
      ) : (
        <ChatInput
          options={options}
          isStreaming={isStreaming}
          onSendMessage={onSendMessage}
          stage={stage}
        />
      )}
    </div>
  );
}
