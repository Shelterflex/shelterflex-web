"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Building2,
  CheckCheck,
  Clock,
  ChevronLeft,
  MessageSquareOff,
  MessageCircle,
  Lock,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listConversations,
  listMessages,
  sendMessage,
  markConversationRead,
  getOrCreateConversation,
  type Conversation,
  type Message,
} from "@/lib/messagesApi";
import { getCurrentUser } from "@/lib/authApi";
import useAuthStore from "@/store/useAuthStore";
import { sanitizeText } from "@/lib/sanitize";
import { showErrorToast } from "@/lib/toast";
import { formatRelativeTime } from "@/lib/i18n-utils";
import type { Locale } from "@/i18n";

type DisplayMessage = Message & {
  clientStatus?: "sending" | "failed";
};

const MESSAGES_POLL_MS = 5000;
const CONVERSATIONS_POLL_MS = 15000;

function otherParticipantId(
  conv: Conversation,
  currentUserId: string | null,
): string | null {
  if (!currentUserId) return conv.participantIds[0] ?? null;
  return conv.participantIds.find((id) => id !== currentUserId) ?? null;
}

// The messaging API doesn't return participant display names yet (only
// user-ids) -- filed as Shelterflex/shelterflex-api#32. Fall back to a
// short, stable label derived from the id rather than inventing a name.
function participantLabel(userId: string | null): string {
  if (!userId) return "Unknown user";
  return `User ${userId.slice(0, 8)}`;
}

function participantInitials(userId: string | null): string {
  if (!userId) return "?";
  return userId.slice(0, 2).toUpperCase();
}

