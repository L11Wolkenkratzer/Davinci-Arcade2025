import React, { useState, useEffect, useCallback, useRef } from 'react';

import type {Ship} from '../types/gametypes.ts';
import type {Upgrade} from '../types/gametypes.ts';


interface ShopProps {
    ships: Ship[];
    coins: number;
    onBuyShip: (shipId: string) => boolean;
    onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({
    ships,
    coins,
    onBuyShip,
    onBack
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const availableShips = ships.filter(ship => !ship.owned);
    const currentItems = availableShips;

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp': {
                event.preventDefault();
                if (selectedIndex === -1) {
                    setSelectedIndex(currentItems.length - 1);
                } else if (selectedIndex > 0) {
                    setSelectedIndex(selectedIndex - 1);
                } else if (selectedIndex === 0 && currentItems.length > 0) {
                    setSelectedIndex(-1); // EXIT button
                }
                break;
            }
            case 'ArrowDown': {
                event.preventDefault();
                if (selectedIndex === -1) {
                    setSelectedIndex(0);
                } else if (selectedIndex < currentItems.length - 1) {
                    setSelectedIndex(selectedIndex + 1);
                } else if (selectedIndex === currentItems.length - 1) {
                    setSelectedIndex(-1); // EXIT button
                }
                break;
            }
            case 'Enter':
                event.preventDefault();
                if (selectedIndex === -1) {
                    onBack();
                } else if (currentItems[selectedIndex]) {
                    const item = currentItems[selectedIndex];
                    onBuyShip(item.id);
                }
                break;
            case 'Escape':
                event.preventDefault();
                onBack();
                break;
        }
    }, [selectedIndex, currentItems, onBuyShip, onBack]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
        if (selectedIndex >= currentItems.length) {
            setSelectedIndex(Math.max(0, currentItems.length - 1));
        }
    }, [selectedIndex, currentItems.length]);

    // Refs für Scroll-Container und Items
    const shopListRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [selectedIndex]);

    return (
        <>
            <div className="shop">
                <div className="shop-header">
                    <h1>GALACTIC SHOP</h1>
                    <div className="coins-display">
                        <span>COINS: {coins}</span>
                    </div>
                </div>

                <div className="shop-tabs">
                    <button
                        className={`tab active`}
                        style={{ pointerEvents: 'none', opacity: 0.7 }}
                    >
                        SHIPS
                    </button>
                </div>

                <div className="shop-content">
                    {currentItems.length === 0 ? (
                        <div className="empty-shop">
                            <p>ALL SHIPS PURCHASED!</p>
                        </div>
                    ) : (
                        <div className="shop-items" ref={shopListRef} style={{ maxHeight: 350, overflowY: 'auto', scrollbarWidth: 'none' }}>
                            {currentItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    ref={el => { itemRefs.current[index] = el; }}
                                    className={`shop-item ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        onBuyShip(item.id);
                                    }}
                                >
                                    <div className="ship-item">
                                        <img src={item.icon} alt={item.name} className="ship-icon shop-ship-icon" />
                                        <div className="ship-info">
                                            <h3>{item.name}</h3>
                                            <div className="ship-stats">
                                                <span>Health: {item.maxHealth}</span>
                                                <span>Speed: {item.speed}</span>
                                                <span>Fire Rate: {item.fireRate}</span>
                                                <span>Damage: {item.damage}</span>
                                            </div>
                                        </div>
                                        <div className="price">
                                            <span className={coins >= item.cost ? 'affordable' : 'expensive'}>
                                                {item.cost} COINS
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="shop-controls" style={{ marginTop: '4rem' }}>
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
        </>
    );
}
export default Shop;
