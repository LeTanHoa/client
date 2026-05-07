import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const { login} = useAuth();
 
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const user = await login(email, password);
  
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-spotify-subtle mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full bg-spotify-panel border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-spotify-subtle mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full bg-spotify-panel border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-spotify-green"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-spotify-green text-black font-semibold py-2.5 hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Continue'}
        </button>
      </form>
      <p className="mt-6 text-sm text-spotify-subtle">
        No account?{' '}
        <Link className="text-white underline" to="/register">
          Sign up
        </Link>
      </p>
    </div>
  );
}
