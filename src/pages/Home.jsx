import { useCallback, useEffect, useState } from 'react';
import { api, coverUrlForSong } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';
import { FavoriteHeart } from '../components/FavoriteHeart.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

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
      {song.genre ? <p className="text-xs text-spotify-subtle truncate mt-1">#{song.genre}</p> : null}
      <div className="flex gap-2 mt-3">
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

export function Home() {
  const sectionRef = useRef(null);

  const { playTrack } = usePlayer();
  const navigate = useNavigate();
  const playFrom = (list) => (song) => playTrack(song, { queue: list });
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [songs, setSongs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalSong, setModalSong] = useState(null);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const load = useCallback(async (q, genre) => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('search', q.trim());
      if (genre.trim()) params.set('genre', genre.trim());
      const qs = params.toString() ? `?${params.toString()}` : '';
      const tasks = [api(`/songs${qs}`)];
      if (isAuthenticated) {
        tasks.push(api('/history/recent?limit=8'), api('/history/recommend?limit=8'));
      }
      const [sRes, rRes, recRes] = await Promise.all(tasks);
      setSongs(sRes.songs || []);
      setRecent(rRes?.songs || []);
      setRecommended(recRes?.songs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    const t = setTimeout(() => load(search, genreFilter), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, genreFilter, load]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Home</h1>
        <p className="text-spotify-subtle mb-6">Browse, search, and play your library.</p>
        <input
          type="search"
          placeholder="Search songs, artists, albums…"
          className="w-full max-w-md bg-spotify-panel border border-white/20 rounded-full px-5 py-2.5 outline-none focus:border-spotify-green"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* <div className="mt-3">
          <label className="block text-xs text-spotify-subtle mb-1">Lọc theo thể loại</label>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full max-w-md bg-spotify-panel border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green text-sm"
          >
            <option value="">Tất cả thể loại</option>
            {VIETNAMESE_MUSIC_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div> */}
        <div className="mt-7 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => {
              setGenreFilter('');
              scrollToSection();
            }}
            className={`px-3 py-1.5 rounded-full text-xs transition ${!genreFilter
              ? 'bg-spotify-green text-black font-semibold'
              : 'bg-spotify-hover text-spotify-subtle hover:text-white'
              }`}
          >
            Tất cả
          </button>
          {VIETNAMESE_MUSIC_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                setGenreFilter(genre);
                scrollToSection();
              }}
              className={`px-3 py-1.5 rounded-full text-xs transition ${genreFilter === genre
                ? 'bg-spotify-green text-black font-semibold'
                : 'bg-spotify-hover text-spotify-subtle hover:text-white'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
        {user?.role === 'admin' ? (
          <p className="mt-6 text-sm text-spotify-subtle">
            Quản lý và thêm nhạc tại trang <span className="text-white">/admin</span>.
          </p>
        ) : null}
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {!search && recent.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recently played</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recent.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={playTrack}
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
        </section>
      )}

      {!search && recommended.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recommended for you</h2>
          <p className="text-sm text-spotify-subtle mb-4">Based on artists in your listening history.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recommended.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={playFrom(recommended)}
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
        </section>
      )}

      <section ref={sectionRef}>
        <h2 className="text-xl font-semibold mb-4">
          {search || genreFilter ? 'Search results' : 'All songs'}
        </h2>
        {genreFilter ? (
          <p className="text-sm text-spotify-subtle mb-4">
            Đang lọc theo thể loại: <span className="text-white">{genreFilter}</span>
          </p>
        ) : null}
        {loading ? (
          <p className="text-spotify-subtle">Loading…</p>
        ) : songs.length === 0 ? (
          <p className="text-spotify-subtle">
            Chưa có bài nào. Thêm nhạc bằng link hoặc file ở trên, hoặc chạy seed trên server.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
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
      </section>

      {modalSong && (
        <AddToPlaylistModal songId={modalSong.id} onClose={() => setModalSong(null)} />
      )}
    </div>
  );
}
