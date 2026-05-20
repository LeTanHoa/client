import { useTheme } from '../context/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';

export function SingerCard({ artist, songCount = 0, onClick, imageUrl }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(artist);
    } else {
      navigate(`/singers/${encodeURIComponent(artist)}`);
    }
  };

  // Generate AI image URL for artist
  const getArtistImage = () => {
    if (imageUrl) return imageUrl;
    
    // Use Unsplash API to get random artist-like images
    // Query with artist name keywords
    const keywords = artist.split(' ').join('%20');
    return `https://source.unsplash.com/400x400/?artist,${keywords},music&q=${Date.now()}`;
  };

  // Generate consistent color based on artist name (fallback)
  const colors = [
    'from-zing-primary to-zing-secondary',
    'from-zing-pink to-zing-orange',
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
  ];
  const colorIndex = artist.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <article
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer flex flex-col h-full ${
        isDark
          ? 'bg-zing-bg-panel border-white/10 hover:border-zing-primary/50 hover:bg-zing-bg-tertiary hover:shadow-lg hover:shadow-zing-primary/20'
          : 'bg-white border-slate-200 hover:border-zing-primary hover:shadow-lg hover:shadow-zing-primary/10'
      }`}
    >
      {/* Avatar Section */}
      <div className={`relative aspect-square w-full overflow-hidden bg-gradient-to-br ${bgColor}`}>
        {/* Artist Image */}
        <img
          src={getArtistImage()}
          alt={artist}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            // Fallback to gradient if image fails to load
            e.target.style.display = 'none';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Hover Play Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="absolute bottom-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-zing-primary to-zing-accent text-white shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="View songs"
        >
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between space-y-2 p-3 sm:p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug">{artist}</h3>
          <p
            className={`mt-1 text-xs ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}
          >
            {songCount} bài hát
          </p>
        </div>

        {/* View Button */}
        <button
          type="button"
          onClick={handleClick}
          className="rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-3 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-95"
        >
          Xem tất cả
        </button>
      </div>
    </article>
  );
}
