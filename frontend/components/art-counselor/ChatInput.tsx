'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatOption, SessionStage } from '@/lib/art-counselor/types';

interface ChatInputProps {
  options: ChatOption[];
  isStreaming: boolean;
  onSendMessage: (content: string, optionId?: string) => void;
  stage: SessionStage;
}

export function ChatInput({
  options,
  isStreaming,
  onSendMessage,
  stage,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, isStreaming, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleOptionTap = useCallback(
    (option: ChatOption) => {
      if (isStreaming) return;
      onSendMessage(option.label, option.id);
    },
    [isStreaming, onSendMessage]
  );

  const handleTextareaInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  const isConnecting = stage === 'connecting';

  return (
    <div className="border-t border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-sm">
      {/* Streaming indicator */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 py-2 text-white/25 text-xs"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>응답 중...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Option buttons - hide during connecting stage */}
      <AnimatePresence>
        {!isConnecting && options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="px-4 pt-3 pb-1 space-y-2"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => handleOptionTap(option)}
                disabled={isStreaming}
                className={cn(
                  'w-full text-left px-4 py-3 text-sm',
                  'border border-white/10 rounded-lg',
                  'bg-white/[0.03] text-white/70',
                  'hover:bg-white/[0.06] hover:border-white/20',
                  'disabled:opacity-40 disabled:pointer-events-none',
                  'transition-colors duration-200'
                )}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text input */}
      <div className="px-4 py-3">
        {isConnecting ? (
          /* Connecting stage: larger textarea for reflection */
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTextareaInput();
              }}
              onKeyDown={handleKeyDown}
              placeholder="이 작품이 떠올리게 한 생각이나 기억을 적어주세요"
              disabled={isStreaming}
              rows={3}
              className={cn(
                'w-full bg-white/[0.03] border border-white/10 rounded-lg',
                'px-4 py-3 text-sm text-white/80',
                'placeholder:text-white/25',
                'focus:outline-none focus:border-white/20',
                'disabled:opacity-40',
                'resize-none transition-colors'
              )}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !text.trim()}
              className={cn(
                'w-full py-2.5 text-sm font-light rounded-lg',
                'border border-white/15 text-white/70',
                'hover:bg-white/[0.06] hover:border-white/25',
                'disabled:opacity-30 disabled:pointer-events-none',
                'transition-colors duration-200'
              )}
            >
              마무리하기
            </button>
          </div>
        ) : (
          /* Normal stage: inline input */
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTextareaInput();
              }}
              onKeyDown={handleKeyDown}
              placeholder="직접 입력하기..."
              disabled={isStreaming}
              rows={1}
              className={cn(
                'flex-1 bg-transparent border-0',
                'text-sm text-white/80 leading-relaxed',
                'placeholder:text-white/25',
                'focus:outline-none',
                'disabled:opacity-40',
                'resize-none min-h-[36px] max-h-[120px] py-1.5'
              )}
            />
            <AnimatePresence>
              {text.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSend}
                  disabled={isStreaming}
                  className={cn(
                    'p-2 rounded-full shrink-0',
                    'text-white/40 hover:text-white/60',
                    'disabled:opacity-30',
                    'transition-colors'
                  )}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
