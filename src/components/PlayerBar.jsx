import { usePlayer } from '../context/PlayerContext.jsx';
import { coverUrlForSong } from '../api.js';
import { FavoriteHeart } from './FavoriteHeart.jsx';

export function PlayerBar() {
  const {
    current,
    playing,
    currentTime,
    duration,
    shuffle,
    setShuffle,
    togglePlay,
    playNextTrack,
    playRandomTrack,
    seek,
    formatTime,
    queue,
    queueIndex,
  } = usePlayer();

  if (!current) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-spotify-panel border-t border-white/10 flex items-center justify-center text-spotify-subtle text-sm z-30">
        Select a song to start listening
      </div>
    );
  }

  const progress = duration > 0 ? currentTime / duration : 0;
  const sliderValue = Number.isFinite(progress) ? progress : 0;
  const canSkip =
    shuffle ? queue.length > 1 : queue.length > 0 && queueIndex < queue.length - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-spotify-panel to-spotify-panel border-t border-white/10 z-30 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <img
          src={coverUrlForSong(current.id)}
          alt=""
          className="w-14 h-14 rounded object-cover bg-spotify-hover shrink-0"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <FavoriteHeart songId={current.id} size="sm" className="!p-1" />
            <span className="font-medium truncate">{current.title}</span>
          </div>
          <div className="text-xs text-spotify-subtle truncate">{current.artist}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShuffle((s) => !s)}
              className={`w-8 h-8 rounded flex items-center justify-center shrink-0 transition ${
                shuffle
                  ? 'bg-spotify-green text-black'
                  : 'bg-spotify-hover text-spotify-subtle hover:text-white'
              }`}
              title={shuffle ? 'Tắt shuffle khi hết bài' : 'Bật shuffle: hết bài sẽ chọn ngẫu nhiên trong danh sách đang phát'}
              aria-pressed={shuffle}
              aria-label="Shuffle khi hết bài"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => void playRandomTrack()}
              className="w-8 h-8 rounded bg-spotify-hover text-spotify-subtle hover:text-white flex items-center justify-center shrink-0 transition"
              title="Phát bài ngẫu nhiên (trong danh sách hoặc toàn thư viện)"
              aria-label="Phát bài ngẫu nhiên"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => void playNextTrack()}
              disabled={!canSkip}
              className="w-8 h-8 rounded bg-spotify-hover text-spotify-subtle hover:text-white flex items-center justify-center shrink-0 transition disabled:opacity-30 disabled:pointer-events-none"
              title="Bài tiếp theo"
              aria-label="Bài tiếp theo"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shrink-0"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <span className="text-xs text-spotify-subtle tabular-nums w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={sliderValue}
              onChange={(e) => seek(Number(e.target.value))}
              className="seek flex-1 min-w-[4rem] h-1 accent-spotify-green"
            />
            <span className="text-xs text-spotify-subtle tabular-nums w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
