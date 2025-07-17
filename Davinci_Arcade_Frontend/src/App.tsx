import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './Home/Home.tsx'
import Login from './Login/Login.tsx'
import SpaceshipGame from './Game_SPACESHIPS/SpaceshipsGame.tsx';  // ⬅︎ NEU

// Universeller Player-Typ, passend zum Backend
export type Player = {
  _id: string;
  badgeId: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string; // ISO-String
} | null;

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>(null);

  useEffect(() => {
    // Prüfe LocalStorage beim App-Start
    const savedPlayer = localStorage.getItem('currentPlayer');
    if (savedPlayer) {
      try {
        const parsed = JSON.parse(savedPlayer);
        // Prüfe, ob alle Felder vorhanden sind
        if (
          parsed &&
          typeof parsed._id === 'string' &&
          typeof parsed.badgeId === 'string' &&
          typeof parsed.name === 'string' &&
          typeof parsed.totalScore === 'number' &&
          typeof parsed.gamesPlayed === 'number' &&
          typeof parsed.lastPlayed === 'string'
        ) {
          setCurrentPlayer(parsed);
        } else {
          setCurrentPlayer(null);
        }
      } catch {
        setCurrentPlayer(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('currentPlayer');
    setCurrentPlayer(null);
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            currentPlayer ? (
              <Home currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} />
            ) : (
              <Login setCurrentPlayer={setCurrentPlayer} />
            )
          }
        />
        <Route path="/spaceships" element={<SpaceshipGame />} />
        <Route
          path="/pacman"
          element={
            currentPlayer ? (
              <Home currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} />
            ) : (
              <Login setCurrentPlayer={setCurrentPlayer} />
            )
          }
        />
        <Route path="/login" element={<Login setCurrentPlayer={setCurrentPlayer} />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;
