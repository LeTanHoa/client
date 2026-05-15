import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useEffect, useState } from 'react';

export function Header({ onSearch }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const navItems = [
    { to: '/', label: '🔍 Khám phá' },
    { to: '/charts', label: '📊 Bảng xếp hạng' },
    { to: '/favorites', label: '❤️ Yêu thích' },
    { to: '/playlists', label: '🎵 Playlist' },
  ];

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <header
      className={`fixed top-0 left-72 right-0 h-20 transition-colors duration-300 z-30 backdrop-blur-xl border-b ${
        isDark ? 'bg-zing-bg/90 border-white/5' : 'bg-white/95 border-slate-200'
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-6 px-6">
        {/* Navigation Items - Hidden on mobile */}
        <div className="hidden xl:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 border ${
                isActive(item.to)
                  ? isDark
                    ? 'bg-gradient-to-r from-zing-primary/20 to-zing-secondary/20 text-zing-primary border-zing-primary/30'
                    : 'bg-zing-primary/10 text-zing-primary border-zing-primary/20'
                  : isDark
                    ? 'text-zing-text-secondary hover:text-zing-text hover:bg-white/5 border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zing-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bài hát, nghệ sĩ, playlist..."
              value={searchValue}
              onChange={handleSearch}
              className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-full border transition-all duration-200 outline-none ${
                isDark
                  ? 'bg-zing-bg-panel border-white/10 text-zing-text placeholder-zing-text-tertiary focus:border-zing-primary/50 focus:bg-zing-bg-tertiary'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500 focus:border-zing-primary focus:ring-2 focus:ring-zing-primary/20'
              }`}
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 border ${
              isDark
                ? 'bg-zing-bg-panel border-white/10 text-zing-success hover:bg-white/10 hover:border-zing-success/30'
                : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'
            }`}
            title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isDark
                    ? 'bg-zing-bg-panel border-white/10 text-zing-text hover:bg-zing-bg-tertiary hover:border-white/20'
                    : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>👤</span>
                <span className="hidden sm:inline">{user?.username}</span>
              </button>

              {showMenu && (
                <div
                  className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border shadow-2xl backdrop-blur-sm ${
                    isDark
                      ? 'bg-zing-bg-panel/95 border-white/10'
                      : 'bg-white/95 border-slate-200'
                  }`}
                >
                  <div className={`space-y-1 p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-zing-text' : 'text-slate-900'}`}>
                      👤 {user?.username}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-zing-text-tertiary' : 'text-slate-500'}`}>
                      {user?.role === 'admin' ? '🔑 Quản trị viên' : '👥 Người dùng'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                      isDark
                        ? 'text-zing-text-secondary hover:bg-white/5 hover:text-zing-pink'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 border ${
                  isDark
                    ? 'text-zing-text-secondary hover:text-zing-text hover:bg-white/5 border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                }`}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-lg hover:brightness-110"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
