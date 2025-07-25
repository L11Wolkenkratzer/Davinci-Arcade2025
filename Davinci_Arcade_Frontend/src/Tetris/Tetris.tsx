import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../SettingsContext";
import type { Player } from "../App";
import "./Tetris.css";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 48;

// 🎨 Saftige Farben
const COLORS = [
  "#00FFFF", // I - Cyan
  "#FF8C00", // L - Orange
  "#0080FF", // J - Blau
  "#FFD700", // O - Gold
  "#00FF00", // S - Grün
  "#FF0040", // Z - Rot
  "#C040FF", // T - Lila
];

const GLOW_COLORS = [
  "#80FFFF", "#FFB84D", "#4DA6FF", "#FFF066", 
  "#66FF66", "#FF6680", "#E680FF"
];

const SHAPES = [
  // I
  [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]],
  ],
  // L
  [
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[1,2],[2,0]],
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[0,2]],
  ],
  // J
  [
    [[0,2],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[2,0]],
    [[1,0],[1,1],[1,2],[0,0]],
  ],
  // O
  [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
  ],
  // S
  [
    [[1,1],[2,1],[0,2],[1,2]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[1,0],[1,1],[2,1],[2,2]],
  ],
  // Z
  [
    [[0,1],[1,1],[1,2],[2,2]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[2,0],[1,1],[2,1],[1,2]],
  ],
  // T
  [
    [[1,1],[0,2],[1,2],[2,2]],
    [[1,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[0,1],[1,1],[1,2]],
  ],
];

type Piece = {
  shape: number;
  rotation: number;
  x: number;
  y: number;
};

type GameState = "start" | "playing" | "gameover" | "highscores";

type HighscoreEntry = {
  _id: string;
  playerId: {
    name: string;
    badgeId: string;
  };
  score: number;
  level: number;
  duration: number;
  createdAt: string;
};

type PlayerStats = {
  totalScore: number;
  gamesPlayed: number;
  tetrisHighscore: number;
  tetrisCoins: number;
  tetrisGamesPlayed: number;
};

const getRandomPiece = (): Piece => {
  const shape = Math.floor(Math.random() * SHAPES.length);
  return { shape, rotation: 0, x: 3, y: 0 };
};

const emptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(-1)
  );

