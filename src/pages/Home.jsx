import { useCallback, useEffect, useRef, useState } from 'react';
import { api, coverUrlForSong } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';
import { SongCard } from '../components/SongCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { VIETNAMESE_MUSIC_GENRES } from '../constants/genres.js';
import { useNavigate } from 'react-router-dom';
import { Charts } from './Charts.jsx';
import { TopChartPanel } from '../components/TopChartPanel.jsx';

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
  const panelClass = isDark
    ? 'bg-zing-bg-panel border-white/10'
    : 'bg-white border-slate-200';
  const rowCardClass = isDark
    ? 'bg-zing-bg-tertiary/70 border-white/10 hover:border-zing-primary/40 hover:bg-zing-primary/10'
    : 'bg-slate-50 border-slate-200 hover:border-zing-primary/30 hover:bg-white';

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Hero Section */}
      <section className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 md:p-12 ${isDark ? 'bg-gradient-to-br from-zing-bg-panel via-zing-bg-secondary to-zing-bg-tertiary border-white/10' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
        }`}>
        {/* Background Decoration */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-zing-primary/10 to-transparent' : 'bg-gradient-to-br from-zing-primary/5 to-transparent'}`} />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
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
          <div className="w-full space-y-3 lg:w-auto">
            {featured.slice(0, 3).map((song, idx) => (
              <button
                key={song.id}
                type="button"
                onClick={() => playTrack(song)}
                className={`w-full rounded-lg border p-3 text-left transition-all duration-200 lg:max-w-xs ${isDark
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
      <section className="flex flex-col lg:flex-row gap-5">
            <div className='flex flex-col lg:flex-row w-full lg:w-[30%]' >
          {isAuthenticated && recent.length > 0 && (
              <div
                className={`w-full h-full  max-w-full overflow-hidden rounded-2xl border p-4 sm:p-5 ${panelClass}`}
              >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold sm:text-xl">
                      ⏰ Bạn vừa nghe
                    </h3>

                    <p
                      className={`mt-1 text-xs ${isDark
                          ? 'text-zing-text-tertiary'
                          : 'text-slate-500'
                        }`}
                    >
                      Lịch sử gần đây
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${isDark
                        ? 'bg-white/10 text-zing-success'
                        : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {recent.length}
                  </span>
                </div>

                {/* Recent List */}
                <div className="space-y-3">
                  {recent.slice(0, 6).map((song) => (
                    <article
                      key={song.id}
                      className={`group flex items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-200 active:scale-[0.98] ${rowCardClass}`}
                    >
                      {/* Cover */}
                      <img
                        src={coverUrlForSong(song.id)}
                        alt={song.title}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.opacity = 0;
                        }}
                      />

                      {/* Content */}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h4 className="line-clamp-2 text-sm font-bold leading-snug">
                          {song.title}
                        </h4>

                        <p
                          className={`mt-1 truncate text-xs ${isDark
                              ? 'text-zing-text-tertiary'
                              : 'text-slate-500'
                            }`}
                        >
                          {song.artist}
                        </p>
                      </div>

                      {/* Play */}
                      <button
                        type="button"
                        onClick={() =>
                          playTrack(song, { queue: recent })
                        }
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${isDark
                            ? 'bg-white/10 text-white hover:bg-zing-primary'
                            : 'bg-white text-slate-700 shadow hover:bg-zing-primary hover:text-white'
                          }`}
                        aria-label="Phát"
                      >
                        ▶
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
        </div>
        <div className={`h-full w-full lg:w-[70%] `}  >
           <TopChartPanel/>
        </div>
      </section>

        
      {/* ở đây */}

      {/* Main Songs Section */}
      <section ref={sectionRef} className={`rounded-2xl border p-4 sm:p-6 md:p-8 ${isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'}`}>
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
              className={`rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all duration-200 border whitespace-nowrap ${!genreFilter
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
                className={`rounded-lg px-4 py-2 text-xs md:text-sm font-bold transition-all duration-200 border whitespace-nowrap ${genreFilter === genre
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                mobileTile
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
