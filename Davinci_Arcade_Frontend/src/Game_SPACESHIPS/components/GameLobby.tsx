// components/GameLobby.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../../SettingsContext.tsx';
import type {Ship} from '../types/gametypes.ts';

interface GameLobbyProps {
    onStartGame: () => void;
    onOpenShop: () => void;
    onOpenShipManager: () => void;
    onOpenHighscore: () => void;
    onOpenInfo: () => void;
    onExit: () => void;
    coins: number;
    currentShip: Ship;
    upgrades?: import('../types/gametypes').Upgrade[];
}

const GameLobby: React.FC<GameLobbyProps> = ({
                                                 onStartGame,
                                                 onOpenShop,
                                                 onOpenShipManager,
                                                 onOpenHighscore,
                                                 onOpenInfo,
                                                 onExit,
                                                 coins,
                                                 currentShip,
                                                 upgrades
                                             }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { volume } = useAudio();

    // Sound-Referenzen für Menü-Sounds
    const soundsRef = React.useRef<{ [key: string]: HTMLAudioElement | undefined }>({});

    const menuItems = [
        { label: 'START GAME', action: onStartGame },
        { label: 'SHOP', action: onOpenShop },
        { label: 'SHIP MANAGER', action: onOpenShipManager },
        { label: 'HIGHSCORE', action: onOpenHighscore },
        { label: 'INFO', action: onOpenInfo },
        { label: 'EXIT', action: onExit }
    ];

    // Audio-Initialisierung
    useEffect(() => {
        // Pacman-Lobby-Sounds
        let menuNavigate: HTMLAudioElement | undefined;
        let menuSelect: HTMLAudioElement | undefined;
        try {
            menuNavigate = new Audio('/Sounds/Pacman/pacman_button switch.mp3');
            menuSelect = new Audio('/Sounds/Pacman/pacman_button click.mp3');
            menuNavigate.volume = (volume / 100) * 0.3;
            menuSelect.volume = (volume / 100) * 0.4;
        } catch {}
        soundsRef.current = { menuNavigate, menuSelect };
    }, [volume]);

    // Lautstärke aktualisieren wenn sich globale Lautstärke ändert
    useEffect(() => {
        if (soundsRef.current.menuNavigate) {
            soundsRef.current.menuNavigate.volume = (volume / 100) * 0.3;
        }
        if (soundsRef.current.menuSelect) {
            soundsRef.current.menuSelect.volume = (volume / 100) * 0.4;
        }
    }, [volume]);

    // Sound-Funktionen
    const playNavigateSound = useCallback(() => {
        if (soundsRef.current.menuNavigate) {
            soundsRef.current.menuNavigate.currentTime = 0;
            soundsRef.current.menuNavigate.play().catch(console.error);
        }
    }, []);

    const playSelectSound = useCallback(() => {
        if (soundsRef.current.menuSelect) {
            soundsRef.current.menuSelect.currentTime = 0;
            soundsRef.current.menuSelect.play().catch(console.error);
        }
    }, []);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => {
                    const newIndex = prev > 0 ? prev - 1 : menuItems.length - 1;
                    return newIndex;
                });
                break;
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => {
                    const newIndex = prev < menuItems.length - 1 ? prev + 1 : 0;
                    return newIndex;
                });
                break;
            case 'Enter':
                event.preventDefault();
                playSelectSound(); // Sound bei Auswahl
                // Kurze Verzögerung damit der Sound abgespielt wird bevor die Aktion ausgeführt wird
                setTimeout(() => {
                    menuItems[selectedIndex].action();
                }, 150);
                break;
        }
    }, [selectedIndex, menuItems, playNavigateSound, playSelectSound]);

    // Click-Handler für Mouse-Interaktion mit Sound
    const handleMenuItemClick = useCallback((action: () => void) => {
        playSelectSound();
        setTimeout(() => {
            action();
        }, 150);
    }, [playSelectSound]);

    const handleMenuItemHover = useCallback((index: number) => {
        if (index !== selectedIndex) {
            setSelectedIndex(index);
        }
    }, [selectedIndex, playNavigateSound]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return (
        <div className="game-container">
            <div className="game-lobby">
                <div className="lobby-header">
                    <h1 className="game-title">SPACESHIPS</h1>
                    <div className="ship-preview">
                        <img src={currentShip.icon} alt={currentShip.name} className="ship-icon" />
                        <div className="ship-name">{currentShip.name}</div>
                        {/* Upgrades anzeigen */}
                        {Array.isArray(upgrades) && upgrades.filter(u => u.owned).length > 0 && (
                            <div style={{ marginTop: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                                {upgrades.filter(u => u.owned).map(u => (
                                    <span key={u.id} title={u.description} style={{
                                        background: '#222',
                                        color: '#b388ff',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        padding: '0.1rem 0.5rem',
                                        boxShadow: '0 0 6px #b388ff',
                                        letterSpacing: '1px',
                                        textShadow: 'none',
                                        cursor: 'help',
                                        border: '1px solid #b388ff',
                                        transition: 'background 0.2s',
                                    }}>{u.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="coins-display">
                        <span className="coins-label">COINS:</span>
                        <span className="coins-amount">{coins}</span>
                    </div>
                </div>

                <div className="menu-container">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            className={`menu-item ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => handleMenuItemClick(item.action)}
                            onMouseEnter={() => handleMenuItemHover(index)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="lobby-footer">
                    <p style={{ fontSize: '0.8rem', color: '#0ff', textAlign: 'center' }}>
                        Use Joystick arrows to navigate, bottom Button to select
                        {/* Debug-Info für Audio (optional - kannst du entfernen) */}
                        <span style={{ fontSize: '0.6rem', color: '#666', display: 'block', marginTop: '0.2rem' }}>
                            Audio Volume: {volume}%
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GameLobby;
