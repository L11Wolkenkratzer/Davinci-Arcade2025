import React from 'react';
import './TilliTimianLobby.css';

const levels = [
  'Uhrwerk-Halle',
  'Rostkammer',
  'Chrono-Turm',
  'Feder-Labyrinth',
  'Finale: Zeituhr',
];

interface TilliLevelSelectorProps {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
}

const TilliLevelSelector: React.FC<TilliLevelSelectorProps> = ({ currentLevel, setCurrentLevel }) => {
  return (
    <div className="level-selector-card">
    
      <div className="level-selector-controls">
        <button className="level-btn" onClick={() => setCurrentLevel(Math.max(0, currentLevel - 1))} disabled={currentLevel === 0}>◀</button>
        <span className="level-name">{levels[currentLevel]}</span>
        <button className="level-btn" onClick={() => setCurrentLevel(Math.min(levels.length - 1, currentLevel + 1))} disabled={currentLevel === levels.length - 1}>▶</button>
      </div>
      <div className="level-index">{currentLevel + 1} / {levels.length}</div>
    </div>
  );
};

export default TilliLevelSelector;
