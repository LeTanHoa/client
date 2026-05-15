import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';
import { AddMusicPanel } from '../components/AddMusicPanel.jsx';

export function AdminDashboard() {
  const { isDark } = useTheme();

  const [songs, setSongs] = useState([]);
  const [songSearch, setSongSearch] = useState('');
  const [songGenre, setSongGenre] = useState('');
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [registerMsg, setRegisterMsg] = useState(null);
  const [editingSongId, setEditingSongId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busySongId, setBusySongId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (songSearch.trim()) params.set('search', songSearch.trim());
      if (songGenre.trim()) params.set('genre', songGenre.trim());
      const qs = params.toString() ? `?${params.toString()}` : '';
      const songsRes = await api(`/songs${qs}`);
      setSongs(songsRes.songs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [songSearch, songGenre]);

  useEffect(() => {
    load();
  }, [load]);

  const editingSong = useMemo(
    () => songs.find((s) => s.id === editingSongId) || null,
    [songs, editingSongId]
  );

  function startEdit(song) {
    setEditingSongId(song.id);
    setEditDraft({
      title: song.title || '',
      artist: song.artist || '',
      album: song.album || '',
      genre: song.genre || '',
      duration: Number(song.duration || 0),
    });
  }

  function stopEdit() {
    setEditingSongId(null);
  }

  async function submitRegister(e) {
    e.preventDefault();
    setRegisterMsg(null);
    try {
      await api('/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });
      setRegisterMsg({
        type: 'ok',
        text: 'Tạo user thành công.',
      });
      setRegisterForm({ username: '', email: '', password: '' });
    } catch (e2) {
      setRegisterMsg({ type: 'err', text: e2.message });
    }
  }

  async function saveSong(songId) {
    setBusySongId(songId);
    try {
      await api(`/songs/${songId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...editDraft, duration: Number(editDraft.duration || 0) }),
      });
      setEditingSongId(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusySongId(null);
    }
  }

  async function removeSong(songId) {
    if (!window.confirm('Bạn chắc chắn muốn xoá bài hát này?')) {
      return;
    }
    setBusySongId(songId);
    try {
      await api(`/songs/${songId}`, {
        method: 'DELETE',
      });
      if (editingSongId === songId) setEditingSongId(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusySongId(null);
    }
  }

  const panelClass = `border rounded-[2rem] p-6 ${isDark ? 'bg-[#150f28] border-white/10' : 'bg-white border-slate-200'}`;
  const inputClass = `rounded-full px-4 py-3 text-sm outline-none transition ${isDark ? 'bg-[#110c1b] border border-white/10 text-white placeholder-slate-500' : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-500'}`;

  return (
    <div className="space-y-8">
      <div className={panelClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
              Quản lý bài hát, playlist và người dùng với giao diện đồng bộ.
            </p>
          </div>
          <div className="inline-flex rounded-full bg-spotify-green/10 px-4 py-3 text-sm font-semibold text-spotify-green">
            {songs.length} bài hát
          </div>
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.55fr]">
        <div className={panelClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Danh sách nhạc</h2>
              <p className={`mt-2 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
                Tìm kiếm, lọc và chỉnh sửa nhanh các bài hát trong hệ thống.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                className={inputClass}
                placeholder="Tìm bài hát"
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
              />
              <select
                className={inputClass}
                value={songGenre}
                onChange={(e) => setSongGenre(e.target.value)}
              >
                <option value="">Tất cả thể loại</option>
                {VIETNAMESE_MUSIC_GENRES.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Đang tải bài hát…</p>
            ) : songs.length === 0 ? (
              <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Không tìm thấy bài hát.</p>
            ) : (
              <div className="grid gap-4">
                {songs.map((song) => (
                  <div key={song.id} className={`rounded-[1.75rem] border p-4 transition ${isDark ? 'bg-[#110c1b] border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold truncate">{song.title}</div>
                        <p className={`mt-1 text-sm truncate ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>{song.artist}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(song)}
                          className="rounded-full bg-spotify-green px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={busySongId === song.id}
                          onClick={() => removeSong(song.id)}
                          className="rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-40"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                    {editingSongId === song.id && (
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <input
                          className={inputClass}
                          placeholder="Tiêu đề"
                          value={editDraft.title}
                          onChange={(e) => setEditDraft((v) => ({ ...v, title: e.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="Ca sĩ"
                          value={editDraft.artist}
                          onChange={(e) => setEditDraft((v) => ({ ...v, artist: e.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="Album"
                          value={editDraft.album}
                          onChange={(e) => setEditDraft((v) => ({ ...v, album: e.target.value }))}
                        />
                        <div className="flex gap-3">
                          <select
                            className={`${inputClass} w-full`}
                            value={editDraft.genre}
                            onChange={(e) => setEditDraft((v) => ({ ...v, genre: e.target.value }))}
                          >
                            <option value="">Thể loại</option>
                            {VIETNAMESE_MUSIC_GENRES.map((genre) => (
                              <option key={genre} value={genre}>{genre}</option>
                            ))}
                          </select>
                          <input
                            className={`${inputClass} w-28`}
                            type="number"
                            placeholder="Giây"
                            value={editDraft.duration}
                            onChange={(e) => setEditDraft((v) => ({ ...v, duration: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={busySongId === song.id}
                            onClick={() => saveSong(song.id)}
                            className="rounded-full bg-spotify-green px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={stopEdit}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Huỷ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className={panelClass}>
          <h2 className="text-2xl font-semibold">Quản lý user</h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
            Tạo user mới nhanh và xem trạng thái.
          </p>

          <form onSubmit={submitRegister} className="mt-6 space-y-4">
            <input
              required
              className={inputClass}
              placeholder="Username"
              value={registerForm.username}
              onChange={(e) => setRegisterForm((v) => ({ ...v, username: e.target.value }))}
            />
            <input
              required
              type="email"
              className={inputClass}
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((v) => ({ ...v, email: e.target.value }))}
            />
            <input
              required
              type="password"
              className={inputClass}
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((v) => ({ ...v, password: e.target.value }))}
            />
            <button
              type="submit"
              className="w-full rounded-full bg-spotify-green px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Tạo User
            </button>
            {registerMsg && (
              <p className={`text-sm ${registerMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                {registerMsg.text}
              </p>
            )}
          </form>

          <div className={`mt-8 rounded-[1.75rem] border border-dashed border-white/10 p-4 ${isDark ? 'bg-[#110c1b]' : 'bg-slate-50'}`}>
            <h3 className="text-sm font-semibold">Thêm nhạc</h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
              Dùng form bên dưới để upload và quản lý nhạc.
            </p>
          </div>
        </aside>
      </div>

      <div className={panelClass}>
        <AddMusicPanel />
      </div>
    </div>
  );
}
