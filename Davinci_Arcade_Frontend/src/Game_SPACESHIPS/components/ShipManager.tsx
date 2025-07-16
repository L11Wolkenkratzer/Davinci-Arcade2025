import React, { useState, useEffect, useCallback } from 'react';
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

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : ownedShips.length - 1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => prev < ownedShips.length - 1 ? prev + 1 : 0);
                break;
            case 'Enter':
                event.preventDefault();
                if (ownedShips[selectedIndex]) {
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

    return (
        <div className="ship-manager">
            <div className="manager-header">
                <h1>SHIP MANAGER</h1>
                <p>Current Ship: {currentShip.name}</p>
            </div>

            <div className="ship-list">
                {ownedShips.map((ship, index) => (
                    <div
                        key={ship.id}
                        className={`ship-item ${index === selectedIndex ? 'selected' : ''} ${ship.equipped ? 'equipped' : ''}`}
                        onClick={() => {
                            setSelectedIndex(index);
                            onEquipShip(ship.id);
                        }}
                    >
                        <div className="ship-icon">{ship.icon}</div>
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

            <div className="manager-controls">
                <p>↑↓: Select | ENTER: Equip | ESC: Back</p>
            </div>
        </div>
    );
};

export default ShipManager;
