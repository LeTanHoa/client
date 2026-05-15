import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { PlayerProvider } from './context/PlayerContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
