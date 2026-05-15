import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';
import { SongCard } from '../components/SongCard.jsx';

export function Charts() {
  const { isDark } = useTheme();
  const { playTrack } = usePlayer();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalSong, setModalSong] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTopSongs() {
      setError(null);
      setLoading(true);
      try {
        const data = await api('/history/top?limit=20');
        if (!cancelled) {
          setSongs(data.songs || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTopSongs();
    return () => {
      cancelled = true;
    };
  }, []);

  const playFrom = (list) => (song) => playTrack(song, { queue: list });

  return (
    <div className="space-y-8">
      <div className={`rounded-[2rem] border p-6 ${isDark ? 'bg-[#150f28] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-spotify-green">BXH</p>
            <h1 className="mt-3 text-3xl font-black">Top nhạc thịnh hành</h1>
            <p className={`mt-3 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
              Những bài hát được nghe nhiều nhất trên hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
              isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Về trang chủ
          </button>
        </div>
      </div>

      {loading ? (
        <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Đang tải BXH…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : songs.length === 0 ? (
        <div className={`rounded-[2rem] border p-6 ${isDark ? 'bg-[#110c1b] border-white/10' : 'bg-white border-slate-200'}`}>
          <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>
            Chưa có đủ dữ liệu để hiển thị BXH. Hãy phát nhiều bài hơn để cập nhật.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {songs.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              badge={`#${index + 1}`}
              onPlay={playFrom(songs)}
              onAdd={(picked) => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                setModalSong(picked);
              }}
            />
          ))}
        </div>
      )}

      {modalSong && <AddToPlaylistModal songId={modalSong.id} onClose={() => setModalSong(null)} />}
    </div>
  );
}
