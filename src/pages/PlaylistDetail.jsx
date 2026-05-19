import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { api, coverUrlForSong } from '../api.js';

import { usePlayer } from '../context/PlayerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { SongCard } from '../components/SongCard.jsx';

import { FavoriteHeart } from '../components/FavoriteHeart.jsx';

export function PlaylistDetail() {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  async function removePlaylist() {
    if (!window.confirm('Bạn chắc chắn muốn xoá playlist này?')) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await api(`/playlist/${id}`, { method: 'DELETE' });
      navigate('/playlists');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Đang tải...</p>;
  }

  if (error || !playlist) {
    return <p className="text-red-400">{error || 'Playlist không tìm thấy'}</p>;
  }

  return (
    <div className="space-y-8">
      <div className={`rounded-2xl border p-4 sm:p-6 ${isDark ? 'bg-[#150f28] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-spotify-green">Playlist</p>
            <h1 className="mt-3 break-words text-3xl font-black sm:text-4xl">{playlist.name}</h1>
            <p className={`mt-3 text-sm ${isDark ? 'text-spotify-subtle' : 'text-slate-600'}`}>
              {entries.length} bài hát trong danh sách
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/playlists"
              className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              ← Về playlist
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={removePlaylist}
              className="inline-flex items-center justify-center rounded-full border border-red-500/50 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              Xoá playlist
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-gradient-to-br from-spotify-green/10 to-transparent p-4 text-slate-900 sm:p-5">
        <p className="text-sm font-semibold text-spotify-green">Trong playlist này</p>
        <p className="mt-2 text-sm text-slate-700">Chọn bài để phát ngay, hoặc tiếp tục duyệt thêm track khác.</p>
      </div>

      <div className="grid grid-cols-5 gap-4  lg:grid-cols-5">
        {entries.map((entry) => {
          const song = entry.song;
          if (!song) return null;

          return (
            <SongCard
              key={`${entry.songId}-${entry.orderIndex}`}
              song={song}
              onPlay={(songToPlay) =>
                playTrack(
                  {
                    id: songToPlay.id,
                    title: songToPlay.title,
                    artist: songToPlay.artist,
                    duration: songToPlay.duration,
                    ...(songToPlay.youtubeId ? { youtubeId: songToPlay.youtubeId } : {}),
                  },
                  { queue: queueTracks }
                )
              }
            />
          );
        })}
      </div>

      {entries.length === 0 && (
        <p className={isDark ? 'text-spotify-subtle' : 'text-slate-600'}>Danh sách phát trống.</p>
      )}
    </div>
  );
}
