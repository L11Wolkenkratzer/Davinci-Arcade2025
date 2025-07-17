import React, { useEffect, useRef } from 'react';
import { PacManPhaserGame, type GameConfig } from './PacManPhaser';
import './PacManGame.css'; // Importiere das CSS

interface PacManGameProps {
    onBack?: () => void;
    onGameComplete?: (score: number, won: boolean) => void;
}

const PacManGame: React.FC<PacManGameProps> = ({ onBack, onGameComplete }) => {
    const gameRef = useRef<HTMLDivElement>(null);
    const phaserGameRef = useRef<PacManPhaserGame | null>(null);

    useEffect(() => {
        if (gameRef.current && !phaserGameRef.current) {
            const config: GameConfig = {
                onBack,
                onGameComplete
            };

            phaserGameRef.current = new PacManPhaserGame(gameRef.current, config);
        }

        return () => {
            if (phaserGameRef.current) {
                phaserGameRef.current.destroy();
                phaserGameRef.current = null;
            }
        };
    }, [onBack, onGameComplete]);

    return (
        <div className="pacman-game">
            <div className="canvas-container">
                <div
                    ref={gameRef}
                    className="pacman-game-container"
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        zIndex: 10
                    }}
                />
            </div>
        </div>
    );
};

export default PacManGame;
