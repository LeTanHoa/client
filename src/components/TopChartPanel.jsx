
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal.jsx';
import { SongCard } from '../components/SongCard.jsx';

export function TopChartPanel() {
  const { isDark } = useTheme();
  const { playTrack } = usePlayer();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalSong, setModalSong] = useState(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
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

  const chartMaxPlays = chartSongs.length
    ? Math.max(...chartSongs.map((song) => song.plays ?? 1))
    : 1;

  const chartMinPlays = chartSongs.length
    ? Math.min(...chartSongs.map((song) => song.plays ?? 0))
    : 0;

  const chartValues = chartSongs.map((song) => song.plays ?? 0);

  const chartPoints = useMemo(() => {
    if (!chartSongs.length) return [];

    const range = Math.max(chartMaxPlays - chartMinPlays, 1);

    return chartValues.map((value, index) => {
      const x = 24 + index * 40;

      const y =
        196 - Math.round(((value - chartMinPlays) / range) * 140);

      return { x, y, value };
    });
  }, [chartMinPlays, chartMaxPlays, chartSongs.length, chartValues]);

  const chartLinePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const chartAreaPath = chartPoints.length
    ? `${chartLinePath} L ${chartPoints[chartPoints.length - 1].x
    } 200 L ${chartPoints[0].x} 200 Z`
    : '';

  const playFrom = (list) => (song) =>
    playTrack(song, { queue: list });

  const chartMetadata = useMemo(() => {
    return chartSongs.map((song, index) => ({
      ...song,
      percent:
        chartMaxPlays > 0
          ? Math.round(((song.plays ?? 0) / chartMaxPlays) * 100)
          : 0,
      position: index + 1,
    }));
  }, [chartSongs, chartMaxPlays]);

  return (
    <div className="h-full w-full">
      {!loading && !error && chartSongs.length > 0 && (
        <div
          className={`rounded-[1rem] w-full border p-4 sm:p-6 ${isDark
            ? 'bg-[#170f33] border-white/10'
            : 'bg-white border-slate-200'
            }`}
        >
          <div className="grid gap-4 sm:gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">

            {/* LEFT PANEL */}
            <div className={`space-y-4 sm:space-y-6 rounded-[1.75rem] border border-white/10 ${isDark ? 'bg-[#170f33]' : 'bg-white'} p-4 sm:p-6 shadow-[0_25px_90px_-70px_rgba(0,0,0,0.8)]`}>

              {/* HEADER */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-zing-primary">
                    #MUchart
                  </p>

                  <h2 className={`mt-2 sm:mt-3 text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    BXH thịnh hành
                  </h2>
                </div>

                <span className="shrink-0 rounded-full border border-zing-primary/50 bg-white/5 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase text-zing-primary">
                  Top 4
                </span>
              </div>

              {/* TOP SONGS */}
              <div className="space-y-3 sm:space-y-4">
                {chartMetadata.slice(0, 4).map((song) => (
                  <div
                    key={song.id}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3 sm:p-4 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">

                      {/* RANK */}
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-3xl ${isDark ? 'bg-white/10 text-white' : 'bg-white text-black border-gray-400 border'} text-lg sm:text-xl font-bold `}>
                        {song.position}
                      </div>

                      {/* SONG INFO */}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 lg:line-clamp-1 text-sm font-bold leading-snug">
                          {song.title}
                        </p>

                        <p className="mt-1 truncate text-[11px] sm:text-xs text-zing-text-secondary">
                          {song.artist || 'Unknown artist'}
                        </p>
                      </div>

                      {/* PERCENT */}
                      <div className="shrink-0 text-right">
                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                          {song.percent}%
                        </p>

                        <p className="text-[10px] sm:text-xs text-zing-text-secondary">
                          lượt nghe
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER INFO */}
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-2 text-center text-xs sm:text-sm text-zing-text-secondary">
                Dữ liệu từ lượt nghe hệ thống, cập nhật theo thời gian thực.
              </div>

              {/* BUTTON */}
              <Link
                to="/charts"
                className={`flex w-full items-center justify-center rounded-full border ${isDark ? 'border-zing-primary/40 bg-zing-primary/10 text-zing-primary hover:bg-zing-primary/20 ' : 'border-gray-300 hover:bg-gray-200 text-black bg-white'} px-5 py-3 text-sm font-semibold transition `}
              >
                Xem thêm
              </Link>
            </div>

            {/* RIGHT PANEL */}
            <div
              className={`rounded-[1.75rem] p-4 sm:p-6 shadow-[0_25px_90px_-70px_rgba(0,0,0,0.8)] ${isDark
                ? 'bg-gradient-to-br from-[#0e1126] via-[#170f33] to-[#170f33]'
                : 'bg-white'
                }`}
            >


              {/* HEADER */}
              <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">
                  <p className={`text-xs sm:text-sm uppercase tracking-[0.35em]  ${isDark ? 'text-zing-primary' : 'text-zing-primary'}`}>
                    Xu hướng
                  </p>

                  <h3 className="mt-2 text-xl sm:text-2xl font-semibold ${isDark ? 'text-white' : 'text-black'}">
                    Lượt nghe theo thời gian
                  </h3>
                </div>

                <div className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase text-zing-text-secondary">
                  Đang tăng
                </div>
              </div>

              {/* CHART */}
              <div className={`mt-4 sm:mt-6 overflow-hidden rounded-[1.5rem] border ${isDark ? 'border-white/10 bg-[#0b0f24]' : 'border-slate-300 bg-gray-100'}  p-3 sm:p-5`}>

                <svg
                  viewBox="0 0 320 220"
                  className="h-[220px] sm:h-[280px] lg:h-[320px] w-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="chart-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#3a86ff"
                        stopOpacity="0.75"
                      />

                      <stop
                        offset="100%"
                        stopColor="#3a86ff"
                        stopOpacity="0.08"
                      />
                    </linearGradient>
                  </defs>

                  <rect
                    x="0"
                    y="0"
                    width="320"
                    height="220"
                    rx="24"
                    fill={
                      isMobile
                        ? isDark
                          ? "#0b0f24"
                          : "#ffff"
                        : "transparent"
                    }
                  />

                  {[40, 80, 120, 160, 200].map((y) => (
                    <line
                      key={y}
                      x1="16"
                      y1={y}
                      x2="304"
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  ))}

                  {chartAreaPath && (
                    <path
                      d={chartAreaPath}
                      fill="url(#chart-gradient)"
                      opacity="0.9"
                    />
                  )}

                  {chartLinePath && (
                    <path
                      d={chartLinePath}
                      stroke="#3a86ff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  )}

                  {chartPoints.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#0b0f24"
                        stroke="#3a86ff"
                        strokeWidth="2"
                      />

                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="2"
                        fill="#3a86ff"
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* TIME */}
              <div className="mt-4 sm:mt-5 grid grid-cols-4 text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zing-text-secondary">
                <span>12:00</span>
                <span>14:00</span>
                <span>18:00</span>
                <span>22:00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-zing-text-secondary">
            Đang tải bảng xếp hạng...
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* MODAL */}
      {modalSong && (
        <AddToPlaylistModal
          song={modalSong}
          onClose={() => setModalSong(null)}
        />
      )}
    </div>
  );
}
