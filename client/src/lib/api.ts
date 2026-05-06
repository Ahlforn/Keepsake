import type { Note, NoteInput, Tag, User, Attachment } from '../types';

const TOKEN_KEY = 'keepsake_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  me: () => request<User>('/api/auth/me'),

  listNotes: (opts: { archived?: boolean; q?: string } = {}) => {
    const params = new URLSearchParams();
    if (opts.archived) params.set('archived', 'true');
    if (opts.q) params.set('q', opts.q);
    const qs = params.toString();
    return request<Note[]>(`/api/notes${qs ? `?${qs}` : ''}`);
  },

  createNote: (data: NoteInput) =>
    request<Note>('/api/notes', { method: 'POST', body: JSON.stringify(data) }),

  updateNote: (id: string, data: NoteInput) =>
    request<Note>(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteNote: (id: string) =>
    request<void>(`/api/notes/${id}`, { method: 'DELETE' }),

  listTags: () => request<Tag[]>('/api/tags'),

  uploadAttachment: (noteId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<Attachment>(`/api/attachments/${noteId}`, {
      method: 'POST',
      body: fd,
    });
  },

  deleteAttachment: (id: string) =>
    request<void>(`/api/attachments/${id}`, { method: 'DELETE' }),
};
