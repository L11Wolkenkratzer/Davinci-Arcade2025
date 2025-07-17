import React, { useState, useEffect, useCallback } from 'react';
import type {Ship, Upgrade} from '../types/gametypes.ts';

interface ShopProps {
    ships: Ship[];
    upgrades: Upgrade[];
    coins: number;
    onBuyShip: (shipId: string) => boolean;
    onBuyUpgrade: (upgradeId: string) => boolean;
    onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({
                                       ships,
                                       upgrades,
                                       coins,
                                       onBuyShip,
                                       onBuyUpgrade,
                                       onBack
                                   }) => {
    const [selectedTab, setSelectedTab] = useState<'ships' | 'upgrades'>('ships');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const availableShips = ships.filter(ship => !ship.owned);
    const availableUpgrades = upgrades.filter(upgrade => !upgrade.owned);
    const currentItems = selectedTab === 'ships' ? availableShips : availableUpgrades;

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : Math.max(0, currentItems.length - 1));
                break;
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => prev < currentItems.length - 1 ? prev + 1 : 0);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                setSelectedTab('ships');
                setSelectedIndex(0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                setSelectedTab('upgrades');
                setSelectedIndex(0);
                break;
            case 'Enter':
                event.preventDefault();
                if (currentItems[selectedIndex]) {
                    const item = currentItems[selectedIndex];
                    if (selectedTab === 'ships') {
                        onBuyShip(item.id);
                    } else {
                        onBuyUpgrade(item.id);
                    }
                }
                break;
            case 'Escape':
                event.preventDefault();
                onBack();
                break;
        }
    }, [selectedTab, selectedIndex, currentItems, onBuyShip, onBuyUpgrade, onBack]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
        if (selectedIndex >= currentItems.length) {
            setSelectedIndex(Math.max(0, currentItems.length - 1));
        }
    }, [selectedIndex, currentItems.length]);

    return (
        <div className="shop">
            <div className="shop-header">
                <h1>GALACTIC SHOP</h1>
                <div className="coins-display">
                    <span>COINS: {coins}</span>
                </div>
            </div>

            <div className="shop-tabs">
                <button
                    className={`tab ${selectedTab === 'ships' ? 'active' : ''}`}
                    onClick={() => { setSelectedTab('ships'); setSelectedIndex(0); }}
                >
                    SHIPS
                </button>
                <button
                    className={`tab ${selectedTab === 'upgrades' ? 'active' : ''}`}
                    onClick={() => { setSelectedTab('upgrades'); setSelectedIndex(0); }}
                >
                    UPGRADES
                </button>
            </div>

            <div className="shop-content">
                {currentItems.length === 0 ? (
                    <div className="empty-shop">
                        <p>ALL ITEMS PURCHASED!</p>
                    </div>
                ) : (
                    <div className="shop-items">
                        {currentItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`shop-item ${index === selectedIndex ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedIndex(index);
                                    if (selectedTab === 'ships') {
                                        onBuyShip(item.id);
                                    } else {
                                        onBuyUpgrade(item.id);
                                    }
                                }}
                            >
                                {selectedTab === 'ships' ? (
                                    <div className="ship-item">
                                        <div className="ship-icon">{(item as Ship).icon}</div>
                                        <div className="ship-info">
                                            <h3>{item.name}</h3>
                                            <div className="ship-stats">
                                                <span>Health: {(item as Ship).maxHealth}</span>
                                                <span>Speed: {(item as Ship).speed}</span>
                                                <span>Fire Rate: {(item as Ship).fireRate}</span>
                                                <span>Damage: {(item as Ship).damage}</span>
                                            </div>
                                        </div>
                                        <div className="price">
                                            <span className={coins >= item.cost ? 'affordable' : 'expensive'}>
                                                {item.cost} COINS
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upgrade-item">
                                        <div className="upgrade-info">
                                            <h3>{item.name}</h3>
                                            <p>{(item as Upgrade).description}</p>
                                        </div>
                                        <div className="price">
                                            <span className={coins >= item.cost ? 'affordable' : 'expensive'}>
                                                {item.cost} COINS
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="shop-controls">
                <p>←→: Switch tabs | ↑↓: Select | ENTER: Buy | ESC: Back</p>
            </div>
        </div>
    );
};

export default Shop;
