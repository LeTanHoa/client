import { useTheme } from '../context/ThemeContext.jsx';
import { coverUrlForSong } from '../api.js';
import { FavoriteHeart } from './FavoriteHeart.jsx';

export function SongCard({ song, onPlay, onAdd, badge, mobileTile = false }) {
  const { isDark } = useTheme();

  return (
    <article
      className={`group relative flex h-[110px] overflow-hidden rounded-2xl border transition-all duration-300 ${isDark
          ? 'border-white/5 bg-[#170B2C] hover:bg-[#21103d]'
          : 'border-slate-200 bg-white hover:shadow-xl'
        }`}
    >
      {/* Cover */}
      <div className="relative h-full w-[110px] shrink-0 overflow-hidden">
        <img
          src={coverUrlForSong(song.id)}
          alt={song.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.style.opacity = 0;
          }}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/10 to-transparent" />

        {/* Badge */}
        {badge ? (
          <span className="absolute left-2 top-2 z-20 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-2 py-0.5 text-[9px] font-bold text-white shadow-md">
            {badge}
          </span>
        ) : null}

        {/* Play Overlay */}
        <button
          type="button"
          onClick={() => onPlay(song)}
          className="absolute bottom-2 right-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Phát"
        >
          <svg
            className="ml-0.5 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        {/* Title + Artist */}
        <div className="min-w-0">
          <h3
            className={`line-clamp-2 text-[15px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            {song.title}
          </h3>

          <p
            className={`mt-1 truncate text-sm ${isDark ? 'text-white/60' : 'text-slate-500'
              }`}
          >
            {song.artist}
          </p>
        </div>

        {/* Bottom */}
        <div className=" flex items-center">
          {/* Genre */}
          <div className="flex items-center gap-2">
            {song.genre && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isDark
                    ? 'bg-white/10 text-pink-300'
                    : 'bg-pink-100 text-pink-600'
                  }`}
              >
                #{song.genre}
              </span>
            )}

            <span
              className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'
                }`}
            >
              Hôm qua
            </span>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <FavoriteHeart
              songId={song.id}
              className="rounded-full bg-black/30 p-1.5 text-white backdrop-blur-md transition hover:bg-white/10"
            />

            {onAdd ? (
              <button
                type="button"
                onClick={() => onAdd(song)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/10"
              >
                +
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
