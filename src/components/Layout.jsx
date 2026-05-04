import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PlayerBar } from './PlayerBar.jsx';

export function Layout() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col pb-28">
      <header className="border-b border-white/10 bg-spotify-panel/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-spotify-green tracking-tight text-lg">
            Spotify Mini
          </Link>
          <nav className="flex items-center gap-6 text-sm text-spotify-subtle">
            {isAuthenticated ? (
              <>
                <Link className="hover:text-white transition" to="/">
                  Home
                </Link>
                <Link className="hover:text-white transition" to="/playlists">
                  Playlists
                </Link>
                <Link className="hover:text-white transition" to="/favorites">
                  Yêu thích
                </Link>
                {user?.role === 'admin' && (
                  <Link className="hover:text-white transition" to="/admin">
                    Admin
                  </Link>
                )}
                <span className="text-white/90">{user?.username}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-white/70 hover:text-white transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link className="hover:text-white transition" to="/login">
                  Log in
                </Link>
                <Link
                  className="rounded-full bg-white text-black px-4 py-1.5 font-medium hover:scale-[1.02] transition"
                  to="/register"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  );
}
