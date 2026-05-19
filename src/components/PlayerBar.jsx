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
      <div className={`fixed bottom-16 left-0 right-0 z-30 flex h-14 items-center justify-center border-t text-sm transition-colors duration-300 sm:bottom-20 sm:h-16 lg:bottom-0 lg:left-72 lg:h-28 ${isDark
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
    <div className={`fixed bottom-16 left-0 right-0 z-30 border-t backdrop-blur-xl transition-colors duration-300 sm:bottom-20 lg:bottom-0 lg:left-72 ${isDark
      ? 'bg-zing-bg/95 border-white/10 shadow-[0_-16px_64px_rgba(0,0,0,0.4)]'
      : 'bg-white/95 border-slate-200 shadow-[0_-16px_64px_rgba(15,23,42,0.08)]'
      }`}>
      <div className="mx-auto grid h-full max-w-[1600px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 lg:flex lg:gap-4 lg:px-6 lg:py-4">
        {/* Album Cover */}
        <img
          src={coverUrlForSong(current.id)}
          alt={current.title}
          className={`h-11 w-11 shrink-0 rounded-lg object-cover shadow-lg sm:h-12 sm:w-12 lg:h-16 lg:w-16 ${isDark ? 'bg-zing-bg-secondary' : 'bg-slate-200'
            }`}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        {/* Song Info */}
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <span className="truncate text-sm font-bold text-zing-text sm:text-base">{current.title}</span>
            <FavoriteHeart songId={current.id} size="sm" className="hidden !p-1 sm:inline-flex" />
          </div>
          <p className={`mt-0.5 truncate text-xs sm:mt-1 sm:text-sm ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
            {current.artist}
          </p>
        </div>

        <div className='w-full flex flex-col gap-4'>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:mt-3 lg:justify-end">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => void playPreviousTrack()}
              className={` flex h-10 w-10 items-center justify-center rounded-full font-bold transition sm:h-11 sm:w-11 lg:rounded-lg ${isDark
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
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition sm:h-11 sm:w-11 lg:rounded-lg ${shuffle
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


{/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => void togglePlay()}
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition sm:h-11 sm:w-11 lg:rounded-lg ${isDark
                ? 'bg-gradient-to-r from-zing-primary to-zing-secondary text-white shadow-lg'
                : 'bg-gradient-to-r  from-zing-primary to-zing-secondary text-white shadow-lg'
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


            {/* Random Button */}
            <button
              type="button"
              onClick={() => void playRandomTrack()}
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition sm:h-11 sm:w-11 lg:rounded-lg ${isDark
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
              className={`flex h-10 w-10 items-center justify-center  rounded-full  border transition disabled:pointer-events-none disabled:opacity-30 sm:flex sm:h-11 sm:w-11 ${isDark
                ? 'bg-zing-bg-panel text-zing-text-secondary hover:bg-zing-bg-tertiary hover:text-zing-primary border-white/10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                }`}
              title="Bài kế tiếp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            

            {/* Time Display */}

          </div>
          {/* Progress Slider */}
          <div className=' w-full flex items-center justify-center gap-3'>

            <span className={` w-7 text-left text-[11px] font-medium tabular-nums lg:inline-block lg:w-12 lg:text-xs ${isDark ? 'text-zing-text-secondary' : 'text-slate-500'
              }`}>
              {formatTime(currentTime)}
            </span>
            <div className='w-full'>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={sliderValue}
                onChange={(e) => seek(Number(e.target.value))}
                className="seek col-span-3 h-1 w-full cursor-pointer lg:flex-1"
              />
            </div>

            {/* Duration Display */}
            <span className={` w-7 text-[11px] text-right font-medium tabular-nums lg:inline-block lg:w-12 lg:text-xs ${isDark ? 'text-zing-text-secondary' : 'text-slate-500'
              }`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Player Controls */}

      </div>
    </div>
  );
}
