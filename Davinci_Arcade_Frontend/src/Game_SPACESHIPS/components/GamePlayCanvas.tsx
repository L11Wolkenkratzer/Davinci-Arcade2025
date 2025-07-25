import React, { useRef, useEffect, useState } from 'react';
import './GamePlayCanvas.css';
import { useAudio } from '../../SettingsContext.tsx';

interface GamePlayCanvasProps {
  onGameOver: (score: number, coins: number) => void;
  onPause: () => void;
  onStart: () => void;
  width?: number;
  height?: number;
}

const SHIP_SIZE = 80;
const ASTEROID_IMG = '/src/Game_SPACESHIPS/images/spaceships/asteroid.png';
const SHIP_IMG = '/src/Game_SPACESHIPS/images/spaceships/standart-fighter.png';
const POWERUP_IMG = '/src/Game_SPACESHIPS/images/spaceships/PowerUp.png';

const GamePlayCanvas: React.FC<GamePlayCanvasProps> = ({ onGameOver, onPause, onStart, width = 900, height = 900 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const runningRef = useRef(true);
  const pausedRef = useRef(false);
  const gameStateRef = useRef<any>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const { volume } = useAudio();

  const [hud, setHud] = useState({ score: 0, level: 1, health: 100, maxHealth: 100, coins: 0 });
  const [screen, setScreen] = useState<'lobby' | 'game' | 'shop' | 'highscore' | 'other'>('lobby');

  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    const asteroid = new window.Image();
    asteroid.src = ASTEROID_IMG;
    const ship = new window.Image();
    ship.src = SHIP_IMG;
    const powerup = new window.Image();
    powerup.src = POWERUP_IMG;
    imagesRef.current = { asteroid, ship, powerup };

    const laserShoot = new window.Audio('/Sounds/laserShoot.mp3');
    const stoneBreak = new window.Audio('/Sounds/asteroid_break.mp3');
    laserShoot.volume = (volume / 100) * 0.2;
    stoneBreak.volume = (volume / 100) * 0.4;
    soundsRef.current = { laserShoot, stoneBreak };
  }, [volume]);

  useEffect(() => {
    if (soundsRef.current.laserShoot) {
      soundsRef.current.laserShoot.volume = (volume / 100) * 0.2;
    }
    if (soundsRef.current.stoneBreak) {
      soundsRef.current.stoneBreak.volume = (volume / 100) * 0.4;
    }
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = {
      ship: {
        x: 220 + 32,
        y: height / 2 - SHIP_SIZE / 2,
        speed: 5,
        health: 100,
        maxHealth: 100,
        fireRate: 10,
        cooldown: 0,
      },
      bullets: [],
      asteroids: [],
      powerup: null,
      score: 0,
      coins: 0,
      level: 1,
      gameOver: false,
      gameRunning: true,
      asteroidsDestroyed: 0,
      lastAsteroid: 0,
      lastShot: 0,
      stars: Array.from({ length: 120 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.7 + 0.7,
        color: ['#fff', '#b388ff', '#e1bee7', '#ce93d8', '#9575cd'][Math.floor(Math.random() * 5)]
      })),
    };
    gameStateRef.current = state;
    runningRef.current = true;
    pausedRef.current = false;

    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === 'p' || e.key === 'P') pausedRef.current = !pausedRef.current;
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    let last = performance.now();
    function loop(now: number) {
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;
      if (!runningRef.current) return;
      if (!pausedRef.current) update(dt);
      render();
      animationRef.current = requestAnimationFrame(loop);
    }
    animationRef.current = requestAnimationFrame(loop);

    function update(dt: number) {
      const s = gameStateRef.current;
      setHud({
        score: s.score,
        level: s.level,
        health: s.ship.health,
        maxHealth: s.ship.maxHealth,
        coins: s.coins
      });
      if (keysRef.current['ArrowUp']) s.ship.y -= s.ship.speed * dt;
      if (keysRef.current['ArrowDown']) s.ship.y += s.ship.speed * dt;
      if (keysRef.current['ArrowLeft']) s.ship.x -= s.ship.speed * dt;
      if (keysRef.current['ArrowRight']) s.ship.x += s.ship.speed * dt;
      s.ship.y = Math.max(0, Math.min(height - SHIP_SIZE, s.ship.y));
      s.ship.x = Math.max(0, Math.min(width - SHIP_SIZE, s.ship.x));
      s.ship.cooldown -= dt;

      const fireInterval = Math.max(18, 50 - (s.ship.fireRate - 10) * 2);
      if (s.ship.cooldown <= 0 && s.gameRunning && !s.gameOver) {
        s.bullets.push({ x: s.ship.x + 60, y: s.ship.y + 30, v: 14 });
        s.ship.cooldown = fireInterval;
        if (soundsRef.current.laserShoot) {
          soundsRef.current.laserShoot.currentTime = 0;
          soundsRef.current.laserShoot.play();
        }
      }
      s.bullets.forEach(b => b.x += b.v * dt);
      s.bullets = s.bullets.filter(b => b.x < width + 50);
      s.lastAsteroid += dt * 16.67;
      if (s.lastAsteroid > Math.max(600 - s.level * 30, 120)) {
        const typeRand = Math.random();
        let size = 40, health = 2;
        if (typeRand < 0.4) { size = 40; health = 2; }
        else if (typeRand < 0.8) { size = 65; health = 3; }
        else { size = 95; health = 4; }
        s.asteroids.push({
          x: width + size,
          y: Math.random() * (height - size),
          size,
          v: 2.5 + Math.random() * 1.5 + s.level * 0.5,
          health,
          maxHealth: health,
        });
        s.lastAsteroid = 0;
      }
      s.asteroids.forEach(a => a.x -= a.v * dt);
      s.asteroids = s.asteroids.filter(a => a.x > -a.size);
      for (let b = s.bullets.length - 1; b >= 0; b--) {
        const bullet = s.bullets[b];
        for (let a = s.asteroids.length - 1; a >= 0; a--) {
          const asteroid = s.asteroids[a];
          const hit = bullet.x < asteroid.x + asteroid.size && bullet.x + 15 > asteroid.x && bullet.y < asteroid.y + asteroid.size && bullet.y + 8 > asteroid.y;
          if (hit) {
            asteroid.health--;
            if (asteroid.health <= 0) {
              s.score += Math.floor(asteroid.size);
              s.coins += Math.floor(asteroid.size / 10);
              s.asteroidsDestroyed++;
              s.asteroids.splice(a, 1);
              if (soundsRef.current.stoneBreak) {
                soundsRef.current.stoneBreak.currentTime = 0;
                soundsRef.current.stoneBreak.play();
              }
            }
            s.bullets.splice(b, 1);
            break;
          }
        }
      }
      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const a = s.asteroids[i];
        const hit = s.ship.x + 15 < a.x + a.size && s.ship.x + 15 + 50 > a.x && s.ship.y + 15 < a.y + a.size && s.ship.y + 15 + 50 > a.y;
        if (hit) {
          s.ship.health -= 18;
          if (s.ship.health <= 0) {
            s.ship.health = 0;
            s.gameOver = true;
            s.gameRunning = false;
            runningRef.current = false;
            setTimeout(() => onGameOver(s.score, s.coins), 2200);
          }
          s.asteroids.splice(i, 1);
        }
      }
      if (s.score > s.level * 600) s.level++;
      if (
          s.asteroidsDestroyed > 0 &&
          s.asteroidsDestroyed % 10 === 0 &&
          !s.powerup &&
          (!s.lastPowerupSpawn || s.lastPowerupSpawn !== s.asteroidsDestroyed)
      ) {
        s.powerup = {
          x: width - 80,
          y: Math.random() * (height - 60),
          v: 3.5
        };
        s.lastPowerupSpawn = s.asteroidsDestroyed;
      }
      if (
          s.powerup &&
          typeof s.powerup === 'object' &&
          s.powerup !== null &&
          typeof s.powerup.x === 'number' &&
          typeof s.powerup.y === 'number' &&
          typeof s.powerup.v === 'number'
      ) {
        s.powerup.x -= s.powerup.v * dt;
        if (s.powerup.x < -60) {
          s.powerup = null;
        } else if (
            s.ship.x < s.powerup.x + 60 &&
            s.ship.x + SHIP_SIZE > s.powerup.x &&
            s.ship.y < s.powerup.y + 60 &&
            s.ship.y + SHIP_SIZE > s.powerup.y
        ) {
          s.ship.maxHealth += 1.5;
          s.ship.speed += 0.7;
          s.ship.fireRate += 4.5;
          s.ship.health = Math.min(s.ship.maxHealth, Math.floor(s.ship.maxHealth / 2));
          s.powerup = null;
        }
      } else {
        if (s.powerup !== null) s.powerup = null;
      }
    }

    function render() {
      const s = gameStateRef.current;
      ctx.clearRect(0, 0, width, height);
      for (const star of s.stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.fillStyle = star.color;
        ctx.fill();
      }
      ctx.save();
      ctx.drawImage(imagesRef.current.ship, s.ship.x, s.ship.y, SHIP_SIZE, SHIP_SIZE);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = '#fff';
      for (const b of s.bullets) {
        ctx.fillRect(b.x, b.y, 18, 6);
      }
      ctx.restore();
      for (const a of s.asteroids) {
        ctx.save();
        ctx.globalAlpha = a.health > 1 ? 1 : 0.7;
        ctx.drawImage(imagesRef.current.asteroid, a.x, a.y, a.size, a.size);
        ctx.restore();
      }
      if (s.powerup) {
        ctx.save();
        ctx.drawImage(imagesRef.current.powerup, s.powerup.x, s.powerup.y, 60, 60);
        ctx.restore();
      }
      ctx.save();
      ctx.font = 'bold 22px "Press Start 2P",cursive';
      ctx.fillStyle = '#b388ff';
      ctx.fillText(`SCORE: ${s.score}`, 24, 38);
      ctx.fillStyle = '#fff';
      ctx.fillText(`LEVEL: ${s.level}`, 220, 38);
      ctx.fillStyle = '#ff5252';
      ctx.fillText(`❤ ${s.ship.health}/${s.ship.maxHealth}`, 370, 38);
      ctx.fillStyle = '#ffe082';
      ctx.fillText(`⦿ ${s.coins}`, 600, 38);
      ctx.restore();
      if (s.gameOver) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#140a28';
        ctx.fillRect(width / 2 - 220, height / 2 - 120, 440, 240);
        ctx.strokeStyle = '#b388ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(width / 2 - 220, height / 2 - 120, 440, 240);
        ctx.font = 'bold 38px "Press Start 2P",cursive';
        ctx.fillStyle = '#b388ff';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 30);
        ctx.font = 'bold 24px "Press Start 2P",cursive';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Score: ${s.score}`, width / 2, height / 2 + 20);
        ctx.fillStyle = '#ffe082';
        ctx.fillText(`Coins: ${s.coins}`, width / 2, height / 2 + 60);
        ctx.restore();
      }
    }

    return () => {
      runningRef.current = false;
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [height, width, onGameOver]);

  return (
      <>
        <div className="hud-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          maxWidth: '100vw',
          background: 'rgba(10,10,19,0.98)',
          color: '#fff',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          fontFamily: 'Press Start 2P, cursive',
          fontSize: '1rem',
          boxShadow: '0 2px 16px #b388ff',
          borderBottom: '2px solid #b388ff',
          minHeight: 44,
          padding: '0.3rem 1.2rem 0.3rem 1.2rem',
          letterSpacing: '1px',
          gap: '1.2rem',
          borderTopLeftRadius: 0,
          borderBottomRightRadius: 18,
          margin: 0
        }}>
          <span style={{ color: '#b388ff', fontWeight: 700, fontSize: '1.1rem', textShadow: '0 0 8px #fff', marginRight: 10 }}>SCORE: {hud.score}</span>
          <span style={{ color: '#fff', marginRight: 10 }}>LEVEL: {hud.level}</span>
          <span style={{ color: '#ff5252', textShadow: '0 0 8px #fff', marginRight: 10 }}>❤ {hud.health}/{hud.maxHealth}</span>
          <span style={{ color: '#ffe082', textShadow: '0 0 8px #fff', marginRight: 10 }}>⦿ {hud.coins}</span>
        </div>
        <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 44 }}>
          <div className="gameplay-canvas-container" style={{ height: width, maxHeight: width, minHeight: width }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={width}
                className="spaceships-canvas"
                tabIndex={0}
            />
          </div>
        </div>
      </>
  );
};

export default GamePlayCanvas;
