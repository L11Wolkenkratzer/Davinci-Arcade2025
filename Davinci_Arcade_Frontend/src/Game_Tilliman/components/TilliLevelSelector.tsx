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
  onConfirm?: () => void;
  onCancel?: () => void;
}

const TilliLevelSelector: React.FC<TilliLevelSelectorProps> = ({ 
  currentLevel, 
  setCurrentLevel, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="level-selector-card">
      <div className="level-selector-header">
        <h1 className="level-selector-title">LEVEL AUSWÄHLEN</h1>
        <p className="level-selector-subtitle">Wähle dein Abenteuer</p>
      </div>
      
      <div className="level-selector-controls">
        <button 
          className="level-btn" 
          onClick={() => setCurrentLevel(Math.max(0, currentLevel - 1))} 
          disabled={currentLevel === 0}
          title="Vorheriges Level"
        >
          ◀
        </button>
        
        <div className="level-name">
          {levels[currentLevel]}
        </div>
        
        <button 
          className="level-btn" 
          onClick={() => setCurrentLevel(Math.min(levels.length - 1, currentLevel + 1))} 
          disabled={currentLevel === levels.length - 1}
          title="Nächstes Level"
        >
          ▶
        </button>
      </div>
      
      <div className="level-index">
        LEVEL {currentLevel + 1} / {levels.length}
      </div>
      
      <div className="level-selector-actions">
        <button 
          className="level-select-btn" 
          onClick={onCancel}
          title="Zurück zum Lobby"
        >
          ← ZURÜCK
        </button>
        
        <button 
          className="level-select-btn primary" 
          onClick={onConfirm}
          title="Level bestätigen"
        >
          ▶ SPIELEN
        </button>
      </div>
    </div>
  );
};

export default TilliLevelSelector;
