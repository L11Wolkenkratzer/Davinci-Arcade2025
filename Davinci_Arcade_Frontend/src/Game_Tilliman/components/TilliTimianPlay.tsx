import React from 'react';

interface TilliTimianPlayProps {
  onGameOver: () => void;
}

const TilliTimianPlay: React.FC<TilliTimianPlayProps> = ({ onGameOver }) => {
  return (
    <div className="tillit-play">
      <h2>Hier kommt das Spiel!</h2>
      <button onClick={onGameOver}>Zurück zur Lobby</button>
    </div>
  );
};

export default TilliTimianPlay;
