import { useTheme } from '../context/ThemeContext.jsx';
import { coverUrlForSong } from '../api.js';
import { FavoriteHeart } from './FavoriteHeart.jsx';

export function SongCard({ song, onPlay, onAdd, badge }) {
  const { isDark } = useTheme();

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isDark
          ? 'bg-zing-bg-panel border-white/10 hover:border-zing-primary/50 hover:bg-zing-bg-tertiary hover:shadow-lg hover:shadow-zing-primary/20'
          : 'bg-white border-slate-200 hover:border-zing-primary hover:shadow-lg'
      }`}
    >
      {badge ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-zing-pink to-zing-orange px-3 py-1 text-[10px] font-bold text-white shadow-lg">
          {badge}
        </span>
      ) : null}

      {/* Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zing-bg-secondary to-zing-bg-tertiary">
        <img
          src={coverUrlForSong(song.id)}
          alt={song.title}
          className="h-[180px] w-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.style.opacity = 0;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Favorite Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <FavoriteHeart songId={song.id} className="bg-black/50 text-white backdrop-blur-sm rounded-full" />
        </div>

        {/* Play Button */}
        <button
          type="button"
          onClick={() => onPlay(song)}
          className="absolute right-2.5 bottom-2.5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-zing-primary to-zing-accent text-white shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          aria-label="Phát"
        >
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="space-y-2 p-4">
        <div className="truncate text-sm font-semibold leading-tight text-zing-text">
          {song.title}
        </div>
        <p className={`truncate text-xs ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
          {song.artist}
        </p>

        {song.genre && (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-[9px] uppercase tracking-wide font-semibold ${
              isDark
                ? 'bg-white/10 text-zing-success'
                : 'bg-zing-primary/10 text-zing-primary'
            }`}
          >
            #{song.genre}
          </span>
        )}

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPlay(song)}
            className="rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-3 py-1.5 text-[11px] font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110"
          >
            ▶ Phát
          </button>

          {onAdd ? (
            <button
              type="button"
              onClick={() => onAdd(song)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 border ${
                isDark
                  ? 'border-white/20 text-zing-text-secondary hover:border-zing-primary/50 hover:text-zing-primary hover:bg-white/5'
                  : 'border-slate-200 text-slate-600 hover:border-zing-primary hover:text-zing-primary hover:bg-zing-primary/5'
              }`}
            >
              + Playlist
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
