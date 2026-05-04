import { useFavorites } from '../context/FavoritesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * @param {{ songId: string | number; size?: 'sm' | 'md' | 'lg'; className?: string }} props
 */
export function FavoriteHeart({ songId, size = 'md', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const active = isFavorite(songId);
  const dim = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }
        void toggleFavorite(songId);
      }}
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition shrink-0 ${
        active
          ? 'text-red-500 hover:text-red-400'
          : 'text-spotify-subtle hover:text-red-400/90'
      } ${className}`}
      title={active ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
      aria-label={active ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
      aria-pressed={active}
    >
      <svg className={dim} viewBox="0 0 24 24" aria-hidden>
        {active ? (
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        ) : (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        )}
      </svg>
    </button>
  );
}
