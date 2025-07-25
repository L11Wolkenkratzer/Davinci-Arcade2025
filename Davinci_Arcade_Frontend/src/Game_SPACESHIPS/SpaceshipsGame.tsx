import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../SettingsContext.tsx';
import './SpaceshipGame.css';
import GameLobby from './components/GameLobby';
import GamePlay from './components/GamePlay';
import Shop from './components/Shop';
import ShipManager from './components/ShipManager';
import Highscore from './components/Highscore';
import Info from './components/Info';
import type {GameScreen, Ship, Upgrade, HighscoreEntry} from './types/gametypes.ts';
import { useGameState } from './hooks/useGameState';

const SpaceshipGame: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<GameScreen>('lobby');
    const [selectedMenuItem, setSelectedMenuItem] = useState(0);
    const navigate = useNavigate();

    const { volume } = useAudio();
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);

    const {
        gameState,
        ships,
        upgrades,
        highscores,
        buyShip,
        buyUpgrade,
        equipShip,
        startGame,
        resetGame,
        addHighscore
    } = useGameState();

    // Hintergrundmusik-Initialisierung
    useEffect(() => {
        if (!bgMusicRef.current) {
            bgMusicRef.current = new window.Audio('/Sounds/background.mp3');
            bgMusicRef.current.loop = true;
            bgMusicRef.current.volume = (volume / 100) * 0.4; // 40% der globalen Lautstärke

            bgMusicRef.current.addEventListener('canplaythrough', () => {
                console.log('🎵 Spaceship background music loaded');
            });

            bgMusicRef.current.addEventListener('error', (e) => {
                console.error('❌ Error loading spaceship background music:', e);
            });
        }
    }, [volume]);

    // Lautstärke aktualisieren wenn sich globale Lautstärke ändert
    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.volume = (volume / 100) * 0.4;
        }
    }, [volume]);

    // Hintergrundmusik-Steuerung basierend auf Screen
    useEffect(() => {
        if (!bgMusicRef.current) return;

        // Musik nur in Menüs, nicht im Spiel
        const menuScreens = ['lobby', 'shop', 'shipManager', 'highscore', 'info'];

        if (menuScreens.includes(currentScreen)) {
            bgMusicRef.current.play().catch((error) => {
                console.log('🔇 Background music autoplay blocked:', error);
            });
        } else {
            bgMusicRef.current.pause();
        }

        // Stoppe Musik komplett beim Unmount (z.B. Startseite)
        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current.currentTime = 0;
            }
        };
    }, [currentScreen]);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (currentScreen === 'game') {
                setCurrentScreen('lobby');
            } else if (currentScreen !== 'lobby') {
                setCurrentScreen('lobby');
            } else {
                navigate('/');
            }
        }
    }, [currentScreen, navigate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'lobby':
                return (
                    <GameLobby
                        onStartGame={() => setCurrentScreen('game')}
                        onOpenShop={() => setCurrentScreen('shop')}
                        onOpenShipManager={() => setCurrentScreen('shipManager')}
                        onOpenHighscore={() => setCurrentScreen('highscore')}
                        onOpenInfo={() => setCurrentScreen('info')}
                        onExit={() => navigate('/')}
                        coins={gameState.coins}
                        currentShip={gameState.ship}
                        upgrades={upgrades}
                    />
                );
            case 'game':
                return (
                    <GamePlay
                        gameState={gameState}
                        onGameOver={(score) => {
                            if (score > 0) {
                                addHighscore('Player', score);
                            }
                            setCurrentScreen('lobby');
                        }}
                        onPause={() => setCurrentScreen('lobby')}
                        onStart={startGame}
                        onReset={resetGame}
                    />
                );
            case 'shop':
                return (
                    <Shop
                        ships={ships}
                        upgrades={upgrades}
                        coins={gameState.coins}
                        onBuyShip={buyShip}
                        onBuyUpgrade={buyUpgrade}
                        onBack={() => setCurrentScreen('lobby')}
                    />
                );
            case 'shipManager':
                return (
                    <ShipManager
                        ships={ships}
                        currentShip={gameState.ship}
                        onEquipShip={equipShip}
                        onBack={() => setCurrentScreen('lobby')}
                    />
                );
            case 'highscore':
                return (
                    <Highscore
                        highscores={highscores}
                        onBack={() => setCurrentScreen('lobby')}
                    />
                );
            case 'info':
                return (
                    <Info
                        onBack={() => setCurrentScreen('lobby')}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="spaceship-game">
            <div className="game-container">
                {renderScreen()}

                {/* Debug-Info für Audio (optional - kannst du entfernen) */}
                <div style={{
                    position: 'fixed',
                    bottom: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    zIndex: 9999,
                    fontFamily: 'monospace'
                }}>
                    🎵 Volume: {volume}% | Screen: {currentScreen}
                </div>
            </div>
        </div>
    );
};

export default SpaceshipGame;
