import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit3, Paperclip, Smile, Send, Trash2, Ban, ShieldCheck, Search, ArrowLeft, Phone, CheckCheck, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  apiGetConversations,
  apiGetMessages,
  apiGetOrCreateConversation,
  apiGetUserRequests,
  apiSendMessage,
  apiDeleteConversation,
  apiBlockUser,
  apiGetBlockedUsers,
  apiUnblockUser,
} from '../lib/api';
import { getAvatarUrl } from '../lib/media';

type Conversation = {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  userId: string;
  unreadCount: number;
  isBlocked: boolean;
};

export function Messages() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    isIncoming: boolean;
    time: string;
    senderName: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentType?: string | null;
    status?: 'delivered' | 'read';
  }>>([]);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = ['😀', '😂', '😍', '👍', '🔥', '🎉', '🙏', '📚', '✅', '💬', '❤️', '😊'];

  async function loadConversations() {
    const [conversations, requests, blocked] = await Promise.all([
      apiGetConversations(),
      apiGetUserRequests(),
      apiGetBlockedUsers(),
    ]);
    setBlockedUsers(blocked);

    let list: Conversation[] = conversations.map((c) => ({
      id: c.id,
      name: c.otherUser.name,
      message: c.lastMessage || 'Start conversation',
      time: 'recent',
      avatar: getAvatarUrl({ name: c.otherUser.name, email: c.otherUser.email, id: c.otherUser.id }),
      userId: c.otherUser.id,
      unreadCount: c.unreadCount || 0,
      isBlocked: c.isBlocked,
    }));

    if (list.length === 0 && requests.length > 0) {
      const seeded: Conversation[] = [];
      for (const r of requests.slice(0, 10)) {
        const partnerId = r.isOutgoing ? r.ownerId : r.borrowerId;
        if (!partnerId) continue;
        const conv = await apiGetOrCreateConversation(partnerId);
        seeded.push({
          id: conv.id,
          name: r.user,
          message: `${r.title} • ${r.status}`,
          time: 'recent',
          avatar: getAvatarUrl({ name: r.user, id: partnerId }),
          userId: partnerId,
          unreadCount: 0,
          isBlocked: false,
        });
      }
      list = seeded;
    }

    setItems(list);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadConversations();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      loadConversations().catch(() => undefined);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    (async () => {
      const data = await apiGetMessages(activeId);
      if (!cancelled) {
        setMessages(data.map((m) => ({
          id: m.id,
          content: m.content,
          isIncoming: m.isIncoming,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: m.sender.name,
          attachmentUrl: m.attachmentUrl,
          attachmentName: m.attachmentName,
          attachmentType: m.attachmentType,
          status: m.status,
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const id = setInterval(async () => {
      const data = await apiGetMessages(activeId);
      setMessages(data.map((m) => ({
        id: m.id,
        content: m.content,
        isIncoming: m.isIncoming,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: m.sender.name,
        attachmentUrl: m.attachmentUrl,
        attachmentName: m.attachmentName,
        attachmentType: m.attachmentType,
        status: m.status,
      })));
    }, 2000);
    return () => clearInterval(id);
  }, [activeId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const active = useMemo(() => items.find((i) => i.id === activeId) || null, [items, activeId]);
  const filteredItems = useMemo(() =>
    items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.message.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  async function handleSend() {
    if (!activeId || (!text.trim() && !attachment)) return;
    setError(null);
    setSending(true);
    try {
      const created = await apiSendMessage(activeId, text.trim(), attachment);
      setMessages((prev) => [
        ...prev,
        {
          id: created.id,
          content: created.content,
          isIncoming: false,
          time: new Date(created.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: created.sender?.name || 'You',
          attachmentUrl: created.attachmentUrl,
          attachmentName: created.attachmentName,
          attachmentType: created.attachmentType,
          status: created.status || 'delivered',
        },
      ]);
      setItems((prev) =>
        prev.map((i) => (i.id === activeId ? { ...i, message: text.trim() || attachment?.name || 'Attachment', time: 'now' } : i))
      );
      setText('');
      setAttachment(null);
      setShowEmoji(false);
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteConversation() {
    if (!activeId) return;
    await apiDeleteConversation(activeId);
    setItems((prev) => prev.filter((i) => i.id !== activeId));
    setActiveId(null);
    setMessages([]);
  }

  async function handleBlockToggle() {
    if (!active) return;
    const alreadyBlocked = blockedUsers.some((u) => u.id === active.userId);
    if (alreadyBlocked) {
      await apiUnblockUser(active.userId);
    } else {
      await apiBlockUser(active.userId);
    }
    await loadConversations();
  }

  function openChat(id: string) {
    setActiveId(id);
    setShowSidebar(false); // Mobile: hide sidebar when chat opens
  }

  const isActiveBlocked = active ? blockedUsers.some((u) => u.id === active.userId) : false;

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 rounded-2xl overflow-hidden border border-primary/10 bg-surface shadow-sm">

      {/* ─── Sidebar / Conversations List ─── */}
      <div className={cn(
        "flex flex-col bg-surface-container-low border-r border-primary/10 shrink-0 transition-all duration-300",
        "w-full md:w-80 lg:w-96",
        // Mobile: hide when chat is open
        !showSidebar ? "hidden md:flex" : "flex"
      )}>
        {/* Sidebar Header */}
        <div className="px-4 pt-5 pb-3 shrink-0 bg-surface-container-low border-b border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-headline font-bold text-xl text-on-surface">Chats</h1>
            <button className="p-2 hover:bg-primary/5 rounded-full transition-colors text-on-surface-variant hover:text-primary">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-surface rounded-xl pl-9 pr-4 py-2.5 text-sm text-on-surface border border-primary/10 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-container animate-pulse rounded-full w-2/3" />
                    <div className="h-2.5 bg-surface-container animate-pulse rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageCircleIcon className="w-12 h-12 text-on-surface-variant/20 mb-3" />
              <p className="text-on-surface-variant text-sm font-medium">No conversations yet</p>
              <p className="text-on-surface-variant/60 text-xs mt-1">Request a book to start chatting</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ConversationRow
                key={item.id}
                {...item}
                isBlocked={blockedUsers.some(u => u.id === item.userId)}
                active={item.id === activeId}
                onClick={() => openChat(item.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── Chat Area ─── */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 min-w-0",
        // Mobile: show only when chat is active
        showSidebar ? "hidden md:flex" : "flex"
      )}>
        {active ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low border-b border-primary/10 shrink-0">
              {/* Mobile back button */}
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-1.5 -ml-1 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={active.avatar}
                  alt={active.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-surface-container-low rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-on-surface truncate">{active.name}</h3>
                <p className="text-[10px] text-on-surface-variant">
                  {isActiveBlocked ? '🚫 Blocked' : 'Active'}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!isActiveBlocked && (
                  <button
                    onClick={handleBlockToggle}
                    className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-primary/5 transition-colors"
                    title="Block user"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
                {isActiveBlocked && (
                  <button
                    onClick={handleBlockToggle}
                    className="p-2 text-green-500 hover:text-green-600 rounded-full hover:bg-green-500/10 transition-colors"
                    title="Unblock user"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleDeleteConversation}
                  className="p-2 text-on-surface-variant hover:text-red-500 rounded-full hover:bg-red-500/5 transition-colors"
                  title="Delete chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area - WhatsApp style background */}
            <div
              className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-1"
              style={{
                background: 'linear-gradient(to bottom, var(--color-surface-container-lowest), var(--color-surface))',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.015' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {/* Date separator */}
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface/80 backdrop-blur-sm border border-primary/10 shadow-sm">
                  Today
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <p className="text-sm text-on-surface-variant">No messages yet</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const isSameDirection = prevMsg && prevMsg.isIncoming === msg.isIncoming;
                  const isLast = idx === messages.length - 1 || messages[idx + 1].isIncoming !== msg.isIncoming;

                  return (
                    <ChatBubble
                      key={msg.id}
                      {...msg}
                      avatarSrc={active.avatar}
                      isFirst={!isSameDirection}
                      isLast={isLast}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <div className="px-4 py-2 bg-surface-container border-t border-primary/10 flex flex-wrap gap-2 shrink-0">
                {emojis.map((emo) => (
                  <button
                    key={emo}
                    onClick={() => setText(t => `${t}${emo}`)}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emo}
                  </button>
                ))}
              </div>
            )}

            {/* Attachment preview */}
            {attachment && (
              <div className="px-4 py-2 bg-primary/5 border-t border-primary/10 flex items-center gap-2 shrink-0">
                <Paperclip className="w-4 h-4 text-primary" />
                <span className="text-xs text-on-surface flex-1 truncate">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-xs text-red-400 hover:text-red-500">Remove</button>
              </div>
            )}

            {/* Input Bar */}
            <div className="px-3 py-3 bg-surface-container-low border-t border-primary/10 shrink-0">
              <div className="flex items-end gap-2">
                {/* Attachment */}
                <label className="p-2.5 text-on-surface-variant hover:text-primary rounded-full hover:bg-primary/5 transition-colors cursor-pointer shrink-0" title="Attach file">
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  />
                </label>

                {/* Message Input */}
                <div className="flex-1 flex items-end gap-2 bg-surface rounded-2xl px-4 py-2.5 border border-primary/15 focus-within:border-primary/30 transition-colors min-h-[44px]">
                  <textarea
                    value={text}
                    rows={1}
                    onChange={(e) => {
                      setText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isActiveBlocked ? "You've blocked this user" : "Type a message..."}
                    disabled={isActiveBlocked}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface resize-none outline-none py-0.5 max-h-[120px] disabled:opacity-50"
                    style={{ lineHeight: '1.4' }}
                  />
                  <button
                    onClick={() => setShowEmoji(v => !v)}
                    className={cn("p-0.5 transition-colors shrink-0", showEmoji ? "text-primary" : "text-on-surface-variant hover:text-primary")}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!activeId || (!text.trim() && !attachment) || sending || isActiveBlocked}
                  className="w-11 h-11 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-sm shrink-0"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-2 px-2">{error}</p>}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 bg-surface-container-lowest">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 border border-primary/10">
              <MessageCircleIcon className="w-9 h-9 text-on-surface-variant/30" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2 italic">Select a Conversation</h3>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Choose a conversation from the left or request a book to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation list row
function ConversationRow({ name, message, time, active, avatar, onClick, unreadCount, isBlocked }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150",
        active
          ? "bg-primary/8 border-r-2 border-primary"
          : "hover:bg-surface-container"
      )}
    >
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {active && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-low rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn(
            "text-sm font-semibold truncate",
            active ? "text-primary" : "text-on-surface"
          )}>
            {name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isBlocked && <span className="text-[9px] text-red-400 font-bold">BLOCKED</span>}
            <span className="text-[10px] text-on-surface-variant">{time}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-xs truncate",
            active ? "text-on-surface-variant" : "text-on-surface-variant/60"
          )}>
            {message}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 shrink-0 min-w-[18px] h-[18px] bg-primary text-on-primary rounded-full text-[9px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// Chat bubble
function ChatBubble({
  content, isIncoming, time, status, attachmentUrl, attachmentName, avatarSrc, isFirst, isLast
}: {
  content: string; isIncoming: boolean; time: string; status?: string;
  attachmentUrl?: string | null; attachmentName?: string | null;
  avatarSrc: string; isFirst?: boolean; isLast?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-end gap-2 mb-0.5",
      isIncoming ? "flex-row" : "flex-row-reverse",
      isFirst && "mt-3"
    )}>
      {/* Avatar - only on last incoming bubble */}
      {isIncoming ? (
        isLast ? (
          <img src={avatarSrc} className="w-7 h-7 rounded-full object-cover shrink-0" alt="avatar" />
        ) : (
          <div className="w-7 shrink-0" />
        )
      ) : null}

      {/* Bubble */}
      <div className={cn(
        "max-w-[75%] sm:max-w-[65%]",
        isIncoming ? "ml-0" : "mr-0"
      )}>
        <div className={cn(
          "px-3 py-2 shadow-sm",
          "relative",
          isIncoming
            ? "bg-surface-container-high text-on-surface rounded-2xl rounded-bl-sm"
            : "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-white rounded-2xl rounded-br-sm",
        )}>
          {content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
          )}
          {attachmentUrl && (
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "mt-1.5 block text-xs underline underline-offset-2",
                isIncoming ? "text-primary" : "text-[#075e54]"
              )}
            >
              📎 {attachmentName || 'Open attachment'}
            </a>
          )}
          <div className={cn(
            "flex items-center gap-1 mt-1",
            isIncoming ? "justify-start" : "justify-end"
          )}>
            <span className="text-[10px] opacity-50">{time}</span>
            {!isIncoming && (
              status === 'read'
                ? <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                : <Check className="w-3 h-3 opacity-50" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple icon placeholder
function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
