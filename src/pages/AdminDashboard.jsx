import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { AddMusicPanel } from '../components/AddMusicPanel.jsx';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const tabs = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'songs', label: 'Bài hát' },
  { id: 'add', label: 'Thêm nhạc' },
  { id: 'users', label: 'Người dùng' },
  { id: 'playlists', label: 'Playlist' },
  { id: 'system', label: 'Hệ thống' },
];

const emptyOverview = {
  users: 0,
  songs: 0,
  playlists: 0,
  favorites: 0,
  historyEntries: 0,
};

function formatDate(value) {
  if (!value) return 'Chưa có dữ liệu';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDuration(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n < 0) return '0:00';
  const minutes = Math.floor(n / 60);
  const remain = Math.floor(n % 60);
  return `${minutes}:${String(remain).padStart(2, '0')}`;
}

const formatTime = formatDuration;

export function AdminDashboard() {
  const { isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(emptyOverview);
  const [songs, setSongs] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [health, setHealth] = useState(null);
  const [songSearch, setSongSearch] = useState('');
  const [songGenre, setSongGenre] = useState('');
  const [editingSongId, setEditingSongId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: 0,
  });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [registerMsg, setRegisterMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busySongId, setBusySongId] = useState(null);
  const [busyUserId, setBusyUserId] = useState(null);
  const [error, setError] = useState(null);






  const panelClass = `rounded-lg border p-5 ${isDark ? 'border-white/10 bg-[#151515]' : 'border-slate-200 bg-white'
    }`;
  const surfaceClass = isDark
    ? 'border-white/10 bg-white/[0.03]'
    : 'border-slate-200 bg-slate-50';
  const mutedClass = isDark ? 'text-spotify-subtle' : 'text-slate-600';
  const inputClass = `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-spotify-green ${isDark
    ? 'border-white/10 bg-black/30 text-white placeholder:text-slate-500'
    : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-400'
    }`;
  const buttonGhostClass = `rounded-lg border px-3 py-2 text-sm font-semibold transition ${isDark
    ? 'border-white/10 text-white hover:border-white/25 hover:bg-white/5'
    : 'border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-100'
    }`;

  const loadAdminData = useCallback(async () => {
    setError(null);
    setLoading(true);
    const params = new URLSearchParams();
    if (songSearch.trim()) params.set('search', songSearch.trim());
    if (songGenre.trim()) params.set('genre', songGenre.trim());
    const songQuery = params.toString() ? `?${params.toString()}` : '';

    const requests = [
      ['overview', api('/admin/overview')],
      ['songs', api(`/songs${songQuery}`)],
      ['users', api('/admin/users')],
      ['playlists', api('/admin/playlists')],
      ['topSongs', api('/history/top?limit=10')],
      ['health', api('/health')],
    ];

    const settled = await Promise.allSettled(requests.map(([, request]) => request));
    const failures = [];

    settled.forEach((result, index) => {
      const key = requests[index][0];
      if (result.status === 'rejected') {
        failures.push(`${key}: ${result.reason?.message || 'Request failed'}`);
        return;
      }

      const data = result.value;
      if (key === 'overview') setOverview(data.overview || emptyOverview);
      if (key === 'songs') setSongs(data.songs || []);
      if (key === 'users') setUsers(data.users || []);
      if (key === 'playlists') setPlaylists(data.playlists || []);
      if (key === 'topSongs') setTopSongs(data.songs || []);
      if (key === 'health') setHealth(data || null);
    });

    if (failures.length) {
      setError(`Một số endpoint chưa trả dữ liệu: ${failures.join('; ')}`);
    }
    setLoading(false);
  }, [songGenre, songSearch]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const recentSongs = useMemo(() => songs.slice(0, 5), [songs]);
  const recentUsers = useMemo(() => users.slice(0, 5), [users]);
  const latestPlaylist = playlists[0];
  const totalDuration = useMemo(
    () => songs.reduce((sum, song) => sum + Number(song.duration || 0), 0),
    [songs]
  );
  const genreBreakdown = useMemo(() => {
    const counts = new Map();
    songs.forEach((song) => {
      const genre = song.genre || 'Chưa phân loại';
      counts.set(genre, (counts.get(genre) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [songs]);


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

  async function saveSong(songId) {
    setBusySongId(songId);
    setError(null);
    try {
      await api(`/songs/${songId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editDraft,
          duration: Number(editDraft.duration || 0),
        }),
      });
      setEditingSongId(null);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusySongId(null);
    }
  }

  async function removeSong(songId) {
    if (!window.confirm('Bạn chắc chắn muốn xoá bài hát này khỏi hệ thống?')) {
      return;
    }
    setBusySongId(songId);
    setError(null);
    try {
      await api(`/songs/${songId}`, { method: 'DELETE' });
      if (editingSongId === songId) setEditingSongId(null);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusySongId(null);
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    setRegisterMsg(null);
    try {
      await api('/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });
      setRegisterMsg({ type: 'ok', text: 'Đã tạo người dùng mới.' });
      setRegisterForm({ username: '', email: '', password: '' });
      await loadAdminData();
    } catch (err) {
      setRegisterMsg({ type: 'err', text: err.message });
    }
  }

  async function updateUserRole(userId, role) {
    setBusyUserId(userId);
    setError(null);
    try {
      await api(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyUserId(null);
    }
  }

  async function removeUser(userId) {
    if (!window.confirm('Bạn chắc chắn muốn xoá người dùng này? Playlist, yêu thích và lịch sử nghe của user cũng sẽ bị xoá.')) {
      return;
    }

    setBusyUserId(userId);
    setError(null);
    try {
      await api(`/admin/users/${userId}`, { method: 'DELETE' });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyUserId(null);
    }
  }

  function userIdFor(item) {
    return item._id || item.id;
  }
  const statCards = [
    { label: 'Người dùng', value: overview.users, detail: `${recentUsers.length} tài khoản mới nhất` },
    { label: 'Bài hát', value: overview.songs, detail: `${formatDuration(totalDuration)} tổng thời lượng đã tải` },
    { label: 'Playlist', value: overview.playlists, detail: latestPlaylist ? `Mới nhất: ${latestPlaylist.name}` : 'Chưa có playlist' },
    { label: 'Lượt yêu thích', value: overview.favorites, detail: `${overview.historyEntries} lượt nghe được ghi nhận` },
  ];

  return (
    <div className="space-y-6 p-10">
      <section className={panelClass}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${mutedClass}`}>
              Admin Console
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              Hệ thống quản lý Spotify Mini
            </h1>
            <p className={`mt-2 max-w-2xl text-sm ${mutedClass}`}>
              Quản lý bài hát, upload nhạc, theo dõi người dùng, playlist và các chỉ số vận hành hiện có.
            </p>
          </div>
          {/* <div className={`rounded-lg border px-4 py-3 text-sm ${surfaceClass}`}>
            <div className={mutedClass}>Đang đăng nhập</div>
            <div className="mt-1 font-bold">{user?.username || user?.email || 'Admin'}</div>
          </div> */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${isDark
                  ? 'bbg-black/30 border-white/10 text-white hover:bg-white/5'
                  : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <span>👤</span>
                <span className="hidden sm:inline">{user?.username || user?.email || 'Admin'}</span>
              </button>

              {showMenu && (
                <div
                  className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border shadow-2xl backdrop-blur-sm ${isDark
                    ? 'bg-black/95 border-white/10'
                    : 'bg-white/95 border-slate-200'
                    }`}
                >
                  <div className={`space-y-1 p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-zing-text' : 'text-slate-900'}`}>
                      👤 {user?.username || user?.email || 'Admin'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
                      {user?.role === 'admin' ? '🔑 Quản trị viên' : '👥 Người dùng'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${isDark
                      ? 'text-zing-text-secondary hover:bg-white/5 hover:text-zing-pink'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 border ${isDark
                  ? 'text-zing-text-secondary hover:text-zing-text hover:bg-white/5 border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-lg hover:brightness-110"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === tab.id
                ? 'bg-spotify-green text-black'
                : isDark
                  ? 'bg-white/5 text-spotify-subtle hover:bg-white/10 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => (
              <article key={item.label} className={`rounded-lg border p-5 ${surfaceClass}`}>
                <p className={`text-sm font-semibold ${mutedClass}`}>{item.label}</p>
                <div className="mt-3 text-3xl font-black">{item.value}</div>
                <p className={`mt-2 text-xs ${mutedClass}`}>{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className={panelClass}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Bài hát mới nhất</h2>
                  <p className={`mt-1 text-sm ${mutedClass}`}>5 bài hát vừa được thêm vào thư viện.</p>
                </div>
                <button type="button" onClick={() => setActiveTab('songs')} className={buttonGhostClass}>
                  Quản lý
                </button>
              </div>
              <SongTable
                songs={recentSongs}
                isDark={isDark}
                mutedClass={mutedClass}
                compact
              />
            </section>

            <section className={panelClass}>
              <h2 className="text-xl font-bold">Phân bố thể loại</h2>
              <div className="mt-5 space-y-4">
                {genreBreakdown.length === 0 ? (
                  <p className={`text-sm ${mutedClass}`}>Chưa có dữ liệu thể loại.</p>
                ) : (
                  genreBreakdown.map(([genre, count]) => {
                    const width = overview.songs ? Math.max(8, (count / overview.songs) * 100) : 0;
                    return (
                      <div key={genre}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold">{genre}</span>
                          <span className={mutedClass}>{count}</span>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                          <div className="h-2 rounded-full bg-spotify-green" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <section className={panelClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Bảng xếp hạng lượt nghe</h2>
                <p className={`mt-1 text-sm ${mutedClass}`}>Dữ liệu từ endpoint /history/top.</p>
              </div>
              <button type="button" onClick={() => setActiveTab('songs')} className={buttonGhostClass}>
                Xem thư viện
              </button>
            </div>
            <TopSongsTable songs={topSongs} isDark={isDark} mutedClass={mutedClass} />
          </section>
        </div>
      )}

      {activeTab === 'songs' && (
        <section className={panelClass}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quản lý bài hát</h2>
              <p className={`mt-1 text-sm ${mutedClass}`}>
                Tìm kiếm, lọc, sửa metadata và xoá bài hát khỏi hệ thống.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_200px_auto]">
              <input
                className={inputClass}
                placeholder="Tìm theo tên, nghệ sĩ, album"
                value={songSearch}
                onChange={(event) => setSongSearch(event.target.value)}
              />
              <select
                className={inputClass}
                value={songGenre}
                onChange={(event) => setSongGenre(event.target.value)}
              >
                <option value="">Tất cả thể loại</option>
                {VIETNAMESE_MUSIC_GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <button type="button" onClick={loadAdminData} className={buttonGhostClass}>
                Làm mới
              </button>
            </div>
          </div>

          {loading ? (
            <p className={`mt-6 text-sm ${mutedClass}`}>Đang tải dữ liệu...</p>
          ) : (
            <div className="mt-6 space-y-3">
              {songs.length === 0 ? (
                <p className={`text-sm ${mutedClass}`}>Không tìm thấy bài hát phù hợp.</p>
              ) : (
                songs.map((song) => (
                  <article key={song.id} className={`rounded-lg border p-4 ${surfaceClass}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">{song.title}</h3>
                        <p className={`mt-1 truncate text-sm ${mutedClass}`}>
                          {song.artist} {song.album ? `- ${song.album}` : ''}
                        </p>
                        <div className={`mt-3 flex flex-wrap gap-2 text-xs ${mutedClass}`}>
                          <span className={`rounded-md border px-2 py-1 ${surfaceClass}`}>
                            {song.genre || 'Chưa phân loại'}
                          </span>
                          <span className={`rounded-md border px-2 py-1 ${surfaceClass}`}>
                            {formatDuration(song.duration)}
                          </span>
                          <span className={`rounded-md border px-2 py-1 ${surfaceClass}`}>
                            {formatDate(song.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(song)} className={buttonGhostClass}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={busySongId === song.id}
                          onClick={() => removeSong(song.id)}
                          className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>

                    {editingSongId === song.id && (
                      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:grid-cols-5">
                        <input
                          className={inputClass}
                          placeholder="Tên bài"
                          value={editDraft.title}
                          onChange={(event) => setEditDraft((value) => ({ ...value, title: event.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="Nghệ sĩ"
                          value={editDraft.artist}
                          onChange={(event) => setEditDraft((value) => ({ ...value, artist: event.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="Album"
                          value={editDraft.album}
                          onChange={(event) => setEditDraft((value) => ({ ...value, album: event.target.value }))}
                        />
                        <select
                          className={inputClass}
                          value={editDraft.genre}
                          onChange={(event) => setEditDraft((value) => ({ ...value, genre: event.target.value }))}
                        >
                          <option value="">Chọn thể loại</option>
                          {VIETNAMESE_MUSIC_GENRES.map((genre) => (
                            <option key={genre} value={genre}>
                              {genre}
                            </option>
                          ))}
                        </select>
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          placeholder="Thời lượng giây"
                          value={editDraft.duration}
                          onChange={(event) => setEditDraft((value) => ({ ...value, duration: event.target.value }))}
                        />
                        <div className="flex gap-2 lg:col-span-5">
                          <button
                            type="button"
                            disabled={busySongId === song.id}
                            onClick={() => saveSong(song.id)}
                            className="rounded-lg bg-spotify-green px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
                          >
                            Lưu thay đổi
                          </button>
                          <button type="button" onClick={stopEdit} className={buttonGhostClass}>
                            Huỷ
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === 'add' && (
        <section className={panelClass}>
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Thêm nhạc vào thư viện</h2>
            <p className={`mt-1 text-sm ${mutedClass}`}>
              Hỗ trợ link YouTube, URL file âm thanh và upload qua Cloudinary theo cấu hình hiện có.
            </p>
          </div>
          <AddMusicPanel onAdded={loadAdminData} variant="admin" />
        </section>
      )}

      {activeTab === 'users' && (
        <section className={panelClass}>
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div>
              <h2 className="text-2xl font-bold">Người dùng</h2>
              <p className={`mt-1 text-sm ${mutedClass}`}>Danh sách tối đa 300 tài khoản mới nhất.</p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className={mutedClass}>
                    <tr className="border-b border-white/10">
                      <th className="py-3 pr-4 font-semibold">Username</th>
                      <th className="py-3 pr-4 font-semibold">Email</th>
                      <th className="py-3 pr-4 font-semibold">Vai trò</th>
                      <th className="py-3 pr-4 font-semibold">Ngày tạo</th>
                      <th className="py-3 pr-4 font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => {
                      const itemId = userIdFor(item);
                      return (
                        <tr key={itemId} className="border-b border-white/10 last:border-0">
                          <td className="py-3 pr-4 font-semibold">{item.username}</td>
                          <td className={`py-3 pr-4 ${mutedClass}`}>{item.email}</td>
                          <td className="py-3 pr-4">
                            <select
                              className={`${inputClass} min-w-[110px] py-2`}
                              value={item.role}
                              disabled={busyUserId === itemId}
                              onChange={(event) => updateUserRole(itemId, event.target.value)}
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className={`py-3 pr-4 ${mutedClass}`}>{formatDate(item.createdAt)}</td>
                          <td className="py-3 pr-4">
                            <button
                              type="button"
                              disabled={busyUserId === itemId}
                              onClick={() => removeUser(itemId)}
                              className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                            >
                              Xoá
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className={`rounded-lg border p-5 ${surfaceClass}`}>
              <h3 className="text-lg font-bold">Tạo người dùng mới</h3>
              <form onSubmit={submitRegister} className="mt-4 space-y-3">
                <input
                  required
                  className={inputClass}
                  placeholder="Username"
                  value={registerForm.username}
                  onChange={(event) => setRegisterForm((value) => ({ ...value, username: event.target.value }))}
                />
                <input
                  required
                  type="email"
                  className={inputClass}
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((value) => ({ ...value, email: event.target.value }))}
                />
                <input
                  required
                  type="password"
                  minLength="6"
                  className={inputClass}
                  placeholder="Mật khẩu"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((value) => ({ ...value, password: event.target.value }))}
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-spotify-green px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
                >
                  Tạo tài khoản
                </button>
                {registerMsg && (
                  <p className={`text-sm ${registerMsg.type === 'ok' ? 'text-spotify-green' : 'text-red-400'}`}>
                    {registerMsg.text}
                  </p>
                )}
              </form>
            </aside>
          </div>
        </section>
      )}

      {activeTab === 'playlists' && (
        <section className={panelClass}>
          <h2 className="text-2xl font-bold">Playlist</h2>
          <p className={`mt-1 text-sm ${mutedClass}`}>Theo dõi playlist, chủ sở hữu và số lượng bài hát.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className={mutedClass}>
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-semibold">Tên playlist</th>
                  <th className="py-3 pr-4 font-semibold">Chủ sở hữu</th>
                  <th className="py-3 pr-4 font-semibold">Số bài</th>
                  <th className="py-3 pr-4 font-semibold">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((playlist) => (
                  <tr key={playlist.id} className="border-b border-white/10 last:border-0">
                    <td className="py-3 pr-4 font-semibold">{playlist.name}</td>
                    <td className={`py-3 pr-4 ${mutedClass}`}>
                      {playlist.user?.username || playlist.user?.email || 'Không rõ'}
                    </td>
                    <td className="py-3 pr-4 font-semibold">{playlist.songCount}</td>
                    <td className={`py-3 pr-4 ${mutedClass}`}>{formatDate(playlist.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'system' && (
        <section className={panelClass}>
          <h2 className="text-2xl font-bold">Trạng thái hệ thống</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SystemItem label="Health check" value={health?.ok ? 'API đang hoạt động' : 'Chưa nhận phản hồi'} isDark={isDark} />
            <SystemItem label="Admin overview" value={`${overview.users} user, ${overview.songs} bài hát`} isDark={isDark} />
            <SystemItem label="Admin users" value={`${users.length} tài khoản từ /admin/users`} isDark={isDark} />
            <SystemItem label="Admin playlists" value={`${playlists.length} playlist từ /admin/playlists`} isDark={isDark} />
            <SystemItem label="History top" value={`${topSongs.length} bài hát từ /history/top`} isDark={isDark} />
            <SystemItem label="Songs endpoint" value={`${songs.length} bài hát từ /songs`} isDark={isDark} />
          </div>
        </section>
      )}
    </div>
  );
}

function TopSongsTable({ songs, isDark, mutedClass }) {
  if (songs.length === 0) {
    return <p className={`mt-5 text-sm ${mutedClass}`}>Chưa có dữ liệu lượt nghe.</p>;
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className={mutedClass}>
          <tr className="border-b border-white/10">
            <th className="py-3 pr-4 font-semibold">#</th>
            <th className="py-3 pr-4 font-semibold">Bài hát</th>
            <th className="py-3 pr-4 font-semibold">Nghệ sĩ</th>
            <th className="py-3 pr-4 font-semibold">Thể loại</th>
            <th className="py-3 pr-4 font-semibold">Lượt nghe</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={song.id} className="border-b border-white/10 last:border-0">
              <td className={`py-3 pr-4 font-black ${mutedClass}`}>{index + 1}</td>
              <td className="py-3 pr-4 font-semibold">{song.title}</td>
              <td className={`py-3 pr-4 ${mutedClass}`}>{song.artist}</td>
              <td className="py-3 pr-4">
                <span className={`rounded-md px-2 py-1 text-xs ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                  {song.genre || 'Khác'}
                </span>
              </td>
              <td className="py-3 pr-4 font-bold">{song.plays || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SongTable({ songs, isDark, mutedClass, compact = false }) {
  if (songs.length === 0) {
    return <p className={`mt-5 text-sm ${mutedClass}`}>Chưa có bài hát.</p>;
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className={mutedClass}>
          <tr className="border-b border-white/10">
            <th className="py-3 pr-4 font-semibold">Bài hát</th>
            <th className="py-3 pr-4 font-semibold">Nghệ sĩ</th>
            {!compact && <th className="py-3 pr-4 font-semibold">Album</th>}
            <th className="py-3 pr-4 font-semibold">Thể loại</th>
            <th className="py-3 pr-4 font-semibold">Thời lượng</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id} className="border-b border-white/10 last:border-0">
              <td className="py-3 pr-4 font-semibold">{song.title}</td>
              <td className={`py-3 pr-4 ${mutedClass}`}>{song.artist}</td>
              {!compact && <td className={`py-3 pr-4 ${mutedClass}`}>{song.album || '-'}</td>}
              <td className="py-3 pr-4">
                <span className={`rounded-md px-2 py-1 text-xs ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                  {song.genre || 'Khác'}
                </span>
              </td>
              <td className={`py-3 pr-4 ${mutedClass}`}>{formatTime(song?.duration)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SystemItem({ label, value, isDark }) {
  return (
    <div className={`rounded-lg border p-4 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
      <div className={`text-xs font-bold uppercase tracking-[0.18em] ${isDark ? 'text-spotify-subtle' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className="mt-3 text-sm font-semibold">{value}</div>
    </div>
  );
}
