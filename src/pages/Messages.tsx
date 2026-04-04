import React, { useMemo, useState, useEffect } from 'react';
import { MoreVertical, Edit3, Paperclip, Smile, Send, Trash2, Ban, ShieldCheck } from 'lucide-react';
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
  const emojis = ['😀', '😂', '😍', '👍', '🔥', '🎉', '🙏', '📚', '✅', '💬'];

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

    // Seed chats from request partners if chat doesn't exist yet.
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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      loadConversations().catch(() => undefined);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const data = await apiGetMessages(activeId);
      if (!cancelled) {
        setMessages(
          data.map((m) => ({
            id: m.id,
            content: m.content,
            isIncoming: m.isIncoming,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderName: m.sender.name,
            attachmentUrl: m.attachmentUrl,
            attachmentName: m.attachmentName,
            attachmentType: m.attachmentType,
            status: m.status,
          }))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const id = setInterval(async () => {
      const data = await apiGetMessages(activeId);
      setMessages(
        data.map((m) => ({
          id: m.id,
          content: m.content,
          isIncoming: m.isIncoming,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: m.sender.name,
          attachmentUrl: m.attachmentUrl,
          attachmentName: m.attachmentName,
          attachmentType: m.attachmentType,
          status: m.status,
        }))
      );
    }, 2000);
    return () => clearInterval(id);
  }, [activeId]);

  const active = useMemo(() => items.find((i) => i.id === activeId) || null, [items, activeId]);

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

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full min-h-[calc(100vh-4rem)] min-w-0">
      <div className="w-full lg:w-80 max-h-[40vh] lg:max-h-none border-b lg:border-b-0 lg:border-r border-primary/10 flex flex-col bg-surface-container-low shrink-0 min-h-0">
        <div className="p-4 lg:p-6 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold tracking-tight">Messages</h2>
            <button className="p-2 hover:bg-primary/5 rounded-full transition-colors">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 space-y-1">
          {loading ? (
            <p className="text-on-surface-variant text-sm px-4">Loading conversations...</p>
          ) : items.length === 0 ? (
            <p className="text-on-surface-variant text-sm px-4">No conversations yet.</p>
          ) : (
            items.map((item, idx) => (
              <ConversationItem
                key={item.id}
                name={item.name}
                message={item.message}
                time={item.time}
                active={item.id === activeId}
                avatar={item.avatar}
                onClick={() => setActiveId(item.id)}
                unreadCount={item.unreadCount}
                isBlocked={blockedUsers.some((u) => u.id === item.userId)}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-surface min-h-0 min-w-0">
        <header className="min-h-16 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-8 py-3 bg-surface/60 backdrop-blur-xl border-b border-primary/10 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={active?.avatar || getAvatarUrl({ name: 'User' })} alt={active?.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-surface rounded-full"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">{active?.name || 'No conversation selected'}</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                {active ? (blockedUsers.some((u) => u.id === active.userId) ? 'Blocked' : 'Active') : 'No chat selected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {active && (
              <>
                <button
                  onClick={handleBlockToggle}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                  title={blockedUsers.some((u) => u.id === active.userId) ? 'Unblock User' : 'Block User'}
                >
                  {blockedUsers.some((u) => u.id === active.userId) ? <ShieldCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleDeleteConversation}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                  title="Delete Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-6 sm:space-y-8 min-h-0">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-surface-container-low rounded-full text-[10px] text-on-surface-variant tracking-widest uppercase font-bold">Today</span>
          </div>
          
          {active ? (
            messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3 sm:gap-4 max-w-[min(100%,28rem)] sm:max-w-[80%]", !msg.isIncoming && "flex-row-reverse ml-auto")}>
                {msg.isIncoming && (
                  <img src={active.avatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto grayscale opacity-50" alt={active.name} />
                )}
                <div className={cn(
                  "p-4 rounded-2xl shadow-xl",
                  msg.isIncoming ? "bg-surface-container-high rounded-bl-none" : "bg-accent text-on-accent rounded-br-none"
                )}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.attachmentUrl && (
                    <a
                      href={msg.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mt-3 block text-xs underline",
                        msg.isIncoming ? "text-on-surface-variant" : "text-on-accent/80"
                      )}
                    >
                      {msg.attachmentName || 'Open attachment'}
                    </a>
                  )}
                  <span className={cn("text-[9px] mt-2 block uppercase tracking-widest font-bold opacity-40", !msg.isIncoming && "text-right")}>{msg.time}</span>
                  {!msg.isIncoming && (
                    <span className="text-[9px] block uppercase tracking-widest font-bold opacity-40 text-right">
                      {msg.status === 'read' ? 'Read' : 'Delivered'}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-surface-container-high border border-primary/10 text-on-surface-variant text-sm">
              No messages yet.
            </div>
          )}
        </div>

        <div className="p-4 sm:p-8 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 bg-surface-container-low p-2 pr-3 sm:pr-4 rounded-2xl border border-primary/10 focus-within:border-primary/25 transition-all duration-300">
            <label className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="Attach image/document">
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.txt,.doc,.docx"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface py-2"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!activeId || (!text.trim() && !attachment) || sending || blockedUsers.some((u) => u.id === active?.userId)}
                className="ml-2 w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:scale-[1.05] hover:bg-primary/90 transition-transform disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          {attachment && (
            <p className="text-xs text-on-surface-variant mt-2 max-w-4xl mx-auto">Attachment: {attachment.name}</p>
          )}
          {showEmoji && (
            <div className="max-w-4xl mx-auto mt-2 p-2 bg-surface-container rounded-xl border border-primary/10 flex gap-2 flex-wrap">
              {emojis.map((emo) => (
                <button
                  key={emo}
                  onClick={() => setText((t) => `${t}${emo}`)}
                  className="px-2 py-1 hover:bg-primary/10 rounded"
                >
                  {emo}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-red-500 text-sm mt-2 max-w-4xl mx-auto">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({ name, message, time, active, avatar, onClick, unreadCount, isBlocked }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl transition-all duration-200 flex gap-3",
        active ? "bg-surface-container-high border border-primary/10" : "hover:bg-primary/5"
      )}
    >
      <div className="relative flex-shrink-0">
        <img src={avatar} alt={name} className={cn("w-12 h-12 rounded-full object-cover", !active && "grayscale")} />
        {active && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-high rounded-full"></span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className={cn("text-sm font-bold truncate", active ? "text-on-surface" : "text-on-surface/80")}>{name}</span>
          <div className="flex items-center gap-2">
            {isBlocked && <span className="text-[9px] text-red-400 uppercase">Blocked</span>}
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-accent text-on-accent rounded-full text-[9px] font-bold">{unreadCount}</span>
            )}
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{time}</span>
          </div>
        </div>
        <p className={cn("text-xs truncate", active ? "text-on-surface-variant font-medium" : "text-on-surface-variant/60")}>{message}</p>
      </div>
    </button>
  );
}
