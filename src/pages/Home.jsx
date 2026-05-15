import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';
import { SongCard } from '../components/SongCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { isDark } = useTheme();
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
    const timer = setTimeout(() => load(search, genreFilter), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, genreFilter, load]);

  const featured = recommended.length > 0 ? recommended.slice(0, 4) : recent.slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className={`rounded-2xl border p-8 md:p-12 overflow-hidden relative ${
        isDark ? 'bg-gradient-to-br from-zing-bg-panel via-zing-bg-secondary to-zing-bg-tertiary border-white/10' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
      }`}>
        {/* Background Decoration */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-zing-primary/10 to-transparent' : 'bg-gradient-to-br from-zing-primary/5 to-transparent'}`} />
        
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs md:text-sm uppercase tracking-widest font-bold text-zing-success">
              🎵 ZingMP3 Đề Xuất
            </p>
            <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-zing-primary to-zing-accent bg-clip-text text-transparent">
              Nhạc hay mỗi ngày
            </h1>
            <p className={`mt-4 text-sm md:text-base leading-relaxed ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
              Khám phá những bài hát mới, yêu thích của người khác và tạo playlist riêng của bạn.
            </p>
            <button
              type="button"
              onClick={scrollToSection}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-lg hover:brightness-110"
            >
              ▶ Khám phá ngay
            </button>
          </div>

          {/* Featured Songs Quick Preview */}
          <div className="space-y-3">
            {featured.slice(0, 3).map((song, idx) => (
              <button
                key={song.id}
                type="button"
                onClick={() => playTrack(song)}
                className={`w-full max-w-xs rounded-lg border p-3 text-left transition-all duration-200 ${
                  isDark
                    ? 'bg-zing-bg-tertiary/50 border-white/10 hover:bg-zing-primary/10 hover:border-zing-primary/30'
                    : 'bg-white/50 border-slate-200 hover:bg-zing-primary/10 hover:border-zing-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${isDark ? 'bg-zing-primary/20 text-zing-primary' : 'bg-zing-primary/20 text-zing-primary'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{song.title}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>{song.artist}</p>
                  </div>
                  <span className="text-lg">▶</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Recommended Section */}
        {recommended.length > 0 && (
          <div className={`lg:col-span-2 rounded-2xl border p-6 ${isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">🎁 Gợi ý hôm nay</h2>
                <p className={`mt-1 text-xs md:text-sm ${isDark ? 'text-zing-text-tertiary' : 'text-slate-600'}`}>
                  Những bài hát đặc biệt dành cho bạn
                </p>
              </div>
              <button
                type="button"
                onClick={() => load(search, genreFilter)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all duration-200 border ${
                  isDark
                    ? 'bg-zing-bg-tertiary border-white/10 text-zing-success hover:bg-zing-primary/20'
                    : 'bg-slate-100 border-slate-200 text-zing-primary hover:bg-zing-primary/10'
                }`}
              >
                🔄 Làm mới
              </button> 
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {recommended.slice(0, 4).map((song) => (
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
          </div>
        )}

        {/* Recent/History Section */}
        {isAuthenticated && recent.length > 0 && (
          <div className={`rounded-2xl border p-6 ${isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg md:text-xl font-bold mb-4">⏰ Bạn vừa nghe</h3>
            <div className="space-y-3">
              {recent.slice(0, 6).map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => playTrack(song)}
                  className={`w-full rounded-lg border p-3 text-left transition-all duration-200 group ${
                    isDark
                      ? 'bg-zing-bg-tertiary border-white/10 hover:bg-zing-primary/10 hover:border-zing-primary/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-zing-primary/10 hover:border-zing-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-xs md:text-sm group-hover:text-zing-primary transition-colors">{song.title}</p>
                      <p className={`text-xs truncate ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>{song.artist}</p>
                    </div>
                    <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Main Songs Section */}
      <section ref={sectionRef} className={`rounded-2xl border p-6 md:p-8 ${isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black">🎵 Hôm nay nghe gì?</h2>
              <p className={`mt-2 text-sm ${isDark ? 'text-zing-text-tertiary' : 'text-slate-600'}`}>
                Khám phá những bài hát mới phù hợp với thể loại yêu thích
              </p>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => {
                setGenreFilter('');
                scrollToSection();
              }}
              className={`rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all duration-200 border whitespace-nowrap ${
                !genreFilter
                  ? 'bg-gradient-to-r from-zing-primary to-zing-secondary text-white border-transparent shadow-md'
                  : isDark
                    ? 'bg-zing-bg-tertiary border-white/10 text-zing-text-secondary hover:border-zing-primary/50 hover:text-zing-primary'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-zing-primary hover:text-zing-primary'
              }`}
            >
              ✨ Tất cả
            </button>
            {VIETNAMESE_MUSIC_GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  setGenreFilter(genre);
                  scrollToSection();
                }}
                className={`rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all duration-200 border whitespace-nowrap ${
                  genreFilter === genre
                    ? 'bg-gradient-to-r from-zing-primary to-zing-secondary text-white border-transparent shadow-md'
                    : isDark
                      ? 'bg-zing-bg-tertiary border-white/10 text-zing-text-secondary hover:border-zing-primary/50 hover:text-zing-primary'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-zing-primary hover:text-zing-primary'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Songs Grid */}
        {error && (
          <p className={`py-8 text-center ${isDark ? 'text-zing-pink' : 'text-red-500'}`}>
            ⚠️ {error}
          </p>
        )}

        {loading ? (
          <div className={`py-12 text-center ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
            <p className="text-sm md:text-base">⏳ Đang tải nhạc...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className={`py-12 text-center ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
            <p className="text-sm md:text-base">📭 Chưa có bài nào</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      {modalSong && <AddToPlaylistModal songId={modalSong.id} onClose={() => setModalSong(null)} />}
    </div>
  );
}
