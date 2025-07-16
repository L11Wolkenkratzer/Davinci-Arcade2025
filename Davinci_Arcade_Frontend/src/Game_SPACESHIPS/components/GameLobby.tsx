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
}

const GameLobby: React.FC<GameLobbyProps> = ({
                                                 onStartGame,
                                                 onOpenShop,
                                                 onOpenShipManager,
                                                 onOpenHighscore,
                                                 onOpenInfo,
                                                 onExit,
                                                 coins,
                                                 currentShip
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
        <div className="game-lobby">
            <div className="lobby-header">
                <h1 className="game-title">SPACESHIPS</h1>
                <div className="ship-preview">
                    <div className="ship-icon">{currentShip.icon}</div>
                    <div className="ship-name">{currentShip.name}</div>
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
                <p>Use ↑↓ arrows to navigate, ENTER to select</p>
            </div>
        </div>
    );
};

export default GameLobby;
