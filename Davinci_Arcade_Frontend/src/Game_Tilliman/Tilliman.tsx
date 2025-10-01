import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudio } from '../SettingsContext.tsx';
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

    
    // Space-Hold für Hauptmenü (2 Sekunden)
    const [spaceHoldProgress, setSpaceHoldProgress] = useState(0); // 0-100 Progress
    const [spaceHoldActive, setSpaceHoldActive] = useState(false);
    const spaceHoldStartTime = useRef<number | null>(null);
    const spaceHoldInterval = useRef<NodeJS.Timeout | null>(null);

    // Audio (wie bei SpaceShips - Musik läuft in allen Screens außer Gameplay)
    const { volume } = useAudio();
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});



    // Smart navigation handler für Game Over
    const handleReturnToHome = () => {
        navigate('/tillimanhome');
    };
    
    const handleGameOver = async () => {
        setGameState('gameOver');
        setDeaths(deaths + 1);
        
        // SENIOR DEV FIX: Game Over = NO backend call!
        // We should NOT call level-complete endpoint on failure
        // Only track stats locally - level completion is ONLY for success
        
        const playTime = (Date.now() - startTime) / 1000;
        
        console.log('💀 GAME OVER - Level FAILED');
        console.log('   Player:', currentPlayer?.badgeId || 'Guest');
        console.log('   Level:', currentLevel, '- Score:', score);
        console.log('   Deaths:', deaths + 1, '- PlayTime:', playTime.toFixed(2), 's');
        console.log('   ⚠️  NO BACKEND CALL - Game Over does not complete level');
        console.log('   ℹ️  Stats tracked locally only');
        
        // Optional: Track stats locally for analytics (if needed later)
        // For now, just log it - no backend persistence on failure
    };
    
    const handleLevelComplete = async () => {
        setGameState('levelComplete');
        
        // Save level completion to backend - CRITICAL: completed: true for successful completion
        if (currentPlayer) {
            try {
                const completionTime = (Date.now() - startTime) / 1000;
                
                console.log(`🎉 LEVEL COMPLETED - Level ${currentLevel} erfolgreich abgeschlossen!`);
                console.log(`   Player: ${currentPlayer.badgeId}`);
                console.log(`   Score: ${score}, Gears: ${collectedGears}, Enemies: ${enemiesDefeated}, Deaths: ${deaths}`);
                console.log(`   ✅ completed: true (Level unlock + Leaderboard)`);
                
                const result = await tilliApi.completeLevel({
                    level: currentLevel,
                    score: score,
                    gearsCollected: collectedGears,
                    enemiesDefeated: enemiesDefeated,
                    deaths: deaths,
                    playTime: completionTime,
                    completionTime: completionTime,
                    completed: true // CRITICAL: Level successfully completed
                });
                
                console.log(`✅ Level completion saved - Next level unlocked!`);
                
            
                
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
            onCollectGear: () => {
                // 🔊 Play collect sound (wie stoneBreak bei SpaceShips)
                if (soundsRef.current.collect) {
                    soundsRef.current.collect.currentTime = 0;
                    soundsRef.current.collect.play().catch(err => console.log('Sound play blocked:', err));
                }
            },
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

    // Hintergrundmusik-Initialisierung (wie bei SpaceShips)
    useEffect(() => {
        if (!bgMusicRef.current) {
            bgMusicRef.current = new window.Audio('/Sounds/TilliBackgroundMusic.mp3');
            bgMusicRef.current.loop = true;
            bgMusicRef.current.volume = (volume / 100) * 0.4;
            bgMusicRef.current.addEventListener('canplaythrough', () => {
                console.log('🎵 Tilliman background music loaded');
            });
            bgMusicRef.current.addEventListener('error', (e) => {
                console.error('❌ Error loading Tilliman background music:', e);
            });
        }
    }, [volume]);

    // Volume Anpassung
    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.volume = (volume / 100) * 0.4;
        }
    }, [volume]);

    // Musik-Steuerung - läuft IMMER (Lobby UND Gameplay)
    useEffect(() => {
        if (!bgMusicRef.current) return;

        // Musik läuft in ALLEN Game States
        bgMusicRef.current.play().catch((error) => {
            console.log('🔇 Background music autoplay blocked:', error);
        });

        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current.currentTime = 0;
            }
        };
    }, [gameState]);

    // Gameplay-Sound-Effekte initialisieren (Navigation-Sound für Zahnrad)
    useEffect(() => {
        const collectSound = new window.Audio('/Sounds/Pacman/pacman_button switch.mp3');
        collectSound.volume = (volume / 100) * 0.3;
        soundsRef.current = { collect: collectSound };
        console.log('🔊 Tilliman gameplay sounds initialized');
    }, []);

    // Volume Anpassung für Sound-Effekte
    useEffect(() => {
        if (soundsRef.current.collect) {
            soundsRef.current.collect.volume = (volume / 100) * 0.3;
        }
    }, [volume]);

    // Reset selection when entering game over state
    useEffect(() => {
        if (gameState === 'gameOver') {
            setGameOverSelectedOption(0);
        }
    }, [gameState]);

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
                    // Use functional update to avoid stale closure
                    setGameOverSelectedOption(current => {
                        if (current === 0) {
                            restartGame();
                        } else {
                            handleReturnToHome();
                        }
                        return current;
                    });
                    break;
            }
        };

        window.addEventListener('keydown', handleGameOverKeyPress);

        return () => {
            window.removeEventListener('keydown', handleGameOverKeyPress);
        };
    }, [gameState]); // FIXED: Removed gameOverSelectedOption from dependencies


    // Space-Hold für Hauptmenü (2 Sekunden) - nur während des Spiels
    useEffect(() => {
        if (gameState !== 'playing') return;

        const handleSpaceHold = (event: KeyboardEvent) => {
            if (event.key === ' ' && event.type === 'keydown' && !event.repeat) {
                // Space gedrückt - Start Hold Timer
                event.preventDefault();
                setSpaceHoldActive(true);
                spaceHoldStartTime.current = Date.now();
                
                // Progress Update Interval (alle 50ms)
                spaceHoldInterval.current = setInterval(() => {
                    if (spaceHoldStartTime.current) {
                        const elapsed = Date.now() - spaceHoldStartTime.current;
                        const progress = Math.min((elapsed / 2000) * 100, 100); // 2000ms = 2 Sekunden
                        setSpaceHoldProgress(progress);
                        
                        // Nach 2 Sekunden -> Tilliman Lobby
                        if (elapsed >= 2000) {
                            console.log('🚀 Space Hold complete - navigating to Tilliman lobby');
                            navigate('/tillimanhome');
                        }
                    }
                }, 50);
            }
        };

        const handleSpaceRelease = (event: KeyboardEvent) => {
            if (event.key === ' ' && event.type === 'keyup') {
                // Space losgelassen - Reset
                event.preventDefault();
                resetSpaceHold();
            }
        };

        const resetSpaceHold = () => {
            setSpaceHoldActive(false);
            setSpaceHoldProgress(0);
            spaceHoldStartTime.current = null;
            if (spaceHoldInterval.current) {
                clearInterval(spaceHoldInterval.current);
                spaceHoldInterval.current = null;
            }
        };

        window.addEventListener('keydown', handleSpaceHold);
        window.addEventListener('keyup', handleSpaceRelease);

        // Cleanup bei unmount oder gameState change
        return () => {
            window.removeEventListener('keydown', handleSpaceHold);
            window.removeEventListener('keyup', handleSpaceRelease);
            resetSpaceHold();
        };
    }, [gameState, navigate]);


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
            // SENIOR DEV FIX: Restart on SAME level where player died, not level 1
            console.log(`🔄 Restarting Level ${currentLevel} (not level 1!)`);
            
            // Reset React state
            setScore(0);
            setLives(3);
            setCollectedGears(0);
            setEnemiesDefeated(0);
            setStartTime(Date.now());
            setGameState('playing');
            
            // CRITICAL: Reload the CURRENT level, not defaulting to level 1
            gameRef.current.getLevelManager().loadLevel(currentLevel);
            gameRef.current.start();
            
            console.log(`✅ Level ${currentLevel} restarted successfully`);
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
                                    <li>Joystick - Bewegung</li>
                                    <li>Oberer Button - Springen</li>
                                    <li style={{ color: '#FFD700', fontWeight: 'bold' }}>Unterer Button halten (2s) - Zur Lobby</li>
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
                                    Joystick Auswählen • Oberer Button Bestätigen
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

            {/* Space-Hold Progress Indicator */}
            {gameState === 'playing' && spaceHoldActive && (
                <div className="space-hold-indicator" style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.85)',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '3px solid #0ff',
                    boxShadow: '0 0 30px #0ff',
                    fontFamily: 'Press Start 2P, cursive',
                    fontSize: '14px',
                    color: '#0ff',
                    textAlign: 'center',
                    zIndex: 1000,
                    minWidth: '300px'
                }}>
                    <div style={{ marginBottom: '15px', fontSize: '12px' }}>
                        Unterer Button halten für Lobby
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{
                        width: '100%',
                        height: '20px',
                        background: 'rgba(0, 255, 255, 0.2)',
                        border: '2px solid #0ff',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: `${spaceHoldProgress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #0ff, #00ffff, #40e0d0)',
                            transition: 'width 0.05s ease',
                            boxShadow: '0 0 15px #0ff'
                        }} />
                        
                        {/* Progress Text */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: spaceHoldProgress > 50 ? '#000' : '#0ff',
                            textShadow: spaceHoldProgress > 50 ? '1px 1px 2px #0ff' : '1px 1px 2px #000'
                        }}>
                            {Math.round(spaceHoldProgress)}%
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.8 }}>
                        Loslassen zum Abbrechen
                    </div>
                </div>
            )}
        </div>
    );
};
