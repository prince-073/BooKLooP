const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function resolveServerAssetUrl(pathOrUrl: string) {
  const raw = pathOrUrl.trim();
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  if (raw.startsWith('/uploads/')) return `${API_BASE_URL}${raw}`;
  if (raw.startsWith('uploads/')) return `${API_BASE_URL}/${raw}`;
  return raw;
}

export function getAvatarUrl(params: {
  name?: string | null;
  email?: string | null;
  id?: string | null;
  avatarUrl?: string | null;
}) {
  if (params.avatarUrl && params.avatarUrl.trim()) {
    return resolveServerAssetUrl(params.avatarUrl);
  }
  const seed = params.email || params.id || params.name || 'User';
  const label = params.name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=111827&color=ffffff&bold=true&format=png&rounded=true&size=128&seed=${encodeURIComponent(seed)}`;
}

export function getBookCoverUrl(cover?: string | null, title?: string) {
  const raw = (cover || '').trim();
  if (!raw) return fallbackBookCover(title);
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  if (raw.startsWith('/uploads/')) return `${API_BASE_URL}${raw}`;
  if (raw.startsWith('uploads/')) return `${API_BASE_URL}/${raw}`;
  return raw;
}

export function fallbackBookCover(title?: string) {
  const t = encodeURIComponent((title || 'Book').slice(0, 30));
  return `https://dummyimage.com/600x900/111827/ffffff&text=${t}`;
}
