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

import type { GameScreen, Player } from './types/gametypes';
import { useGameState } from './hooks/useGameState';

interface SpaceshipGameProps {
  currentPlayer?: Player | null;
}

const SpaceshipGame: React.FC<SpaceshipGameProps> = ({ currentPlayer }) => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('lobby');
  const navigate = useNavigate();

  // Audio
  const { volume } = useAudio();
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // ✅ Game State mit currentPlayer
  const {
    gameState,
    ships,
    upgrades,
    currentShip,    // ✅ Ship-Objekt
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
    loadHighscores
  } = useGameState(currentPlayer);

  // Hintergrundmusik-Initialisierung
  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new window.Audio('/Sounds/background.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = (volume / 100) * 0.4;
      bgMusicRef.current.addEventListener('canplaythrough', () => {
        console.log('🎵 Spaceship background music loaded');
      });
      bgMusicRef.current.addEventListener('error', (e) => {
        console.error('❌ Error loading spaceship background music:', e);
      });
    }
  }, [volume]);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = (volume / 100) * 0.4;
    }
  }, [volume]);

  useEffect(() => {
    if (!bgMusicRef.current) return;

    const menuScreens: GameScreen[] = ['lobby', 'shop', 'shipManager', 'highscore', 'info'];
    if (menuScreens.includes(currentScreen)) {
      bgMusicRef.current.play().catch((error) => {
        console.log('🔇 Background music autoplay blocked:', error);
      });
    } else {
      bgMusicRef.current.pause();
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, [currentScreen]);


  // Globaler ESC/SPACE-Handler
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === ' ') {
        if (currentScreen === 'game') {
          setCurrentScreen('lobby');
        } else if (currentScreen !== 'lobby') {
          setCurrentScreen('lobby');
        } else {
          navigate('/');

        }
      }
    },
      [currentScreen, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleGameOver = useCallback(
      async (score: number, coins: number) => {
        try {
          console.log('🚀 Spaceship Game Over:', { score, coins, level: gameState.level });

          if (currentPlayer && score > 0) {
            await submitGameResult(score, gameState.level);
          }

          trackGameEvent?.('game_over', { score, coins, level: gameState.level });
        } catch (err) {
          console.error('Failed to submit spaceship game result:', err);
        } finally {
          setCurrentScreen('lobby');
        }
      },
      [currentPlayer, submitGameResult, trackGameEvent, gameState.level]
  );

  const handleOpenHighscore = useCallback(() => {
    loadHighscores();
    setCurrentScreen('highscore');
  }, [loadHighscores]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'lobby':
        return (
            <GameLobby
                onStartGame={() => setCurrentScreen('game')}
                onOpenShop={() => setCurrentScreen('shop')}
                onOpenShipManager={() => setCurrentScreen('shipManager')}
                onOpenHighscore={handleOpenHighscore}
                onOpenInfo={() => setCurrentScreen('info')}
                onExit={() => navigate('/')}
                coins={gameState.coins}
                currentShip={currentShip} // ✅ Ship-Objekt
                upgrades={upgrades}
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
                onBuyShip={(shipId: string) => {
                  buyShip(shipId).catch(console.error);
                  return true;
                }}
                onBuyUpgrade={(upgradeId: string) => {
                  buyUpgrade(upgradeId).catch(console.error);
                  return true;
                }}
                onBack={() => setCurrentScreen('lobby')}
            />
        );
      case 'shipManager':
        return (
            <ShipManager
                ships={ships}
                currentShip={currentShip} // ✅ Ship-Objekt
                onEquipShip={equipShip}
                onBack={() => setCurrentScreen('lobby')}
            />
        );
      case 'highscore':
        return <Highscore highscores={highscores} onBack={() => setCurrentScreen('lobby')} />;
      case 'info':
        return <Info onBack={() => setCurrentScreen('lobby')} />;
      default:
        return null;
    }
  };

  return (
      <div className="spaceship-game">
        {showNewHighscore && (
            <div className="spaceship-notification">
              <div className="spaceship-notification-content">🚀 NEW GALACTIC RECORD! 🚀</div>
            </div>
        )}

        <div className="game-container">
          {renderScreen()}
        </div>
      </div>
  );
};

export default SpaceshipGame;
