
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { GameState, Upgrade } from '../types/gametypes.ts';

interface GamePlayProps {
    gameState: GameState;
    upgrades?: Upgrade[];
    onGameOver: (score: number) => void;
    onPause: () => void;
    onStart: () => void;
    onReset?: () => void;
}

const STAR_COLORS = ['#fff', '#b388ff', '#e1bee7', '#ce93d8', '#9575cd'];
const getBoxSize = () => Math.max(420, Math.min(window.innerWidth, window.innerHeight, 900));

const GamePlay: React.FC<GamePlayProps> = ({ gameState, upgrades, onGameOver, onPause, onStart, onReset }) => {
    // Only UI overlays use state
    const [showGameOver, setShowGameOver] = useState(false);
    const [score, setScore] = useState(gameState.score);
    const [paused, setPaused] = useState(false);
    const [gameRunning, setGameRunning] = useState(true);
    const [gameWidth, setGameWidth] = useState(getBoxSize());
    const [gameHeight, setGameHeight] = useState(getBoxSize());

    // Canvas ref
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Mutable game objects
    const shipRef = useRef<any>(null);
    const asteroidsRef = useRef<any[]>([]);
    const bulletsRef = useRef<any[]>([]);
    const powerupRef = useRef<any>(null);
    const starsRef = useRef<any[]>([]);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const lastShotRef = useRef<number>(0);
    const lastAsteroidSpawnRef = useRef<number>(0);
    const asteroidsDestroyedRef = useRef<number>(0);

    // Init stars
    useEffect(() => {
        starsRef.current = Array.from({ length: 120 }, () => ({
            x: Math.random() * gameWidth,
            y: Math.random() * gameHeight,
            r: Math.random() * 1.7 + 0.7,
            color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
        }));
    }, [gameWidth, gameHeight]);

    // Responsive resize
    useEffect(() => {
        const handleResize = () => {
            setGameWidth(getBoxSize());
            setGameHeight(getBoxSize());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Key events
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            keysRef.current[e.key] = true;
            if (e.key === 'Escape') {
                setPaused((p) => !p);
            }
        };
        const up = (e: KeyboardEvent) => {
            keysRef.current[e.key] = false;
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, []);

    // Game loop
    // Only run the game loop when gameRunning is true
    useEffect(() => {
        if (!gameRunning) return;
        let animationId: number;
        let lastTime = performance.now();

        // Initialize ship if not already
        const SHIP_START_X = 220 + 32;
        const SHIP_START_Y = gameHeight / 2 - 40;
        if (!shipRef.current) {
            shipRef.current = {
                ...gameState.ship,
                x: SHIP_START_X,
                y: SHIP_START_Y,
                width: 64,
                height: 64,
                alive: true
            };
        }

        function gameLoop(now: number) {
            const dt = Math.min((now - lastTime) / 1000, 0.05); // seconds
            lastTime = now;

            // Update
            if (!paused && shipRef.current.alive) {
                // Move ship
                const speed = shipRef.current.speed || 6;
                if (keysRef.current['ArrowUp']) shipRef.current.y -= speed;
                if (keysRef.current['ArrowDown']) shipRef.current.y += speed;
                if (keysRef.current['ArrowLeft']) shipRef.current.x -= speed;
                if (keysRef.current['ArrowRight']) shipRef.current.x += speed;
                // Boundaries
                shipRef.current.x = Math.max(0, Math.min(gameWidth - shipRef.current.width, shipRef.current.x));
                shipRef.current.y = Math.max(0, Math.min(gameHeight - shipRef.current.height, shipRef.current.y));

                // Shooting (auto)
                if (now - lastShotRef.current > 1000 / (shipRef.current.fireRate || 2)) {
                    bulletsRef.current.push({
                        x: shipRef.current.x + shipRef.current.width,
                        y: shipRef.current.y + shipRef.current.height / 2 - 4,
                        width: 16,
                        height: 8,
                        velocity: 12,
                        damage: shipRef.current.damage || 1
                    });
                    lastShotRef.current = now;
                }

                // Move bullets
                bulletsRef.current.forEach(b => b.x += b.velocity);
                bulletsRef.current = bulletsRef.current.filter(b => b.x < gameWidth);

                // Spawn asteroids
                if (now - lastAsteroidSpawnRef.current > 900) {
                    const size = Math.random() * 40 + 40;
                    asteroidsRef.current.push({
                        x: gameWidth + size,
                        y: Math.random() * (gameHeight - size),
                        width: size,
                        height: size,
                        velocity: Math.random() * 3 + 2,
                        hp: 2 + Math.floor(score / 10)
                    });
                    lastAsteroidSpawnRef.current = now;
                }

                // Move asteroids
                asteroidsRef.current.forEach(a => a.x -= a.velocity);
                asteroidsRef.current = asteroidsRef.current.filter(a => a.x + a.width > 0);

                // Collisions: bullets <-> asteroids
                bulletsRef.current.forEach((b, bi) => {
                    asteroidsRef.current.forEach((a, ai) => {
                        if (
                            b.x < a.x + a.width &&
                            b.x + b.width > a.x &&
                            b.y < a.y + a.height &&
                            b.y + b.height > a.y
                        ) {
                            a.hp -= b.damage;
                            b._hit = true;
                        }
                    });
                });
                asteroidsRef.current = asteroidsRef.current.filter(a => a.hp > 0);
                bulletsRef.current = bulletsRef.current.filter(b => !b._hit);

                // Collisions: ship <-> asteroids
                asteroidsRef.current.forEach(a => {
                    if (
                        shipRef.current.x < a.x + a.width &&
                        shipRef.current.x + shipRef.current.width > a.x &&
                        shipRef.current.y < a.y + a.height &&
                        shipRef.current.y + shipRef.current.height > a.y
                    ) {
                        shipRef.current.alive = false;
                        setShowGameOver(true);
                        setGameRunning(false);
                        setTimeout(() => onGameOver(score), 500);
                    }
                });

                // Score
                setScore(s => s + 1);
            }

            // Draw
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, gameWidth, gameHeight);
                // Draw stars
                starsRef.current.forEach(star => {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
                    ctx.fillStyle = star.color;
                    ctx.globalAlpha = 0.7;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                });
                // Draw ship
                if (shipRef.current.alive) {
                    ctx.fillStyle = '#b388ff';
                    ctx.fillRect(shipRef.current.x, shipRef.current.y, shipRef.current.width, shipRef.current.height);
                }
                // Draw asteroids
                ctx.fillStyle = '#888';
                asteroidsRef.current.forEach(a => {
                    ctx.beginPath();
                    ctx.arc(a.x + a.width / 2, a.y + a.height / 2, a.width / 2, 0, 2 * Math.PI);
                    ctx.fill();
                });
                // Draw bullets
                ctx.fillStyle = '#fff';
                bulletsRef.current.forEach(b => {
                    ctx.fillRect(b.x, b.y, b.width, b.height);
                });
            }

            if (gameRunning) {
                animationId = requestAnimationFrame(gameLoop);
            }
        }


        animationId = requestAnimationFrame(gameLoop);
        return () => {
            cancelAnimationFrame(animationId);
        };
        // eslint-disable-next-line
    }, [gameRunning, gameWidth, gameHeight]);
    // Reset game objects only when a new game is started (on mount or when gameRunning goes from false to true)
    useEffect(() => {
        if (gameRunning) {
            const SHIP_START_X = 220 + 32;
            const SHIP_START_Y = gameHeight / 2 - 40;
            shipRef.current = {
                ...gameState.ship,
                x: SHIP_START_X,
                y: SHIP_START_Y,
                width: 64,
                height: 64,
                alive: true
            };
            asteroidsRef.current = [];
            bulletsRef.current = [];
            powerupRef.current = null;
            asteroidsDestroyedRef.current = 0;
            setScore(0);
            setPaused(false);
            setShowGameOver(false);
        }
        // eslint-disable-next-line
    }, [gameRunning, gameWidth, gameHeight]);

    // Game over handler
    const handleGameOverExit = useCallback(() => {
        setShowGameOver(false);
        setGameRunning(false);
        if (onReset) onReset();
    }, [onReset]);

    // ENTER closes game over
    useEffect(() => {
        if (!showGameOver) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleGameOverExit();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showGameOver, handleGameOverExit]);

    return (
        <div style={{ position: 'relative', width: gameWidth, height: gameHeight }}>
            <canvas
                ref={canvasRef}
                width={gameWidth}
                height={gameHeight}
                style={{ display: 'block', background: '#0a0a13', borderRadius: 18, boxShadow: '0 0 40px #222' }}
            />
            {/* UI overlays */}
            <div style={{ position: 'absolute', top: 10, left: 20, color: '#fff', fontSize: 24, fontFamily: 'Press Start 2P, cursive', textShadow: '0 0 8px #b388ff' }}>
                Score: {score}
            </div>
            {paused && (
                <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff', fontSize: 36, background: 'rgba(0,0,0,0.7)', padding: 32, borderRadius: 16 }}>
                    PAUSED
                </div>
            )}
            {showGameOver && (
                <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff', fontSize: 36, background: 'rgba(0,0,0,0.8)', padding: 32, borderRadius: 16, textAlign: 'center' }}>
                    <div>GAME OVER</div>
                    <div style={{ fontSize: 20, marginTop: 16 }}>Score: {score}</div>
                    <div style={{ fontSize: 16, marginTop: 24 }}>Press ENTER to return</div>
                </div>
            )}
        </div>
    );
};

export default GamePlay;

