import React, { useState, useEffect, useCallback } from 'react';
import type {HighscoreEntry} from '../types/gametypes.ts';

interface HighscoreProps {
    highscores: HighscoreEntry[];
    onBack: () => void;
}

const Highscore: React.FC<HighscoreProps> = ({ highscores, onBack }) => {
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
        <div className="highscore">
            <div className="highscore-header">
                <h1>HALL OF FAME</h1>
            </div>

            <div className="highscore-list">
                {highscores.map((entry, index) => (
                    <div key={index} className="highscore-entry">
                        <span className="rank">#{index + 1}</span>
                        <span className="name">{entry.name}</span>
                        <span className="score">{entry.score}</span>
                        <span className="date">{entry.date}</span>
                    </div>
                ))}
            </div>

            <div className="highscore-controls">
                <p>ESC/ENTER: Back</p>
            </div>
        </div>
    );
};

export default Highscore;
