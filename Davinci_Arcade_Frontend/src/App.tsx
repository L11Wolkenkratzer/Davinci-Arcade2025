import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useMemo, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import Home from './Home/Home';

import Login from './Login/Login.tsx';

// Lazy load all game components for better performance
const SpaceshipGame = lazy(() => import('./Game_SPACESHIPS/SpaceshipsGame.tsx'));
const Snake = lazy(() => import('./Game_Snake/snake.tsx'));
const Dino = lazy(() => import('./Game_Dinojump/Dinojump.tsx'));
const Tetris = lazy(() => import('./Tetris/Tetris.tsx'));
const PacMan = lazy(() => import('./PacMan/PacMan.tsx'));
const Tilliman = lazy(() => import('./Game_Tilliman/Tilliman.tsx').then(module => ({ default: module.Tilliman })));



// Loading component for Suspense
const GameLoading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '24px',
    color: '#00ff00',
    fontFamily: 'monospace'
  }}>
    Loading Game...
  </div>
);


// Universeller Player-Typ, passend zum Backend
export type Player = {
  _id: string;
  badgeId: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string; // ISO-String
  updatedAt?: string;
  createdAt?: string;
  __v?: number;
} | null;

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => {
    const savedPlayer = localStorage.getItem('currentPlayer');
    if (savedPlayer) {
      try {
        const parsed = JSON.parse(savedPlayer);
        if (
          parsed &&
          typeof parsed._id === 'string' &&
          typeof parsed.badgeId === 'string' &&
          typeof parsed.name === 'string' &&
          typeof parsed.totalScore === 'number' &&
          typeof parsed.gamesPlayed === 'number' &&
          typeof parsed.lastPlayed === 'string'
        ) {
          return parsed;
        }
      } catch {
        // Invalid JSON in localStorage
      }
    }
    return null;
  });

  // CRITICAL FIX: Use ref-based stable reference
  const setCurrentPlayerRef = useRef(setCurrentPlayer);
  setCurrentPlayerRef.current = setCurrentPlayer;

  // STABLE: This function never changes reference
  const updateCurrentPlayer = useCallback((value: React.SetStateAction<Player>) => {
    setCurrentPlayerRef.current(value);
  }, []); // EMPTY DEPENDENCIES - always stable!

  const logout = () => {
    localStorage.removeItem('currentPlayer');
    setCurrentPlayer(null);
    window.location.href = '/login';
  };

  // OPTIMIZED: Only currentPlayer changes should trigger re-memoization
  const homeElement = useMemo(
    () => {
      return <Home currentPlayer={currentPlayer!} setCurrentPlayer={updateCurrentPlayer} />;
    },
    [currentPlayer, updateCurrentPlayer] // updateCurrentPlayer is now always stable
  );
  
  const loginElement = useMemo(
    () => {
      return <Login setCurrentPlayer={updateCurrentPlayer} />;
    },
    [updateCurrentPlayer]
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={currentPlayer ? homeElement : loginElement}
        />
        <Route 
          path="/spaceships" 
          element={currentPlayer ? <Suspense fallback={<GameLoading />}><SpaceshipGame /></Suspense> : loginElement} 
        />

          <Route path="/login" element={<Login setCurrentPlayer={setCurrentPlayer} />} />

        <Route
          path="/pacman"
          element={currentPlayer ? <Suspense fallback={<GameLoading />}><PacMan /></Suspense> : loginElement}
        />
        <Route 
          path="/tetris" 
          element={currentPlayer ? <Suspense fallback={<GameLoading />}><Tetris currentPlayer={currentPlayer} /></Suspense> : loginElement}
        />
        <Route 
          path="/snake" 
          element={currentPlayer ? <Suspense fallback={<GameLoading />}><Snake /></Suspense> : loginElement}
        />
        <Route 
          path="/dino" 
          element={currentPlayer ? <Suspense fallback={<GameLoading />}><Dino /></Suspense> : loginElement}
        />

        <Route 
          path="/tilliman" 
          element={currentPlayer ? <Suspense fallback={<GameLoading />}><Tilliman /></Suspense> : loginElement}
        />

        <Route path="/login" element={loginElement} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;
