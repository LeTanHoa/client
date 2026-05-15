import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';

export function AddToPlaylistModal({ songId, onClose }) {
  const { isDark } = useTheme();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/playlist');
        if (!cancelled) setPlaylists(data.playlists || []);
      } catch (e) {
        if (!cancelled) setMessage(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function addTo(playlistId) {
    setBusy(true);
    setMessage(null);
    try {
      await api('/playlist/add-song', {
        method: 'POST',
        body: JSON.stringify({ playlistId, songId }),
      });
      setMessage('Đã thêm vào danh sách phát.');
      setTimeout(onClose, 600);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createAndAdd() {
    if (!name.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const { playlist } = await api('/playlist', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      });
      await api('/playlist/add-song', {
        method: 'POST',
        body: JSON.stringify({ playlistId: playlist.id, songId }),
      });
      setMessage('Đã tạo playlist và thêm bài hát.');
      setTimeout(onClose, 600);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
      isDark ? 'bg-black/75' : 'bg-slate-200/70'
    }`}>
      <div className={`w-full max-w-lg rounded-[2rem] border p-6 shadow-2xl ${
        isDark ? 'bg-[#130f25] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Thêm vào playlist</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-500'}`}>
              Chọn playlist hoặc tạo mới ngay lập tức.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full px-3 py-2 text-sm transition ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đóng
          </button>
        </div>

        {loading ? (
          <p className={`text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
            Đang tải playlist…
          </p>
        ) : (
          <ul className="space-y-3 max-h-56 overflow-y-auto mb-5">
            {playlists.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => addTo(p.id)}
                  className={`w-full rounded-3xl border px-4 py-3 text-left text-sm transition ${
                    isDark
                      ? 'border-white/10 bg-[#110c1b] text-white hover:bg-white/5'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className={`ml-2 text-xs ${isDark ? 'text-spotify-subtle' : 'text-slate-500'}`}>
                    ({p.songCount} bài)
                  </span>
                </button>
              </li>
            ))}
            {playlists.length === 0 && (
              <p className={`text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
                Chưa có playlist nào. Hãy tạo mới bên dưới.
              </p>
            )}
          </ul>
        )}

        <div className="flex flex-col gap-3">
          <input
            className={`w-full rounded-3xl border px-4 py-3 text-sm outline-none transition ${
              isDark
                ? 'bg-[#110c1b] border-white/10 text-white placeholder-slate-500 focus:border-spotify-green'
                : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-green-500'
            }`}
            placeholder="Tên playlist mới"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={createAndAdd}
            className="rounded-3xl bg-spotify-green px-5 py-3 text-sm font-semibold text-black transition disabled:opacity-50"
          >
            Tạo và thêm
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
