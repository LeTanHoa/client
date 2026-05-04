import { useState } from 'react';
import { api, apiForm } from '../api.js';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';

export function AddMusicPanel({ onAdded }) {
  const [tab, setTab] = useState('link');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submitLink(e) {
    e.preventDefault();
    setMsg(null);
    if (!url.trim()) {
      setMsg({ type: 'err', text: 'Nhập link YouTube hoặc URL file nhạc trực tiếp.' });
      return;
    }
    setBusy(true);
    try {
      await api('/songs/from-link', {
        method: 'POST',
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
          artist: artist.trim() || undefined,
          genre: genre.trim() || undefined,
        }),
      });
      setUrl('');
      setTitle('');
      setArtist('');
      setGenre('');
      onAdded?.();
      setMsg({ type: 'ok', text: 'Đã thêm bài từ link.' });
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function submitFile(e) {
    e.preventDefault();
    setMsg(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem('audio');
    const f = input && 'files' in input ? input.files?.[0] : null;
    if (!f) {
      setMsg({ type: 'err', text: 'Chọn file nhạc.' });
      return;
    }
    const fd = new FormData();
    fd.append('audio', f);
    if (title.trim()) fd.append('title', title.trim());
    if (artist.trim()) fd.append('artist', artist.trim());
    if (genre.trim()) fd.append('genre', genre.trim());
    setBusy(true);
    try {
      await apiForm('/songs/upload', fd);
      form.reset();
      setTitle('');
      setArtist('');
      setGenre('');
      onAdded?.();
      setMsg({ type: 'ok', text: 'Đã tải lên và thêm bài.' });
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-spotify-panel border border-white/10 rounded-xl p-5 max-w-xl">
      <h2 className="text-xl font-semibold mb-1">Thêm nhạc</h2>
      <p className="text-sm text-spotify-subtle mb-4">
        Có thể dán link YouTube (watch, youtu.be, Shorts) hoặc URL trực tiếp tới file MP3/OGG. Hoặc chọn file trên máy.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setTab('link');
            setMsg(null);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === 'link'
              ? 'bg-spotify-green text-black'
              : 'bg-spotify-hover text-spotify-subtle hover:text-white'
          }`}
        >
          Từ link
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('file');
            setMsg(null);
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === 'file'
              ? 'bg-spotify-green text-black'
              : 'bg-spotify-hover text-spotify-subtle hover:text-white'
          }`}
        >
          Từ file
        </button>
      </div>

      {msg && (
        <p className={`text-sm mb-3 ${msg.type === 'err' ? 'text-red-400' : 'text-spotify-green'}`}>
          {msg.text}
        </p>
      )}

      {tab === 'link' ? (
        <form onSubmit={submitLink} className="space-y-3">
          <div>
            <label className="block text-xs text-spotify-subtle mb-1">URL</label>
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              required
              placeholder="https://www.youtube.com/watch?v=… hoặc file .mp3"
              className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-spotify-subtle mb-1">Tên bài (tuỳ chọn)</label>
              <input
                type="text"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
              />
            </div>
            <div>
              <label className="block text-xs text-spotify-subtle mb-1">Nghệ sĩ (tuỳ chọn)</label>
              <input
                type="text"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                disabled={busy}
              />
            </div>
            <div>
              <label className="block text-xs text-spotify-subtle mb-1">Thể loại (tuỳ chọn)</label>
              <select
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={busy}
              >
                <option value="">Chọn thể loại</option>
                {VIETNAMESE_MUSIC_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2 rounded-full bg-spotify-green text-black text-sm font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {busy ? 'Đang thêm…' : 'Thêm từ link'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitFile} className="space-y-3">
          <div>
            <label className="block text-xs text-spotify-subtle mb-1">File nhạc</label>
            <input
              name="audio"
              type="file"
              accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.opus,.webm"
              className="w-full text-sm text-spotify-subtle file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-spotify-hover file:text-white"
              disabled={busy}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-spotify-subtle mb-1">Tên bài (tuỳ chọn)</label>
              <input
                type="text"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
              />
            </div>
            <div>
              <label className="block text-xs text-spotify-subtle mb-1">Nghệ sĩ (tuỳ chọn)</label>
              <input
                type="text"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                disabled={busy}
              />
            </div>
            <div>
              <label className="block text-xs text-spotify-subtle mb-1">Thể loại (tuỳ chọn)</label>
              <select
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={busy}
              >
                <option value="">Chọn thể loại</option>
                {VIETNAMESE_MUSIC_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2 rounded-full bg-spotify-green text-black text-sm font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {busy ? 'Đang tải lên…' : 'Tải lên và thêm'}
          </button>
        </form>
      )}
    </section>
  );
}
