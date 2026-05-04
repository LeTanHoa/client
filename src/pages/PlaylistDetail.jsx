import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, coverUrlForSong } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import { FavoriteHeart } from '../components/FavoriteHeart.jsx';

export function PlaylistDetail() {
  const { id } = useParams();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api(`/playlist/${id}`);
        if (!cancelled) setPlaylist(data.playlist);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="text-spotify-subtle">Loading…</p>;
  if (error || !playlist) return <p className="text-red-400">{error || 'Not found'}</p>;

  const entries = [...playlist.songs].sort((a, b) => a.orderIndex - b.orderIndex);
  const queueTracks = entries
    .map((e) => e.song)
    .filter(Boolean)
    .map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      duration: s.duration,
      ...(s.youtubeId ? { youtubeId: s.youtubeId } : {}),
    }));

  return (
    <div>
      <Link to="/playlists" className="text-sm text-spotify-subtle hover:text-white mb-4 inline-block">
        ← Playlists
      </Link>
      <h1 className="text-3xl font-bold mb-6">{playlist.name}</h1>
      <ul className="space-y-2">
        {entries.map((entry) => {
          const s = entry.song;
          if (!s) return null;
          return (
            <li
              key={`${entry.songId}-${entry.orderIndex}`}
              className="flex items-center gap-4 bg-spotify-panel rounded-lg p-3 border border-white/5 hover:border-white/10 transition"
            >
              <img
                src={coverUrlForSong(s.id)}
                alt=""
                className="w-12 h-12 rounded object-cover bg-spotify-hover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-sm text-spotify-subtle truncate">{s.artist}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <FavoriteHeart songId={s.id} size="sm" />
                <button
                  type="button"
                  onClick={() =>
                    playTrack(
                      {
                        id: s.id,
                        title: s.title,
                        artist: s.artist,
                        duration: s.duration,
                        ...(s.youtubeId ? { youtubeId: s.youtubeId } : {}),
                      },
                      { queue: queueTracks }
                    )
                  }
                  className="text-spotify-green text-sm font-medium hover:underline"
                >
                  Play
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {entries.length === 0 && (
        <p className="text-spotify-subtle mt-4">This playlist is empty. Add songs from Home.</p>
      )}
    </div>
  );
}
