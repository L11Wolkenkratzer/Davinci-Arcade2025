import React, { useEffect, useState, useRef } from 'react';
import { useSettings } from "../SettingsContext";
import './PacmanGame.css';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  x: number;
  y: number;
}

type GameState = 'menu' | 'playing' | 'won';

const levelMap = `
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1;
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1;
1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1;
1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1;
1,0,1,0,1,1,0,0,0,1,0,0,0,1,0,1,1,0,1;
1,0,1,0,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1;
1,0,1,1,0,1,1,1,0,1,0,1,0,0,0,0,0,0,1;
1,0,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,5,1;
1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1;
3,0,0,0,0,1,1,1,1,2,1,1,1,1,0,0,0,0,3;
1,1,0,1,0,0,0,1,4,4,4,1,0,0,0,1,0,1,1;
1,0,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,0,1;
1,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,0,1;
1,0,1,0,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1;
1,0,1,0,1,1,1,1,0,1,0,1,0,0,0,1,1,0,1;
1,0,1,0,1,0,0,0,0,1,0,0,0,1,0,1,1,0,1;
1,0,1,0,1,5,1,1,1,1,1,1,1,1,0,1,1,0,1;
1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1;
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1`;

const MAP_ROWS = levelMap.trim().split(';').length;
const MAP_COLS = levelMap.trim().split(';')[0].split(',').length;
const MAP_WIDTH = MAP_COLS;
const MAP_HEIGHT = MAP_ROWS;
const CELL_SIZE = 24;

const WALLS: Position[] = [];
const DOORS: Position[] = [];
const PORTALS: Position[] = [];
const GHOST_ROOMS: Position[] = [];

levelMap.trim().split(';').forEach((line, y) => {
  line.trim().split(',').forEach((cell, x) => {
    const val = cell.trim();
    if (val === '1') WALLS.push({ x, y });
    if (val === '2') DOORS.push({ x, y });
    if (val === '3') PORTALS.push({ x, y });
    if (val === '4') GHOST_ROOMS.push({ x, y });
  });
});

interface Ghost extends Position {
  scared: boolean;
  scaredTimer: number;
  respawnTimer: number;
  startPos: Position;
}

