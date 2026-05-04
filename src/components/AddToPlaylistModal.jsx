import { useEffect, useState } from 'react';
import { api } from '../api.js';

export function AddToPlaylistModal({ songId, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/playlist');
        if (!cancelled) setPlaylists(data.playlists || []);
      } catch (e) {
        if (!cancelled) setMessage(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function addTo(playlistId) {
    setBusy(true);
    setMessage(null);
    try {
      await api('/playlist/add-song', {
        method: 'POST',
        body: JSON.stringify({ playlistId, songId }),
      });
      setMessage('Added to playlist.');
      setTimeout(onClose, 600);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createAndAdd() {
    if (!name.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const { playlist } = await api('/playlist', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      });
      await api('/playlist/add-song', {
        method: 'POST',
        body: JSON.stringify({ playlistId: playlist.id, songId }),
      });
      setMessage('Playlist created and song added.');
      setTimeout(onClose, 600);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-panel rounded-xl max-w-md w-full p-6 border border-white/10 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Add to playlist</h2>
        {loading ? (
          <p className="text-spotify-subtle text-sm">Loading playlists…</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {playlists.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => addTo(p.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-spotify-hover transition text-sm"
                >
                  {p.name}{' '}
                  <span className="text-spotify-subtle">({p.songCount} tracks)</span>
                </button>
              </li>
            ))}
            {playlists.length === 0 && (
              <p className="text-spotify-subtle text-sm">No playlists yet — create one below.</p>
            )}
          </ul>
        )}
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 bg-spotify-black border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-spotify-green"
            placeholder="New playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={createAndAdd}
            className="px-4 py-2 rounded-full bg-spotify-green text-black font-medium text-sm disabled:opacity-40"
          >
            Create & add
          </button>
        </div>
        {message && <p className="text-sm text-spotify-subtle mb-3">{message}</p>}
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-spotify-subtle hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
