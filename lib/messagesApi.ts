/**
 * Messaging API Client
 * Handles conversations and messages against the real messaging service
 * (shelterflex-api src/routes/messages.ts, mounted at /api/v1/messages).
 *
 * Delivery mechanism: cursor-based polling, matching the backend's chosen
 * approach (see that route file's doc comment) -- there is no push/SSE/
 * WebSocket fan-out for new messages yet.
 */

import { apiGet, apiPost } from "./apiClient";
import { withQuery } from "./apiClient";

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  body: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  conversationId: string;
  participantIds: string[];
  listingId?: string | null;
  dealId?: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface MessagePage {
  messages: Message[];
  nextCursor: string | null;
  total: number;
}

export interface ConversationPage {
  conversations: Conversation[];
  nextCursor: string | null;
}

export interface CreateConversationInput {
  recipientId: string;
  listingId?: string;
  dealId?: string;
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

export async function getOrCreateConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  const res = await apiPost<Envelope<Conversation>>(
    "/messages/conversations",
    input,
  );
  return res.data;
}

export async function listConversations(params?: {
  limit?: number;
  cursor?: string;
}): Promise<ConversationPage> {
  const path = withQuery(
    "/messages/conversations",
    (params ?? {}) as Record<string, string | number | boolean | undefined | null>,
  );
  const res = await apiGet<Envelope<ConversationPage>>(path);
  return res.data;
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  const res = await apiGet<Envelope<Conversation>>(
    `/messages/conversations/${encodeURIComponent(conversationId)}`,
  );
  return res.data;
}

export async function listMessages(
  conversationId: string,
  params?: { limit?: number; before?: string },
): Promise<MessagePage> {
  const path = withQuery(
    `/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
    (params ?? {}) as Record<string, string | number | boolean | undefined | null>,
  );
  const res = await apiGet<Envelope<MessagePage>>(path);
  return res.data;
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<Message> {
  const res = await apiPost<Envelope<Message>>(
    `/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
    { body },
  );
  return res.data;
}

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  await apiPost<{ success: boolean }>(
    `/messages/conversations/${encodeURIComponent(conversationId)}/read`,
    {},
  );
}
