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

  const inputClass = `
    flex-1 min-w-[220px] rounded-full px-4 py-3 outline-none transition
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
        className={`rounded-[2rem] border p-6 ${isDark
            ? 'bg-[#150f28] border-white/10'
            : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
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
          className={`rounded-[2rem] border p-6 ${isDark
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((p) => (
            <Link
              key={p.id}
              to={`/playlists/${p.id}`}
              className={`block rounded-[2rem] border p-6 transition ${isDark
                  ? 'bg-[#150f28] border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-lg font-semibold">
                  {p.name}
                </span>

                <span
                  className={`text-sm ${isDark
                      ? 'text-spotify-subtle'
                      : 'text-slate-500'
                    }`}
                >
                  {p.songCount || 0} bài
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}