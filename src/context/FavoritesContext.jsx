import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api('/favorites');
      const ids = (data.songs || []).map((s) => String(s.id));
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.id]);

  const isFavorite = useCallback(
    (songId) => favoriteIds.includes(String(songId)),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (songId) => {
      if (!isAuthenticated || songId == null) return;
      const id = String(songId);
      const was = favoriteIds.includes(id);
      try {
        if (was) {
          await api(`/favorites/${encodeURIComponent(id)}`, { method: 'DELETE' });
          setFavoriteIds((prev) => prev.filter((x) => x !== id));
        } else {
          await api('/favorites', { method: 'POST', body: JSON.stringify({ songId: id }) });
          setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        }
      } catch {
        await refresh();
      }
    },
    [isAuthenticated, favoriteIds, refresh]
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      loading,
      isFavorite,
      toggleFavorite,
      refresh,
    }),
    [favoriteIds, loading, isFavorite, toggleFavorite, refresh]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
