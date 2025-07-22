import React, { memo } from 'react';
import settingsImage from '../assets/settingsImage.png';
import Clock from './Clock';

interface HeaderProps {
  navigationMode: 'games' | 'header';
  selectedHeaderButton: 'settings' | 'user' | 'info';
  onHeaderButtonActivate: (button: 'settings' | 'user' | 'info') => void;
}

const Header: React.FC<HeaderProps> = memo(({ 
  navigationMode, 
  selectedHeaderButton, 
  onHeaderButtonActivate 
}) => {
  const getBtnClass = (button: 'settings' | 'user' | 'info'): string => {
    const baseClass = button === "user" ? "user-text" :
                     button === "info" ? "info-circle" :
                     `${button}-button`;

    return `${baseClass}${
      navigationMode === "header" && selectedHeaderButton === button
        ? " keyboard-selected"
        : ""
    }`;
  };

  return (
    <header className="arcade-header">
      <div className="header-left">
        <button
          className={getBtnClass("settings")}
          onClick={() => onHeaderButtonActivate("settings")}
          aria-label="Einstellungen öffnen"
        >
          <img
            className="settings-icon"
            src={settingsImage}
            alt="Einstellungen"
          />
        </button>
        <button
          className={getBtnClass("user")}
          onClick={() => onHeaderButtonActivate("user")}
          aria-label="Benutzer-Menü öffnen"
        >
          USER
        </button>
      </div>
      <div className="header-center">
        <h1 className="arcade-title">DAVINCI ARCADE</h1>
      </div>
      <div className="header-right">
        <button
          className={getBtnClass("info")}
          onClick={() => onHeaderButtonActivate("info")}
          aria-label="Informationen anzeigen"
        >
          i
        </button>
        <Clock />
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header; 