'use client';

import { ConversationMessage, ConversationRole } from './types';

export const createMessage = (
  role: ConversationRole,
  content: string,
  extras: Partial<ConversationMessage> = {}
): ConversationMessage => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${role}-${Date.now()}`,
  role,
  content,
  createdAt: new Date().toISOString(),
  ...extras,
});
