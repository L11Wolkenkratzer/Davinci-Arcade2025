import React, { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { Game } from './engine/Game';
import './Tilliman.css';
    
export const Tilliman: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete'>('playing');

    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [collectedGears, setCollectedGears] = useState(0);


    // Smart navigation handler für Game Over
    const handleReturnToHome = () => {
        navigate('/tillimanhome');
    };


    useEffect(() => {
        if (canvasRef.current && !gameRef.current) {
            const game = new Game(canvasRef.current, {
                onScoreChange: setScore,
                onLivesChange: setLives,
                onGearsCollected: setCollectedGears,
                onGameOver: () => setGameState('gameOver'),
                onLevelComplete: () => {
                    // Show level complete message briefly
                    setGameState('levelComplete');
                    setTimeout(() => {
                        setGameState('playing');
                    }, 3000);

                },
                onReturnToHome: handleReturnToHome
            });
            gameRef.current = game;
            // Spiel direkt starten
            game.start();

        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy();
                gameRef.current = null;
            }
        };

    }, [navigate]);

    const startGame = () => {
       

        if (gameRef.current) {
            gameRef.current.start();
            setGameState('playing');
        }
    };

    const pauseGame = () => {
        if (gameRef.current) {
            if (gameState === 'playing') {
                gameRef.current.pause();
                setGameState('paused');
            } else if (gameState === 'paused') {
                gameRef.current.resume();
                setGameState('playing');
            }
        }
    };

    const restartGame = () => {
        if (gameRef.current) {
            gameRef.current.restart();
            setGameState('playing');
            setScore(0);
            setLives(3);
            setCollectedGears(0);
        }
    };

    return (
        <div className="tilliman-container">
            <div className="game-header">
                <h1>Zeital - Sprung durchs Uhrwerk</h1>
                <div className="game-stats">
                    <div className="stat">
                        <span className="stat-label">Leben:</span>
                        <span className="stat-value">{lives}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Zahnräder:</span>
                        <span className="stat-value">{collectedGears}/3</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Punkte:</span>
                        <span className="stat-value">{score}</span>
                    </div>
                </div>
            </div>

            <div className="game-area">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="game-canvas"
                />


                {gameState === 'menu' && (
                    <div className="game-overlay" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                        <div className="menu-content">
                            <h2>Willkommen zu Zeital!</h2>
                            <p>Hilf Tilli Timian, die Zahnradteile zu sammeln und die Zeit zu reparieren!</p>
                            <div className="controls-info">
                                <h3>Steuerung:</h3>
                                <ul>
                                    <li>← → - Bewegung</li>
                                    <li>Leertaste - Springen</li>
                                    <li>Shift - Dash</li>
                                    <li>P - Pause</li>
                                </ul>
                            </div>
                            <button onClick={startGame} className="game-button" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                                Spiel starten
                            </button>
                        </div>
                    </div>
                )}


                {gameState === 'paused' && (
                    <div className="game-overlay" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                        <div className="pause-content">
                            <h2>Pause</h2>

                            <button
                                className="game-button"
                                style={{ fontFamily: 'Press Start 2P, cursive' }}
                                disabled
                            >

                                Weiter spielen
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'gameOver' && (
                    <div className="game-overlay" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                        <div className="gameover-content">
                            <h2>Game Over</h2>
                            <p>Deine Punktzahl: {score}</p>

                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                                <button
                                    className="game-button"
                                    style={{ fontFamily: 'Press Start 2P, cursive' }}
                                    onClick={restartGame}
                                >
                                    Nochmal spielen
                                </button>
                                <button
                                    className="game-button"
                                    style={{ fontFamily: 'Press Start 2P, cursive' }}
                                    onClick={handleReturnToHome}
                                >
                                    Zurück zur Lobby
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {gameState === 'levelComplete' && (
                    <div className="game-overlay" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                        <div className="levelcomplete-content">
                            <h2>Level Geschafft!</h2>
                            <p>🎉 Alle Zahnräder gesammelt! 🎉</p>
                            <p>Bonus: +500 Punkte</p>
                            <p>Nächstes Level lädt...</p>
                        </div>
                    </div>
                )}
            </div>

            {gameState === 'playing' && (
                <div className="game-controls">

                    <button
                        className="control-button"
                        style={{ fontFamily: 'Press Start 2P, cursive' }}
                        disabled
                    >

                        Pause
                    </button>
                </div>
            )}
        </div>
    );
};
