import { useTheme } from '../context/ThemeContext.jsx';
import { coverUrlForSong } from '../api.js';
import { FavoriteHeart } from './FavoriteHeart.jsx';

export function SongDetailRow({ song, onPlay, onAdd, badge }) {
  const { isDark } = useTheme();

  return (
    <article
      className={`group flex items-center gap-4 overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
        isDark
          ? 'bg-zing-bg-tertiary/50 border-white/10 hover:bg-zing-primary/10 hover:border-zing-primary/30'
          : 'bg-slate-50 border-slate-200 hover:bg-zing-primary/5 hover:border-zing-primary'
      }`}
    >
      {/* Badge */}
      {badge && (
        <span className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs ${
          isDark ? 'bg-zing-primary/20 text-zing-primary' : 'bg-zing-primary/20 text-zing-primary'
        }`}>
          {badge}
        </span>
      )}

      {/* Cover Image */}
      <img
        src={coverUrlForSong(song.id)}
        alt={song.title}
        className="h-16 w-16 shrink-0 rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.style.opacity = 0;
        }}
      />

      {/* Song Info */}
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-1 font-bold text-sm leading-snug">{song.title}</h4>
        <p className={`mt-1 truncate text-xs ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
          {song.artist}
        </p>
        {song.genre && (
          <span className={`inline-flex mt-2 rounded px-2 py-1 text-[9px] uppercase tracking-wide font-semibold ${
            isDark ? 'bg-white/10 text-zing-success' : 'bg-zing-primary/10 text-zing-primary'
          }`}>
            #{song.genre}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <FavoriteHeart songId={song.id} />
        
        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(song)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            +
          </button>
        )}

        {onPlay && (
          <button
            type="button"
            onClick={() => onPlay(song)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-zing-primary to-zing-accent text-white shadow-lg transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}
