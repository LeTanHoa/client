import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';

export function Playlists() {
  const { isDark } = useTheme();

  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function refresh() {
    const data = await api('/playlist');
    setPlaylists(data.playlists || []);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylists() {
      try {
        setLoading(true);
        setError(null);

        await refresh();
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlaylists();

    return () => {
      cancelled = true;
    };
  }, []);

  async function create(e) {
    e.preventDefault();

    if (!name.trim()) return;

    setError(null);

    try {
      await api('/playlist', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      setName('');

      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removePlaylist(playlistId) {
    if (!window.confirm('Bạn chắc chắn muốn xoá playlist này?')) {
      return;
    }

    setDeletingId(playlistId);
    setError(null);
    try {
      await api(`/playlist/${playlistId}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass = `
    min-w-0 flex-1 rounded-full px-4 py-3 outline-none transition sm:min-w-[220px]
    ${isDark
      ? 'bg-[#110c1b] border border-white/10 text-white placeholder-slate-500 focus:border-spotify-green'
      : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-green-500'
    }
  `;

  if (loading) {
    return (
      <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>
        Đang tải danh sách phát...
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className={`rounded-2xl border p-4 sm:p-6 ${isDark
            ? 'bg-[#150f28] border-white/10'
            : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Danh sách phát của bạn
            </h1>

            <p
              className={`mt-2 text-sm ${isDark
                  ? 'text-spotify-subtle'
                  : 'text-slate-600'
                }`}
            >
              Quản lý playlist cá nhân.
            </p>
          </div>

          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${isDark
                ? 'bg-white/5 text-white'
                : 'bg-slate-100 text-slate-900'
              }`}
          >
            {playlists.length} playlist
          </div>
        </div>
      </div>

      <form
        onSubmit={create}
        className="flex flex-wrap gap-3"
      >
        <input
          className={inputClass}
          placeholder="Tên playlist mới"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          type="submit"
          className="rounded-full bg-spotify-green px-6 py-3 text-sm font-semibold text-black hover:brightness-110"
        >
          Tạo mới
        </button>
      </form>

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {playlists.length === 0 ? (
        <div
          className={`rounded-2xl border p-4 sm:p-6 ${isDark
              ? 'bg-[#110c1b] border-white/10'
              : 'bg-white border-slate-200'
            }`}
        >
          <p
            className={
              isDark
                ? 'text-spotify-subtle'
                : 'text-slate-600'
            }
          >
            Chưa có playlist nào.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {playlists.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-3 transition sm:p-6 ${isDark
                  ? 'bg-[#150f28] border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <Link
                  to={`/playlists/${p.id}`}
                  className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-spotify-green sm:text-lg"
                >
                  {p.name}
                </Link>

                <span
                  className={`text-xs sm:text-sm ${isDark
                      ? 'text-spotify-subtle'
                      : 'text-slate-500'
                    }`}
                >
                  {p.songCount || 0} bài
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <Link
                  to={`/playlists/${p.id}`}
                  className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${isDark
                      ? 'bg-white/10 text-white hover:bg-white/15'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                >
                  Mở
                </Link>

                <button
                  type="button"
                  disabled={deletingId === p.id}
                  onClick={() => removePlaylist(p.id)}
                  className="rounded-full border border-red-500/50 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
