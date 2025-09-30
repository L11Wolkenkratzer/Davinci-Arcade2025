import React, { useState, useEffect } from 'react';
import './TilliTimianLobby.css';

interface TilliTimianInfoProps {
  onBack: () => void;
}

const TilliTimianInfo: React.FC<TilliTimianInfoProps> = ({ onBack }) => {
  const [selectedOption] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <div className="fullscreen-overlay" style={{
      background: 'url("/Images/image.png") center center no-repeat, rgba(60, 40, 20, 0.98)',
      backgroundSize: 'cover'
    }}>
      <div className="level-selector-card" style={{
        width: '85vw',
        height: '85vh',
        padding: '1.5em',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '0.8rem', width: '100%' }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontFamily: 'Press Start 2P, cursive',
            color: '#D2691E',
            textShadow: '4px 4px 0 #000',
            marginBottom: '0.3rem',
            letterSpacing: '2px'
          }}>Tilli Timian</h1>
          <p style={{
            fontSize: '0.6rem',
            color: '#CD853F',
            fontFamily: 'Press Start 2P, cursive',
            textShadow: '2px 2px 0 #000',
            letterSpacing: '1px'
          }}>Arcade Adventure</p>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '1200px', flex: '1 1 auto' }}>
          {/* Story Section */}
          <div style={{ background: 'rgba(139, 69, 19, 0.7)', border: '3px solid #8B4513', padding: '1rem', boxShadow: '4px 4px 0 #5D2E0C' }}>
            <h2 style={{ fontSize: '0.8rem', color: '#D2691E', fontFamily: 'Press Start 2P, cursive', marginBottom: '0.8rem', textShadow: '2px 2px 0 #000', textAlign: 'center' }}>⚙️ Die Geschichte</h2>
            <p style={{ fontSize: '0.45rem', lineHeight: '1.5', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', textAlign: 'left', marginBottom: '0.6rem' }}>Die Zeit ist zerbrochen! Tilli Timian, der mutige Uhrmacher-Lehrling, muss die verlorenen Zahnräder sammeln und die mysteriöse Zeitmaschine reparieren.</p>
            <p style={{ fontSize: '0.45rem', lineHeight: '1.5', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', textAlign: 'left' }}>Durchquere 10 gefährliche Steampunk-Level voller Rätsel, Fallen und mechanischer Kreaturen!</p>
          </div>

          {/* Controls Section */}
          <div style={{ background: 'rgba(139, 69, 19, 0.7)', border: '3px solid #8B4513', padding: '1rem', boxShadow: '4px 4px 0 #5D2E0C' }}>
            <h2 style={{ fontSize: '0.8rem', color: '#D2691E', fontFamily: 'Press Start 2P, cursive', marginBottom: '0.8rem', textShadow: '2px 2px 0 #000', textAlign: 'center' }}>🎮 Steuerung</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(60, 40, 20, 0.6)', padding: '0.5rem', border: '2px solid #8B4513' }}>
                <span style={{ fontSize: '0.65rem', minWidth: '100px', textAlign: 'center', fontFamily: 'Press Start 2P, cursive' }}>Joystick</span>
                <span style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive' }}>Bewegung</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(60, 40, 20, 0.6)', padding: '0.5rem', border: '2px solid #8B4513' }}>
                <span style={{ fontSize: '0.5rem', minWidth: '100px', textAlign: 'center', fontFamily: 'Press Start 2P, cursive' }}>Oberer Button</span>
                <span style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive' }}>Springen</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(60, 40, 20, 0.6)', padding: '0.5rem', border: '2px solid #D2691E' }}>
                <span style={{ fontSize: '0.5rem', minWidth: '100px', textAlign: 'center', fontFamily: 'Press Start 2P, cursive' }}>Unterer Button</span>
                <span style={{ fontSize: '0.45rem', color: '#FFD700', fontFamily: 'Press Start 2P, cursive' }}>Halten (2s) - Zur Lobby</span>
              </div>
            </div>
          </div>

          {/* Gameplay Section */}
          <div style={{ background: 'rgba(139, 69, 19, 0.7)', border: '3px solid #8B4513', padding: '1rem', boxShadow: '4px 4px 0 #5D2E0C' }}>
            <h2 style={{ fontSize: '0.8rem', color: '#D2691E', fontFamily: 'Press Start 2P, cursive', marginBottom: '0.8rem', textShadow: '2px 2px 0 #000', textAlign: 'center' }}>🎯 Spielziel</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>⚙️</span><span>Sammle alle Zahnräder im Level</span>
              </li>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>❤️</span><span>Vermeide Fallen und Gegner</span>
              </li>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>🏁</span><span>Erreiche das Ziel schnellstmöglich</span>
              </li>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>🪙</span><span>Verdiene Münzen für den Shop</span>
              </li>
            </ul>
          </div>

          {/* Features Section */}
          <div style={{ background: 'rgba(139, 69, 19, 0.7)', border: '3px solid #8B4513', padding: '1rem', boxShadow: '4px 4px 0 #5D2E0C' }}>
            <h2 style={{ fontSize: '0.8rem', color: '#D2691E', fontFamily: 'Press Start 2P, cursive', marginBottom: '0.8rem', textShadow: '2px 2px 0 #000', textAlign: 'center' }}>✨ Features</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>🎨</span><span>5 einzigartige Skins</span>
              </li>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>🏆</span><span>10 herausfordernde Level</span>
              </li>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>🛒</span><span>Shop-System mit Upgrades</span>
              </li>
              <li style={{ fontSize: '0.45rem', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ minWidth: '25px', textAlign: 'center' }}>📊</span><span>Globale Bestenliste</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tips Section - Full Width */}
        <div style={{ background: 'rgba(139, 69, 19, 0.7)', border: '3px solid #D2691E', padding: '0.8rem', boxShadow: '4px 4px 0 #5D2E0C, 0 0 20px rgba(210, 105, 30, 0.3)', width: '100%', maxWidth: '1200px', marginTop: '0.8rem' }}>
          <h2 style={{ fontSize: '0.7rem', color: '#FFD700', fontFamily: 'Press Start 2P, cursive', marginBottom: '0.6rem', textShadow: '2px 2px 0 #000', textAlign: 'center' }}>💡 Profi-Tipps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <p style={{ fontSize: '0.4rem', lineHeight: '1.4', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', textAlign: 'center', margin: 0 }}>Jedes Level hat versteckte Münzen - erkunde jede Ecke!</p>
            <p style={{ fontSize: '0.4rem', lineHeight: '1.4', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', textAlign: 'center', margin: 0 }}>Schalte Fähigkeiten im Shop frei für neue Bewegungs-Optionen!</p>
            <p style={{ fontSize: '0.4rem', lineHeight: '1.4', color: '#F5DEB3', fontFamily: 'Press Start 2P, cursive', textAlign: 'center', margin: 0 }}>Schnelle Zeiten bringen Bonus-Punkte für die Bestenliste!</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginTop: '0.8rem' }}>
          <button
            className="level-btn"
            style={{
              fontSize: '0.8rem',
              padding: '0.8rem 2rem',
              outline: selectedOption === 0 ? '3px solid #FFD700' : 'none',
              boxShadow: selectedOption === 0 ? '0 0 20px #FFD700, 4px 4px 0 #5D2E0C' : '4px 4px 0 #5D2E0C',
              transform: selectedOption === 0 ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
            onClick={onBack}
          >
            Zurück zur Lobby
          </button>

          <div style={{ color: '#CD853F', fontSize: '0.4rem', fontFamily: 'Press Start 2P, cursive', textAlign: 'center' }}>
            Oberer Button / Unterer Button - Zurück
          </div>
        </div>
      </div>
    </div>
  );
};

export default TilliTimianInfo;