/** In dev, Vite proxies `/api` → backend (see vite.config.js). */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';


export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(t) {
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

/** POST multipart (do not set Content-Type — browser sets boundary). */
export async function apiForm(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body: formData, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

/** Stream URL for HTML5 audio (JWT in query — required because <audio> cannot set headers). */
export function streamUrlForSong(songId) {
  const token = getToken();
  const q = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${API_BASE}/stream/${songId}${q}`;
}

export function coverUrlForSong(songId) {
  const token = getToken();
  const q = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${API_BASE}/stream/cover/${songId}${q}`;
}
