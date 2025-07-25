import React, { useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './SettingsContext';
import Home from './Home/Home';
import Login from './Login/Login.tsx';
// ...existing code...
const SpaceshipGame = lazy(() => import('./Game_SPACESHIPS/SpaceshipsGame.tsx'));
const Snake = lazy(() => import('./Game_Snake/snake.tsx'));
const Dino = lazy(() => import('./Game_Dinojump/Dinojump.tsx'));
const Tetris = lazy(() => import('./Tetris/Tetris.tsx'));
const PacMan = lazy(() => import('./Game_PacMan/Pacman.tsx'));
const Tilliman = lazy(() => import('./Game_Tilliman/Tilliman.tsx').then(module => ({ default: module.Tilliman })));
const TilliTimianGame = lazy(() => import('./Game_Tilliman/TilliTimianGame.tsx'));

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

export type Player = {
    _id: string;
    badgeId: string;
    name: string;
    totalScore: number;
    gamesPlayed: number;
    lastPlayed: string;
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
            }

        return null;
    });

    // ✅ VEREINFACHT: Direkter stabiler Callback ohne Ref-Komplexität
    const updateCurrentPlayer = useCallback((value: React.SetStateAction<Player>) => {
        setCurrentPlayer(value);
    }, []); // setCurrentPlayer ist von React garantiert stabil

    const logout = () => {
        localStorage.removeItem('currentPlayer');
        setCurrentPlayer(null);
        window.location.href = '/login';
    };

    // ✅ ENTFERNT: useMemo für Elemente - React.memo in Komponenten übernimmt Optimierung

    return (
        <SettingsProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            currentPlayer ? (
                                <Home
                                    currentPlayer={currentPlayer}
                                    setCurrentPlayer={updateCurrentPlayer}
                                />
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/spaceships"
                        element={
                            currentPlayer ? (
                                <Suspense fallback={<GameLoading />}>
                                    <SpaceshipGame />
                                </Suspense>
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/pacman"
                        element={
                            currentPlayer ? (
                                <Suspense fallback={<GameLoading />}>
                                    <PacMan />
                                </Suspense>
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/tetris"
                        element={
                            currentPlayer ? (
                                <Suspense fallback={<GameLoading />}>
                                    <Tetris currentPlayer={currentPlayer} />
                                </Suspense>
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/snake"
                        element={
                            currentPlayer ? (
                                <Suspense fallback={<GameLoading />}>
                                    <Snake />
                                </Suspense>
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/dino"
                        element={
                            currentPlayer ? (
                                <Suspense fallback={<GameLoading />}>
                                    <Dino />
                                </Suspense>
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/tilliman"
                        element={
                            currentPlayer ? (
                                <Suspense fallback={<GameLoading />}>
                                    <Tilliman />
                                </Suspense>
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/tillimanhome"
                        element={
                            currentPlayer ? (
                                <Suspense fallback={<GameLoading />}>
                                    <TilliTimianGame />
                                </Suspense>
                            ) : (
                                <Login setCurrentPlayer={updateCurrentPlayer} />
                            )
                        }
                    />
                    <Route
                        path="/login"
                        element={<Login setCurrentPlayer={updateCurrentPlayer} />}
                    />
                </Routes>
            </BrowserRouter>
        </SettingsProvider>
    );
}

export default App;
