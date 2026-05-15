import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { api, coverUrlForSong } from '../api.js';

import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

import { FavoriteHeart } from '../components/FavoriteHeart.jsx';

export function PlaylistDetail() {
  const { isDark } = useTheme();
  const { id } = useParams();
  const { playTrack } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      try {
        setLoading(true);
        setError(null);

        const data = await api(`/playlist/${id}`);
        if (!cancelled) {
          setPlaylist(data.playlist || null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlaylist();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const entries = useMemo(() => {
    return [...(playlist?.songs || [])].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [playlist]);

  const queueTracks = useMemo(
    () =>
      entries
        .map((entry) => entry.song)
        .filter(Boolean)
        .map((song) => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          duration: song.duration,
          ...(song.youtubeId ? { youtubeId: song.youtubeId } : {}),
        })),
    [entries]
  );

  if (loading) {
    return <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Đang tải...</p>;
  }

  if (error || !playlist) {
    return <p className="text-red-400">{error || 'Playlist không tìm thấy'}</p>;
  }

  return (
    <div className="space-y-8">
      <div className={`rounded-[2rem] border p-6 ${isDark ? 'bg-[#150f28] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-spotify-green">Playlist</p>
            <h1 className="mt-3 text-4xl font-black">{playlist.name}</h1>
            <p className={`mt-3 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
              {entries.length} bài hát trong danh sách
            </p>
          </div>
          <Link
            to="/playlists"
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
              isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            ← Về playlist
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border p-5 bg-gradient-to-br from-spotify-green/10 to-transparent text-slate-900">
        <p className="text-sm font-semibold text-spotify-green">Trong playlist này</p>
        <p className="mt-2 text-sm text-slate-700">Chọn bài để phát ngay, hoặc tiếp tục duyệt thêm track khác.</p>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          const song = entry.song;
          if (!song) return null;

          return (
            <div
              key={`${entry.songId}-${entry.orderIndex}`}
              className={`flex flex-col gap-3 rounded-[1.75rem] border p-4 transition ${
                isDark ? 'bg-[#110c1b] border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'
              } sm:flex-row sm:items-center`}
            >
              <img
                src={coverUrlForSong(song.id)}
                alt={song.title}
                className={`w-full rounded-[1.5rem] object-cover sm:w-20 sm:h-20 ${isDark ? 'bg-[#1c1732]' : 'bg-slate-200'}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold truncate">{song.title}</div>
                <p className={`mt-1 text-sm truncate ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
                  {song.artist}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <FavoriteHeart songId={song.id} size="sm" />
                <button
                  type="button"
                  onClick={() =>
                    playTrack(
                      {
                        id: song.id,
                        title: song.title,
                        artist: song.artist,
                        duration: song.duration,
                        ...(song.youtubeId ? { youtubeId: song.youtubeId } : {}),
                      },
                      {
                        queue: queueTracks,
                      }
                    )
                  }
                  className="rounded-full bg-spotify-green px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Phát
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Danh sách phát trống.</p>
      )}
    </div>
  );
}
