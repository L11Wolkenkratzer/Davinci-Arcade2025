import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Player } from "../App";
import "./Tetris.css";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 48; // px (bigger blocks for a larger board)

const COLORS = [
  "#00f0f0", // I
  "#f0a000", // L
  "#0000f0", // J
  "#f0f000", // O
  "#00f000", // S
  "#f00000", // Z
  "#a000f0", // T
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
  
  const requestRef = useRef<number>();
  const lastDrop = useRef(Date.now());
  
  // Menu navigation state
  const [menuIndex, setMenuIndex] = useState(0); // for start screen
  const [gameoverIndex, setGameoverIndex] = useState(0); // for gameover screen
  const [highscoreIndex, setHighscoreIndex] = useState(0); // for highscore screen

  // 🎯 Load Player Stats beim Start
  useEffect(() => {
    if (currentPlayer) {
      loadPlayerStats();
    }
  }, [currentPlayer]);

// 🔍 Super-detaillierte Debug-API-Funktion
const apiCall = async (url: string, options?: RequestInit) => {
  const startTime = Date.now();
  const origin5000 = window.location.origin.replace(/:5173$/, ':5000');
  const fullUrl = `${origin5000}${url}`;
  
  console.group(`🔍 API DEBUG: ${options?.method || 'GET'} ${url}`);
  console.log('📍 Full URL:', fullUrl);
  console.log('🌐 Origin:', window.location.origin);
  console.log('⚙️ Options:', options);
  
  try {
    // 1. SERVER-STATUS PRÜFEN
    console.log('🔄 Making request...');
    const response = await fetch(fullUrl, options);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 2. RESPONSE-DETAILS LOGGEN
    console.log('⏱️ Request Duration:', `${duration}ms`);
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('🎯 Response OK:', response.ok);
    console.log('🔗 Response URL:', response.url);
    
    // 3. CONTENT-TYPE PRÜFEN
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    // 4. RESPONSE BODY KLONEN FÜR DEBUGGING
    const responseClone = response.clone();
    const rawText = await responseClone.text();
    console.log('📝 Raw Response (first 200 chars):', rawText.substring(0, 200));
    
    if (!response.ok) {
      console.error('❌ HTTP Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        body: rawText
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // 5. JSON-PARSING PRÜFEN
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Content-Type Error:', {
        expected: 'application/json',
        received: contentType,
        isHTML: rawText.includes('<!doctype') || rawText.includes('<html'),
        bodyPreview: rawText.substring(0, 500)
      });
      throw new Error(`Expected JSON, got: ${contentType}`);
    }
    
    const data = await response.json();
    console.log('✅ Parsed JSON:', data);
    console.log('📦 Data Type:', typeof data);
    console.log('🔢 Data Length:', Array.isArray(data) ? data.length : 'N/A');
    
    console.groupEnd();
    return data;
    
  } catch (error) {
    console.error('💥 API Call Failed:', {
      url: fullUrl,
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - startTime}ms`
    });
    
    // 6. NETWORK-ERROR DETAILS
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🌐 Network Error - Possible causes:', {
        serverDown: 'Backend server might not be running',
        cors: 'CORS configuration issue',
        port: 'Wrong port number',
        firewall: 'Firewall blocking request'
      });
    }
    
    console.groupEnd();
    throw error;
  }
};

// 🔧 SERVER-HEALTH-CHECK HINZUFÜGEN
const checkServerHealth = async () => {
  console.group('🏥 SERVER HEALTH CHECK');
  
  try {
    const healthCheck = await fetch('/api/health');
    console.log('🔍 Health Check Status:', healthCheck.status);
    
    if (healthCheck.ok) {
      const healthData = await healthCheck.json();
      console.log('✅ Server is running:', healthData);
    } else {
      console.error('❌ Server health check failed:', healthCheck.status);
    }
  } catch (error) {
    console.error('💥 Server unreachable:', error.message);
  }
  
  console.groupEnd();
};

// 🔧 ROUTE-VALIDATION HINZUFÜGEN
const validateRoute = async (route: string) => {
  console.group(`🛣️ ROUTE VALIDATION: ${route}`);
  
  try {
    const response = await fetch(route, { method: 'OPTIONS' });
    console.log('🔍 OPTIONS Response:', response.status);
    console.log('🔍 Allowed Methods:', response.headers.get('allow'));
    console.log('🔍 CORS Headers:', {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    });
  } catch (error) {
    console.error('❌ Route validation failed:', error.message);
  }
  
  console.groupEnd();
};

// 🔧 ERWEITERTE LOAD-PLAYER-STATS MIT ALLEN DEBUG-FEATURES
const loadPlayerStats = async () => {
  if (!currentPlayer) return;
  
  console.group('🎮 LOADING PLAYER STATS');
  console.log('👤 Current Player:', currentPlayer);
  
  // 1. SERVER-HEALTH PRÜFEN
  await checkServerHealth();
  
  // 2. ROUTE-VALIDATION
  await validateRoute(`/api/players/${currentPlayer._id}`);
  await validateRoute('/api/scores/game/tetris');
  
  try {
    // 3. PLAYER-DATEN LADEN
    console.log('📊 Loading player data...');
    const playerData = await apiCall(`/api/players/${currentPlayer._id}`);
    
    // 4. TETRIS-SCORES LADEN
    console.log('🎮 Loading tetris scores...');
    const scoresData = await apiCall('/api/scores/game/tetris');
    
    // 5. DATEN-VERARBEITUNG
    console.log('🔄 Processing data...');
    const tetrisScores = scoresData.filter((score: any) => 
      score.playerId._id === currentPlayer._id
    );
    
    console.log('🎯 Filtered tetris scores:', tetrisScores);
    
    const tetrisHighscore = tetrisScores.length > 0 
      ? Math.max(...tetrisScores.map((s: any) => s.score))
      : 0;
    
    const tetrisGamesPlayed = tetrisScores.length;
    const tetrisCoins = Math.floor(tetrisHighscore / 100);
    
    const stats: PlayerStats = {
      totalScore: playerData.totalScore || 0,
      gamesPlayed: playerData.gamesPlayed || 0,
      tetrisHighscore,
      tetrisCoins,
      tetrisGamesPlayed
    };
    
    console.log('📈 Final calculated stats:', stats);
    
    setPlayerStats(stats);
    setCoins(tetrisCoins);
    
  } catch (error) {
    console.error('💥 Load player stats failed:', error);
    // Fallback bleibt gleich
  }
  
  console.groupEnd();
};


// 🔧 KORRIGIERT: Highscores laden mit Debug-API
const loadHighscores = async () => {
  console.log('🏆 Loading Tetris highscores...');
  
  try {
    const data = await apiCall('/api/scores/game/tetris');
    const topScores = data.slice(0, 10);
    
    console.log('🎯 Top 10 Tetris scores:', topScores);
    setHighscores(topScores);
    
  } catch (error) {
    console.error('💥 Error loading highscores:', error);
    console.log('🔄 Using empty highscores list');
    setHighscores([]); // Fallback: Leere Liste
  }
};

// 🔧 KORRIGIERT: Score submitten mit Debug-API
const submitGameResult = async (finalScore: number, finalLevel: number, finalDuration: number) => {
  if (!currentPlayer || isSubmitting) return;
  
  console.log('💾 Submitting game result:', {
    player: currentPlayer.name,
    score: finalScore,
    level: finalLevel,
    duration: finalDuration
  });
  
  setIsSubmitting(true);
  try {
    const payload = {
      playerId: currentPlayer._id,
      gameName: 'tetris',
      score: finalScore,
      level: finalLevel,
      duration: finalDuration
    };
    
    console.log('📤 Sending score payload:', payload);
    
    const result = await apiCall('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    // Prüfe ob neuer Highscore
    if (playerStats && finalScore > playerStats.tetrisHighscore) {
      console.log('🎉 NEW HIGHSCORE ACHIEVED!', {
        oldHighscore: playerStats.tetrisHighscore,
        newHighscore: finalScore
      });
      setShowNewHighscore(true);
      setTimeout(() => setShowNewHighscore(false), 5000);
    }
    
    // Update Player Stats
    console.log('🔄 Refreshing player stats after score submission...');
    await loadPlayerStats();
    
    console.log('✅ Score submitted successfully:', result);
  } catch (error) {
    console.error('💥 Error submitting score:', error);
  } finally {
    setIsSubmitting(false);
    console.log('🏁 Score submission process completed');
  }
};


  // Start Game
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

  // Collision Detection
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

  // Merge piece into board
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

  // Clear lines
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
    return { newBoard, cleared };
  }, []);

  // Game Over Handler
  const handleGameOver = useCallback(() => {
    const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
    const coinsEarned = Math.floor(score / 100);
    
    setCoins(prev => prev + coinsEarned);
    
    if (currentPlayer) {
      submitGameResult(score, level, gameDuration);
    }
    
    setGameState("gameover");
  }, [score, level, currentPlayer, gameStartTime]);

  // Drop logic
  useEffect(() => {
    if (gameState !== "playing" || !current) return;
    
    const drop = () => {
      let moved = { ...current, y: current.y + 1 };
      if (isValid(moved)) {
        setCurrent(moved);
      } else {
        // Merge and check for lines
        let merged = merge(current, board);
        const { newBoard, cleared } = clearLines(merged);
        setBoard(newBoard);
        setScore((s) => s + [0, 40, 100, 300, 1200][cleared] * level);
        setLines((l) => l + cleared);
        if (cleared > 0 && (lines + cleared) % 10 === 0) {
          setLevel((lv) => lv + 1);
          setDropTime((t) => Math.max(100, t - 60));
        }
        
        // New piece
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

  // Keyboard controls for game
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
        // SPACE: Drop if possible, else exit to menu
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

  // Keyboard navigation for menus
  useEffect(() => {
    if (gameState === "playing") return;
    
    const handle = (e: KeyboardEvent) => {
      // Start screen navigation
      if (gameState === "start") {
        const menuItems = [
          () => startGame(),
          () => { loadHighscores(); setGameState("highscores"); },
          null, // INFO (disabled)
          () => window.location.href = "/"
        ];
        
        if (["ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          setMenuIndex((idx) => {
            let next = idx + (e.key === "ArrowDown" ? 1 : -1);
            // Skip disabled items
            while (next >= 0 && next < menuItems.length && menuItems[next] === null) {
              next += (e.key === "ArrowDown" ? 1 : -1);
            }
            if (next < 0) next = menuItems.length - 1;
            if (next >= menuItems.length) next = 0;
            // Skip disabled items again if we wrapped around
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
      
      // Gameover screen navigation
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
      
      // Highscore screen navigation
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

  // Draw board with current piece
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

  // UI
  return (
    <div className="tetris-arcade-bg" style={{justifyContent: 'center', alignItems: 'center', minHeight: '100vh', minWidth: '100vw', display: 'flex'}}>
      {/* New Highscore Notification */}
      {showNewHighscore && (
        <div className="tetris-highscore-notification">
          🎉 NEW HIGHSCORE! 🎉
        </div>
      )}
      
      {gameState === "start" && (
        <div className="tetris-startscreen" style={{maxWidth: '900px', width: '100%', margin: 'auto'}}>
          <h1 className="tetris-title">TETRIS</h1>
          
          {/* Player Info */}
          {currentPlayer && (
            <div className="tetris-player-info">
              <div className="tetris-player-name">
                Welcome, {currentPlayer.name}!
              </div>
            </div>
          )}
          
          {/* Player Stats */}
          {playerStats && (
            <div className="tetris-player-stats">
              <div className="tetris-info-row">
                <span className="tetris-label">COINS:</span>
                <span className="tetris-value">{playerStats.tetrisCoins}</span>
              </div>
              <div className="tetris-info-row">
                <span className="tetris-label">HIGHSCORE:</span>
                <span className="tetris-value">{playerStats.tetrisHighscore}</span>
              </div>
              <div className="tetris-info-row">
                <span className="tetris-label">GAMES PLAYED:</span>
                <span className="tetris-value">{playerStats.tetrisGamesPlayed}</span>
              </div>
            </div>
          )}
          
          <div className="tetris-menu">
            <button 
              className={`tetris-menu-btn${menuIndex === 0 ? " selected" : ""}`} 
              onClick={startGame} 
              tabIndex={-1}
            >
              START GAME
            </button>
            <button 
              className={`tetris-menu-btn${menuIndex === 1 ? " selected" : ""}`} 
              onClick={() => { loadHighscores(); setGameState("highscores"); }} 
              tabIndex={-1}
            >
              HIGHSCORES
            </button>
            <button className="tetris-menu-btn" disabled tabIndex={-1}>
              INFO
            </button>
            <button 
              className={`tetris-menu-btn${menuIndex === 3 ? " selected" : ""}`} 
              onClick={() => window.location.href = '/'} 
              tabIndex={-1}
            >
              EXIT
            </button>
          </div>
          
          <div className="tetris-hint">
            Use <span>↑↓</span> arrows to navigate, <span>ENTER</span> to select
          </div>
        </div>
      )}

      {gameState === "highscores" && (
        <div className="tetris-highscores">
          <h2 className="tetris-title">HIGHSCORES</h2>
          <div className="tetris-highscore-list">
            {highscores.length > 0 ? (
              highscores.map((entry, index) => (
                <div key={entry._id} className="tetris-highscore-entry">
                  <span className="tetris-rank">#{index + 1}</span>
                  <span className="tetris-name">{entry.playerId.name}</span>
                  <span className="tetris-score">{entry.score}</span>
                  <span className="tetris-level">L{entry.level}</span>
                </div>
              ))
            ) : (
              <div className="tetris-no-scores">No highscores yet!</div>
            )}
          </div>
          <button 
            className="tetris-menu-btn" 
            onClick={() => setGameState("start")}
            tabIndex={-1}
          >
            BACK
          </button>
          <div className="tetris-hint">
            Press <span>ESC</span> or <span>ENTER</span> to go back
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="tetris-game" style={{justifyContent: 'center', alignItems: 'center', display: 'flex', width: '100vw', height: '100vh', minHeight: '100vh'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
            <div
              className="tetris-board"
              style={{
                width: `calc(${BOARD_WIDTH} * ${BLOCK_SIZE}px + 2px)`,
                height: `calc(${BOARD_HEIGHT} * ${BLOCK_SIZE}px + 2px)`
              }}
            >
              {getDisplayBoard().map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={x + '-' + y}
                    className={`tetris-cell${cell !== -1 ? ' filled' : ''}`}
                    style={{
                      left: x * BLOCK_SIZE,
                      top: y * BLOCK_SIZE,
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      background: cell !== -1 ? COLORS[cell] : undefined,
                      boxShadow: cell !== -1 ? `0 0 16px ${COLORS[cell]}, 0 0 32px #fff2` : undefined,
                    }}
                  />
                ))
              )}
              {/* Grid Overlay */}
              {[...Array(BOARD_WIDTH + 1)].map((_, i) => (
                <div key={"v" + i} className="tetris-grid-v" style={{ left: i * BLOCK_SIZE, height: BOARD_HEIGHT * BLOCK_SIZE }} />
              ))}
              {[...Array(BOARD_HEIGHT + 1)].map((_, i) => (
                <div key={"h" + i} className="tetris-grid-h" style={{ top: i * BLOCK_SIZE, width: BOARD_WIDTH * BLOCK_SIZE }} />
              ))}
            </div>
            <div className="tetris-hint" style={{marginTop: '1.2rem', fontSize: '1.1rem', opacity: 0.7}}>
              Hold <span>Space</span> To Exit
            </div>
          </div>
          
          <div className="tetris-sidebar" style={{marginLeft: '3vw', minWidth: 210, fontSize: '1.2rem'}}>
            <div className="tetris-next">
              <span className="tetris-label">NEXT</span>
              <div className="tetris-next-shape" style={{width: 120, height: 120}}>
                {SHAPES[next.shape][0].map(([dx, dy], i) => (
                  <div
                    key={i}
                    className="tetris-cell filled"
                    style={{
                      left: dx * 36,
                      top: dy * 36,
                      width: 36,
                      height: 36,
                      background: COLORS[next.shape],
                      boxShadow: `0 0 12px ${COLORS[next.shape]}, 0 0 24px #fff2`,
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="tetris-score">
              <span className="tetris-label">SCORE</span>
              <span className="tetris-value">{score}</span>
            </div>
            
            <div className="tetris-score">
              <span className="tetris-label">LINES</span>
              <span className="tetris-value">{lines}</span>
            </div>
            
            <div className="tetris-score">
              <span className="tetris-label">LEVEL</span>
              <span className="tetris-value">{level}</span>
            </div>
            
            <div className="tetris-score">
              <span className="tetris-label">COINS</span>
              <span className="tetris-value">{coins}</span>
            </div>
            
            <button className="tetris-menu-btn" onClick={() => handleGameOver()}>
              EXIT
            </button>
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="tetris-gameover">
          <h2 className="tetris-title">GAME OVER</h2>
          <div className="tetris-score-final">
            <div>Final Score: {score}</div>
            <div>Level Reached: {level}</div>
            <div>Lines Cleared: {lines}</div>
            <div>Coins Earned: {Math.floor(score / 100)}</div>
          </div>
          
          {isSubmitting && (
            <div className="tetris-submitting">
              Saving score...
            </div>
          )}
          
          <div className="tetris-menu">
            <button 
              className={`tetris-menu-btn${gameoverIndex === 0 ? " selected" : ""}`} 
              onClick={startGame} 
              tabIndex={-1}
            >
              RESTART
            </button>
            <button 
              className={`tetris-menu-btn${gameoverIndex === 1 ? " selected" : ""}`} 
              onClick={() => setGameState("start")} 
              tabIndex={-1}
            >
              BACK TO MENU
            </button>
          </div>
          
          <div className="tetris-hint">
            Use <span>↑↓</span> arrows to navigate, <span>ENTER</span> to select
          </div>
        </div>
      )}
    </div>
  );
};

export default Tetris;
