import React, { useState } from 'react';
import TilliTimianLobby from './components/TilliTimianLobby.tsx';
import TilliTimianPlay from './components/TilliTimianPlay.tsx';
import TilliTimianHighscore from './components/TilliTimianHighscore.tsx';
import TilliTimianInfo from './components/TilliTimianInfo.tsx';
import './TilliTimianGame.css';

export type TilliScreen = 'lobby' | 'game' | 'highscore' | 'info';

const TilliTimianGame: React.FC = () => {
  const [screen, setScreen] = useState<TilliScreen>('lobby');

  const renderScreen = () => {
    switch (screen) {
      case 'lobby':
        return <TilliTimianLobby onOpenHighscore={() => setScreen('highscore')} onOpenInfo={() => setScreen('info')} />;
      case 'game':
        return <TilliTimianPlay onGameOver={() => setScreen('lobby')} />;
      case 'highscore':
        return <TilliTimianHighscore onBack={() => setScreen('lobby')} />;
      case 'info':
        return <TilliTimianInfo onBack={() => setScreen('lobby')} />;
      default:
        return null;
    }
  };

  return (
    <div className="tillit-game-container">
      {renderScreen()}
    </div>
  );
};

export default TilliTimianGame;
