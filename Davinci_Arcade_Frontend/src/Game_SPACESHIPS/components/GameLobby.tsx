// components/GameLobby.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

    const menuItems = [
        { label: 'START GAME', action: onStartGame },
        { label: 'SHOP', action: onOpenShop },
        { label: 'SHIP MANAGER', action: onOpenShipManager },
        { label: 'HIGHSCORE', action: onOpenHighscore },
        { label: 'INFO', action: onOpenInfo },
        { label: 'EXIT', action: onExit }
    ];

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : menuItems.length - 1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => prev < menuItems.length - 1 ? prev + 1 : 0);
                break;
            case 'Enter':
                event.preventDefault();
                menuItems[selectedIndex].action();
                break;
        }
    }, [selectedIndex, menuItems]);

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
                            onClick={item.action}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="lobby-footer">
                    <p style={{ fontSize: '0.8rem', color: '#0ff', textAlign: 'center' }}>Use Joystick arrows to navigate, bottom Button to select</p>
                </div>
            </div>
        </div>
    );
};

export default GameLobby;

