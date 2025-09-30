import React, { useEffect, useRef, useState } from 'react';
import type { PacmanHighscoreEntry } from '../pacmanTypes';

interface PacmanHighscoreProps {
    highscores: PacmanHighscoreEntry[];
    onBack: () => void;
}

const PacmanHighscore: React.FC<PacmanHighscoreProps> = ({ highscores, onBack }) => {
    // ✅ STATES FÜR KEYBOARD NAVIGATION
    const [selectedIndex, setSelectedIndex] = useState(-1); // -1 = Back Button selected
    const listRef = useRef<HTMLDivElement>(null);
    const entryRefs = useRef<(HTMLDivElement | null)[]>([]);

    // ✅ SCROLL ZU SELECTED ENTRY
    const scrollToSelected = (index: number) => {
        if (index >= 0 && entryRefs.current[index]) {
            entryRefs.current[index]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    };

    // ✅ KEYBOARD NAVIGATION
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
                onBack();
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelectedIndex(prev => {
                    const newIndex = prev <= 0 ? -1 : prev - 1; // -1 = Back Button
                    if (newIndex >= 0) scrollToSelected(newIndex);
                    return newIndex;
                });
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelectedIndex(prev => {
                    const maxIndex = highscores.length - 1;
                    const newIndex = prev >= maxIndex ? -1 : prev + 1;
                    if (newIndex >= 0) scrollToSelected(newIndex);
                    return newIndex;
                });
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onBack, highscores.length]);

    return (
        // ✅ TETRIS-STYLE CONTAINER
        <div className="pacman-highscore-container">
            <div className="pacman-highscore-screen">
                <div className="pacman-highscore-panel">
                    <div className="pacman-highscore-header">
                        <h1 className="pacman-highscore-title">PACMAN LEADERBOARD</h1>
                    </div>

                    <div className="pacman-highscore-list" ref={listRef}>
                        {highscores.length > 0 ? (
                            highscores.map((entry, i) => (
                                <div
                                    key={entry._id || i}
                                    ref={el => { entryRefs.current[i] = el; }}
                                    className={`pacman-highscore-entry position-${i + 1} ${i === selectedIndex ? 'keyboard-selected' : ''}`}
                                >
                                    <div className="pacman-rank">#{i + 1}</div>
                                    <div className="pacman-name">
                                        {entry.playerId?.name?.length > 15
                                            ? entry.playerId.name.substring(0, 15) + "..."
                                            : entry.playerId?.name || 'Unknown Player'
                                        }
                                    </div>
                                    <div className="pacman-score">{entry.score}</div>
                                    <div className="pacman-level">L{entry.level}</div>
                                </div>
                            ))
                        ) : (
                            <div className="pacman-no-scores">
                                <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🟡</div>
                                <div>No Pacman champions yet!</div>
                                <div style={{ fontSize: '0.8em', marginTop: '15px' }}>Be the first to chomp your way to glory!</div>
                            </div>
                        )}
                    </div>

                    <button
                        className={`pacman-btn ${selectedIndex === -1 ? 'selected keyboard-selected' : ''}`}
                        onClick={onBack}
                    >
                        BACK TO MENU
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PacmanHighscore;
