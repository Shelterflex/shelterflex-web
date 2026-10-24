import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MessagesPage from "./page";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Conversation, Message } from "@/lib/messagesApi";

const ME = "me-000000-0000";
const ADA = "ada-11111-1111";
const BAYO = "bayo-2222-2222";

vi.mock("next-intl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-intl")>()),
  useLocale: () => "en",
}));

vi.mock("@/store/useAuthStore", () => ({
  default: () => ({ isAuthenticated: true }),
}));

vi.mock("@/lib/authApi", () => ({
  getCurrentUser: vi.fn(async () => ({ user: { id: ME, email: "me@example.com", name: "Me", role: "tenant" } })),
}));

const api = vi.hoisted(() => ({
  listConversations: vi.fn(),
  listMessages: vi.fn(),
  sendMessage: vi.fn(),
  markConversationRead: vi.fn(),
  getOrCreateConversation: vi.fn(),
}));
vi.mock("@/lib/messagesApi", () => api);

window.HTMLElement.prototype.scrollIntoView = vi.fn();

function conversation(id: string, other: string): Conversation {
  const now = new Date().toISOString();
  return { conversationId: id, participantIds: [ME, other], createdAt: now, updatedAt: now, unreadCount: 0 };
}

function message(conversationId: string, body: string, senderId = ME): Message {
  const now = new Date().toISOString();
  return { messageId: `m-${body}`, conversationId, senderId, body, readBy: [senderId], createdAt: now, updatedAt: now };
}

async function renderWithThread() {
  render(<MessagesPage />);
  // The first conversation is opened automatically once the list loads.
  await screen.findByRole("heading", { level: 2, name: /User ada-1111/ });
  return screen.findByPlaceholderText(/type your message/i);
}

describe("MessagesPage", () => {
  beforeEach(() => {
    api.listConversations.mockResolvedValue({
      conversations: [conversation("c1", ADA), conversation("c2", BAYO)],
      nextCursor: null,
    });
    api.listMessages.mockResolvedValue({ messages: [], nextCursor: null, total: 0 });
    api.markConversationRead.mockResolvedValue(undefined);
    api.sendMessage.mockImplementation(async (conversationId: string, body: string) =>
      message(conversationId, body),
    );
  });

  it("preserves draft text when switching between conversations", async () => {
    const input = await renderWithThread();

    fireEvent.change(input, { target: { value: "Draft for Ada" } });
    fireEvent.click(screen.getByLabelText(/Select conversation with User bayo-222/));
    await screen.findByRole("heading", { level: 2, name: /User bayo-222/ });
    expect(input).toHaveValue("");

    fireEvent.change(input, { target: { value: "Draft for Bayo" } });
    fireEvent.click(screen.getByLabelText(/Select conversation with User ada-1111/));
    await screen.findByRole("heading", { level: 2, name: /User ada-1111/ });
    expect(input).toHaveValue("Draft for Ada");
  });

  it("clears the selection when the mobile back button is pressed", async () => {
    await renderWithThread();

    fireEvent.click(screen.getByLabelText("Back to conversations"));

    expect(screen.getByText(/Select a conversation/i)).toBeInTheDocument();
  });

  it("shows the message straight away and keeps it once the send succeeds", async () => {
    const input = await renderWithThread();

    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(screen.getByText("Hello!")).toBeInTheDocument();
    await waitFor(() => expect(api.sendMessage).toHaveBeenCalledWith("c1", "Hello!"));
    expect(await screen.findByText("Hello!")).toBeInTheDocument();
  });

  it("offers a retry when sending fails", async () => {
    api.sendMessage.mockRejectedValueOnce(new Error("network down"));
    const input = await renderWithThread();

    fireEvent.change(input, { target: { value: "Will fail" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    fireEvent.click(await screen.findByText("Retry"));
    await waitFor(() => expect(api.sendMessage).toHaveBeenCalledTimes(2));
  });

  it("announces the message thread politely to assistive tech", async () => {
    await renderWithThread();

    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
  });

  it("sends sanitized text", async () => {
    const input = await renderWithThread();

    fireEvent.change(input, { target: { value: "<script>alert('xss')</script>Hello" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    await waitFor(() => expect(api.sendMessage).toHaveBeenCalled());
    expect(api.sendMessage.mock.calls[0][1]).not.toContain("<script>");
  });

  it("prevents duplicate sends while a message is in flight", async () => {
    let finish: (m: Message) => void = () => {};
    api.sendMessage.mockImplementationOnce(() => new Promise<Message>((resolve) => { finish = resolve; }));
    const input = await renderWithThread();

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(screen.getByLabelText("Sending message")).toBeDisabled();
    finish(message("c1", "Test message"));
    await screen.findByLabelText("Send message");
    expect(api.sendMessage).toHaveBeenCalledTimes(1);
  });
});
