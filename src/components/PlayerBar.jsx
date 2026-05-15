import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { coverUrlForSong } from '../api.js';
import { FavoriteHeart } from './FavoriteHeart.jsx';

export function PlayerBar() {
  const { isDark } = useTheme();
  const {
    current,
    playing,
    currentTime,
    duration,
    shuffle,
    setShuffle,
    togglePlay,
    playPreviousTrack,
    playNextTrack,
    playRandomTrack,
    seek,
    formatTime,
    queue,
    queueIndex,
  } = usePlayer();

  if (!current) {
    return (
      <div className={`fixed bottom-0 left-72 right-0 h-28 border-t flex items-center justify-center text-sm z-30 transition-colors duration-300 ${
        isDark
          ? 'bg-zing-bg border-white/10 text-zing-text-tertiary'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        🎵 Chọn bài hát để bắt đầu nghe
      </div>
    );
  }

  const progress = duration > 0 ? currentTime / duration : 0;
  const sliderValue = Number.isFinite(progress) ? progress : 0;
  const canSkip =
    shuffle ? queue.length > 1 : queue.length > 0 && queueIndex < queue.length - 1;

  return (
    <div className={`fixed bottom-0 left-72 right-0 border-t z-30 transition-colors duration-300 backdrop-blur-xl ${
      isDark
        ? 'bg-zing-bg/95 border-white/10 shadow-[0_-16px_64px_rgba(0,0,0,0.4)]'
        : 'bg-white/95 border-slate-200 shadow-[0_-16px_64px_rgba(15,23,42,0.08)]'
    }`}>
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-4 px-6 py-4">
        {/* Album Cover */}
        <img
          src={coverUrlForSong(current.id)}
          alt={current.title}
          className={`w-16 h-16 rounded-lg shrink-0 object-cover shadow-lg ${
            isDark ? 'bg-zing-bg-secondary' : 'bg-slate-200'
          }`}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        {/* Song Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-base font-bold text-zing-text">{current.title}</span>
            <FavoriteHeart songId={current.id} size="sm" className="!p-1" />
          </div>
          <p className={`mt-1 text-sm ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
            {current.artist}
          </p>

          {/* Player Controls */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => void playPreviousTrack()}
              className={`h-10 w-10 rounded-lg flex items-center justify-center transition ${
                isDark
                  ? 'bg-zing-bg-panel text-zing-text-secondary hover:bg-zing-bg-tertiary hover:text-zing-primary border border-white/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
              title="Bài trước"
              aria-label="Bài trước"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6 7.5 12 16 18V6z" />
              </svg>
            </button>

            {/* Shuffle Button */}
            <button
              type="button"
              onClick={() => setShuffle((s) => !s)}
              className={`h-10 w-10 rounded-lg flex items-center justify-center transition border ${
                shuffle
                  ? 'bg-gradient-to-r from-zing-primary to-zing-secondary text-white border-transparent shadow-md'
                  : isDark
                    ? 'bg-zing-bg-panel text-zing-text-secondary hover:bg-zing-bg-tertiary hover:text-zing-primary border-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
              title={shuffle ? 'Tắt shuffle' : 'Bật shuffle'}
              aria-pressed={shuffle}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            {/* Random Button */}
            <button
              type="button"
              onClick={() => void playRandomTrack()}
              className={`h-10 w-10 rounded-lg flex items-center justify-center transition border ${
                isDark
                  ? 'bg-zing-bg-panel text-zing-text-secondary hover:bg-zing-bg-tertiary hover:text-zing-accent border-white/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
              title="Phát ngẫu nhiên"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => void playNextTrack()}
              disabled={!canSkip}
              className={`h-10 w-10 rounded-lg flex items-center justify-center transition border disabled:opacity-30 disabled:pointer-events-none ${
                isDark
                  ? 'bg-zing-bg-panel text-zing-text-secondary hover:bg-zing-bg-tertiary hover:text-zing-primary border-white/10'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
              title="Bài kế tiếp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => void togglePlay()}
              className={`h-11 w-11 rounded-lg flex items-center justify-center transition font-bold ${
                isDark
                  ? 'bg-gradient-to-r from-zing-primary to-zing-secondary text-white shadow-lg'
                  : 'bg-gradient-to-r from-zing-primary to-zing-secondary text-white shadow-lg'
              }`}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Time Display */}
            <span className={`text-xs tabular-nums w-12 text-right font-medium ${
              isDark ? 'text-zing-text-secondary' : 'text-slate-500'
            }`}>
              {formatTime(currentTime)}
            </span>

            {/* Progress Slider */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={sliderValue}
              onChange={(e) => seek(Number(e.target.value))}
              className="seek h-1 flex-1 cursor-pointer"
            />

            {/* Duration Display */}
            <span className={`text-xs tabular-nums w-12 font-medium ${
              isDark ? 'text-zing-text-secondary' : 'text-slate-500'
            }`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
