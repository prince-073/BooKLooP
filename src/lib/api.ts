import { getToken, clearToken, type StoredUser } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// When server rejects our token (expired/invalid), log user out cleanly
// Only acts if a token was actually stored — prevents false PWA logouts
function handleUnauthorized() {
  const hadToken = !!localStorage.getItem('campus_book_exchange_token');
  if (!hadToken) return; // No token = guest request failed, not our auth issue
  clearToken();
  // Redirect to login only if not already there
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

export async function apiGetBooks(params?: {
  search?: string;
  subject?: string;
  availability?: 'available' | 'borrowed';
  condition?: string;
  ownerId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.subject) query.set('subject', params.subject);
  if (params?.availability) query.set('availability', params.availability);
  if (params?.condition) query.set('condition', params.condition);
  if (params?.ownerId) query.set('ownerId', params.ownerId);
  const suffix = query.toString() ? `?${query.toString()}` : '';

  const res = await fetch(`${API_BASE_URL}/api/books${suffix}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch books: ${res.status} ${text}`);
  }
  return (await res.json()) as any[];
}

export async function apiGetBook(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/books/${id}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch book: ${res.status} ${text}`);
  }
  return (await res.json()) as any;
}

async function apiPost(path: string, body: any, token?: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    // Token expired or invalid — auto logout
    if (res.status === 401) handleUnauthorized();
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }

  return (await res.json()) as any;
}

async function apiPut(path: string, body: any, token?: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return (await res.json()) as any;
}

async function apiDelete(path: string, token?: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }
  return null;
}

export async function apiRequestOtp(email: string) {
  return apiPost('/api/auth/request-otp', { email });
}

export async function apiVerifyOtp(payload: {
  email: string;
  code: string;
  name?: string;
  course?: string;
  year?: string;
  phone?: string;
}) {
  return apiPost('/api/auth/verify-otp', payload);
}

export async function apiUploadAvatar(file: File) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const form = new FormData();
  form.append('avatar', file);
  const res = await fetch(`${API_BASE_URL}/api/auth/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }
  return (await res.json()) as StoredUser;
}

export async function apiGetUser(id: string) {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch user');
  return await res.json();
}

export async function apiGetAllUsers() {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  };

  const res = await fetch(`${API_BASE_URL}/api/users/all`, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }
  return await res.json();
}

export async function apiRecordVisit(id: string) {
  const token = getToken();
  if (!token) return; 
  return fetch(`${API_BASE_URL}/api/users/${id}/visit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => {});
}

export async function apiGetMyVisitors() {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const res = await fetch(`${API_BASE_URL}/api/users/me/visitors`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch visitors');
  return await res.json();
}

export async function apiUpdateUser(payload: Partial<StoredUser> & { phoneVisible?: boolean }) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update user');
  return await res.json() as StoredUser;
}

export async function apiAddBook(payload: {
  title: string;
  author: string;
  type?: string;
  subject: string;
  course?: string;
  pickupPoint?: string;
  condition: string;
  language?: string;
  abstract?: string;
  image?: string;
  imageBack?: string;
  imageFile?: File | null;
  imageBackFile?: File | null;
  available?: boolean;
}) {
  const token = getToken();
  if (!token) throw new Error('Please login first');

  if (payload.imageFile || payload.imageBackFile) {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('author', payload.author);
    if (payload.type) form.append('type', payload.type);
    form.append('subject', payload.subject);
    if (payload.course) form.append('course', payload.course);
    if (payload.pickupPoint) form.append('pickupPoint', payload.pickupPoint);
    form.append('condition', payload.condition);
    if (payload.language) form.append('language', payload.language);
    if (payload.abstract) form.append('abstract', payload.abstract);
    form.append('available', String(payload.available ?? true));
    if (payload.image) form.append('image', payload.image);
    if (payload.imageBack) form.append('imageBack', payload.imageBack);
    if (payload.imageFile) form.append('imageFile', payload.imageFile);
    if (payload.imageBackFile) form.append('imageBackFile', payload.imageBackFile);

    const res = await fetch(`${API_BASE_URL}/api/books/add`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let msg = `Request failed: ${res.status}`;
      try {
        const j = JSON.parse(text);
        if (j?.error?.message) msg = j.error.message;
      } catch {
        if (text) msg += ` ${text}`;
      }
      throw new Error(msg);
    }
    return (await res.json()) as any;
  }
  return apiPost('/api/books/add', payload, token);
}

export async function apiEditBook(id: string, payload: {
  title?: string;
  author?: string;
  type?: string;
  subject?: string;
  course?: string;
  pickupPoint?: string;
  condition?: string;
  language?: string;
  abstract?: string;
  available?: boolean;
  imageFile?: File | null;
  imageBackFile?: File | null;
}) {
  const token = getToken();
  if (!token) throw new Error('Please login first');

  const form = new FormData();
  if (payload.title) form.append('title', payload.title);
  if (payload.author) form.append('author', payload.author);
  if (payload.type) form.append('type', payload.type);
  if (payload.subject) form.append('subject', payload.subject);
  if (payload.course) form.append('course', payload.course);
  if (payload.pickupPoint) form.append('pickupPoint', payload.pickupPoint);
  if (payload.condition) form.append('condition', payload.condition);
  if (payload.language) form.append('language', payload.language);
  if (payload.abstract !== undefined) form.append('abstract', payload.abstract);
  if (payload.available !== undefined) form.append('available', String(payload.available));
  if (payload.imageFile) form.append('imageFile', payload.imageFile);
  if (payload.imageBackFile) form.append('imageBackFile', payload.imageBackFile);

  const res = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }
  return (await res.json()) as any;
}

export async function apiSendRequest(bookId: string, daysRequested = 7) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost('/api/requests/send', { bookId, daysRequested }, token);
}

export async function apiJoinWaitlist(bookId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost(`/api/books/${bookId}/join-waitlist`, {}, token);
}

export async function apiGetUserRequests() {
  const token = getToken();
  if (!token) throw new Error('Please login first');

  const res = await fetch(`${API_BASE_URL}/api/requests/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }

  return (await res.json()) as Array<{
    id: string;
    title: string;
    user: string;
    status: 'pending' | 'accepted' | 'rejected' | 'pending_out' | 'completed';
    image: string;
    isOutgoing: boolean;
    ownerId: string;
    borrowerId: string;
    daysRequested?: number;
    dueDate?: string;
    returnedAt?: string;
  }>;
}

