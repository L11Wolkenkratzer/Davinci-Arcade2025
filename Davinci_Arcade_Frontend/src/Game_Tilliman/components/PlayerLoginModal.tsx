import React, { useState } from 'react';
import { playerManager } from '../api/playerManager';
import type { PlayerData } from '../api/playerManager';

interface PlayerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSet: (player: PlayerData) => void;
}

const PlayerLoginModal: React.FC<PlayerLoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onPlayerSet 
}) => {
  const [loginMode, setLoginMode] = useState<'guest' | 'badge'>('guest');
  const [guestName, setGuestName] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const guestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const playerData = {
        badgeId: `guest-${guestId}`,
        name: guestName || `Gast-${guestId.slice(0, 6)}`
      };
      
      // Save to localStorage
      localStorage.setItem('currentPlayer', JSON.stringify(playerData));
      localStorage.setItem('playerBadgeId', playerData.badgeId);
      localStorage.setItem('playerName', playerData.name);
      
      onPlayerSet(playerData);
      onClose();
    } catch (error) {
      console.error('Failed to create guest player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeLogin = async () => {
    if (!badgeId.trim()) return;
    
    setLoading(true);
    try {
      const playerData = {
        badgeId: badgeId.trim(),
        name: playerName.trim() || `Player-${badgeId.slice(-6)}`
      };
      
      // Save to localStorage
      localStorage.setItem('currentPlayer', JSON.stringify(playerData));
      localStorage.setItem('playerBadgeId', playerData.badgeId);
      localStorage.setItem('playerName', playerData.name);
      
      onPlayerSet(playerData);
      onClose();
    } catch (error) {
      console.error('Failed to login with badge:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlayer = () => {
    return playerManager.getCurrentPlayer();
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('currentPlayer');
    localStorage.removeItem('playerBadgeId');
    localStorage.removeItem('playerName');
    
    onPlayerSet(null);
  };

  if (!isOpen) return null;

  const currentPlayer = getCurrentPlayer();

  return (
    <div className="player-login-modal-overlay" onClick={onClose}>
      <div className="player-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✖</button>
        
        <h2>🎮 Spieler Anmeldung</h2>
        
        {currentPlayer && (
          <div className="current-player-info">
            <h3>🎯 Aktueller Spieler:</h3>
            <div className="player-card">
              <span className="player-name">{currentPlayer.name}</span>
              <span className="player-badge">#{currentPlayer.badgeId}</span>
              {currentPlayer.isGuest && <span className="guest-badge">Gast</span>}
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Abmelden
            </button>
          </div>
        )}

        <div className="login-options">
          <div className="login-mode-selector">
            <button 
              className={`mode-button ${loginMode === 'guest' ? 'active' : ''}`}
              onClick={() => setLoginMode('guest')}
            >
              👤 Als Gast spielen
            </button>
            <button 
              className={`mode-button ${loginMode === 'badge' ? 'active' : ''}`}
              onClick={() => setLoginMode('badge')}
            >
              🎫 Mit Badge-ID anmelden
            </button>
          </div>

          {loginMode === 'guest' && (
            <div className="guest-login">
              <h3>Als Gast spielen</h3>
              <p>Spiele sofort los! Dein Fortschritt wird lokal gespeichert.</p>
              <input
                type="text"
                placeholder="Dein Name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={20}
                style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px' }}
              />
              <button 
                className="login-submit-button"
                onClick={handleGuestLogin}
                disabled={loading}
                style={{ fontFamily: 'Press Start 2P, cursive' }}
              >
                {loading ? 'Erstelle...' : '🚀 Als Gast starten'}
              </button>
            </div>
          )}

          {loginMode === 'badge' && (
            <div className="badge-login">
              <h3>Mit Badge-ID anmelden</h3>
              <p>Melde dich mit deiner Badge-ID an um Fortschritt zu synchronisieren.</p>
              <input
                type="text"
                placeholder="Badge-ID eingeben..."
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px' }}
              />
              <input
                type="text"
                placeholder="Dein Name (optional)"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px' }}
              />
              <button 
                className="login-submit-button"
                onClick={handleBadgeLogin}
                disabled={loading || !badgeId.trim()}
                style={{ fontFamily: 'Press Start 2P, cursive' }}
              >
                {loading ? 'Anmelden...' : '🎫 Anmelden'}
              </button>
            </div>
          )}
        </div>

        <div className="player-info">
          <h4>ℹ️ Individuelle Speicherung</h4>
          <ul>
            <li>🎯 Jeder Spieler hat seinen eigenen Fortschritt</li>
            <li>💰 Coins und Freischaltungen sind individuell</li>
            <li>🏆 Highscores werden separat getrackt</li>
            <li>🎮 Gastspielerdaten bleiben lokal gespeichert</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerLoginModal; 