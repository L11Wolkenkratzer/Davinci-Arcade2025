import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './Home/Home.tsx'
import Login from './Login/Login.tsx'

// Player-Typ definieren
export type Player = { id: string; name: string; badgeId: string } | null;

function App() {
    const [currentPlayer, setCurrentPlayer] = useState<Player>(null);

    useEffect(() => {
        // Prüfe LocalStorage beim App-Start
        const savedPlayer = localStorage.getItem('currentPlayer');
        if (savedPlayer) {
            setCurrentPlayer(JSON.parse(savedPlayer));
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
                <Route path="/" element={currentPlayer ? <Home currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} /> : <Login />} />
                <Route path="/pacman" element={currentPlayer ? <Home currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} /> : <Login />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
