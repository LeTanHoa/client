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

/** Fetch all singers/artists with optional limit and search */
export async function getSingers(limit = 12, search = '') {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (search) params.set('search', search);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return api(`/singers${qs}`);
}

/** Fetch songs by a specific artist */
export async function getSongsByArtist(artistName, limit = 50) {
  const params = new URLSearchParams();
  params.set('artist', artistName);
  if (limit) params.set('limit', limit);
  return api(`/songs?${params.toString()}`);
}

/** Fetch trending/popular songs */
export async function getTrendingSongs(limit = 12) {
  return api(`/history/top?limit=${limit}`);
}

/** Fetch new/latest songs */
export async function getNewSongs(limit = 12) {
  const params = new URLSearchParams();
  params.set('sort', 'latest');
  if (limit) params.set('limit', limit);
  return api(`/songs?${params.toString()}`);
}

/** Get all unique artists with their song counts */
export async function getArtistsWithStats() {
  return api('/artists/stats');
}
