// components/ShipManager.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

import type {Ship} from '../types/gametypes.ts';

interface ShipManagerProps {
    ships: Ship[];
    currentShip: Ship;
    onEquipShip: (shipId: string) => void;
    onBack: () => void;
}

const ShipManager: React.FC<ShipManagerProps> = ({
                                                     ships,
                                                     currentShip,
                                                     onEquipShip,
                                                     onBack
                                                 }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const ownedShips = ships.filter(ship => ship.owned);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const listRef = useRef<HTMLDivElement>(null);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp': {
                event.preventDefault();
                if (selectedIndex === -1) {
                    setSelectedIndex(ownedShips.length - 1);
                } else if (selectedIndex > 0) {
                    setSelectedIndex(selectedIndex - 1);
                } else if (selectedIndex === 0 && ownedShips.length > 0) {
                    setSelectedIndex(-1); // EXIT button
                }
                break;
            }
            case 'ArrowDown': {
                event.preventDefault();
                if (selectedIndex === -1) {
                    setSelectedIndex(0);
                } else if (selectedIndex < ownedShips.length - 1) {
                    setSelectedIndex(selectedIndex + 1);
                } else if (selectedIndex === ownedShips.length - 1) {
                    setSelectedIndex(-1); // EXIT button
                }
                break;
            }
            case 'Enter':
                event.preventDefault();
                if (selectedIndex === -1) {
                    onBack();
                } else if (ownedShips[selectedIndex]) {
                    onEquipShip(ownedShips[selectedIndex].id);
                }
                break;
            case 'Escape':
                event.preventDefault();
                onBack();
                break;
        }
    }, [selectedIndex, ownedShips, onEquipShip, onBack]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
        // Scroll to selected on mount or when selectedIndex changes
        itemRefs.current[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [selectedIndex, ownedShips.length]);

    return (
        <div className="game-container">
            <div className="ship-manager">
                <div className="manager-header">
                    <h1>SHIP MANAGER</h1>
                    <p>Current Ship: {currentShip.name}</p>
                </div>

                <div className="ship-list" ref={listRef} style={{ maxHeight: 350, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {ownedShips.map((ship, index) => (
                        <div
                            key={ship.id}
                            ref={el => { itemRefs.current[index] = el; }}
                            className={`ship-item ${index === selectedIndex ? 'selected' : ''} ${ship.equipped ? 'equipped' : ''}`}
                            onClick={() => {
                                setSelectedIndex(index);
                                onEquipShip(ship.id);
                            }}
                        >
                            <img src={ship.icon} alt={ship.name} className="ship-icon" />
                            <div className="ship-details">
                                <h3>{ship.name}</h3>
                                <div className="ship-stats">
                                    <div className="stat">
                                        <span>Health:</span>
                                        <div className="stat-bar">
                                            <div
                                                className="stat-fill health"
                                                style={{ width: `${(ship.maxHealth / 200) * 100}%` }}
                                            />
                                        </div>
                                        <span>{ship.maxHealth}</span>
                                    </div>
                                    <div className="stat">
                                        <span>Speed:</span>
                                        <div className="stat-bar">
                                            <div
                                                className="stat-fill speed"
                                                style={{ width: `${(ship.speed / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span>{ship.speed}</span>
                                    </div>
                                    <div className="stat">
                                        <span>Fire Rate:</span>
                                        <div className="stat-bar">
                                            <div
                                                className="stat-fill fire-rate"
                                                style={{ width: `${(ship.fireRate / 20) * 100}%` }}
                                            />
                                        </div>
                                        <span>{ship.fireRate}</span>
                                    </div>
                                    <div className="stat">
                                        <span>Damage:</span>
                                        <div className="stat-bar">
                                            <div
                                                className="stat-fill damage"
                                                style={{ width: `${(ship.damage / 50) * 100}%` }}
                                            />
                                        </div>
                                        <span>{ship.damage}</span>
                                    </div>
                                </div>
                            </div>
                            {ship.equipped && (
                                <div className="equipped-badge">EQUIPPED</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="manager-controls" style={{ marginTop: '4rem' }}>
                <button
                    className={selectedIndex === -1 ? 'exit-button selected' : 'exit-button'}
                    style={{
                        padding: '1rem 2.5rem',
                        fontFamily: 'Press Start 2P, cursive',
                        fontSize: '1rem',
                        borderRadius: '10px',
                        border: '2px solid #b90a10ff',
                        background: '#111',
                        color: '#b90a10ff',
                        cursor: 'pointer',
                        outline: selectedIndex === -1 ? '2px solid #d85156ff' : 'none',
                        margin: '0 auto',
                        display: 'block',
                        boxShadow: selectedIndex === -1 ? '0 0 20px #ca4449ff' : 'none',
                        transition: 'all 0.2s',
                    }}
                    onClick={onBack}
                    tabIndex={0}
                >
                    EXIT
                </button>
            </div>
            
        </div>
    );
};

export default ShipManager;