const Tetris: React.FC<{ currentPlayer?: Player }> = ({ currentPlayer }) => {
  // SettingsContext für Sound
  const { volume, isMuted } = useSettings();

  // Sound-Refs
  const lineClearSoundRef = useRef<HTMLAudioElement>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement>(null);
  const levelUpSoundRef = useRef<HTMLAudioElement>(null);
  const lobbyMusicRef = useRef<HTMLAudioElement>(null);
  const gameMusicRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backBufferRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState<Piece | null>(null);
  const [next, setNext] = useState<Piece>(getRandomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [dropTime, setDropTime] = useState(700);
  const [coins, setCoins] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewHighscore, setShowNewHighscore] = useState(false);
  
  // 🚀 ANTI-FLICKER: Double Buffering
  const requestRef = useRef<number>(0);
  const lastDrop = useRef(Date.now());
  const lastGameState = useRef<any>(null);
  
  // Menu navigation
  const [menuIndex, setMenuIndex] = useState(0);
  const [gameoverIndex, setGameoverIndex] = useState(0);

  // API Functions (optimiert)
  const apiCall = async (url: string, options?: RequestInit) => {
    const origin5000 = window.location.origin.replace(/:5173$/, ':5000');
    const fullUrl = `${origin5000}${url}`;
    
    try {
      const response = await fetch(fullUrl, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const loadPlayerStats = async () => {
    if (!currentPlayer) return;
    
    try {
      const [playerData, scoresData] = await Promise.all([
        apiCall(`/api/players/${currentPlayer._id}`),
        apiCall('/api/scores/game/tetris')
      ]);
      
      const tetrisScores = scoresData.filter((score: any) => 
        score.playerId._id === currentPlayer._id
      );
      
      const tetrisHighscore = tetrisScores.length > 0 
        ? Math.max(...tetrisScores.map((s: any) => s.score))
        : 0;
      
      const stats: PlayerStats = {
        totalScore: playerData.totalScore || 0,
        gamesPlayed: playerData.gamesPlayed || 0,
        tetrisHighscore,
        tetrisCoins: Math.floor(tetrisHighscore / 100),
        tetrisGamesPlayed: tetrisScores.length
      };
      
      setPlayerStats(stats);
      setCoins(stats.tetrisCoins);
      
    } catch (error) {
      console.error('Load player stats failed:', error);
    }
  };

  const loadHighscores = async () => {
    try {
      const data = await apiCall('/api/scores/game/tetris');
      setHighscores(data.slice(0, 10));
    } catch (error) {
      console.error('Error loading highscores:', error);
      setHighscores([]);
    }
  };

  const submitGameResult = async (finalScore: number, finalLevel: number, finalDuration: number) => {
    if (!currentPlayer || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await apiCall('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayer._id,
          gameName: 'tetris',
          score: finalScore,
          level: finalLevel,
          duration: finalDuration
        })
      });
      
      if (playerStats && finalScore > playerStats.tetrisHighscore) {
        setShowNewHighscore(true);
        setTimeout(() => setShowNewHighscore(false), 5000);
      }
      
      await loadPlayerStats();
      
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentPlayer) loadPlayerStats();
  }, [currentPlayer]);

  // 🎨 FLACKER-FREIE CANVAS DRAWING FUNCTIONS
  const initializeBackBuffer = () => {
    if (!backBufferRef.current) {
      backBufferRef.current = document.createElement('canvas');
    }
    
    const backBuffer = backBufferRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !backBuffer) return null;
    
    backBuffer.width = canvas.width;
    backBuffer.height = canvas.height;
    
    return backBuffer.getContext('2d');
  };

  const drawTetrisBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colorIndex: number, intensity = 1) => {
    const baseColor = COLORS[colorIndex];
    const glowColor = GLOW_COLORS[colorIndex];
    
    // Gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + size);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, baseColor);
    
    // Block mit Glow
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 15 * intensity;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 8);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  };

  const drawBoard = (ctx: CanvasRenderingContext2D, displayBoard: number[][], boardX: number, boardY: number) => {
    // Board background
    const bgGradient = ctx.createLinearGradient(boardX, boardY, boardX, boardY + BOARD_HEIGHT * BLOCK_SIZE);
    bgGradient.addColorStop(0, "#001122");
    bgGradient.addColorStop(1, "#000811");
    
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(boardX - 4, boardY - 4, BOARD_WIDTH * BLOCK_SIZE + 8, BOARD_HEIGHT * BLOCK_SIZE + 8, 16);
    ctx.fill();
    
    // Board border
    ctx.shadowColor = "#00DDFF";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#00DDFF";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Grid (subtil)
    ctx.strokeStyle = "#004466";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    for (let i = 1; i < BOARD_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(boardX + i * BLOCK_SIZE, boardY);
      ctx.lineTo(boardX + i * BLOCK_SIZE, boardY + BOARD_HEIGHT * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let i = 1; i < BOARD_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(boardX, boardY + i * BLOCK_SIZE);
      ctx.lineTo(boardX + BOARD_WIDTH * BLOCK_SIZE, boardY + i * BLOCK_SIZE);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    
    // Blocks
    displayBoard.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== -1) {
          const time = Date.now() * 0.002;
          const pulse = 1 + Math.sin(time + x + y) * 0.05;
          const blockSize = BLOCK_SIZE * 0.95;
          const offset = (BLOCK_SIZE - blockSize) / 2;
          
          drawTetrisBlock(ctx, 
            boardX + x * BLOCK_SIZE + offset, 
            boardY + y * BLOCK_SIZE + offset, 
            blockSize, 
            cell, 
            pulse
          );
        }
      });
    });
  };

  const drawNextPiece = (ctx: CanvasRenderingContext2D, piece: Piece, x: number, y: number) => {
    const boxSize = 120;
    
    // Next box
    const bgGradient = ctx.createLinearGradient(x, y, x, y + boxSize);
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(1, "#0f0f1a");
    
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(x, y, boxSize, boxSize, 12);
    ctx.fill();
    
    ctx.shadowColor = "#00DDFF";
    ctx.shadowBlur = 15;
    ctx.strokeStyle = "#00DDFF";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Next piece
    const shape = SHAPES[piece.shape][0];
    const blockSize = 28;
    shape.forEach(([dx, dy]) => {
      drawTetrisBlock(ctx, x + dx * blockSize + 20, y + dy * blockSize + 20, blockSize, piece.shape, 1.2);
    });
  };

  const drawGameCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const boardX = canvas.width / 2 - (BOARD_WIDTH * BLOCK_SIZE) / 2 - 120;
    const boardY = (canvas.height - BOARD_HEIGHT * BLOCK_SIZE) / 2;
    
    // Clear mit Gradient
    const bgGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
    );
    bgGradient.addColorStop(0, '#001122');
    bgGradient.addColorStop(0.7, '#000811');
    bgGradient.addColorStop(1, '#000406');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    const displayBoard = getDisplayBoard();
    drawBoard(ctx, displayBoard, boardX, boardY);
    
    // Sidebar
    const sidebarX = boardX + BOARD_WIDTH * BLOCK_SIZE + 80;
    const sidebarY = boardY;
    
    // Next piece
    ctx.font = "18px 'Press Start 2P'";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#FFD700";
    ctx.fillText("NEXT", sidebarX, sidebarY - 25);
    ctx.shadowBlur = 0;
    
    drawNextPiece(ctx, next, sidebarX, sidebarY + 5);
    
    // Stats
    const statsStartY = sidebarY + 150;
    const statItems = [
      { label: "SCORE", value: score.toString(), color: "#00FFFF" },
      { label: "LINES", value: lines.toString(), color: "#FF4500" },
      { label: "LEVEL", value: level.toString(), color: "#32CD32" },
      { label: "COINS", value: coins.toString(), color: "#FFD700" }
    ];
    
    ctx.font = "16px 'Press Start 2P'";
    statItems.forEach((stat, index) => {
      const y = statsStartY + index * 45;
      
      ctx.shadowColor = stat.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = stat.color;
      ctx.fillText(stat.label, sidebarX, y);
      
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(stat.value, sidebarX + 160, y);
      ctx.shadowBlur = 0;
    });
    
    // Hint
    ctx.font = "14px 'Press Start 2P'";
    ctx.textAlign = 'center';
    ctx.shadowColor = "#00DDFF";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#00DDFF";
    ctx.fillText("Hold Space To Exit", canvas.width / 2, boardY + BOARD_HEIGHT * BLOCK_SIZE + 45);
    ctx.shadowBlur = 0;
  };

  // Game logic
  // Sound-Initialisierung
  useEffect(() => {
    // Falls volume als Prozentwert kommt, umrechnen
    const safeVolume = typeof volume === "number" && volume > 1 ? volume / 100 : volume;
    if (lineClearSoundRef.current) {
      lineClearSoundRef.current.volume = isMuted ? 0 : safeVolume;
    }
    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.volume = isMuted ? 0 : safeVolume;
    }
    if (levelUpSoundRef.current) {
      levelUpSoundRef.current.volume = isMuted ? 0 : safeVolume;
    }
    if (lobbyMusicRef.current) {
      lobbyMusicRef.current.volume = isMuted ? 0 : safeVolume;
    }
    if (gameMusicRef.current) {
      gameMusicRef.current.volume = isMuted ? 0 : safeVolume;
    }
  }, [volume, isMuted]);

  // Musiksteuerung: Lobby/Game
  useEffect(() => {
    if (gameState === "start") {
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.currentTime = 0;
        lobbyMusicRef.current.loop = true;
        if (!isMuted) lobbyMusicRef.current.play();
      }
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
    } else if (gameState === "playing") {
      if (gameMusicRef.current) {
        gameMusicRef.current.currentTime = 0;
        gameMusicRef.current.loop = true;
        if (!isMuted) gameMusicRef.current.play();
      }
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.pause();
        lobbyMusicRef.current.currentTime = 0;
      }
    } else {
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.pause();
        lobbyMusicRef.current.currentTime = 0;
      }
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
    }
  }, [gameState, isMuted]);

  const playLineClear = () => {
    if (lineClearSoundRef.current && lineClearSoundRef.current.src) {
      lineClearSoundRef.current.currentTime = 0;
      lineClearSoundRef.current.play();
    }
  };
  const playGameOver = () => {
    if (gameOverSoundRef.current && gameOverSoundRef.current.src) {
      gameOverSoundRef.current.currentTime = 0;
      gameOverSoundRef.current.play();
    }
  };
  const playLevelUp = () => {
    if (levelUpSoundRef.current && levelUpSoundRef.current.src) {
      levelUpSoundRef.current.currentTime = 0;
      levelUpSoundRef.current.play();
    }
  };

  // ...existing code...

  // Sound-Elemente (aus public-Ordner)
  // lineClear.mp3, gameOver.mp3, levelUp.mp3 müssen im public-Ordner liegen

  const startGame = () => {
    setBoard(emptyBoard());
    setCurrent(getRandomPiece());
    setNext(getRandomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setDropTime(700);
    setCoins(playerStats?.tetrisCoins || 0);
    setGameStartTime(Date.now());
    setShowNewHighscore(false);
    setGameState("playing");
  };

  const isValid = useCallback(
    (piece: Piece, testBoard = board) => {
      const shape = SHAPES[piece.shape][piece.rotation];
      return shape.every(([dx, dy]) => {
        const x = piece.x + dx;
        const y = piece.y + dy;
        return (
          x >= 0 &&
          x < BOARD_WIDTH &&
          y >= 0 &&
          y < BOARD_HEIGHT &&
          (testBoard[y][x] === -1)
        );
      });
    },
    [board]
  );

  const merge = useCallback(
    (piece: Piece, toBoard = board) => {
      const newBoard = toBoard.map((row) => [...row]);
      SHAPES[piece.shape][piece.rotation].forEach(([dx, dy]) => {
        const x = piece.x + dx;
        const y = piece.y + dy;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          newBoard[y][x] = piece.shape;
        }
      });
      return newBoard;
    },
    []
  );

  const clearLines = useCallback((b: number[][]) => {
    let cleared = 0;
    const newBoard = b.filter((row) => {
      if (row.every((cell) => cell !== -1)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(-1));
    }
    if (cleared > 0) {
      playLineClear();
    }
    return { newBoard, cleared };
  }, [playLineClear]);

  const handleGameOver = useCallback(() => {
    const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
    const coinsEarned = Math.floor(score / 100);

    setCoins(prev => prev + coinsEarned);

    playGameOver();

    if (currentPlayer) {
      submitGameResult(score, level, gameDuration);
    }

    setGameState("gameover");
  }, [score, level, currentPlayer, gameStartTime]);

  const getDisplayBoard = () => {
    const display = board.map((row) => [...row]);
    if (current) {
      SHAPES[current.shape][current.rotation].forEach(([dx, dy]) => {
        const x = current.x + dx;
        const y = current.y + dy;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          display[y][x] = current.shape;
        }
      });
    }
    return display;
  };

  // 🚀 FLACKER-FREIE CANVAS RENDER LOOP - NUR FÜR PLAYING STATE
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // 🎯 ANTI-FLICKER: Double buffering
      const backCtx = initializeBackBuffer();
      if (!backCtx || !backBufferRef.current) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Render auf Back Buffer
      drawGameCanvas(backCtx, backBufferRef.current);
      
      // Copy back buffer to main canvas (atomic operation)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(backBufferRef.current, 0, 0);
      
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, board, current, next, score, lines, level, coins]);

  // Drop logic
  useEffect(() => {
    if (gameState !== "playing" || !current) return;
    
    const drop = () => {
      let moved = { ...current, y: current.y + 1 };
      if (isValid(moved)) {
        setCurrent(moved);
      } else {
        let merged = merge(current, board);
        const { newBoard, cleared } = clearLines(merged);
        setBoard(newBoard);
        setScore((s) => s + [0, 40, 100, 300, 1200][cleared] * level);
        setLines((l) => l + cleared);
        if (cleared > 0 && (lines + cleared) % 10 === 0) {
          setLevel((lv) => lv + 1);
          setDropTime((t) => Math.max(100, t - 60));
          playLevelUp();
        }
        
        const n = next;
        if (!isValid({ ...n, y: 0, x: n.x }, newBoard)) {
          handleGameOver();
        } else {
          setCurrent(n);
          setNext(getRandomPiece());
        }
      }
      lastDrop.current = Date.now();
    };

    const animate = () => {
      if (Date.now() - lastDrop.current > dropTime) {
        drop();
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState, current, board, next, isValid, merge, clearLines, dropTime, level, lines, handleGameOver]);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== "playing" || !current) return;
    
    const handle = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) e.preventDefault();
      
      if (e.key === "ArrowLeft") {
        const moved = { ...current, x: current.x - 1 };
        if (isValid(moved)) setCurrent(moved);
      }
      if (e.key === "ArrowRight") {
        const moved = { ...current, x: current.x + 1 };
        if (isValid(moved)) setCurrent(moved);
      }
      if (e.key === "ArrowDown") {
        const moved = { ...current, y: current.y + 1 };
        if (isValid(moved)) setCurrent(moved);
      }
      if (e.key === "ArrowUp") {
        const rotated = { ...current, rotation: (current.rotation + 1) % 4 };
        if (isValid(rotated)) setCurrent(rotated);
      }
      if (e.key === " ") {
        let drop = { ...current };
        let didDrop = false;
        while (isValid({ ...drop, y: drop.y + 1 })) {
          drop = { ...drop, y: drop.y + 1 };
          didDrop = true;
        }
        if (didDrop) {
          setCurrent(drop);
        } else {
          handleGameOver();
        }
      }
      if (e.key === "Escape") {
        handleGameOver();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [gameState, current, isValid, handleGameOver]);

  // Menu navigation
  useEffect(() => {
    if (gameState === "playing") return;
    
    const handle = (e: KeyboardEvent) => {
      if (gameState === "start") {
        const menuItems = [
          () => startGame(),
          () => { loadHighscores(); setGameState("highscores"); },
          null,
          () => window.location.href = "/"
        ];
        
        if (["ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          setMenuIndex((idx) => {
            let next = idx + (e.key === "ArrowDown" ? 1 : -1);
            while (next >= 0 && next < menuItems.length && menuItems[next] === null) {
              next += (e.key === "ArrowDown" ? 1 : -1);
            }
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
      }
      
      if (gameState === "gameover") {
        const menuItems = [
          () => startGame(),
          () => setGameState("start")
        ];
        
        if (["ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          setGameoverIndex((idx) => (idx + (e.key === "ArrowDown" ? 1 : -1) + menuItems.length) % menuItems.length);
        }
        
        if (e.key === "Enter") {
          e.preventDefault();
          menuItems[gameoverIndex]!();
        }
      }
      
      if (gameState === "highscores") {
        if (e.key === "Escape" || e.key === "Enter") {
          e.preventDefault();
          setGameState("start");
        }
      }
    };
    
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [gameState, menuIndex, gameoverIndex]);

  // 🎮 HYBRID RENDER: HTML für Menüs, Canvas für Spiel
  return (
    <div className="tetris-hybrid-container">
      {/* Sound-Elemente */}
      <audio ref={lineClearSoundRef} src="/lineClear.mp3" preload="auto" />
      <audio ref={gameOverSoundRef} src="/gameOver.mp3" preload="auto" />
      <audio ref={levelUpSoundRef} src="/levelUp.mp3" preload="auto" />
      <audio ref={lobbyMusicRef} src="/Sounds/Tetris/tetris_lobby music.mp3" preload="auto" />
      <audio ref={gameMusicRef} src="/Sounds/Tetris/tetris game music.mp3" preload="auto" />
      {/* 🎉 NEW HIGHSCORE NOTIFICATION */}
      {showNewHighscore && (
        <div className="tetris-notification">
          <div className="tetris-notification-content">
            🎉 NEW HIGHSCORE! 🎉
          </div>
        </div>
      )}

      {/* 🏠 START SCREEN - HTML */}
      {gameState === "start" && (
        <div className="tetris-screen tetris-start-screen">
          <div className="tetris-panel">
            <h1 className="tetris-title">TETRIS</h1>
            
            {currentPlayer && (
              <div className="tetris-welcome">
                Welcome, {currentPlayer.name}!
              </div>
            )}
            
            {playerStats && (
              <div className="tetris-stats">
                <div className="tetris-stat-row">
                  <span className="tetris-label">COINS:</span>
                  <span className="tetris-value">{playerStats.tetrisCoins}</span>
                </div>
                <div className="tetris-stat-row">
                  <span className="tetris-label">HIGHSCORE:</span>
                  <span className="tetris-value">{playerStats.tetrisHighscore}</span>
                </div>
                <div className="tetris-stat-row">
                  <span className="tetris-label">GAMES PLAYED:</span>
                  <span className="tetris-value">{playerStats.tetrisGamesPlayed}</span>
                </div>
              </div>
            )}
            
            <div className="tetris-menu">
              <button 
                className={`tetris-btn ${menuIndex === 0 ? 'selected' : ''}`}
                onClick={startGame}
              >
                START GAME
              </button>
              <button 
                className={`tetris-btn ${menuIndex === 1 ? 'selected' : ''}`}
                onClick={() => { loadHighscores(); setGameState("highscores"); }}
              >
                HIGHSCORES
              </button>
              <button className="tetris-btn disabled" disabled>
                INFO
              </button>
              <button 
                className={`tetris-btn ${menuIndex === 3 ? 'selected' : ''}`}
                onClick={() => window.location.href = '/'}
              >
                EXIT
              </button>
            </div>
            
            <div className="tetris-hint">
              Use <span>↑↓</span> arrows to navigate, <span>ENTER</span> to select
            </div>
          </div>
        </div>
      )}

      {/* 🎮 GAME SCREEN - CANVAS */}
      {gameState === "playing" && (
        <div className="tetris-canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="tetris-game-canvas"
          />
        </div>
      )}

      {/* ☠️ GAME OVER SCREEN - HTML */}
      {gameState === "gameover" && (
        <div className="tetris-screen tetris-gameover-screen">
          <div className="tetris-panel gameover">
            <h2 className="tetris-title red">GAME OVER</h2>
            
            <div className="tetris-final-stats">
              <div className="tetris-final-stat">Final Score: {score}</div>
              <div className="tetris-final-stat">Level Reached: {level}</div>
              <div className="tetris-final-stat">Lines Cleared: {lines}</div>
              <div className="tetris-final-stat">Coins Earned: {Math.floor(score / 100)}</div>
            </div>
            
            {isSubmitting && (
              <div className="tetris-submitting">
                Saving score...
              </div>
            )}
            
            <div className="tetris-menu">
              <button 
                className={`tetris-btn ${gameoverIndex === 0 ? 'selected' : ''}`}
                onClick={startGame}
              >
                RESTART
              </button>
              <button 
                className={`tetris-btn ${gameoverIndex === 1 ? 'selected' : ''}`}
                onClick={() => setGameState("start")}
              >
                BACK TO MENU
              </button>
            </div>
            
            <div className="tetris-hint">
              Use <span>↑↓</span> arrows to navigate, <span>ENTER</span> to select
            </div>
          </div>
        </div>
      )}

      {/* 🏆 HIGHSCORES SCREEN - HTML */}
      {gameState === "highscores" && (
        <div className="tetris-screen tetris-highscores-screen">
          <div className="tetris-panel highscores">
            <h2 className="tetris-title green">HIGHSCORES</h2>
            
            <div className="tetris-highscore-list">
              {highscores.length > 0 ? (
                highscores.map((entry, index) => (
                  <div key={entry._id} className={`tetris-highscore-entry rank-${index + 1}`}>
                    <span className="tetris-rank">#{index + 1}</span>
                    <span className="tetris-name">
                      {entry.playerId.name.length > 15 
                        ? entry.playerId.name.substring(0, 15) + "..." 
                        : entry.playerId.name
                      }
                    </span>
                    <span className="tetris-score">{entry.score}</span>
                    <span className="tetris-level">L{entry.level}</span>
                  </div>
                ))
              ) : (
                <div className="tetris-no-scores">No highscores yet!</div>
              )}
            </div>
            
            <button 
              className="tetris-btn"
              onClick={() => setGameState("start")}
            >
              BACK
            </button>
            
            <div className="tetris-hint">
              Press <span>ESC</span> or <span>ENTER</span> to go back
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tetris;
