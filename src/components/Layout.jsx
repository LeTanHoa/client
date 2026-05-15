import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { PlayerBar } from './PlayerBar.jsx';

export function Layout() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-zing-gradient text-zing-text' : 'bg-slate-50 text-slate-900'
    }`}>
      <Sidebar />

      <Header onSearch={handleSearch} />

      <main className="fixed top-20 left-72 right-0 bottom-28 overflow-y-auto">
        <div className="px-4 md:px-6 lg:px-8 xl:px-10 py-6">
          <Outlet />
        </div>
      </main>

      <PlayerBar />
    </div>
  );
}
