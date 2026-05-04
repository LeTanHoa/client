import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await api('/playlist');
    setPlaylists(data.playlists || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await api('/playlist', { method: 'POST', body: JSON.stringify({ name: name.trim() }) });
      setName('');
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-spotify-subtle">Loading playlists…</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your playlists</h1>
      <form onSubmit={create} className="flex flex-wrap gap-2 mb-8">
        <input
          className="flex-1 min-w-[200px] bg-spotify-panel border border-white/20 rounded-full px-4 py-2 outline-none focus:border-spotify-green"
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-full bg-spotify-green text-black font-medium px-6 py-2 hover:brightness-110"
        >
          Create
        </button>
      </form>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <ul className="space-y-2">
        {playlists.map((p) => (
          <li key={p.id}>
            <Link
              to={`/playlists/${p.id}`}
              className="block bg-spotify-panel hover:bg-spotify-hover rounded-lg px-4 py-3 border border-white/5 transition"
            >
              <span className="font-medium">{p.name}</span>
              <span className="text-spotify-subtle text-sm ml-2">{p.songCount} songs</span>
            </Link>
          </li>
        ))}
        {playlists.length === 0 && (
          <p className="text-spotify-subtle">No playlists yet. Create one above.</p>
        )}
      </ul>
    </div>
  );
}
