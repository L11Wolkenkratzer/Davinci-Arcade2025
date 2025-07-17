import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {GameState, Bullet, Asteroid} from '../types/gametypes.ts';

interface GamePlayProps {
    gameState: GameState;
    onGameOver: (score: number) => void;
    onPause: () => void;
    onStart: () => void;
    onReset: () => void;
}

const GamePlay: React.FC<GamePlayProps> = ({
                                               gameState,
                                               onGameOver,
                                               onPause,
                                               onStart,
                                               onReset
                                           }) => {
    const [localGameState, setLocalGameState] = useState<GameState>(gameState);
    const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
    const [shipY, setShipY] = useState(300);
    const gameLoopRef = useRef<number>();
    const lastShotRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 600;
    const SHIP_X = 50;

    const generateAsteroid = useCallback((): Asteroid => {
        const sizes = [20, 30, 40];
        const size = sizes[Math.floor(Math.random() * sizes.length)];

        return {
            id: Math.random().toString(36).substr(2, 9),
            x: GAME_WIDTH,
            y: Math.random() * (GAME_HEIGHT - size),
            size,
            velocity: Math.random() * 3 + 2,
            health: size / 10
        };
    }, []);

    const shoot = useCallback(() => {
        const now = Date.now();
        if (now - lastShotRef.current > 1000 / (localGameState.ship.fireRate / 10)) {
            const bullet: Bullet = {
                id: Math.random().toString(36).substr(2, 9),
                x: SHIP_X + 60,
                y: shipY + 25,
                velocity: 10
            };

            setLocalGameState(prev => ({
                ...prev,
                bullets: [...prev.bullets, bullet]
            }));

            lastShotRef.current = now;
        }
    }, [localGameState.ship.fireRate, shipY]);

    const checkCollisions = useCallback(() => {
        setLocalGameState(prev => {
            let newState = { ...prev };

            // Bullet-Asteroid collisions
            newState.bullets = newState.bullets.filter(bullet => {
                let bulletExists = true;

                newState.asteroids = newState.asteroids.map(asteroid => {
                    if (bulletExists &&
                        bullet.x < asteroid.x + asteroid.size &&
                        bullet.x + 10 > asteroid.x &&
                        bullet.y < asteroid.y + asteroid.size &&
                        bullet.y + 5 > asteroid.y) {

                        bulletExists = false;
                        const newHealth = asteroid.health - 1;

                        if (newHealth <= 0) {
                            newState.score += asteroid.size;
                            newState.coins += 5;
                            return null;
                        }

                        return { ...asteroid, health: newHealth };
                    }
                    return asteroid;
                }).filter(Boolean) as Asteroid[];

                return bulletExists;
            });

            // Ship-Asteroid collisions
            newState.asteroids.forEach(asteroid => {
                if (SHIP_X < asteroid.x + asteroid.size &&
                    SHIP_X + 60 > asteroid.x &&
                    shipY < asteroid.y + asteroid.size &&
                    shipY + 50 > asteroid.y) {

                    newState.ship.health -= 10;
                    if (newState.ship.health <= 0) {
                        newState.gameOver = true;
                        newState.gameRunning = false;
                    }
                }
            });

            return newState;
        });
    }, [shipY]);

    const gameLoop = useCallback(() => {
        if (!localGameState.gameRunning || localGameState.gameOver) return;

        setLocalGameState(prev => {
            let newState = { ...prev };

            // Update bullets
            newState.bullets = newState.bullets
                .map(bullet => ({ ...bullet, x: bullet.x + bullet.velocity }))
                .filter(bullet => bullet.x < GAME_WIDTH);

            // Update asteroids
            newState.asteroids = newState.asteroids
                .map(asteroid => ({ ...asteroid, x: asteroid.x - asteroid.velocity }))
                .filter(asteroid => asteroid.x > -asteroid.size);

            // Spawn new asteroids
            if (Math.random() < 0.02 + (newState.level * 0.005)) {
                newState.asteroids.push(generateAsteroid());
            }

            // Level progression
            if (newState.score > newState.level * 500) {
                newState.level++;
            }

            return newState;
        });

        checkCollisions();

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [localGameState.gameRunning, localGameState.gameOver, generateAsteroid, checkCollisions]);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        setKeys(prev => ({ ...prev, [event.key]: true }));

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            shoot();
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            onPause();
        }
    }, [shoot, onPause]);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        setKeys(prev => ({ ...prev, [event.key]: false }));
    }, []);

    // Ship movement
    useEffect(() => {
        const moveShip = () => {
            if (keys['ArrowUp'] && shipY > 0) {
                setShipY(prev => Math.max(0, prev - localGameState.ship.speed));
            }
            if (keys['ArrowDown'] && shipY < GAME_HEIGHT - 50) {
                setShipY(prev => Math.min(GAME_HEIGHT - 50, prev + localGameState.ship.speed));
            }
        };

        const interval = setInterval(moveShip, 16);
        return () => clearInterval(interval);
    }, [keys, localGameState.ship.speed]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyPress, handleKeyUp]);

    useEffect(() => {
        if (localGameState.gameRunning && !localGameState.gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [localGameState.gameRunning, localGameState.gameOver, gameLoop]);

    useEffect(() => {
        if (localGameState.gameOver) {
            onGameOver(localGameState.score);
        }
    }, [localGameState.gameOver, localGameState.score, onGameOver]);

    const startGame = () => {
        onStart();
        setLocalGameState(gameState);
    };

    if (!localGameState.gameRunning && !localGameState.gameOver) {
        return (
            <div className="game-start-screen">
                <h2>READY TO LAUNCH?</h2>
                <button className="start-button" onClick={startGame}>
                    START GAME
                </button>
                <p>Use ↑↓ to move, SPACE/ENTER to shoot</p>
            </div>
        );
    }

    return (
        <div className="game-play" ref={containerRef}>
            <div className="game-hud">
                <div className="hud-item">
                    <span>SCORE: {localGameState.score}</span>
                </div>
                <div className="hud-item">
                    <span>LEVEL: {localGameState.level}</span>
                </div>
                <div className="hud-item">
                    <span>HEALTH: {localGameState.ship.health}/{localGameState.ship.maxHealth}</span>
                </div>
            </div>

            <div className="game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
                {/* Stars background */}
                <div className="stars-background">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="star"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>

                {/* Ship */}
                <div
                    className="ship"
                    style={{
                        left: SHIP_X,
                        top: shipY,
                        color: localGameState.ship.health < 30 ? '#ff4444' : '#0ff'
                    }}
                >
                    {localGameState.ship.icon}
                </div>

                {/* Bullets */}
                {localGameState.bullets.map(bullet => (
                    <div
                        key={bullet.id}
                        className="bullet"
                        style={{
                            left: bullet.x,
                            top: bullet.y
                        }}
                    />
                ))}

                {/* Asteroids */}
                {localGameState.asteroids.map(asteroid => (
                    <div
                        key={asteroid.id}
                        className="asteroid"
                        style={{
                            left: asteroid.x,
                            top: asteroid.y,
                            width: asteroid.size,
                            height: asteroid.size
                        }}
                    >
                        🌑
                    </div>
                ))}
            </div>

            <div className="game-controls">
                <p>ESC: Pause | ↑↓: Move | SPACE/ENTER: Shoot</p>
            </div>
        </div>
    );
};

export default GamePlay;
