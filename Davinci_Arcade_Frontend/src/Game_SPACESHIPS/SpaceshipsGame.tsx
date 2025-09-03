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

  // Game State (erweiterte Variante mit currentPlayer und Submit/Tracking)
  const {
    gameState,
    ships,
    upgrades,
    highscores,
    // optionale erweiterte Felder
    playerStats,
    isSubmitting,
    showNewHighscore,
    // Aktionen
    buyShip,
    buyUpgrade,
    equipShip,
    startGame,
    resetGame,
    submitGameResult,
    trackGameEvent,
    // Fallback-Aktion, falls in Hook vorhanden (keine Pflicht):
    addHighscore,
  } = useGameState(currentPlayer);

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
    const menuScreens: GameScreen[] = ['lobby', 'shop', 'shipManager', 'highscore', 'info'];
    if (menuScreens.includes(currentScreen)) {
      bgMusicRef.current.play().catch((error) => {
        console.log('🔇 Background music autoplay blocked:', error);
      });
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

  // Globaler ESC-Handler
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  // Game Over: optionales Submit + zurück zur Lobby
  const handleGameOver = useCallback(
    async (score: number, coins: number) => {
      try {
        if (currentPlayer && score > 0 && typeof submitGameResult === 'function') {
          await submitGameResult(score, gameState.level);
        } else if (typeof addHighscore === 'function') {
          // Fallback falls submitGameResult nicht existiert
          addHighscore?.({ name: currentPlayer?.name ?? 'Player', score });
        }
        trackGameEvent?.('game_over', { score, coins, level: gameState.level });
      } catch (err) {
        console.error('Failed to submit game result:', err);
      } finally {
        setCurrentScreen('lobby');
      }
    },
    [currentPlayer, submitGameResult, addHighscore, trackGameEvent, gameState.level]
  );

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
            currentShip={gameState.ship}
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
      {/* New Highscore Notification */}
      {showNewHighscore && (
        <div className="spaceship-notification">
          <div className="spaceship-notification-content">🚀 NEW HIGHSCORE! 🚀</div>
        </div>
      )}

      <div className="game-container">
        {renderScreen()}

        {/* Debug-Info für Audio (optional) */}
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            zIndex: 9999,
            fontFamily: 'monospace',
          }}
        >
          🎵 Volume: {volume}% | Screen: {currentScreen}
        </div>
      </div>
    </div>
  );
};

export default SpaceshipGame;
