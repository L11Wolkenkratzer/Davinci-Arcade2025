import React, { useState } from 'react';
import TilliTimianLobby from './components/TilliTimianLobby.tsx';
import './TilliTimianGame.css';

// Player type definition (matching App.tsx)
type Player = {
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

export type TilliScreen = 'lobby' | 'game' | 'highscore' | 'info';

interface TilliTimianGameProps {
  currentPlayer: Player;
}

const TilliTimianGame: React.FC<TilliTimianGameProps> = ({ currentPlayer }) => {
  const [screen, setScreen] = useState<TilliScreen>('lobby');

  const renderScreen = () => {
    switch (screen) {
      case 'lobby':
        return <TilliTimianLobby currentPlayer={currentPlayer} onOpenHighscore={() => setScreen('highscore')} onOpenInfo={() => setScreen('info')} />;
      case 'game':
        return <div>Game component would go here</div>;
      case 'highscore':
        return <div>Highscore component would go here</div>;
      case 'info':
        return <div>Info component would go here</div>;
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
