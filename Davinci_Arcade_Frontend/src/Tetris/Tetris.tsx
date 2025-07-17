import React, { useCallback, useEffect, useRef, useState } from "react";
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

type GameState = "start" | "playing" | "gameover";

const getRandomPiece = (): Piece => {
  const shape = Math.floor(Math.random() * SHAPES.length);
  return { shape, rotation: 0, x: 3, y: 0 };
};

const emptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(-1)
  );

const Tetris: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("start");
  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState<Piece | null>(null);
  const [next, setNext] = useState<Piece>(getRandomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [dropTime, setDropTime] = useState(700);
  const [coins, setCoins] = useState(1268);
  const [ship, setShip] = useState("BASIC FIGHTER");
  const requestRef = useRef<number>();
  const lastDrop = useRef(Date.now());
  // Menu navigation state
  const [menuIndex, setMenuIndex] = useState(0); // for start screen
  const [gameoverIndex, setGameoverIndex] = useState(0); // for gameover screen

  // Start Game
  const startGame = () => {
    setBoard(emptyBoard());
    setCurrent(getRandomPiece());
    setNext(getRandomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setDropTime(700);
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
          setGameState("gameover");
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
  }, [gameState, current, board, next, isValid, merge, clearLines, dropTime, level, lines]);

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
          setGameState("start");
        }
      }
      if (e.key === "Escape") setGameState("start");
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [gameState, current, isValid]);

  // Keyboard navigation for start and gameover screens
  useEffect(() => {
    if (gameState === "playing") return;
    const handle = (e: KeyboardEvent) => {
      // Startscreen
      if (gameState === "start") {
        const menu = [
          () => startGame(),
          null, // SHOP
          null, // SHIP MANAGER
          null, // HIGHSCORE
          null, // INFO
          () => window.location.href = "/"
        ];
        if (["ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          setMenuIndex((idx) => {
            let next = idx + (e.key === "ArrowDown" ? 1 : -1);
            // skip disabled
            const max = menu.length - 1;
            while (next >= 0 && next <= max && menu[next] === null) {
              next += (e.key === "ArrowDown" ? 1 : -1);
            }
            if (next < 0) next = max;
            if (next > max) next = 0;
            while (menu[next] === null) {
              next += (e.key === "ArrowDown" ? 1 : -1);
              if (next < 0) next = max;
              if (next > max) next = 0;
            }
            return next;
          });
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (menu[menuIndex]) menu[menuIndex]!();
        }
      }
      // Gameover
      if (gameState === "gameover") {
        const menu = [
          () => startGame(),
          () => setGameState("start")
        ];
        if (["ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          setGameoverIndex((idx) => (idx + (e.key === "ArrowDown" ? 1 : -1) + menu.length) % menu.length);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          menu[gameoverIndex]!();
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
      {gameState === "start" && (
        <div className="tetris-startscreen" style={{maxWidth: '900px', width: '100%', margin: 'auto'}}>
          <h1 className="tetris-title">TETRIS</h1>
          <div className="tetris-ship">{/* Pixel Ship Icon */}</div>
          <div className="tetris-info-row">
            <span className="tetris-label">SHIP:</span>
            <span className="tetris-value">{ship}</span>
          </div>
          <div className="tetris-info-row">
            <span className="tetris-label">COINS:</span>
            <span className="tetris-value">{coins}</span>
          </div>
          <div className="tetris-menu">
            <button className={`tetris-menu-btn${menuIndex === 0 ? " selected" : ""}`} onClick={startGame} tabIndex={-1}>
              START GAME
            </button>
            <button className="tetris-menu-btn" disabled tabIndex={-1}>
              SHOP
            </button>
            <button className="tetris-menu-btn" disabled tabIndex={-1}>
              SHIP MANAGER
            </button>
            <button className="tetris-menu-btn" disabled tabIndex={-1}>
              HIGHSCORE
            </button>
            <button className="tetris-menu-btn" disabled tabIndex={-1}>
              INFO
            </button>
            <button className={`tetris-menu-btn${menuIndex === 5 ? " selected" : ""}`} onClick={() => window.location.href = '/'} tabIndex={-1}>
              EXIT
            </button>
          </div>
          <div className="tetris-hint">
            Use <span>↑↓</span> arrows to navigate, <span>ENTER</span> to select
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
            <button className="tetris-menu-btn" onClick={() => setGameState("start")}>EXIT</button>
          </div>
        </div>
      )}
      {gameState === "gameover" && (
        <div className="tetris-gameover">
          <h2 className="tetris-title">GAME OVER</h2>
          <div className="tetris-score-final">Score: {score}</div>
          <button className={`tetris-menu-btn${gameoverIndex === 0 ? " selected" : ""}`} onClick={startGame} tabIndex={-1}>RESTART</button>
          <button className={`tetris-menu-btn${gameoverIndex === 1 ? " selected" : ""}`} onClick={() => setGameState("start") } tabIndex={-1}>BACK TO MENU</button>
        </div>
      )}
    </div>
  );
};

export default Tetris;