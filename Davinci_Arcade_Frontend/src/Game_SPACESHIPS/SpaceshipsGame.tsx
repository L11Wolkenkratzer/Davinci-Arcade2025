import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpaceshipGame.css';
import GameLobby from './components/GameLobby';
import GamePlay from './components/GamePlay';
import Shop from './components/Shop';
import ShipManager from './components/ShipManager';
import Highscore from './components/Highscore';
import Info from './components/Info';
import type { GameScreen, Player } from './types/gametypes';
import { useGameState } from './hooks/useGameState';

interface SpaceshipGameProps {
    currentPlayer?: Player | null;
}

const SpaceshipGame: React.FC<SpaceshipGameProps> = ({ currentPlayer }) => {
    const [currentScreen, setCurrentScreen] = useState<GameScreen>('lobby');
    const navigate = useNavigate();
    
    // Hintergrundmusik-Ref
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    
    // Enhanced useGameState with currentPlayer
    const {
        gameState,
        ships,
        upgrades,
        highscores,
        playerStats,
        isSubmitting,
        showNewHighscore,
        buyShip,
        buyUpgrade,
        equipShip,
        startGame,
        resetGame,
        submitGameResult,
        trackGameEvent,
    } = useGameState(currentPlayer);

    // Hintergrundmusik-Logik
    useEffect(() => {
        if (!bgMusicRef.current) {
            bgMusicRef.current = new window.Audio('/Sounds/background.mp3');
            bgMusicRef.current.loop = true;
            bgMusicRef.current.volume = 0.4;
        }
        
        // Musik nur in Menüs, nicht im Spiel
        const menuScreens = ['lobby', 'shop', 'shipManager', 'highscore', 'info'];
        if (menuScreens.includes(currentScreen)) {
            bgMusicRef.current.play().catch(() => {});
        } else {
            bgMusicRef.current.pause();
        }
        
        // Stoppe Musik komplett beim Unmount
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

    const handleGameOver = useCallback(async (score: number, coins: number) => {
        if (currentPlayer && score > 0) {
            await submitGameResult(score, gameState.level);
        }
        setCurrentScreen('lobby');
    }, [currentPlayer, submitGameResult, gameState.level]);

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
                    />
                );
            case 'game':
                return (
                    <GamePlay
                        onGameOver={handleGameOver}
                        onPause={() => setCurrentScreen('lobby')}
                        onStart={startGame}
                        onReset={resetGame}
                    />
                );
            case 'shop':
                return (
                    <Shop
                        ships={ships}
                        coins={gameState.coins}
                        onBuyShip={(shipId: string) => { buyShip(shipId).catch(console.error); return true; }}
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
            {/* New Highscore Notification */}
            {showNewHighscore && (
                <div className="spaceship-notification">
                    <div className="spaceship-notification-content">
                        🚀 NEW HIGHSCORE! 🚀
                    </div>
                </div>
            )}
            
            <div className="game-container">
                {renderScreen()}
            </div>
        </div>
    );
};

export default SpaceshipGame;
