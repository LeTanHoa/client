import { useEffect, useMemo, useState } from 'react';
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

  const chartSongs = songs.slice(0, 10);
  const chartMaxPlays = chartSongs.length ? Math.max(...chartSongs.map((song) => song.plays ?? 1)) : 1;
  const chartMinPlays = chartSongs.length ? Math.min(...chartSongs.map((song) => song.plays ?? 0)) : 0;
  const chartValues = chartSongs.map((song) => song.plays ?? 0);

  const chartPoints = useMemo(() => {
    if (!chartSongs.length) return [];
    const range = Math.max(chartMaxPlays - chartMinPlays, 1);
    return chartValues.map((value, index) => {
      const x = 24 + (index * 40);
      const y = 196 - Math.round(((value - chartMinPlays) / range) * 140);
      return { x, y, value };
    });
  }, [chartMinPlays, chartMaxPlays, chartSongs.length, chartValues]);

  const chartLinePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const chartAreaPath = chartPoints.length
    ? `${chartLinePath} L ${chartPoints[chartPoints.length - 1].x} 200 L ${chartPoints[0].x} 200 Z`
    : '';

  const playFrom = (list) => (song) => playTrack(song, { queue: list });

  const chartMetadata = useMemo(() => {
    return chartSongs.map((song, index) => ({
      ...song,
      percent: chartMaxPlays > 0 ? Math.round(((song.plays ?? 0) / chartMaxPlays) * 100) : 0,
      position: index + 1,
    }));
  }, [chartSongs, chartMaxPlays]);

  return (
    <div className="space-y-8">
      <div className={`rounded-2xl border p-4 sm:p-6 ${isDark ? 'bg-[#150f28] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-spotify-green">BXH</p>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">Top nhạc thịnh hành</h1>
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

      {/* Chart hiển thị BXH 7 bài hát từ dữ liệu top plays
      {!loading && !error && chartSongs.length > 0 && (
        <div className={`rounded-[2rem] border p-6 ${isDark ? 'bg-zing-bg-secondary border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <div className="space-y-6 rounded-[1.75rem] border border-white/10 bg-zing-bg p-6 shadow-[0_25px_90px_-70px_rgba(0,0,0,0.8)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-zing-primary">#zingchart</p>
                  <h2 className="mt-3 text-2xl font-black text-white">BXH thịnh hành</h2>
                </div>
                <span className="rounded-full border border-zing-primary/50 bg-white/5 px-3 py-1 text-xs font-semibold uppercase text-zing-primary">
                  Top 7
                </span>
              </div>

              <div className="space-y-4">
                {chartMetadata.slice(0, 3).map((song) => (
                  <div key={song.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-xl font-bold text-white">
                        {song.position}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{song.title}</p>
                        <p className="mt-1 text-xs text-zing-text-secondary">{song.artist || 'Unknown artist'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{song.percent}%</p>
                        <p className="text-xs text-zing-text-secondary">lượt nghe</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-center text-sm text-zing-text-secondary">
                Dữ liệu từ lượt nghe hệ thống, cập nhật theo thời gian thực.
              </div>

              <button
                type="button"
                className="w-full rounded-full border border-zing-primary/40 bg-zing-primary/10 px-5 py-3 text-sm font-semibold text-zing-primary transition hover:bg-zing-primary/20"
              >
                Xem thêm
              </button>
            </div>

            <div className="rounded-[1.75rem] bg-gradient-to-br from-[#0e1126] via-[#170f33] to-[#170f33] p-6 shadow-[0_25px_90px_-70px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-zing-text-secondary">Xu hướng</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Lượt nghe theo thời gian</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase text-zing-text-secondary">
                  Đang tăng
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f24] p-5">
                <svg viewBox="0 0 320 220" className="h-[320px] w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a86ff" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#3a86ff" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="320" height="220" rx="24" fill="#0b0f24" />
                  {[40, 80, 120, 160, 200].map((y) => (
                    <line key={y} x1="16" y1={y} x2="304" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  {chartAreaPath && <path d={chartAreaPath} fill="url(#chart-gradient)" opacity="0.9" />}
                  {chartLinePath && <path d={chartLinePath} stroke="#3a86ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
                  {chartPoints.map((point, index) => (
                    <g key={index}>
                      <circle cx={point.x} cy={point.y} r="5" fill="#0b0f24" stroke="#3a86ff" strokeWidth="2" />
                      <circle cx={point.x} cy={point.y} r="2" fill="#3a86ff" />
                    </g>
                  ))}
                </svg>
              </div>

              <div className="mt-5 grid grid-cols-4 text-xs uppercase tracking-[0.2em] text-zing-text-secondary">
                <span>12:00</span>
                <span>14:00</span>
                <span>18:00</span>
                <span>22:00</span>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {!loading && !error && chartSongs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zing-primary">Danh sách <strong className='text-white font-bold'>{chartSongs.length}</strong>  bài hát yêu thích</p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
            {chartSongs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                badge={`#${index + 1}`}
                mobileTile
                onPlay={playFrom(chartSongs)}
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

      {loading ? (
        <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Đang tải BXH…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : songs.length === 0 ? (
        <div className={`rounded-2xl border p-4 sm:p-6 ${isDark ? 'bg-[#110c1b] border-white/10' : 'bg-white border-slate-200'}`}>
          <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>
            Chưa có đủ dữ liệu để hiển thị BXH. Hãy phát nhiều bài hơn để cập nhật.
          </p>
        </div>
      ) : null}

      {modalSong && <AddToPlaylistModal songId={modalSong.id} onClose={() => setModalSong(null)} />}
    </div>
  );
}
