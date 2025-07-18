// components/Info.tsx
import React, { useEffect, useCallback } from 'react';


interface InfoProps {
    onBack: () => void;
}

const Info: React.FC<InfoProps> = ({ onBack }) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const infoContentRef = React.useRef<HTMLDivElement>(null);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        const scrollAmount = 60; // px
        const infoDiv = infoContentRef.current;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (infoDiv && infoDiv.scrollHeight > infoDiv.clientHeight) {
                event.preventDefault();
                if (event.key === 'ArrowDown') {
                    infoDiv.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                } else {
                    infoDiv.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
                }
                return;
            }
        }
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + 1) % 1); // only one button, stays 0
                break;
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % 1); // only one button, stays 0
                break;
            case 'Enter':
            case 'Escape':
                event.preventDefault();
                onBack();
                break;
        }
    }, [onBack]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return (
        <div className="game-container">
            <div className="info">
                <div className="info-header">
                    <h1>GAME INFO</h1>
                </div>

                <div className="info-content" ref={infoContentRef}>
                    <div className="info-section">
                        <h2>OBJECTIVE</h2>
                        <p>Pilot your spaceship through the asteroid field and survive as long as possible!</p>
                    </div>

                    <div className="info-section">
                        <h2>CONTROLS</h2>
                        <div className="controls-list">
                            <div className="control-item">
                                <span className="key">↑↓←→</span>
                                <span className="description">Move ship</span>
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

                <div className="info-controls" style={{ marginTop: '7rem' }}>
                    <button
                        className={selectedIndex === 0 ? 'exit-button selected' : 'exit-button'}
                        style={{
                            padding: '1rem 2.5rem',
                            fontFamily: 'Press Start 2P, cursive',
                            fontSize: '1rem',
                            borderRadius: '10px',
                            border: '2px solid #b90a10ff',
                            background: '#111',
                            color: '#b90a10ff',
                            cursor: 'pointer',
                            outline: selectedIndex === 0 ? '2px solid #d85156ff' : 'none',
                            margin: '0 auto',
                            display: 'block',
                            boxShadow: selectedIndex === 0 ? '0 0 20px #ca4449ff' : 'none',
                            transition: 'all 0.2s',
                        }}
                        onClick={onBack}
                        tabIndex={0}
                    >
                        EXIT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Info;
