import React from 'react';

interface TilliTimianHighscoreProps {
  onBack: () => void;
}

const TilliTimianHighscore: React.FC<TilliTimianHighscoreProps> = ({ onBack }) => {
  return (
    <div className="level-selector-card">
      <h2>Highscore</h2>
      {/* Hier können Highscore-Listen oder weitere Inhalte eingefügt werden */}
      <button className="level-btn" onClick={onBack}>Zurück</button>
    </div>
  );
};

export default TilliTimianHighscore;
