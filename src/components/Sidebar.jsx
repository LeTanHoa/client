import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const libraryItems = [
  { label: 'Việt Nam', key: 'vn' },
  { label: 'US-UK', key: 'us' },
  { label: 'K-Pop', key: 'kp' },
  { label: 'Nhạc trẻ', key: 'young' },
];

export function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Khám phá', icon: '🔍' },
    { path: '/charts', label: 'Bảng xếp hạng', icon: '📊' },
    ...(isAuthenticated
      ? [
          { path: '/playlists', label: 'Playlist', icon: '🎵' },
          { path: '/favorites', label: 'Yêu thích', icon: '❤️' },
        ]
      : []),
  ];

  const adminItems =
    user?.role === 'admin'
      ? [{ path: '/admin', label: 'Quản lý', icon: '⚙️' }]
      : [];

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto border-r backdrop-blur-sm transition-colors duration-300 lg:block ${
          isDark ? 'bg-zing-bg/95 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        {/* Logo Section */}
        <div className={`sticky top-0 z-10 px-7 py-8 border-b backdrop-blur-sm ${isDark ? 'bg-zing-bg/95 border-white/10' : 'bg-white border-slate-200'}`}>
          <Link to="/" className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zing-primary to-zing-secondary shadow-lg">
              <span className="text-lg font-black text-white">Z</span>
            </div>
            <div>
              <div className="text-xl font-black bg-gradient-to-r from-zing-primary to-zing-accent bg-clip-text text-transparent">
                ZingMP3
              </div>
              <p className={`text-xs ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
                Nhạc hay mỗi ngày
              </p>
            </div>
          </Link>
        </div>

      {/* Main Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? isDark
                    ? 'bg-gradient-to-r from-zing-primary/20 to-zing-secondary/20 text-zing-primary border border-zing-primary/30'
                    : 'bg-zing-primary/10 text-zing-primary border border-zing-primary/20'
                  : isDark
                    ? 'text-zing-text-secondary hover:text-zing-text hover:bg-white/5 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          {adminItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? isDark
                    ? 'bg-gradient-to-r from-zing-pink/20 to-zing-orange/20 text-zing-pink'
                    : 'bg-zing-pink/10 text-zing-pink'
                  : isDark
                    ? 'text-zing-text-secondary hover:text-zing-text hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className={`mx-4 my-4 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

      {/* Categories Section */}
      <div className="px-4 py-4">
        <div className={`text-[10px] uppercase tracking-widest font-semibold mb-3 ${isDark ? 'text-zing-text-tertiary' : 'text-slate-400'}`}>
          🎵 Danh mục
        </div>
        <div className="grid gap-2">
          {libraryItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 border ${
                isDark
                  ? 'bg-zing-bg-panel border-white/10 text-zing-text-secondary hover:border-zing-primary/50 hover:text-zing-text hover:bg-zing-bg-tertiary'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Section */}
      {isAuthenticated && (
        <div
          className={`sticky bottom-0 left-0 right-0 p-4 border-t backdrop-blur-sm ${
            isDark ? 'bg-gradient-to-t from-zing-bg-secondary to-transparent border-white/10' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className={`rounded-lg p-3 ${isDark ? 'bg-zing-bg-panel border border-white/10' : 'bg-white border border-slate-200'}`}>
            <div className="text-sm font-semibold">
              👤 {user?.username}
            </div>
            <div className={`mt-1 text-xs ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
              {user?.role === 'admin' ? '🔑 Quản trị viên' : '👥 Người dùng'}
            </div>
          </div>
        </div>
      )}
      </aside>

      <nav
        className={`fixed inset-x-0 bottom-0 z-40 h-16 border-t px-2 py-1 backdrop-blur-xl lg:hidden ${
          isDark ? 'bg-zing-bg/95 border-white/10' : 'bg-white/95 border-slate-200'
        }`}
      >
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.min(navItems.length, 4)}, minmax(0, 1fr))` }}
        >
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-center text-[10px] font-semibold transition-all sm:text-[11px] ${
                isActive(item.path)
                  ? isDark
                    ? 'bg-zing-primary/20 text-zing-primary'
                    : 'bg-zing-primary/10 text-zing-primary'
                  : isDark
                    ? 'text-zing-text-secondary'
                    : 'text-slate-600'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
