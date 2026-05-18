import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export function Register() {
  const { isDark } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, username);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-2 sm:px-6 sm:py-8">
      <div className={`rounded-2xl border p-5 shadow-2xl sm:p-8 ${isDark ? 'bg-zing-bg-panel border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest font-bold text-zing-success">🎉 Tạo tài khoản</p>
          <h1 className="mt-4 text-3xl md:text-4xl font-black bg-gradient-to-r from-zing-primary to-zing-accent bg-clip-text text-transparent">
            Đăng ký
          </h1>
          <p className={`mt-3 text-sm ${isDark ? 'text-zing-text-secondary' : 'text-slate-600'}`}>
            Tạo tài khoản để lưu yêu thích và quản lý playlist cá nhân.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-zing-text-secondary' : 'text-slate-700'}`}>
              👤 Tên người dùng
            </label>
            <input
              type="text"
              required
              placeholder="your_username"
              className={`w-full rounded-lg px-4 py-3 outline-none transition-all duration-200 border ${
                isDark
                  ? 'bg-zing-bg-tertiary border-white/10 text-zing-text placeholder-zing-text-tertiary focus:border-zing-primary/50 focus:ring-2 focus:ring-zing-primary/20'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-zing-primary focus:ring-2 focus:ring-zing-primary/20'
              }`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-zing-text-secondary' : 'text-slate-700'}`}>
              📧 Email
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              className={`w-full rounded-lg px-4 py-3 outline-none transition-all duration-200 border ${
                isDark
                  ? 'bg-zing-bg-tertiary border-white/10 text-zing-text placeholder-zing-text-tertiary focus:border-zing-primary/50 focus:ring-2 focus:ring-zing-primary/20'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-zing-primary focus:ring-2 focus:ring-zing-primary/20'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-zing-text-secondary' : 'text-slate-700'}`}>
              🔐 Mật khẩu
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Ít nhất 6 ký tự"
              className={`w-full rounded-lg px-4 py-3 outline-none transition-all duration-200 border ${
                isDark
                  ? 'bg-zing-bg-tertiary border-white/10 text-zing-text placeholder-zing-text-tertiary focus:border-zing-primary/50 focus:ring-2 focus:ring-zing-primary/20'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-zing-primary focus:ring-2 focus:ring-zing-primary/20'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className={`rounded-lg p-3 text-sm font-medium ${isDark ? 'bg-zing-pink/20 text-zing-pink border border-zing-pink/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-zing-primary to-zing-secondary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Đang tạo…' : '✨ Đăng ký'}
          </button>
        </form>

        <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <p className={`text-sm text-center ${isDark ? 'text-zing-text-tertiary' : 'text-slate-600'}`}>
            Đã có tài khoản?{' '}
            <Link className={`font-bold underline transition-colors ${isDark ? 'text-zing-primary hover:text-zing-accent' : 'text-zing-primary hover:text-zing-secondary'}`} to="/login">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
