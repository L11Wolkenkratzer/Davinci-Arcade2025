import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Game } from './engine/Game';
import { tilliApi } from './api/tilliApi';
import './Tilliman.css';

// Player type definition (matching App.tsx)
type Player = {
  _id: string;
  badgeId: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string;
  updatedAt?: string;
  createdAt?: string;
  __v?: number;
} | null;

interface TillimanProps {
  currentPlayer: Player;
}

export const Tilliman: React.FC<TillimanProps> = ({ currentPlayer }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete'>('playing');

    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [collectedGears, setCollectedGears] = useState(0);
    
    // Simplified - only currentPlayer, no separate profile
    const [currentLevel, setCurrentLevel] = useState(1);
    const [startTime, setStartTime] = useState(Date.now());
    const [enemiesDefeated, setEnemiesDefeated] = useState(0);
    const [deaths, setDeaths] = useState(0);
    
    // Keyboard navigation for Game Over screen
    const [gameOverSelectedOption, setGameOverSelectedOption] = useState(0); // 0 = restart, 1 = home


    // Smart navigation handler für Game Over
    const handleReturnToHome = () => {
        navigate('/tillimanhome');
    };
    
    const handleGameOver = async () => {
        setGameState('gameOver');
        setDeaths(deaths + 1);
        
        // Save game stats to backend - simplified
        if (currentPlayer) {
            try {
                const playTime = (Date.now() - startTime) / 1000;
                
                console.log('💀 Game Over - saving stats for:', currentPlayer.badgeId);
                
                const result = await tilliApi.completeLevel({
                    level: currentLevel,
                    score: score,
                    gearsCollected: collectedGears,
                    enemiesDefeated: enemiesDefeated,
                    deaths: deaths + 1,
                    playTime: playTime,
                    completionTime: playTime,
                    completed: false // Game over = not completed
                });
                
                console.log('✅ Game over data saved successfully');
            } catch (error) {
                console.error('❌ Failed to save game stats:', error);
                // Show user-friendly message
                alert('Spielstand konnte nicht gespeichert werden. Bitte versuche es erneut.');
            }
        } else {
            console.warn('⚠️ No currentPlayer - game over without saving');
        }
    };
    
    const handleLevelComplete = async () => {
        setGameState('levelComplete');
        
        // Save level completion to backend - simplified
        if (currentPlayer) {
            try {
                const completionTime = (Date.now() - startTime) / 1000;
                
                console.log(`🎉 Level ${currentLevel} completed!`);
                console.log(`Score: ${score}, Gears: ${collectedGears}, Enemies: ${enemiesDefeated}, Deaths: ${deaths}`);
                console.log(`Current Player: ${currentPlayer.badgeId}`);
                
                const result = await tilliApi.completeLevel({
                    level: currentLevel,
                    score: score,
                    gearsCollected: collectedGears,
                    enemiesDefeated: enemiesDefeated,
                    deaths: deaths,
                    playTime: completionTime,
                    completionTime: completionTime,
                    completed: true // Level actually completed
                });
                
                console.log(`✅ Level completed and saved successfully!`);
                
                // Show success message with earned coins
                if (result.coinsEarned > 0) {
                    alert(`Level abgeschlossen! +${result.coinsEarned} Münzen erhalten!`);
                }
                
                // SENIOR DEV FIX: Auto-advance to next level instead of returning to lobby
                setTimeout(() => {
                    const nextLevel = currentLevel + 1;
                    const maxLevel = 10; // Total levels available in LevelData.ts
                    
                    if (nextLevel <= maxLevel) {
                        console.log(`🚀 Auto-advancing to Level ${nextLevel}`);
                        setCurrentLevel(nextLevel);
                        
                        // Advance to next level using the new method
                        if (gameRef.current) {
                            console.log(`🚀 Advancing to Level ${nextLevel} using advanceToLevel()`);
                            
                            // Reset React state
                            setStartTime(Date.now());
                            setScore(0);
                            setLives(3);
                            setCollectedGears(0);
                            setEnemiesDefeated(0);
                            setDeaths(0);
                            setGameState('playing'); // CRITICAL: Set game state back to playing
                            
                            // Use the new advanceToLevel method - this handles everything internally
                            gameRef.current.advanceToLevel(nextLevel);
                        }
                    } else {
                        console.log('🎉 All levels completed - returning to lobby');
                        // All levels completed, return to lobby
                        navigate('/tillimanhome', {
                            state: { 
                                gameCompleted: true,
                                finalScore: score 
                            }
                        });
                    }
                }, 3000);
                
            } catch (error) {
                console.error('❌ Failed to save level completion:', error);
                alert('Level-Fortschritt konnte nicht gespeichert werden. Bitte versuche es erneut.');
                setTimeout(() => {
                    setGameState('playing');
                }, 3000);
            }
        } else {
            console.warn('⚠️ No currentPlayer available - authentication required');
            alert('Bitte melde dich an, um deinen Fortschritt zu speichern.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };
    
    // Simplified handlers - no longer needed
    const handleProfileUpdate = () => {
        // Removed - no profile system anymore
    };
    
    const handleLevelUnlock = (level: number) => {
        console.log(`Level ${level} unlocked!`);
    };


    // SENIOR DEV APPROACH: Separate concerns and fix race conditions
    
    // 1. Initialize localStorage sync (run once per currentPlayer)
    useEffect(() => {
        if (!currentPlayer) {
            console.warn('⚠️ No currentPlayer available in Tilliman');
            alert('Keine Spielerdaten verfügbar. Bitte melde dich erneut an.');
            navigate('/login');
            return;
        }

        // Sync currentPlayer with localStorage for playerManager compatibility
        console.log('🔄 Syncing currentPlayer with localStorage:', currentPlayer.badgeId);
        localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
        localStorage.setItem('playerBadgeId', currentPlayer.badgeId);
        localStorage.setItem('playerName', currentPlayer.name);
        console.log('✅ localStorage synchronized');
    }, [currentPlayer, navigate]);

    // 2. Handle level initialization from navigation state (run once per location change)
    useEffect(() => {
        const stateData = location.state as any;
        const targetLevel = stateData?.selectedLevel || 1;
        
        console.log('🎯 LEVEL INITIALIZATION:', {
            navigationState: stateData?.selectedLevel,
            targetLevel: targetLevel,
            currentLevelBefore: currentLevel
        });
        
        setCurrentLevel(targetLevel);
        console.log('📍 Level set to:', targetLevel);
    }, [location.state]);

    // 3. Initialize game engine (run only when currentLevel is stable)
    useEffect(() => {
        if (!currentPlayer || !canvasRef.current || gameRef.current) {
            return; // Skip if dependencies not ready or game already exists
        }

        console.log('🎮 GAME INITIALIZATION:', {
            currentPlayer: currentPlayer.badgeId,
            currentLevel: currentLevel,
            canvasReady: !!canvasRef.current,
            gameExists: !!gameRef.current
        });

        const gameOptions = {
            onScoreChange: setScore,
            onLivesChange: setLives,
            onGearsCollected: setCollectedGears,
            onGameOver: handleGameOver,
            onLevelComplete: handleLevelComplete,
            onReturnToHome: handleReturnToHome,
            playerProfile: {
                badgeId: currentPlayer.badgeId,
                name: currentPlayer.name,
                equippedSkin: 'classic',
                ownedAbilities: [],
                currentLevel: currentLevel, // Use stable currentLevel state
                unlockedLevels: [1, 2, 3, 4, 5] // Simplified - all levels unlocked
            },
            onProfileUpdate: () => {}, // Simplified - no profile updates
            onLevelUnlock: () => {} // Simplified - no level unlocking
        };
        
        console.log('🚀 Creating game with level:', currentLevel);
        const game = new Game(canvasRef.current, gameOptions);
        gameRef.current = game;
        
        // CRITICAL: Load level AFTER game is fully initialized
        console.log('📥 Loading level into game engine:', currentLevel);
        game.getLevelManager().loadLevel(currentLevel);
        
        // Start the game
        game.start();
        setStartTime(Date.now());
        
        console.log('✅ Game started with level:', currentLevel);

        return () => {
            console.log('🧹 Cleaning up game instance');
            if (gameRef.current) {
                gameRef.current.destroy();
                gameRef.current = null;
            }
        };

    }, [currentPlayer, currentLevel]); // Depend on stable currentLevel

    // Keyboard navigation for Game Over screen
    useEffect(() => {
        if (gameState !== 'gameOver') return;

        const handleGameOverKeyPress = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    setGameOverSelectedOption(0); // Select "Nochmal spielen"
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    setGameOverSelectedOption(1); // Select "Zurück zur Lobby"
                    break;
                case 'Enter':
                case ' ': // Space
                    event.preventDefault();
                    if (gameOverSelectedOption === 0) {
                        restartGame();
                    } else {
                        handleReturnToHome();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleGameOverKeyPress);

        // Reset selection when entering game over state
        setGameOverSelectedOption(0);

        return () => {
            window.removeEventListener('keydown', handleGameOverKeyPress);
        };
    }, [gameState, gameOverSelectedOption]);

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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '30px' }}>
                                <p style={{ fontSize: '12px', color: '#0ff', marginBottom: '10px' }}>
                                    ← → Auswählen • Enter Bestätigen
                                </p>
                                
                                <button
                                    className="game-button"
                                    style={{ 
                                        fontFamily: 'Press Start 2P, cursive',
                                        backgroundColor: gameOverSelectedOption === 0 ? '#0ff' : 'transparent',
                                        color: gameOverSelectedOption === 0 ? '#000' : '#0ff',
                                        border: gameOverSelectedOption === 0 ? '2px solid #0ff' : '2px solid #0ff',
                                        transform: gameOverSelectedOption === 0 ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        boxShadow: gameOverSelectedOption === 0 ? '0 0 20px #0ff' : 'none'
                                    }}
                                    onClick={restartGame}
                                >
                                    {gameOverSelectedOption === 0 ? '► ' : '  '}Nochmal spielen
                                </button>
                                
                                <button
                                    className="game-button"
                                    style={{ 
                                        fontFamily: 'Press Start 2P, cursive',
                                        backgroundColor: gameOverSelectedOption === 1 ? '#0ff' : 'transparent',
                                        color: gameOverSelectedOption === 1 ? '#000' : '#0ff',
                                        border: gameOverSelectedOption === 1 ? '2px solid #0ff' : '2px solid #0ff',
                                        transform: gameOverSelectedOption === 1 ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        boxShadow: gameOverSelectedOption === 1 ? '0 0 20px #0ff' : 'none'
                                    }}
                                    onClick={handleReturnToHome}
                                >
                                    {gameOverSelectedOption === 1 ? '► ' : '  '}Zurück zur Lobby
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
