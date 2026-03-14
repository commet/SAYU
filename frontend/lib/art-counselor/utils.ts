'use client';

import { ChatMessage } from './types';

export function createMessage(
  role: 'user' | 'assistant',
  content: string
): ChatMessage {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${role}-${Date.now()}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}
