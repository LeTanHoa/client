import { useCallback, useEffect, useState } from 'react';
import { api, coverUrlForSong } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';
import { FavoriteHeart } from '../components/FavoriteHeart.jsx';

function SongCard({ song, onPlay, onAdd }) {
  return (
    <div className="group bg-spotify-panel hover:bg-spotify-hover rounded-lg p-4 transition cursor-pointer border border-transparent hover:border-white/10">
      <div className="relative aspect-square mb-3 rounded-md overflow-hidden bg-spotify-hover">
        <img
          src={coverUrlForSong(song.id)}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.opacity = 0;
          }}
        />
        <div className="absolute top-2 right-2 z-10">
          <FavoriteHeart songId={song.id} className="bg-black/40 backdrop-blur-sm" />
        </div>
        <button
          type="button"
          onClick={() => onPlay(song)}
          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition"
          aria-label="Play"
        >
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
      <h3 className="font-medium truncate">{song.title}</h3>
      <p className="text-sm text-spotify-subtle truncate">{song.artist}</p>
      <div className="flex gap-2 mt-3 items-center">
        <button
          type="button"
          onClick={() => onPlay(song)}
          className="text-xs text-spotify-green hover:underline"
        >
          Play
        </button>
        <button type="button" onClick={() => onAdd(song)} className="text-xs text-spotify-subtle hover:text-white">
          Add to playlist
        </button>
      </div>
    </div>
  );
}

export function Favorites() {
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
      <div>
        <h1 className="text-3xl font-bold mb-2">Yêu thích</h1>
        <p className="text-spotify-subtle">Nhạc bạn đã lưu bằng icon trái tim.</p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {loading ? (
        <p className="text-spotify-subtle">Đang tải…</p>
      ) : songs.length === 0 ? (
        <p className="text-spotify-subtle">Chưa có bài yêu thích. Nhấn trái tim trên bài hát để thêm.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={playFrom(songs)}
              onAdd={setModalSong}
            />
          ))}
        </div>
      )}

      {modalSong && (
        <AddToPlaylistModal songId={modalSong.id} onClose={() => setModalSong(null)} />
      )}
    </div>
  );
}
