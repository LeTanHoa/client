import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, coverUrlForSong } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SongCard } from '../components/SongCard.jsx';
import { SongDetailRow } from '../components/SongDetailRow.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';

export function SingerDetail() {
  const { artist } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { playTrack } = usePlayer();
  const { isAuthenticated } = useAuth();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalSong, setModalSong] = useState(null);
  const [artistImage, setArtistImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const decodedArtist = decodeURIComponent(artist);


  const normalizeText = (text) => {
    return decodeURIComponent(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .replace(/\s+/g, "") // bỏ khoảng trắng
      .trim();
  };
  const loadSongs = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await api(
        `/songs`
      );
      setSongs(data.songs || []);
    } catch (e) {
      setError(e.message);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [decodedArtist]);


  const filterSongsByArtist = songs.filter((s) => normalizeText(s.artist) === normalizeText(decodedArtist));

  // Generate AI artist image
  const getArtistImage = useCallback(() => {
    const keywords = decodedArtist.split(' ').join('%20');
    return `https://source.unsplash.com/600x600/?artist,${keywords},portrait,music&q=${Date.now()}`;
  }, [decodedArtist]);

  useEffect(() => {
    loadSongs();
    setArtistImage(getArtistImage());
  }, [loadSongs, getArtistImage]);

  const playFrom = (list) => (song) => playTrack(song, { queue: list });

  // Generate avatar color
  const colors = [
    'from-zing-primary to-zing-secondary',
    'from-zing-pink to-zing-orange',
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
  ];
  const colorIndex = decodedArtist.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section
        className={`relative overflow-hidden rounded-2xl border p-6 md:p-12 ${isDark
            ? 'bg-gradient-to-br from-zing-bg-panel via-zing-bg-secondary to-zing-bg-tertiary border-white/10'
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
          }`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          {/* Avatar/Image */}
          <div className={`shrink-0 h-32 w-32 md:h-48 md:w-48 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br ${bgColor}`}>
            <img
              src={artistImage}
              alt={decodedArtist}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-zing-primary text-2xl md:text-3xl">🎤</span>
              <p className="text-xs md:text-sm uppercase tracking-widest font-bold text-zing-success">
                Ca sĩ / Nghệ sĩ
              </p>
            </div>
            <h1 className="text-3xl md:text-5xl font-black truncate">{decodedArtist}</h1>
            <p className={`mt-3 text-base md:text-lg ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
              {filterSongsByArtist?.length} bài hát
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (songs.length > 0) {
                    playTrack(songs[0], { queue: songs });
                  }
                }}
                disabled={songs.length === 0 || loading}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ▶ Phát tất cả
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`rounded-lg px-6 py-3 text-sm font-bold transition-all ${isDark
                    ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                    : 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Songs Section */}
      <section className={`rounded-2xl border p-4 sm:p-6 md:p-8 ${isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-black">🎵 Bài hát</h2>
              <p className={`mt-2 text-sm ${isDark ? 'text-zing-text-tertiary' : 'text-slate-600'}`}>
                Khám phá toàn bộ tác phẩm của {decodedArtist}
              </p>
            </div>

            {/* View Toggle */}
            {songs.length > 0 && (
              <div className={`flex gap-2 p-1 rounded-lg border ${isDark ? 'bg-zing-bg-tertiary border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${viewMode === 'grid'
                      ? isDark ? 'bg-zing-primary text-white' : 'bg-zing-primary text-white'
                      : isDark ? 'text-zing-text-secondary hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="Grid view"
                >
                  ⊞ Lưới
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${viewMode === 'list'
                      ? isDark ? 'bg-zing-primary text-white' : 'bg-zing-primary text-white'
                      : isDark ? 'text-zing-text-secondary hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  title="List view"
                >
                  ☰ Danh sách
                </button>
              </div>
            )}
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
            <p className="text-sm md:text-base">📭 Chưa có bài nào từ ca sĩ này</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className={`text-sm ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
              Tổng: <strong>{filterSongsByArtist?.length}</strong> bài hát
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {filterSongsByArtist?.map((song, idx) => (
                <SongCard
                  key={song.id}
                  song={song}
                  badge={idx < 3 ? '⭐ Top' : null}
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
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className={`text-sm ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
                Tổng: <strong>{filterSongsByArtist?.length}</strong> bài hát
              </p>
            </div>
            <div className="space-y-2">
              {filterSongsByArtist?.map((song, idx) => (
                <SongDetailRow
                  key={song.id}
                  song={song}
                  badge={idx < 3 ? `${idx + 1}` : null}
                  onPlay={() => playTrack(song, { queue: songs })}
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
          </>
        )}
      </section>

      {modalSong && (
        <AddToPlaylistModal songId={modalSong.id} onClose={() => setModalSong(null)} />
      )}
    </div>
  );
}
