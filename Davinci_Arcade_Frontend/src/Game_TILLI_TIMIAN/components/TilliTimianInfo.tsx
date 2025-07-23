import React from 'react';

interface TilliTimianInfoProps {
  onBack: () => void;
}

const TilliTimianInfo: React.FC<TilliTimianInfoProps> = ({ onBack }) => {
  return (
    <div className="level-selector-card">
      <h2>Info zu Tilli Timian</h2>
      {/* Hier können Infos oder weitere Inhalte eingefügt werden */}
      <button className="level-btn" onClick={onBack}>Zurück</button>
    </div>
  );
};

export default TilliTimianInfo;
