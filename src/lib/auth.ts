const TOKEN_KEY = 'campus_book_exchange_token';
const USER_KEY = 'campus_book_exchange_user';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  course?: string;
  year?: string;
  role?: string;
  phone?: string;
  phoneVisible?: boolean;
  avatarUrl?: string;
  bio?: string;
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setCurrentUser(user: StoredUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