export async function apiGetGlobalActivity() {
  const res = await fetch(`${API_BASE_URL}/api/books/activity`);
  if (!res.ok) throw new Error('Failed to load activity');
  return await res.json() as Array<{
    id: string;
    type: string;
    userId: string | null;
    userName: string;
    userAvatar: string;
    bookTitle: string;
    timestamp: string;
  }>;
}

export async function apiGetStats() {
  const res = await fetch(`${API_BASE_URL}/api/books/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return await res.json() as { books: number, users: number, exchanges: number };
}

export async function apiAcceptRequest(requestId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPut(`/api/requests/${requestId}/accept`, {}, token);
}

export async function apiRejectRequest(requestId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPut(`/api/requests/${requestId}/reject`, {}, token);
}

export async function apiCancelRequest(requestId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiDelete(`/api/requests/${requestId}`, token);
}

export async function apiCompleteRequest(requestId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPut(`/api/requests/${requestId}/complete`, {}, token);
}

export async function apiDeleteBook(bookId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiDelete(`/api/books/${bookId}`, token);
}

export async function apiModifyRequest(requestId: string, daysRequested: number) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPut(`/api/requests/${requestId}/modify`, { daysRequested }, token);
}

export async function apiSaveBook(bookId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost(`/api/books/${bookId}/save`, {}, token);
}

export async function apiUnsaveBook(bookId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiDelete(`/api/books/${bookId}/save`, token);
}

export async function apiGetSavedBooks() {
  const token = getToken();
  if (!token) throw new Error('Please login first');

  const res = await fetch(`${API_BASE_URL}/api/books/saved`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch saved books: ${res.status} ${text}`);
  }
  return (await res.json()) as any[];
}

export async function apiRequestReturnOtp(requestId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost(`/api/requests/${requestId}/return-otp`, {}, token);
}

export async function apiVerifyReturnOtp(requestId: string, otp: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost(`/api/requests/${requestId}/return-verify`, { otp }, token);
}

export async function apiSubmitRating(payload: { requestId: string, score: number, comment?: string }) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost('/api/ratings', payload, token);
}

export async function apiGetConversations() {
  const token = getToken();
  if (!token) throw new Error('Please login first');

  const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to load conversations');
  }
  return (await res.json()) as Array<{
    id: string;
    otherUser: { id: string; name: string; email: string };
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    isBlocked: boolean;
  }>;
}

export async function apiGetOrCreateConversation(otherUserId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost('/api/chat/conversations', { otherUserId }, token) as Promise<{ id: string }>;
}

export async function apiGetMessages(conversationId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to load messages');
  }
  return (await res.json()) as Array<{
    id: string;
    content: string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentType?: string | null;
    deliveredAt?: string;
    readAt?: string | null;
    status?: 'delivered' | 'read';
    createdAt: string;
    sender: { id: string; name: string; email: string };
    isIncoming: boolean;
  }>;
}

export async function apiSendMessage(conversationId: string, content: string, attachment?: File | null) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  if (attachment) {
    const form = new FormData();
    form.append('conversationId', conversationId);
    if (content?.trim()) form.append('content', content.trim());
    form.append('attachment', attachment);
    const res = await fetch(`${API_BASE_URL}/api/chat/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let msg = `Request failed: ${res.status}`;
      try {
        const j = JSON.parse(text);
        if (j?.error?.message) msg = j.error.message;
      } catch {
        if (text) msg += ` ${text}`;
      }
      throw new Error(msg);
    }
    return (await res.json()) as any;
  }
  return apiPost('/api/chat/messages', { conversationId, content }, token);
}

export async function apiDeleteConversation(conversationId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const res = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to delete conversation');
  }
}

export async function apiBlockUser(blockedUserId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost('/api/chat/block', { blockedUserId }, token);
}

export async function apiUnblockUser(blockedUserId: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  return apiPost('/api/chat/unblock', { blockedUserId }, token);
}

export async function apiGetBlockedUsers() {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const res = await fetch(`${API_BASE_URL}/api/chat/blocked`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to load blocked users');
  }
  return (await res.json()) as Array<{ id: string; name: string; email: string }>;
}

export async function apiRequestHandoverOtp(requestId: string) {
  const token = getToken();
  return apiPost(`/api/requests/${requestId}/handover-otp`, undefined, token);
}

export async function apiVerifyHandoverOtp(requestId: string, otp: string) {
  const token = getToken();
  return apiPost(`/api/requests/${requestId}/handover-verify`, { otp }, token);
}

export async function apiNudgeReturn(requestId: string) {
  const token = getToken();
  return apiPost(`/api/requests/${requestId}/nudge`, undefined, token);
}

export async function apiDeleteUser(userId: string, code: string) {
  const token = getToken();
  if (!token) throw new Error('Please login first');
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ code })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Request failed: ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg = j.error.message;
    } catch {
      if (text) msg += ` ${text}`;
    }
    throw new Error(msg);
  }
}
