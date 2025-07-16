import React, { useEffect, useCallback } from 'react';

interface InfoProps {
    onBack: () => void;
}

const Info: React.FC<InfoProps> = ({ onBack }) => {
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
            event.preventDefault();
            onBack();
        }
    }, [onBack]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return (
        <div className="info">
            <div className="info-header">
                <h1>GAME INFO</h1>
            </div>

            <div className="info-content">
                <div className="info-section">
                    <h2>OBJECTIVE</h2>
                    <p>Pilot your spaceship through the asteroid field and survive as long as possible!</p>
                </div>

                <div className="info-section">
                    <h2>CONTROLS</h2>
                    <div className="controls-list">
                        <div className="control-item">
                            <span className="key">↑↓</span>
                            <span className="description">Move ship up/down</span>
                        </div>
                        <div className="control-item">
                            <span className="key">SPACE/ENTER</span>
                            <span className="description">Shoot</span>
                        </div>
                        <div className="control-item">
                            <span className="key">ESC</span>
                            <span className="description">Pause/Back</span>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h2>GAMEPLAY</h2>
                    <ul>
                        <li>Destroy asteroids to earn points and coins</li>
                        <li>Avoid collisions or lose health</li>
                        <li>Use coins to buy new ships and upgrades</li>
                        <li>Each level increases difficulty</li>
                        <li>Survive as long as possible for high scores</li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>SHOP & UPGRADES</h2>
                    <ul>
                        <li>Buy faster, stronger ships</li>
                        <li>Purchase upgrades for better performance</li>
                        <li>Equip different ships in Ship Manager</li>
                        <li>Earn coins by destroying asteroids</li>
                    </ul>
                </div>
            </div>

            <div className="info-controls">
                <p>ESC/ENTER: Back to Menu</p>
            </div>
        </div>
    );
};

export default Info;
