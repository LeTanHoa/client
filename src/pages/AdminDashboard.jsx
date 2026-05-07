import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';
import { AddMusicPanel } from '../components/AddMusicPanel.jsx';

export function AdminDashboard() {
  const [users, setUsers] = useState([]);
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

  async function loadUsers() {
    try {
      const users = await api('/users');
      console.log(users);
      setUsers(users.users || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    loadUsers();
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
      setRegisterMsg({ type: 'ok', text: 'Tạo user thành công qua /register.' });
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
        body: JSON.stringify({
          ...editDraft,
          duration: Number(editDraft.duration || 0),
        }),
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
    if (!window.confirm('Bạn chắc chắn muốn xoá bài hát này?')) return;
    setBusySongId(songId);
    try {
      await api(`/songs/${songId}`, { method: 'DELETE' });
      if (editingSongId === songId) setEditingSongId(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusySongId(null);
    }
  }

 

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Data Management</h1>
        <p className="text-spotify-subtle">
          Quản lý bằng 2 route: <code>/songs</code> (bài hát) và <code>/register</code>/<code>/login</code> (user).
        </p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <section className="bg-spotify-panel border border-white/10 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Quản lý User (authRouter)</h2>
        <form onSubmit={submitRegister} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            required
            className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
            placeholder="Username"
            value={registerForm.username}
            onChange={(e) => setRegisterForm((v) => ({ ...v, username: e.target.value }))}
          />
          <input
            required
            type="email"
            className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm((v) => ({ ...v, email: e.target.value }))}
          />
          <input
            required
            type="password"
            className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm((v) => ({ ...v, password: e.target.value }))}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-spotify-green text-black text-sm font-semibold hover:brightness-110"
          >
            Tạo user
          </button>
        </form>
        {registerMsg ? (
          <p className={`text-sm mt-3 ${registerMsg.type === 'err' ? 'text-red-400' : 'text-spotify-green'}`}>
            {registerMsg.text}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Thêm nhạc</h2>
        <AddMusicPanel onAdded={load} />
      </section>

      <section className="bg-spotify-panel border border-white/10 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-xs text-spotify-subtle mb-1">Tìm bài hát</label>
            <input
              type="search"
              className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
              placeholder="Tên bài, nghệ sĩ, album..."
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs text-spotify-subtle mb-1">Lọc thể loại</label>
            <select
              value={songGenre}
              onChange={(e) => setSongGenre(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
            >
              <option value="">Tất cả thể loại</option>
              {VIETNAMESE_MUSIC_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-full bg-spotify-green text-black text-sm font-semibold hover:brightness-110"
          >
            Làm mới
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Quản lý bài hát</h2>
        <div className="space-y-3">
          {songs.map((song) => (
            <div key={song.id} className="bg-spotify-panel border border-white/10 rounded-xl p-4">
              {editingSongId === song.id ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input
                    className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
                    value={editDraft.title}
                    onChange={(e) => setEditDraft((v) => ({ ...v, title: e.target.value }))}
                    placeholder="Tên bài"
                  />
                  <input
                    className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
                    value={editDraft.artist}
                    onChange={(e) => setEditDraft((v) => ({ ...v, artist: e.target.value }))}
                    placeholder="Nghệ sĩ"
                  />
                  <input
                    className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
                    value={editDraft.album}
                    onChange={(e) => setEditDraft((v) => ({ ...v, album: e.target.value }))}
                    placeholder="Album"
                  />
                  <select
                    className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
                    value={editDraft.genre}
                    onChange={(e) => setEditDraft((v) => ({ ...v, genre: e.target.value }))}
                  >
                    <option value="">Chưa phân loại</option>
                    {VIETNAMESE_MUSIC_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
                    value={editDraft.duration}
                    onChange={(e) => setEditDraft((v) => ({ ...v, duration: e.target.value }))}
                    placeholder="Thời lượng (giây)"
                  />
                  <div className="md:col-span-5 flex gap-2 justify-end mt-1">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-spotify-green text-black text-xs font-semibold"
                      onClick={() => saveSong(song.id)}
                      disabled={busySongId === song.id}
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-spotify-hover text-white text-xs"
                      onClick={stopEdit}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-spotify-subtle truncate">
                      {song.artist} | {song.album || 'No album'} | {song.genre || 'No genre'}
                    </p>
                  </div>
                  <p className="text-sm text-spotify-subtle w-24">ID: {song.id.slice(-6)}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(song)}
                      className="px-3 py-1.5 rounded-full bg-spotify-hover text-white text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSong(song.id)}
                      disabled={busySongId === song.id}
                      className="px-3 py-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-xs disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!loading && songs.length === 0 && <p className="text-spotify-subtle">Không có bài hát nào.</p>}
        </div>
      </section>

      {editingSong ? (
        <p className="text-xs text-spotify-subtle">Đang sửa: {editingSong.title}</p>
      ) : null}
    </div>
  );
}
