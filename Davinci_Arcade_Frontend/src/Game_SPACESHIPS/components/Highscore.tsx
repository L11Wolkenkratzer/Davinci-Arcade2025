// components/Highscore.tsx
import React, { useState, useEffect, useCallback } from 'react';

import type {HighscoreEntry} from '../types/gametypes.ts';

interface HighscoreProps {
    highscores: HighscoreEntry[];
    onBack: () => void;
}

const Highscore: React.FC<HighscoreProps> = ({ highscores, onBack }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    // Nur ein Button, aber für spätere Erweiterung vorbereitet
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
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
            <div className="highscore">
                <div className="highscore-header">
                    <h1>HALL OF FAME</h1>
                </div>

                <div className="highscore-list">
                    {highscores.map((entry, index) => (
                        <div key={entry._id || index} className="highscore-entry">
                            <span className="rank">#{index + 1}</span>
                            <span className="name">
                                {entry.playerId?.name || 'Unknown Player'}
                            </span>
                            <span className="score">{entry.score}</span>
                            <span className="date">
                                {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="highscore-controls" style={{ marginTop: '7rem' }}>
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

export default Highscore;
