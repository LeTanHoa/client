import { useTheme } from '../context/ThemeContext.jsx';
import { SongCard } from './SongCard.jsx';
import { SingerCard } from './SingerCard.jsx';

export function ContentSection({
  title,
  subtitle,
  items = [],
  loading = false,
  error = null,
  itemType = 'song', // 'song' or 'singer'
  onItemPlay,
  onItemAdd,
  onSingerClick,
  gridCols = 'grid-cols-1 sm:gap-3 lg:grid-cols-3 xl:grid-cols-3',
  emptyMessage = 'Chưa có nội dung',
}) {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div
        className={`rounded-2xl border p-4 sm:p-6 md:p-8 ${
          isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
          {subtitle && <p className={`mt-2 text-sm ${isDark ? 'text-zing-text-tertiary' : 'text-slate-600'}`}>{subtitle}</p>}
        </div>

        <div className={`grid gap-3 ${gridCols}`}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-52 sm:h-64 rounded-xl animate-pulse ${
                isDark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl border p-4 sm:p-6 md:p-8 ${
          isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
        <p className={`py-8 text-center ${isDark ? 'text-zing-pink' : 'text-red-500'}`}>
          ⚠️ {error}
        </p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-4 sm:p-6 md:p-8 ${
          isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
        <p className={`py-8 text-center ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
          📭 {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-6 md:p-8 ${
        isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'
      }`}
    >
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
        {subtitle && (
          <p className={`mt-2 text-sm ${isDark ? 'text-zing-text-tertiary' : 'text-slate-600'}`}>
            {subtitle}
          </p>
        )}
      </div>

      <div className={`grid gap-3 ${gridCols}`}>
        {items.map((item, idx) => {
          if (itemType === 'singer') {
            return (
              <SingerCard
                key={idx}
                artist={item.artist || item.name || item}
                songCount={item.songCount || item.count || 0}
                onClick={() => onSingerClick?.(item)}
              />
            );
          }

          return (
            <SongCard
              key={item.id}
              song={item}
              mobileTile
              onPlay={() => onItemPlay?.(item)}
              onAdd={() => onItemAdd?.(item)}
            />
          );
        })}
      </div>
    </div>
  );
}
