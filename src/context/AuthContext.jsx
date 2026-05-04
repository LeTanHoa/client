import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, getToken, setToken as persistToken } from '../api.js';

const AuthContext = createContext(null);
const AUTH_CHANGED_EVENT = 'spotify-auth-changed';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const data = await api('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    persistToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { type: 'login' } }));
    return data.user;
  }, []);

  const register = useCallback(async (email, password, username) => {
    const data = await api('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    persistToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { type: 'register' } }));
    return data.user;
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { type: 'logout' } }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getToken()),
      login,
      register,
      logout,
    }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
