// NEUES GAMEPLAY: Großes Spielfeld, schwarzer Hintergrund mit violett-weißen Sternen, Schiff links, Asteroiden von rechts, Autoschuss, Upgrades, Balancing
import React, { useState, useEffect, useRef } from 'react';
import './Gameplay.css';
import type { GameState, Bullet, Asteroid } from '../types/gametypes.ts';
import asteroidImg from '../images/spaceships/asteroid.png';
import powerupImg from '../images/spaceships/PowerUp.png';
import type { Upgrade } from '../types/gametypes.ts';

interface GamePlayProps {
    gameState: GameState;
    upgrades?: Upgrade[];
    onGameOver: (score: number) => void;
    onPause: () => void;
    onStart: () => void;
}


const STAR_COLORS = ['#fff', '#b388ff', '#e1bee7', '#ce93d8', '#9575cd'];


const GamePlay: React.FC<GamePlayProps> = ({ gameState, upgrades, onGameOver, onPause, onStart }) => {
    // Die beiden States müssen in die Komponente!
    // Responsive Spielfeld: immer quadratisch, max 90vw/90vh, min 420px
    const getBoxSize = () => Math.max(420, Math.min(window.innerWidth, window.innerHeight, 900));
    const [GAME_WIDTH, setGameWidth] = useState(getBoxSize());
    const [GAME_HEIGHT, setGameHeight] = useState(getBoxSize());
    // Startposition: 2rem (32px) weiter rechts
    const SHIP_START_X = 220 + 32;
    const SHIP_START_Y = GAME_HEIGHT / 2 - 40;

    const [localGameState, setLocalGameState] = useState<GameState>(gameState);
    const [shipY, setShipY] = useState(SHIP_START_Y);
    const [shipX, setShipX] = useState(SHIP_START_X);
    const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
    const [asteroidsDestroyed, setAsteroidsDestroyed] = useState(0);
    const [powerup, setPowerup] = useState<{ id: string, x: number, y: number, velocity: number } | null>(null);
    const [paused, setPaused] = useState(false);
    const [pauseSelected, setPauseSelected] = useState(0); // 0 = Continue, 1 = Exit
    const [controlsLocked, setControlsLocked] = useState(false); // Nach Game Over true
    const [stars] = useState(() => Array.from({ length: 120 }, () => ({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        r: Math.random() * 1.7 + 0.7,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
    })));

    const lastShotRef = useRef<number>(0);
    const lastAsteroidSpawnRef = useRef<number>(0);
    const [bullets, setBullets] = useState<Bullet[]>([]);
    const [asteroids, setAsteroids] = useState<Asteroid[]>([]);

    // Resize game area to window size
    useEffect(() => {
        const handleResize = () => {
            const size = getBoxSize();
            setGameWidth(size);
            setGameHeight(size);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ship movement mit besseren Boundary-Checks
    useEffect(() => {
        if (controlsLocked) return;
        const move = () => {
            setShipY(prev => {
                let newY = prev;
                const speed = localGameState.ship.speed;
                if (keys['ArrowUp']) newY = prev - speed;
                if (keys['ArrowDown']) newY = prev + speed;
                // Ship must stay fully inside the visible area (no overlap)
                if (newY < 0) newY = 0;
                if (newY > GAME_HEIGHT - 80) newY = GAME_HEIGHT - 80;
                return newY;
            });
            setShipX(prev => {
                let newX = prev;
                const speed = localGameState.ship.speed;
                if (keys['ArrowLeft']) newX = prev - speed;
                if (keys['ArrowRight']) newX = prev + speed;
                // Ship must stay fully inside the visible area (no overlap)
                if (newX < 0) newX = 0;
                if (newX > GAME_WIDTH - 80) newX = GAME_WIDTH - 80;
                return newX;
            });
        };
        const interval = setInterval(move, 16);
        return () => clearInterval(interval);
    }, [keys, localGameState.ship.speed, controlsLocked]);

    // Key events
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (paused) {
                if (
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                ) {
                    e.preventDefault();
                    setPauseSelected(prev => (prev === 0 ? 1 : 0));
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (pauseSelected === 0) setPaused(false);
                    else onPause();
                }
            } else {
                setKeys(prev => ({ ...prev, [e.key]: true }));
                if (e.key === 'p' || e.key === 'P') {
                    e.preventDefault();
                    setPaused(true);
                }
            }
        };
        const up = (e: KeyboardEvent) => {
            setKeys(prev => ({ ...prev, [e.key]: false }));
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, [onPause, paused, pauseSelected]);

    // Auto-shoot
    useEffect(() => {
        const shoot = () => {
            const now = Date.now();
            const fireRate = Math.max(200, 1000 / (localGameState.ship.fireRate / 10));
            if (now - lastShotRef.current > fireRate) {
                setBullets(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    x: shipX + 60,
                    y: shipY + 30,
                    velocity: 14
                }]);
                lastShotRef.current = now;
            }
        };
        if (!localGameState.gameOver && localGameState.gameRunning && !paused) {
            const interval = setInterval(shoot, 60);
            return () => clearInterval(interval);
        }
    }, [shipX, shipY, localGameState.ship.fireRate, localGameState.gameOver, localGameState.gameRunning, paused]);

    // Asteroid spawn and movement
    useEffect(() => {
        if (localGameState.gameOver || !localGameState.gameRunning || paused) return;
        const loop = () => {
            setAsteroids(prev => prev
                .map(a => ({ ...a, x: a.x - a.velocity }))
                .filter(a => a.x > -a.size)
            );
            const now = Date.now();
            const spawnRate = Math.max(600 - localGameState.level * 30, 120);
            if (now - lastAsteroidSpawnRef.current > spawnRate) {
                // Asteroid-Größe und Lebenspunkte: klein (2), mittel (3), groß (4)
                const typeRand = Math.random();
                let size = 40, health = 2, asteroidType = 'small';
                if (typeRand < 0.4) {
                    size = 40; health = 2; asteroidType = 'small';
                } else if (typeRand < 0.8) {
                    size = 65; health = 3; asteroidType = 'medium';
                } else {
                    size = 95; health = 4; asteroidType = 'large';
                }
                setAsteroids(prev => [
                    ...prev,
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        x: GAME_WIDTH + size,
                        y: Math.random() * (GAME_HEIGHT - size),
                        size,
                        velocity: 2.5 + Math.random() * 1.5 + localGameState.level * 0.5,
                        health,
                        maxHealth: health,
                        image: asteroidImg,
                        asteroidType,
                    }
                ]);
                lastAsteroidSpawnRef.current = now;
            }
        };
        const interval = setInterval(loop, 30);
        return () => clearInterval(interval);
    }, [localGameState.level, localGameState.gameOver, localGameState.gameRunning, paused]);

    // Bullets movement
    useEffect(() => {
        if (localGameState.gameOver || !localGameState.gameRunning) return;
        const interval = setInterval(() => {
            setBullets(prev => prev.map(b => ({ ...b, x: b.x + b.velocity })).filter(b => b.x < GAME_WIDTH + 50));
        }, 16);
        return () => clearInterval(interval);
    }, [localGameState.gameOver, localGameState.gameRunning]);

    // Collisions (Bullets <-> Asteroids) - mit kleineren Hitboxen
    useEffect(() => {
        if (localGameState.gameOver || !localGameState.gameRunning) return;
        let newBullets = [...bullets];
        let newAsteroids = [...asteroids];
        let asteroidsToRemove: Set<string> = new Set();
        let scoreToAdd = 0;
        let coinsToAdd = 0;
        let asteroidsDestroyedCount = 0;
        
        for (let bIdx = 0; bIdx < newBullets.length; bIdx++) {
            const bullet = newBullets[bIdx];
            for (let aIdx = 0; aIdx < newAsteroids.length; aIdx++) {
                const asteroid = newAsteroids[aIdx];
                
                // Kleinere Hitbox für Asteroiden
                const asteroidHitboxReduction = 0.75; // 75% der ursprünglichen Größe
                const asteroidHitboxSize = asteroid.size * asteroidHitboxReduction;
                const asteroidHitboxOffset = (asteroid.size - asteroidHitboxSize) / 2;
                
                if (
                    bullet.x < asteroid.x + asteroidHitboxOffset + asteroidHitboxSize &&
                    bullet.x + 15 > asteroid.x + asteroidHitboxOffset &&
                    bullet.y < asteroid.y + asteroidHitboxOffset + asteroidHitboxSize &&
                    bullet.y + 8 > asteroid.y + asteroidHitboxOffset
                ) {
                    asteroid.health = (asteroid.health || 1) - 1;
                    if (asteroid.health <= 0) {
                        scoreToAdd += Math.floor(asteroid.size);
                        coinsToAdd += Math.floor(asteroid.size / 10);
                        asteroidsDestroyedCount++;
                        asteroidsToRemove.add(asteroid.id);
                    }
                    newBullets.splice(bIdx, 1);
                    bIdx--;
                    break;
                }
            }
        }
        
        // Remove all asteroids that should be destroyed
        newAsteroids = newAsteroids.filter(a => !asteroidsToRemove.has(a.id));
        if (scoreToAdd > 0 || coinsToAdd > 0) {
            setLocalGameState(prev => ({
                ...prev,
                score: prev.score + scoreToAdd,
                coins: prev.coins + coinsToAdd
            }));
        }
        if (asteroidsDestroyedCount > 0) {
            setAsteroidsDestroyed(count => count + asteroidsDestroyedCount);
        }
        if (
            newBullets.length !== bullets.length ||
            newAsteroids.length !== asteroids.length
        ) {
            setBullets(newBullets);
            setAsteroids(newAsteroids);
        }
    }, [bullets, asteroids, localGameState.gameOver, localGameState.gameRunning]);

    // Ship-Asteroid collision - mit kleineren Hitboxen
    useEffect(() => {
        if (localGameState.gameOver || !localGameState.gameRunning) return;
        setAsteroids(prevAsteroids => {
            let newAsteroids = [...prevAsteroids];
            for (let i = 0; i < newAsteroids.length; i++) {
                const a = newAsteroids[i];
                
                // Kleinere Hitboxen für realistischere Kollision
                const shipHitboxSize = 50; // Reduziert von 80 auf 50
                const asteroidHitboxReduction = 0.7; // 70% der ursprünglichen Größe
                const asteroidHitboxSize = a.size * asteroidHitboxReduction;
                const asteroidHitboxOffset = (a.size - asteroidHitboxSize) / 2;
                
                if (
                    shipX + 15 < a.x + asteroidHitboxOffset + asteroidHitboxSize &&
                    shipX + 15 + shipHitboxSize > a.x + asteroidHitboxOffset &&
                    shipY + 15 < a.y + asteroidHitboxOffset + asteroidHitboxSize &&
                    shipY + 15 + shipHitboxSize > a.y + asteroidHitboxOffset
                ) {
                    setLocalGameState(prev => {
                        const newHealth = prev.ship.health - 18;
                        if (newHealth <= 0) {
                            return { ...prev, ship: { ...prev.ship, health: 0 }, gameOver: true, gameRunning: false };
                        }
                        return { ...prev, ship: { ...prev.ship, health: newHealth } };
                    });
                    newAsteroids.splice(i, 1);
                    break;
                }
            }
            return newAsteroids;
        });
    }, [asteroids, shipX, shipY, localGameState.gameOver, localGameState.gameRunning]);

    // Level up
    useEffect(() => {
        if (localGameState.score > localGameState.level * 600) {
            setLocalGameState(prev => ({ ...prev, level: prev.level + 1 }));
        }
    }, [localGameState.score, localGameState.level]);

    // Powerup spawnen: alle 10 zerstörten Asteroiden
    useEffect(() => {
        if (asteroidsDestroyed > 0 && asteroidsDestroyed % 10 === 0 && !powerup) {
            setPowerup({
                id: Math.random().toString(36).substr(2, 9),
                x: GAME_WIDTH - 80,
                y: Math.random() * (GAME_HEIGHT - 60),
                velocity: 3.5
            });
        }
    }, [asteroidsDestroyed, powerup]);

    // Powerup bewegen
    useEffect(() => {
        if (!powerup || localGameState.gameOver || !localGameState.gameRunning) return;
        const interval = setInterval(() => {
            setPowerup(prev => {
                if (!prev) return null;
                const newX = prev.x - prev.velocity;
                if (newX < -60) return null; // despawn wenn aus dem Screen
                return { ...prev, x: newX };
            });
        }, 16);
        return () => clearInterval(interval);
    }, [powerup, localGameState.gameOver, localGameState.gameRunning]);

    // Powerup-Kollision mit Schiff
    useEffect(() => {
        if (!powerup || localGameState.gameOver || !localGameState.gameRunning) return;
        // Kollisionserkennung
        if (
            shipX < powerup.x + 60 &&
            shipX + 80 > powerup.x &&
            shipY < powerup.y + 60 &&
            shipY + 80 > powerup.y
        ) {
            setLocalGameState(prev => {
                const newMaxHealth = prev.ship.maxHealth + 1.5;
                // Restore half of new max health, but not above max
                const restoredHealth = Math.max(prev.ship.health, Math.floor(newMaxHealth / 2));
                return {
                    ...prev,
                    ship: {
                        ...prev.ship,
                        speed: prev.ship.speed + 1.5,
                        fireRate: prev.ship.fireRate + 1.5,
                        health: Math.min(restoredHealth, newMaxHealth),
                        maxHealth: newMaxHealth
                    }
                };
            });
            setPowerup(null);
        }
    }, [powerup, shipX, shipY, localGameState.gameOver, localGameState.gameRunning]);

    // Game over
    useEffect(() => {
        if (localGameState.gameOver) {
            // Don't call onGameOver immediately, show game over screen first
        }
    }, [localGameState.gameOver]);

    // Start game on mount
    useEffect(() => {
        // Start game if not running
        if (!localGameState.gameRunning && !localGameState.gameOver) {
            onStart();
            setLocalGameState(prev => ({
                ...gameState,
                gameRunning: true,
                gameOver: false,
                ship: { ...gameState.ship },
                coins: 0, // Set initial coins to 0
            }));
            setShipY(SHIP_START_Y);
            setShipX(SHIP_START_X + 20); // Move ship spawn 20px further right
            setBullets([]);
            setAsteroids([]);
            setAsteroidsDestroyed(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Game Over Screen
    const [showGameOver, setShowGameOver] = useState(false);
    useEffect(() => {
        if (localGameState.gameOver) {
            setTimeout(() => setShowGameOver(true), 600); // short delay for effect
            setControlsLocked(true); // Controls nach Game Over sperren
        }
    }, [localGameState.gameOver]);

    // ENTER schließt Game Over Screen
    useEffect(() => {
        if (!showGameOver) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleGameOverExit();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showGameOver]);

    const handleGameOverExit = () => {
        setShowGameOver(false);
        onGameOver(localGameState.score);
    };

    return (
        <div className="gameplay-root">
            {/* HUD: kompakte Leiste links oben, immer sichtbar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 'auto',
                minWidth: 420,
                maxWidth: 600,
                background: 'rgba(10,10,19,0.98)',
                color: '#fff',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                fontFamily: 'Press Start 2P, cursive',
                fontSize: '1rem',
                boxShadow: '0 2px 16px #b388ff',
                borderBottom: '2px solid #b388ff',
                borderRight: '2px solid #b388ff',
                minHeight: 44,
                padding: '0.3rem 1.2rem 0.3rem 1.2rem',
                letterSpacing: '1px',
                gap: '1.2rem',
                borderTopLeftRadius: 0,
                borderBottomRightRadius: 18,
                margin: 0,
            }}>
                <span style={{ color: '#b388ff', fontWeight: 700, fontSize: '1.1rem', textShadow: '0 0 8px #fff', marginRight: 10 }}>SCORE: {localGameState.score}</span>
                <span style={{ color: '#fff', marginRight: 10 }}>LEVEL: {localGameState.level}</span>
                <span style={{ color: '#ff5252', textShadow: '0 0 8px #fff', marginRight: 10 }}>❤ {localGameState.ship.health}/{localGameState.ship.maxHealth}</span>
                <span style={{ color: '#ffe082', textShadow: '0 0 8px #fff', marginRight: 10 }}>⦿ {localGameState.coins}</span>
                {Array.isArray(upgrades) && upgrades.filter((u: Upgrade) => u.owned).length > 0 && (
                    <span style={{ color: '#b388ff', fontWeight: 700, marginLeft: 8 }}>UPGRADES:
                        <span style={{ display: 'inline-flex', gap: '0.3rem', marginLeft: '0.3rem', flexWrap: 'wrap' }}>
                            {upgrades.filter((u: Upgrade) => u.owned).map((u: Upgrade) => (
                                <span key={u.id} title={u.description} style={{
                                    background: '#b388ff',
                                    color: '#222',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontFamily: 'inherit',
                                    fontWeight: 700,
                                    padding: '0.1rem 0.5rem',
                                    boxShadow: '0 0 6px #b388ff',
                                    letterSpacing: '1px',
                                    textShadow: 'none',
                                    cursor: 'help',
                                    border: '1px solid #b388ff',
                                    transition: 'background 0.2s',
                                }}>{u.name}</span>
                            ))}
                        </span>
                    </span>
                )}
            </div>

            {/* Gameplay-Container mit overflow hidden */}
            <div className="gameplay-area" style={{
                marginTop: 48,
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid #333',
                maxWidth: '90vw',
                maxHeight: '90vh',
                minWidth: 420,
                minHeight: 420,
                aspectRatio: '1/1',
                marginLeft: 'auto',
                marginRight: 'auto',
                background: '#0a0a13',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Star background */}
                <svg width={GAME_WIDTH} height={GAME_HEIGHT} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
                    {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color} />)}
                </svg>

                {/* Ship */}
                <img
                    src={localGameState.ship.icon}
                    alt="Ship"
                    className="ship-sprite"
                    style={{
                        position: 'absolute',
                        left: shipX,
                        top: shipY,
                        width: 80,
                        height: 80,
                        zIndex: 2,
                        filter: localGameState.ship.health < 30 ? 'hue-rotate(0deg) saturate(2)' : 'none',
                        transition: 'top 0.08s, left 0.08s',
                    }}
                />

                {/* Bullets */}
                {bullets.map(bullet => (
                    <div
                        key={bullet.id}
                        className="bullet-enhanced"
                        style={{
                            position: 'absolute',
                            left: bullet.x,
                            top: bullet.y,
                            width: 18,
                            height: 6,
                            background: 'linear-gradient(90deg, #fff, #b388ff 80%)',
                            borderRadius: 4,
                            boxShadow: '0 0 8px #fff',
                            zIndex: 2
                        }}
                    />
                ))}

                {/* Asteroids */}
                {asteroids.map(asteroid => {
                    // @ts-ignore: maxHealth, asteroidType werden dynamisch hinzugefügt
                    const maxHealth = (asteroid as Asteroid & { maxHealth?: number }).maxHealth ?? 1;
                    const asteroidType = (asteroid as any).asteroidType ?? 'small';
                    let borderColor = '#b388ff';
                    if (asteroidType === 'medium') borderColor = '#ffe082';
                    if (asteroidType === 'large') borderColor = '#ff5252';
                    return (
                        <img
                            key={asteroid.id}
                            src={asteroid.image}
                            alt={asteroidType + ' Asteroid'}
                            className="asteroid-sprite"
                            style={{
                                position: 'absolute',
                                left: asteroid.x,
                                top: asteroid.y,
                                width: asteroid.size,
                                height: asteroid.size,
                                opacity: asteroid.health > 1 ? 1 : 0.7,
                                zIndex: 2,
                                filter: maxHealth && asteroid.health < maxHealth ? 'brightness(1.2) drop-shadow(0 0 8px ' + borderColor + ')' : 'none',
                                borderRadius: '50%',
                                boxSizing: 'border-box',
                            }}
                        />
                    );
                })}

                {/* Powerup */}
                {powerup && (
                    <img
                        src={powerupImg}
                        alt="Powerup"
                        style={{
                            position: 'absolute',
                            left: powerup.x,
                            top: powerup.y,
                            width: 60,
                            height: 60,
                            zIndex: 5,
                            filter: 'drop-shadow(0 0 16px #ffe082)',
                            pointerEvents: 'none',
                            transition: 'top 0.08s, left 0.08s',
                        }}
                    />
                )}

                {/* Pause Screen */}
                {paused && !localGameState.gameOver && (
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(20,10,40,0.98)',
                        color: '#fff',
                        border: '2px solid #b388ff',
                        borderRadius: 18,
                        padding: '2.5rem 3.5rem',
                        zIndex: 20,
                        boxShadow: '0 0 40px #b388ff',
                        textAlign: 'center',
                        fontFamily: 'Press Start 2P, cursive',
                        fontSize: '1.1rem',
                        minWidth: 320,
                    }}>
                        <div style={{ marginBottom: '2rem', fontSize: '1.5rem', color: '#b388ff', textShadow: '0 0 12px #fff' }}>PAUSED</div>
                        <button
                            className={pauseSelected === 0 ? 'exit-button selected' : 'exit-button'}
                            style={{
                                padding: '1rem 2.5rem',
                                fontFamily: 'Press Start 2P, cursive',
                                fontSize: '1rem',
                                borderRadius: '10px',
                                border: '2px solid #b90a10ff',
                                background: '#111',
                                color: '#b90a10ff',
                                cursor: 'pointer',
                                margin: '0 1.5rem',
                                display: 'inline-block',
                                boxShadow: pauseSelected === 0 ? '0 0 20px #ca4449ff' : 'none',
                                transition: 'all 0.2s',
                            }}
                            onClick={() => setPaused(false)}
                            tabIndex={0}
                        >
                            CONTINUE
                        </button>
                        <button
                            className={pauseSelected === 1 ? 'exit-button selected' : 'exit-button'}
                            style={{
                                padding: '1rem 2.5rem',
                                fontFamily: 'Press Start 2P, cursive',
                                fontSize: '1rem',
                                borderRadius: '10px',
                                border: '2px solid #b90a10ff',
                                background: '#111',
                                color: '#b90a10ff',
                                cursor: 'pointer',
                                margin: '0 1.5rem',
                                display: 'inline-block',
                                boxShadow: pauseSelected === 1 ? '0 0 20px #ca4449ff' : 'none',
                                transition: 'all 0.2s',
                            }}
                            onClick={onPause}
                            tabIndex={0}
                        >
                            EXIT
                        </button>
                    </div>
                )}

                {/* Game Over Screen */}
                {showGameOver && (
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(20,10,40,0.98)',
                        color: '#fff',
                        border: '2px solid #b388ff',
                        borderRadius: 18,
                        padding: '2.5rem 3.5rem',
                        zIndex: 30,
                        boxShadow: '0 0 40px #b388ff',
                        textAlign: 'center',
                        fontFamily: 'Press Start 2P, cursive',
                        fontSize: '1.1rem',
                        minWidth: 320,
                    }}>
                        <div style={{ marginBottom: '2rem', fontSize: '2rem', color: '#b388ff', textShadow: '0 0 16px #fff' }}>GAME OVER</div>
                        <div style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Score: <span style={{ color: '#fff' }}>{localGameState.score}</span></div>
                        <div style={{ marginBottom: '2.5rem', fontSize: '1.2rem' }}>Coins: <span style={{ color: '#ffe082' }}>{localGameState.coins}</span></div>
                        <button
                            className="exit-button selected"
                            style={{
                                padding: '1rem 2.5rem',
                                fontFamily: 'Press Start 2P, cursive',
                                fontSize: '1rem',
                                borderRadius: '10px',
                                border: '2px solid #b90a10ff',
                                background: '#111',
                                color: '#b90a10ff',
                                cursor: 'pointer',
                                margin: '0 auto',
                                display: 'block',
                                boxShadow: '0 0 20px #ca4449ff',
                                transition: 'all 0.2s',
                            }}
                            onClick={handleGameOverExit}
                        >
                            EXIT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GamePlay;

