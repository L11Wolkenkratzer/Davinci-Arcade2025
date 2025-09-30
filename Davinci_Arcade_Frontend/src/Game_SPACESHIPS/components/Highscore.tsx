import React, { useEffect, useRef, useState } from 'react';
import type { SpaceshipHighscoreEntry } from '../types/gametypes';

interface HighscoreProps {
    highscores: SpaceshipHighscoreEntry[];
    onBack: () => void;
}

const Highscore: React.FC<HighscoreProps> = ({ highscores, onBack }) => {

    // ✅ STATE FÜR SCROLL-NAVIGATION
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

    // ✅ PFEIL-NAVIGATION
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
        <div className="spaceship-highscore">
            <div className="spaceship-highscore-title">
                HIGHSCORES
            </div>

            <div className="spaceship-highscore-content">
                {highscores.length > 0 ? (
                    <div className="spaceship-highscore-list" ref={listRef}>
                        {highscores.map((entry, i) => (
                            <div
                                key={entry._id || i}
                                ref={el => { entryRefs.current[i] = el; }}
                                className={`spaceship-highscore-entry rank-${i + 1} ${i === selectedIndex ? 'keyboard-selected' : ''}`}
                            >
                                <div className="spaceship-rank">
                                    #{i + 1}
                                </div>

                                <div className="spaceship-name">
                                    {entry.playerId?.name?.length > 20
                                        ? entry.playerId.name.substring(0, 20) + "..."
                                        : entry.playerId?.name || 'Unknown Pilot'
                                    }
                                </div>

                                <div className="spaceship-score">
                                    {entry.score.toLocaleString()}
                                </div>

                                <div className="spaceship-level">
                                    L{entry.level || 1}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="spaceship-no-scores">
                        No pilots have entered the hall of fame yet.
                        <br />
                        Be the first to leave your mark!
                    </div>
                )}
            </div>

            <div className="spaceship-highscore-controls">
                <button
                    className={`menu-item ${selectedIndex === -1 ? 'keyboard-selected' : ''}`}
                    onClick={onBack}
                >
                    Back to Main Menu
                </button>
            </div>
        </div>
    );
};

export default Highscore;
