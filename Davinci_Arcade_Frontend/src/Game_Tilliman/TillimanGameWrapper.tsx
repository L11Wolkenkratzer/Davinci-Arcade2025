import React, { useState, useEffect } from 'react';
import { playerManager } from './api/playerManager';
import TilliTimianLobby from './components/TilliTimianLobby';
import PlayerLoginModal from './components/PlayerLoginModal';

const TillimanGameWrapper: React.FC = () => {
  const [playerLoggedIn, setPlayerLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<{ badgeId: string; name: string }>({
    badgeId: 'Not logged in',
    name: 'Guest'
  });

  useEffect(() => {
    checkPlayerStatus();
  }, []);

  const checkPlayerStatus = () => {
    const isLoggedIn = playerManager.isPlayerLoggedIn();
    const displayInfo = playerManager.getPlayerDisplayInfo();
    
    setPlayerLoggedIn(isLoggedIn);
    setPlayerInfo(displayInfo);

    if (!isLoggedIn && !showLoginModal) {
      setShowLoginModal(true);
    }
  };

  const handlePlayerLogin = () => {
    checkPlayerStatus();
    setShowLoginModal(false);
  };

  const handleShowLogin = () => {
    setShowLoginModal(true);
  };

  if (!playerLoggedIn) {
    return (
      <div className="tilliman-no-player">
        <div className="no-player-content">
          <h2>🎮 Tilli Timian - Zeital</h2>
          <p>Kein Spieler im localStorage gefunden!</p>
          <p>Bitte melde dich über das Hauptmenü an.</p>
          
          <div className="player-info">
            <h3>Benötigte localStorage Daten:</h3>
            <ul>
              <li><code>currentPlayer</code> - JSON mit badgeId und name</li>
              <li><code>playerBadgeId</code> - Deine Badge-ID</li>
              <li><code>playerName</code> - Dein Name (optional)</li>
            </ul>
          </div>

          <button onClick={handleShowLogin} className="show-login-button">
            Login Modal öffnen
          </button>
        </div>

        {showLoginModal && (
          <PlayerLoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onPlayerSet={handlePlayerLogin}
          />
        )}
      </div>
    );
  }

  return (
    <div className="tilliman-wrapper">
      <div className="player-status">
        <span>🎯 {playerInfo.name} (#{playerInfo.badgeId})</span>
        <button onClick={handleShowLogin} className="change-player-button">
          Player wechseln
        </button>
      </div>

      <TilliTimianLobby 
        onOpenHighscore={() => console.log('Highscore opened')}
        onOpenInfo={() => console.log('Info opened')}
      />

      {showLoginModal && (
        <PlayerLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onPlayerSet={handlePlayerLogin}
        />
      )}
    </div>
  );
};

export default TillimanGameWrapper; 