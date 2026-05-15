import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';
import { SongCard } from '../components/SongCard.jsx';

export function Favorites() {
  const { isDark } = useTheme();
  const { playTrack } = usePlayer();
  const { favoriteIds } = useFavorites();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalSong, setModalSong] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api('/favorites');
      setSongs(data.songs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, favoriteIds.join(',')]);

  const playFrom = (list) => (song) => playTrack(song, { queue: list });

  return (
    <div className="space-y-8">
      <div className={`rounded-[2rem] border p-6 ${isDark ? 'bg-[#150f28] border-white/10' : 'bg-white border-slate-200'}`}>
        <h1 className="text-3xl font-bold">Yêu thích</h1>
        <p className={`mt-2 ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
          Nhạc bạn đã lưu bằng icon trái tim.
        </p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {loading ? (
        <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Đang tải…</p>
      ) : songs.length === 0 ? (
        <div className={`rounded-[2rem] border p-6 ${isDark ? 'bg-[#110c1b] border-white/10' : 'bg-white border-slate-200'}`}>
          <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>
            Chưa có bài yêu thích. Nhấn trái tim trên bài hát để thêm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={playFrom(songs)}
              onAdd={setModalSong}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {modalSong && <AddToPlaylistModal songId={modalSong.id} onClose={() => setModalSong(null)} />}
    </div>
  );
}
