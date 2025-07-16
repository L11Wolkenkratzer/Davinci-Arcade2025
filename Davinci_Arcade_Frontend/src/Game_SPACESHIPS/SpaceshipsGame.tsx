import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
            </div>
        </div>
    );
};

export default SpaceshipGame;
