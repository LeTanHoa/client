import { useTheme } from '../context/ThemeContext.jsx';
import { coverUrlForSong } from '../api.js';
import { FavoriteHeart } from './FavoriteHeart.jsx';

export function SongCard({ song, onPlay, onAdd, badge, mobileTile = false }) {
  const { isDark } = useTheme();

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${mobileTile ? 'block' : 'flex sm:block'} ${
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
      <div className={`relative shrink-0 overflow-hidden bg-gradient-to-br from-zing-bg-secondary to-zing-bg-tertiary ${mobileTile ? 'aspect-square w-full' : 'w-24 sm:w-full'}`}>
        <img
          src={coverUrlForSong(song.id)}
          alt={song.title}
          className={`w-full object-cover transition-transform duration-300 group-hover:scale-110 ${mobileTile ? 'h-full' : 'h-full min-h-28 sm:h-[180px] sm:min-h-0'}`}
          onError={(e) => {
            e.currentTarget.style.opacity = 0;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/30 to-transparent sm:h-24" />

        {/* Favorite Button */}
        <div className="absolute top-2 right-2 z-10 sm:top-2.5 sm:right-2.5">
          <FavoriteHeart songId={song.id} className="bg-black/50 text-white backdrop-blur-sm rounded-full" />
        </div>

        {/* Play Button */}
        <button
          type="button"
          onClick={() => onPlay(song)}
          className="absolute bottom-2 right-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-zing-primary to-zing-accent text-white shadow-lg transition-all duration-200 sm:bottom-2.5 sm:right-2.5 sm:h-11 sm:w-11 sm:opacity-0 sm:group-hover:opacity-100 sm:hover:scale-110"
          aria-label="Phát"
        >
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className={`min-w-0 ${mobileTile ? 'space-y-1.5 p-2.5 sm:space-y-2 sm:p-4' : 'flex flex-1 flex-col justify-between gap-2 p-3 sm:block sm:space-y-2 sm:p-4'}`}>
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
        <div className={`mt-1 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2 ${mobileTile ? 'justify-between' : ''}`}>
          <button
            type="button"
            onClick={() => onPlay(song)}
            className="rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-2.5 py-2 text-[10px] font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 sm:px-3 sm:py-1.5 sm:text-[11px]"
          >
            ▶ Phát
          </button>

          {onAdd ? (
            <button
              type="button"
              onClick={() => onAdd(song)}
              className={`rounded-lg px-2.5 py-2 text-[10px] font-medium transition-all duration-200 border sm:px-3 sm:py-1.5 sm:text-[11px] ${
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