const PacMan: React.FC = () => {
  // SettingsContext für Lautstärke und Mute
  const { volume, isMuted } = useSettings();
  // Debug Logs
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(
    `%c[PACMAN] Render #${renderCount.current}`,
    "color:white;background:#e91e63;padding:2px 4px;border-radius:2px;"
  );

  // Sound-Refs
  const lobbyMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // NEUE REFS FÜR TELEPORT-FIX
  const teleportCooldown = useRef(0);
  const lastTeleportPosition = useRef<Position | null>(null);
  
  // Responsive Canvas: Berechne dynamisch die Größe
  const [canvasDims, setCanvasDims] = useState({ width: MAP_WIDTH * CELL_SIZE, height: MAP_HEIGHT * CELL_SIZE });

  useEffect(() => {
    function handleResize() {
      const maxWidth = Math.min(window.innerWidth * 0.7, MAP_WIDTH * CELL_SIZE * 2);
      const scale = maxWidth / (MAP_WIDTH * CELL_SIZE);
      setCanvasDims({
        width: Math.round(MAP_WIDTH * CELL_SIZE * scale),
        height: Math.round(MAP_HEIGHT * CELL_SIZE * scale)
      });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [menuIndex, setMenuIndex] = useState(0);
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 1, y: 1 });
  const [dots, setDots] = useState<{ pos: Position; big: boolean }[]>([]);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [won, setWon] = useState(false);
  
  const moveInterval = useRef<NodeJS.Timeout | null>(null);
  const ghostMoveCounter = useRef(0);
  const ghostSpawnTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Refs für aktuelle Werte (für die Movement-Logik)
  const currentPacmanPos = useRef(pacmanPos);
  const currentGhosts = useRef(ghosts);
  const currentGameOver = useRef(gameOver);
  
  // Refs synchron halten
  useEffect(() => {
    currentPacmanPos.current = pacmanPos;
  }, [pacmanPos]);
  
  useEffect(() => {
    currentGhosts.current = ghosts;
  }, [ghosts]);
  
  useEffect(() => {
    currentGameOver.current = gameOver;
  }, [gameOver]);

  console.log("[PACMAN] gameState:", gameState);
  console.log("[PACMAN] level:", level);
  console.log("[PACMAN] gameOver:", gameOver);
  console.log("[PACMAN] won:", won);

  // Initialisiere Sounds nur einmal
  useEffect(() => {
    if (!lobbyMusicRef.current) {
      lobbyMusicRef.current = new Audio('/Sounds/Pacman/pacman lobby music.mp3');
      lobbyMusicRef.current.loop = true;
      lobbyMusicRef.current.volume = volume / 100;
    }
    if (!gameOverSoundRef.current) {
      gameOverSoundRef.current = new Audio('/Sounds/Pacman/pacman game Over.mp3');
      gameOverSoundRef.current.volume = volume / 100;
    }
    if (!coinSoundRef.current) {
      coinSoundRef.current = new Audio('/Sounds/Pacman/pacman_button switch.mp3');
      coinSoundRef.current.volume = volume / 100;
    }
    return () => {
      lobbyMusicRef.current?.pause();
      lobbyMusicRef.current && (lobbyMusicRef.current.currentTime = 0);
    };
  }, [volume]);
    // Lautstärke dynamisch anpassen
    if (lobbyMusicRef.current) lobbyMusicRef.current.volume = volume / 100;
    if (gameOverSoundRef.current) gameOverSoundRef.current.volume = volume / 100;
    if (coinSoundRef.current) coinSoundRef.current.volume = volume / 100;

  // Musik je nach State steuern
  useEffect(() => {
    if (isMuted) {
      lobbyMusicRef.current?.pause();
      lobbyMusicRef.current && (lobbyMusicRef.current.currentTime = 0);
      return;
    }
    if (gameState === 'menu' || gameState === 'playing') {
      if (lobbyMusicRef.current && lobbyMusicRef.current.paused) {
        lobbyMusicRef.current.currentTime = 0;
        lobbyMusicRef.current.play().catch(() => {});
      }
    } else {
      lobbyMusicRef.current?.pause();
      lobbyMusicRef.current && (lobbyMusicRef.current.currentTime = 0);
    }
  }, [gameState, isMuted]);

  const startGame = () => {
    console.log("[PACMAN] Starting game...");
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setMenuIndex(0);
    // Reset ghosts and dots
    setGhosts([]);
    setDots([]);
    setPacmanPos({ x: 1, y: 1 });
    setDirection(null);
    ghostMoveCounter.current = 0;
    // Reset teleport state
    teleportCooldown.current = 0;
    lastTeleportPosition.current = null;
  };

  const backToMenu = () => {
    console.log("[PACMAN] Back to menu...");
    setGameState('menu');
    setMenuIndex(0);
    if (moveInterval.current) {
      clearInterval(moveInterval.current);
      moveInterval.current = null;
    }
    ghostSpawnTimeouts.current.forEach(t => clearTimeout(t));
    ghostSpawnTimeouts.current = [];
    ghostMoveCounter.current = 0;
    // Reset teleport state
    teleportCooldown.current = 0;
    lastTeleportPosition.current = null;
  };

  // Menu navigation with arrows
  useEffect(() => {
    if (gameState !== 'menu') return;
    const handle = (e: KeyboardEvent) => {
      const menuItems = [
        () => startGame(),
        null, // Leaderboard (disabled)
        () => window.location.href = '/'
      ];
      if (["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setMenuIndex(idx => {
          let next = idx + (e.key === "ArrowDown" ? 1 : -1);
          if (next < 0) next = menuItems.length - 1;
          if (next >= menuItems.length) next = 0;
          while (menuItems[next] === null) {
            next += (e.key === "ArrowDown" ? 1 : -1);
            if (next < 0) next = menuItems.length - 1;
            if (next >= menuItems.length) next = 0;
          }
          return next;
        });
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (menuItems[menuIndex]) menuItems[menuIndex]!();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [gameState, menuIndex]);

  // Level Setup
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    console.log(`[PACMAN] Setting up level ${level}`);
    
    // Clear existing intervals and timeouts
    if (moveInterval.current) {
      clearInterval(moveInterval.current);
      moveInterval.current = null;
    }
    ghostSpawnTimeouts.current.forEach(t => clearTimeout(t));
    ghostSpawnTimeouts.current = [];
    
    // Reset game state
    setGameOver(false);
    setWon(false);
    setPacmanPos({ x: 1, y: 1 });
    setDirection(null);
    ghostMoveCounter.current = 0;
    // Reset teleport state für neues Level
    teleportCooldown.current = 0;
    lastTeleportPosition.current = null;
    
    // Reset dots and ghosts for new level or game
    const allDots: { pos: Position; big: boolean }[] = [];
    const mapRows = levelMap.trim().split(';');
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const isWall = WALLS.some(w => w.x === x && w.y === y);
        const isDoor = DOORS.some(d => d.x === x && d.y === y);
        const isPortal = PORTALS.some(p => p.x === x && p.y === y);
        const isGhostRoom = GHOST_ROOMS.some(g => g.x === x && g.y === y);
        if (!isWall && !isDoor && !isPortal && !isGhostRoom) {
          const cellVal = mapRows[y].split(',')[x].trim();
          if (cellVal === '0') allDots.push({ pos: { x, y }, big: false });
          else if (cellVal === '5') allDots.push({ pos: { x, y }, big: true });
        }
      }
    }
    setDots(allDots);

    // Setup ghosts
    const uniqueStartPositions = Array.from(
      new Set(GHOST_ROOMS.map(p => `${p.x},${p.y}`))
    ).map(key => {
      const [x, y] = key.split(',').map(Number);
      return { x, y };
    });
    const ghostStartPositions = uniqueStartPositions.slice(0, level);

    setGhosts([]);
    ghostStartPositions.forEach((pos, index) => {
      const timeout = setTimeout(() => {
        setGhosts(gs => [
          ...gs,
          {
            ...pos,
            scared: false,
            scaredTimer: 0,
            respawnTimer: 0,
            startPos: pos,
          },
        ]);
      }, index * 500);
      ghostSpawnTimeouts.current.push(timeout);
    });

    return () => {
      ghostSpawnTimeouts.current.forEach(t => clearTimeout(t));
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
        moveInterval.current = null;
      }
    };
  }, [level, gameState]);

  const getValidMoves = (pos: Position, ghostsPositions: Position[] = []): Position[] => {
    const deltas = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    return deltas
      .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
      .filter(p => {
        if (WALLS.some(w => w.x === p.x && w.y === p.y)) return false;
        if (ghostsPositions.some(gp => gp.x === p.x && gp.y === p.y)) return false;
        return true;
      });
  };

  const findShortestPath = (start: Position, end: Position, ghostsPositions: Position[] = []): Position[] => {
    const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [] }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { pos, path } = queue.shift()!;
      const key = `${pos.x},${pos.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (pos.x === end.x && pos.y === end.y) return path;

      let neighbors = getValidMoves(pos, ghostsPositions);
      neighbors = neighbors.flatMap(n => {
        const portal = PORTALS.find(p => p.x === n.x && p.y === n.y);
        if (portal) {
          const exit = PORTALS.find(p => p.x !== portal.x || p.y !== portal.y);
          return exit ? [exit] : [n];
        }
        return [n];
      });

      for (const move of neighbors) {
        const keyMove = `${move.x},${move.y}`;
        if (!visited.has(keyMove)) {
          queue.push({ pos: move, path: [...path, move] });
        }
      }
    }
    return [];
  };

  // VERBESSERTE TELEPORT-LOGIK
  const getNextPositionPacman = (pos: Position, dir: Direction | null): Position => {
    if (!dir) return pos;
    
    const delta: Record<Direction, Position> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };

    const next = { x: pos.x + delta[dir].x, y: pos.y + delta[dir].y };
    
    // Wand-Kollision
    if (WALLS.some(w => w.x === next.x && w.y === next.y)) return pos;

    // Teleport-Cooldown verringern
    if (teleportCooldown.current > 0) {
      teleportCooldown.current--;
    }

    // Portal-Logik mit Anti-Bounce-Back-Mechanismus
    const enteringPortal = PORTALS.find(p => p.x === next.x && p.y === next.y);
    if (enteringPortal && teleportCooldown.current === 0) {
      const exit = PORTALS.find(p => p.x !== enteringPortal.x || p.y !== enteringPortal.y);
      if (exit) {
        // Prüfen ob wir nicht gerade von diesem Exit-Portal kommen (Bounce-Back verhindern)
        const wasAtExit = lastTeleportPosition.current && 
                         lastTeleportPosition.current.x === exit.x && 
                         lastTeleportPosition.current.y === exit.y;
        
        if (!wasAtExit) {
          console.log(`[PACMAN] Teleporting from (${enteringPortal.x},${enteringPortal.y}) to (${exit.x},${exit.y})`);
          teleportCooldown.current = 3; // 3 Frames Cooldown (verhindert sofortigen Rückteleport)
          lastTeleportPosition.current = { x: exit.x, y: exit.y };
          return exit;
        } else {
          console.log(`[PACMAN] Bounce-back prevented from (${exit.x},${exit.y})`);
        }
      }
    }

    // Normale Bewegung - Position für Bounce-Back-Check aktualisieren
    if (teleportCooldown.current === 0) {
      lastTeleportPosition.current = null;
    }

    return next;
  };

  function distance(a: Position, b: Position) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Menü: ENTER = Aktion ausführen
      if (gameState === 'menu') {
        if (e.key === 'Enter') {
          const menuItems = [
            () => startGame(),
            null,
            () => window.location.href = '/'
          ];
          if (menuItems[menuIndex]) menuItems[menuIndex]!();
        }
        return;
      }

      // Game Over: ENTER = zurück ins Menü
      if (gameState === 'playing' && gameOver) {
        if (e.key === 'Enter') {
          backToMenu();
        }
        return;
      }

      // Level Complete/Gewonnen: ENTER = nächstes Level oder zurück ins Menü
      if (gameState === 'playing' && won) {
        if (e.key === 'Enter') {
          if (level < 3) {
            setLevel(l => l + 1);
          } else {
            backToMenu();
          }
        }
        return;
      }

      // Normale Steuerung
      if (gameState === 'playing' && !gameOver && !won) {
        if (e.key === 'ArrowUp') setDirection('up');
        else if (e.key === 'ArrowDown') setDirection('down');
        else if (e.key === 'ArrowLeft') setDirection('left');
        else if (e.key === 'ArrowRight') setDirection('right');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, gameOver, won, level, menuIndex]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || gameOver || won) {
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
        moveInterval.current = null;
      }
      // Game Over Sound
      if (gameOver && gameOverSoundRef.current && !isMuted) {
        gameOverSoundRef.current.currentTime = 0;
        gameOverSoundRef.current.play().catch(() => {});
      }
      return;
    }

    console.log("[PACMAN] Starting game loop");
    
    if (moveInterval.current) clearInterval(moveInterval.current);
    moveInterval.current = setInterval(() => {
      // Prüfe ob das Spiel bereits beendet wurde
      if (currentGameOver.current) {
        return;
      }

      let newPacmanPos = currentPacmanPos.current;
      let gameEnded = false;

      // Pacman bewegt sich
      setPacmanPos(oldPos => {
        const nextPos = getNextPositionPacman(oldPos, direction);
        newPacmanPos = nextPos;
        currentPacmanPos.current = nextPos;

        // Punkte einsammeln
        setDots(dotsOld => {
          const foundIndex = dotsOld.findIndex(d => d.pos.x === nextPos.x && d.pos.y === nextPos.y);
          if (foundIndex !== -1) {
            const dot = dotsOld[foundIndex];
            setScore(scoreOld => scoreOld + (dot.big ? 50 : 10));
            // Sound für gelbe Punkte (big dot)
            if (dot.big && coinSoundRef.current && !isMuted) {
              coinSoundRef.current.currentTime = 0;
              coinSoundRef.current.play().catch(() => {});
            }
            if (dot.big) {
              // Big dot - Geister 15 Sekunden scared
              setGhosts(gsOld =>
                gsOld.map(g => ({
                  ...g,
                  scared: true,
                  scaredTimer: 15,
                }))
              );
            }
            const newDots = [...dotsOld];
            newDots.splice(foundIndex, 1);
            if (newDots.length === 0) {
              setWon(true);
            }
            return newDots;
          }
          return dotsOld;
        });

        return nextPos;
      });

      // Ghosts bewegen sich alle 2 Zyklen (langsamer als Pacman)
      ghostMoveCounter.current++;
      if (ghostMoveCounter.current % 2 === 0) {
        setGhosts(oldGhosts => {
          if (gameEnded) return oldGhosts;
          
          const newGhosts: Ghost[] = [];
          let ghostEaten = false;
          
          for (const g of oldGhosts) {
            // Respawn-Phase: Ghost bleibt sichtbar (weiß), aber bewegt sich nicht und ist nicht scary
            if (g.respawnTimer > 0) {
              const updatedGhost = {
                ...g,
                x: g.startPos.x,
                y: g.startPos.y,
                respawnTimer: g.respawnTimer - 1,
                scared: false,
                scaredTimer: 0,
              };
              newGhosts.push(updatedGhost);
              continue;
            }

            // Kollision Pacman mit essbarem Geist (scared, respawnTimer==0)
            if (
              g.x === newPacmanPos.x &&
              g.y === newPacmanPos.y &&
              g.scared === true &&
              g.respawnTimer === 0
            ) {
              ghostEaten = true;
              newGhosts.push({
                ...g,
                x: g.startPos.x,
                y: g.startPos.y,
                scared: false,
                scaredTimer: 0,
                respawnTimer: 20, // 3 Sekunden bei 150ms Intervall
              });
              continue;
            }

            // Normale Ghost-Logik
            let updatedGhost = { ...g };
            if (g.scared && g.scaredTimer > 0) {
              updatedGhost.scaredTimer--;
              if (updatedGhost.scaredTimer === 0) updatedGhost.scared = false;
            }
            
            const otherGhosts = newGhosts.map(g => ({ x: g.x, y: g.y }));
            const allGhosts = [...otherGhosts, { x: g.x, y: g.y }];
            let target: Position = { x: g.x, y: g.y };
            
            if (g.scared) {
              const moves = getValidMoves(g, allGhosts.filter(p => p.x !== g.x || p.y !== g.y));
              if (moves.length > 0) {
                moves.sort((a, b) => distance(b, newPacmanPos) - distance(a, newPacmanPos));
                target = moves.find(m => !otherGhosts.some(og => og.x === m.x && og.y === m.y)) || g;
              }
            } else {
              const path = findShortestPath(g, newPacmanPos, otherGhosts);
              if (path.length > 0) {
                const nextStep = path[0];
                if (!otherGhosts.some(og => og.x === nextStep.x && og.y === nextStep.y)) {
                  target = nextStep;
                }
              }
            }
            newGhosts.push({ ...updatedGhost, x: target.x, y: target.y });
          }

          if (ghostEaten) {
            setScore(s => s + 200);
          }

          // Normale (nicht-scared) Ghost-Kollision mit der NEUEN Pacman Position
          for (const ghost of newGhosts) {
            if (
              ghost.x === newPacmanPos.x &&
              ghost.y === newPacmanPos.y &&
              !ghost.scared &&
              ghost.respawnTimer === 0
            ) {
              console.log("[PACMAN] Game Over! Collision detected");
              setGameOver(true);
              currentGameOver.current = true;
              gameEnded = true;
              if (moveInterval.current) {
                clearInterval(moveInterval.current);
                moveInterval.current = null;
              }
              break;
            }
          }
          
          currentGhosts.current = newGhosts;
          return newGhosts;
        });
      }
    }, 150);

    return () => {
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
        moveInterval.current = null;
      }
    };
  }, [direction, gameState, gameOver, won]);

  // Canvas rendering
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = canvasDims.width / (MAP_WIDTH * CELL_SIZE);
    canvas.width = canvasDims.width;
    canvas.height = canvasDims.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2 * scale;
    WALLS.forEach(wall => {
      ctx.fillRect(wall.x * CELL_SIZE * scale, wall.y * CELL_SIZE * scale, CELL_SIZE * scale, CELL_SIZE * scale);
      ctx.strokeRect(wall.x * CELL_SIZE * scale, wall.y * CELL_SIZE * scale, CELL_SIZE * scale, CELL_SIZE * scale);
    });

    // Draw portals (damit man sie sehen kann)
    ctx.fillStyle = '#9333ea';
    PORTALS.forEach(portal => {
      ctx.fillRect(portal.x * CELL_SIZE * scale, portal.y * CELL_SIZE * scale, CELL_SIZE * scale, CELL_SIZE * scale);
    });

    // Draw dots
    dots.forEach(dot => {
      const size = dot.big ? CELL_SIZE * 0.6 * scale : CELL_SIZE * 0.3 * scale;
      ctx.fillStyle = dot.big ? '#ffe066' : '#fff';
      ctx.beginPath();
      ctx.arc(
        dot.pos.x * CELL_SIZE * scale + (CELL_SIZE * scale) / 2,
        dot.pos.y * CELL_SIZE * scale + (CELL_SIZE * scale) / 2,
        size / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw Pacman
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(
      pacmanPos.x * CELL_SIZE * scale + (CELL_SIZE * scale) / 2,
      pacmanPos.y * CELL_SIZE * scale + (CELL_SIZE * scale) / 2,
      (CELL_SIZE * scale) / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw ghosts
    ghosts.forEach(g => {
      if (g.respawnTimer > 0) {
        ctx.fillStyle = '#f3f3f3';
      } else if (g.scared) {
        ctx.fillStyle = '#f3f3f3';
      } else {
        ctx.fillStyle = '#ef4444';
      }
      const x = g.x * CELL_SIZE * scale;
      const y = g.y * CELL_SIZE * scale;
      ctx.beginPath();
      ctx.arc(x + (CELL_SIZE * scale) / 2, y + (CELL_SIZE * scale) / 2, (CELL_SIZE * scale) / 2, Math.PI, 0, false);
      ctx.lineTo(x + CELL_SIZE * scale, y + CELL_SIZE * scale);
      ctx.lineTo(x, y + CELL_SIZE * scale);
      ctx.closePath();
      ctx.fill();
    });
  }, [gameState, pacmanPos, dots, ghosts, canvasDims]);

  if (gameState === 'menu') {
    return (
      <div className="pacman-panel">
        <h1 className="pacman-title">PACMAN</h1>
        <div className="pacman-menu">
          <button
            className={`pacman-btn${menuIndex === 0 ? ' selected' : ''}`}
            onClick={startGame}
            tabIndex={0}
          >
            START GAME
          </button>
          <button
            className="pacman-btn disabled"
            disabled
          >
            LEADERBOARD
          </button>
          <button
            className={`pacman-btn${menuIndex === 2 ? ' selected' : ''}`}
            onClick={() => window.location.href = '/'}
            tabIndex={0}
          >
            EXIT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pacman-panel" style={{ width: canvasDims.width + 40, boxShadow: '0 8px 32px #0008', borderRadius: 24, background: '#222', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 24, top: 24, color: '#ffe066', fontWeight: 'bold', fontSize: 22 }}>Level {level}</div>
      <div style={{ position: 'absolute', right: 24, top: 24, color: '#fff', fontWeight: 'bold', fontSize: 22 }}>Score: {score}</div>
      <div className="pacman-canvas-wrapper" style={{ marginTop: 48, marginBottom: 24 }}>
        <canvas
          ref={canvasRef}
          width={canvasDims.width}
          height={canvasDims.height}
          className="pacman-game-canvas"
          style={{ display: 'block', borderRadius: 16, boxShadow: '0 4px 16px #0006', background: '#181818' }}
        />
      </div>
      {gameOver && (
        <>
          <div className="pacman-gameover" style={{ color: '#ef4444', fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>Game Over</div>
          <button className="pacman-btn" onClick={backToMenu} tabIndex={0} style={{ fontSize: 20, padding: '10px 32px', borderRadius: 12 }}>
            Back to Menu
          </button>
        </>
      )}
      {won && (
        <>
          {level < 3 ? (
            <>
              <div className="pacman-win" style={{ color: '#22c55e', fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>Level Complete!</div>
              <button className="pacman-btn" onClick={() => setLevel(l => l + 1)} tabIndex={0} style={{ fontSize: 20, padding: '10px 32px', borderRadius: 12 }}>
                Next Level
              </button>
            </>
          ) : (
            <>
              <div className="pacman-win" style={{ color: '#22c55e', fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>Gewonnen!</div>
              <button className="pacman-btn" onClick={backToMenu} tabIndex={0} style={{ fontSize: 20, padding: '10px 32px', borderRadius: 12 }}>
                Back to Menu
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PacMan;