function mergeMessages(
  existing: DisplayMessage[],
  incoming: DisplayMessage[],
): DisplayMessage[] {
  const byId = new Map(existing.map((m) => [m.messageId, m]));
  for (const msg of incoming) {
    byId.set(msg.messageId, msg);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function MessagesPageInner() {
  const { isAuthenticated } = useAuthStore();
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserError, setCurrentUserError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const newMessage = selectedConversationId ? drafts[selectedConversationId] || "" : "";
  const setNewMessage = useCallback(
    (val: string) => {
      if (selectedConversationId) {
        setDrafts((prev) => ({ ...prev, [selectedConversationId]: val }));
      }
    },
    [selectedConversationId],
  );

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSelected = useRef(false);
  const hasHandledIntent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Resolve "who am I" once, so messages can be told apart as mine vs. theirs.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getCurrentUser();
        if (!cancelled) setCurrentUserId(res.user.id);
      } catch (err) {
        if (!cancelled) {
          setCurrentUserError(err instanceof Error ? err.message : "Failed to load your profile");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const refreshConversations = useCallback(async () => {
    setConversationsError(null);
    try {
      const page = await listConversations({ limit: 50 });
      setConversations(page.conversations);
    } catch (err) {
      setConversationsError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshConversations();
    const interval = setInterval(() => {
      if (!document.hidden) refreshConversations();
    }, CONVERSATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshConversations]);

  // Start (or resume) a conversation when linked in with ?recipientId=...
  useEffect(() => {
    if (hasHandledIntent.current) return;
    const recipientId = searchParams.get("recipientId");
    if (!recipientId) return;
    hasHandledIntent.current = true;

    const listingId = searchParams.get("listingId") ?? undefined;
    const dealId = searchParams.get("dealId") ?? undefined;

    (async () => {
      try {
        const conv = await getOrCreateConversation({ recipientId, listingId, dealId });
        hasAutoSelected.current = true;
        setSelectedConversationId(conv.conversationId);
        setConversations((prev) => {
          const exists = prev.some((c) => c.conversationId === conv.conversationId);
          return exists ? prev : [conv, ...prev];
        });
      } catch (err) {
        showErrorToast(err, "Could not start conversation");
      } finally {
        router.replace(pathname, { scroll: false });
      }
    })();
  }, [searchParams, router, pathname]);

  // Default to the most recent conversation once the list has loaded.
  useEffect(() => {
    if (hasAutoSelected.current) return;
    if (conversations.length === 0) return;
    hasAutoSelected.current = true;
    setSelectedConversationId((prev) => prev ?? conversations[0].conversationId);
  }, [conversations]);

  // Load the thread for the selected conversation.
  useEffect(() => {
    if (!selectedConversationId) return;
    let cancelled = false;
    setMessagesLoading(true);
    setMessagesError(null);
    setMessages([]);
    setNextCursor(null);

    (async () => {
      try {
        const page = await listMessages(selectedConversationId, { limit: 30 });
        if (cancelled) return;
        setMessages(mergeMessages([], page.messages));
        setNextCursor(page.nextCursor);

        try {
          await markConversationRead(selectedConversationId);
          if (!cancelled) {
            setConversations((prev) =>
              prev.map((c) =>
                c.conversationId === selectedConversationId ? { ...c, unreadCount: 0 } : c,
              ),
            );
          }
        } catch {
          // Non-critical -- the unread badge just won't clear until the next successful call.
        }
      } catch (err) {
        if (!cancelled) {
          setMessagesError(err instanceof Error ? err.message : "Failed to load messages");
        }
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  // Poll for new messages in the open conversation.
  useEffect(() => {
    if (!selectedConversationId) return;
    const interval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const page = await listMessages(selectedConversationId, { limit: 30 });
        setMessages((prev) => mergeMessages(prev, page.messages));
      } catch {
        // Silent -- transient poll failures shouldn't interrupt the thread;
        // the manual error state covers a hard failure to load.
      }
    }, MESSAGES_POLL_MS);
    return () => clearInterval(interval);
  }, [selectedConversationId]);

  const handleLoadOlder = useCallback(async () => {
    if (!selectedConversationId || !nextCursor || isLoadingOlder) return;
    setIsLoadingOlder(true);
    try {
      const page = await listMessages(selectedConversationId, { before: nextCursor });
      setMessages((prev) => mergeMessages(prev, page.messages));
      setNextCursor(page.nextCursor);
    } catch (err) {
      showErrorToast(err, "Failed to load older messages");
    } finally {
      setIsLoadingOlder(false);
    }
  }, [selectedConversationId, nextCursor, isLoadingOlder]);

  const handleSendMessage = useCallback(async () => {
    const text = sanitizeText(newMessage).trim();
    if (!text || isSending || !selectedConversationId || !currentUserId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: DisplayMessage = {
      messageId: tempId,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      body: text,
      readBy: [currentUserId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientStatus: "sending",
    };

    setMessages((prev) => mergeMessages(prev, [optimisticMsg]));
    setNewMessage("");
    setIsSending(true);

    try {
      const real = await sendMessage(selectedConversationId, text);
      setMessages((prev) => mergeMessages(prev.filter((m) => m.messageId !== tempId), [real]));
      refreshConversations();
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.messageId === tempId ? { ...m, clientStatus: "failed" as const } : m)),
      );
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, selectedConversationId, currentUserId, refreshConversations, setNewMessage]);

  const handleRetry = useCallback(
    async (failedMsg: DisplayMessage) => {
      if (isSending || !selectedConversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === failedMsg.messageId ? { ...m, clientStatus: "sending" as const } : m,
        ),
      );
      setIsSending(true);

      try {
        const real = await sendMessage(selectedConversationId, failedMsg.body);
        setMessages((prev) =>
          mergeMessages(prev.filter((m) => m.messageId !== failedMsg.messageId), [real]),
        );
        refreshConversations();
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.messageId === failedMsg.messageId ? { ...m, clientStatus: "failed" as const } : m,
          ),
        );
      } finally {
        setIsSending(false);
      }
    },
    [isSending, selectedConversationId, refreshConversations],
  );

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const label = participantLabel(otherParticipantId(conv, currentUserId)).toLowerCase();
    const preview = (conv.lastMessage?.body ?? "").toLowerCase();
    return label.includes(q) || preview.includes(q);
  });

  const selectedConv = conversations.find((c) => c.conversationId === selectedConversationId);
  const selectedOtherId = selectedConv ? otherParticipantId(selectedConv, currentUserId) : null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20">
        <div className="mx-auto max-w-md border-3 border-foreground bg-card p-8 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-3 border-foreground bg-muted">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-mono text-2xl font-black mb-3">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access your messages and connect with
            landlords and residents.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full border-3 border-foreground bg-primary py-6 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full border-3 border-foreground bg-transparent py-6 font-bold shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20">
        {currentUserError ? (
          <div className="mx-auto max-w-md border-3 border-destructive bg-destructive/10 p-8 text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
            <h1 className="font-bold text-destructive mb-2">Couldn&apos;t load your account</h1>
            <p className="text-sm text-destructive/80 mb-4">{currentUserError}</p>
            <Button
              variant="outline"
              className="border-2 border-destructive text-destructive hover:bg-destructive/20"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background pt-20">
      {/* Conversations List */}
      <aside
        className={`w-full border-r-3 border-foreground bg-card md:w-80 lg:w-96 ${selectedConversationId ? "hidden md:block" : "block"}`}
      >
        <div className="border-b-3 border-foreground p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Link href="/dashboard/landlord">
              <Button
                variant="outline"
                size="icon"
                className="border-3 border-foreground bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-3 border-foreground pl-10 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            />
          </div>
        </div>

        <div className="h-[calc(100vh-180px)] overflow-y-auto">
          {conversationsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : conversationsError ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <h3 className="mt-4 font-bold text-destructive">Couldn&apos;t load conversations</h3>
              <p className="mt-2 text-sm text-muted-foreground">{conversationsError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-2 border-destructive text-destructive"
                onClick={() => refreshConversations()}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-muted">
                <MessageSquareOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-bold">No conversations found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Your messages will appear here"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherId = otherParticipantId(conv, currentUserId);
              const label = participantLabel(otherId);
              const unread = conv.unreadCount ?? 0;
              return (
                <button
                  key={conv.conversationId}
                  aria-label={`Select conversation with ${label}`}
                  onClick={() => setSelectedConversationId(conv.conversationId)}
                  className={`w-full border-b-3 border-foreground p-4 text-left transition-colors ${
                    selectedConversationId === conv.conversationId
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border-3 border-foreground bg-accent font-bold">
                      {participantInitials(otherId)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{label}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(conv.lastMessage?.createdAt ?? conv.updatedAt, locale)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm">
                        {conv.lastMessage?.body ?? "No messages yet"}
                      </p>
                    </div>
                    {unread > 0 && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-xs font-bold">
                        {unread}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Area */}
      {selectedConv ? (
        <main
          className={`flex flex-1 flex-col ${selectedConversationId ? "block" : "hidden md:block"}`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b-3 border-foreground bg-card p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile back button */}
              <button
                onClick={() => setSelectedConversationId(null)}
                aria-label="Back to conversations"
                className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-muted md:hidden"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-accent text-sm font-bold md:h-12 md:w-12 md:text-base">
                {participantInitials(selectedOtherId)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold md:text-base">
                  {participantLabel(selectedOtherId)}
                </h2>
                {selectedConv.listingId && (
                  <Link
                    href={`/properties/${selectedConv.listingId}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:text-sm"
                  >
                    <Building2 className="h-3 w-3 shrink-0" />
                    View listing
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled
                className="hidden border-3 border-foreground bg-transparent shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] sm:flex"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled
                className="hidden border-3 border-foreground bg-transparent shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] sm:flex"
              >
                <Video className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-3 border-foreground bg-transparent shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-3 border-foreground">
                  {selectedConv.listingId && (
                    <DropdownMenuItem asChild>
                      <Link href={`/properties/${selectedConv.listingId}`}>View Listing</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem disabled>Block User</DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-destructive">
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto bg-muted/30 p-6"
            role="log"
            aria-live="polite"
            aria-label="Message thread"
          >
            <div className="mx-auto max-w-3xl space-y-4">
              {nextCursor && !messagesLoading && (
                <div className="flex justify-center pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadOlder}
                    disabled={isLoadingOlder}
                    className="border-2 border-foreground bg-transparent text-xs font-bold"
                  >
                    {isLoadingOlder && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Load older messages
                  </Button>
                </div>
              )}

              {messagesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messagesError ? (
                <div className="border-3 border-destructive bg-destructive/10 p-6 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
                  <h3 className="font-bold text-destructive mb-2">Couldn&apos;t load messages</h3>
                  <p className="text-sm text-destructive/80 mb-4">{messagesError}</p>
                  <Button
                    variant="outline"
                    className="border-2 border-destructive text-destructive hover:bg-destructive/20"
                    onClick={() => setSelectedConversationId((id) => (id ? `${id}` : id))}
                  >
                    Try Again
                  </Button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-bold">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Send a message to start the conversation.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = message.senderId === currentUserId;
                  const safeBody = sanitizeText(message.body);
                  const isRead = selectedOtherId ? message.readBy.includes(selectedOtherId) : false;
                  return (
                    <div
                      key={message.messageId}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      aria-label={`Message from ${isMine ? "you" : "other"}: ${safeBody.slice(0, 50)}`}
                    >
                      <div
                        className={`max-w-md border-3 border-foreground p-4 ${
                          isMine
                            ? "bg-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                            : "bg-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                        }`}
                      >
                        <p className="text-sm break-words">{safeBody}</p>
                        <div className="mt-2 flex items-center justify-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMine && (
                            <>
                              {message.clientStatus === "sending" && (
                                <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                              )}
                              {message.clientStatus === "failed" && (
                                <AlertCircle className="h-3 w-3 text-destructive" />
                              )}
                              {!message.clientStatus && isRead && (
                                <CheckCheck className="h-3 w-3 text-secondary" />
                              )}
                              {!message.clientStatus && !isRead && (
                                <Clock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </>
                          )}
                        </div>
                        {message.clientStatus === "failed" && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetry(message)}
                              disabled={isSending}
                              className="border-2 border-destructive text-destructive text-xs font-bold"
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Retry
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t-3 border-foreground bg-card p-3 md:p-4">
            <div className="mx-auto flex max-w-3xl gap-2 md:gap-4">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
                className="flex-1 border-3 border-foreground py-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:py-6"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                aria-label={isSending ? "Sending message" : "Send message"}
                className="border-3 border-foreground bg-primary px-4 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50 md:px-6"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex flex-1 items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-3 border-foreground bg-muted">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">Select a conversation</h2>
            <p className="mt-2 text-muted-foreground">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </main>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesPageInner />
    </Suspense>
  );
}
