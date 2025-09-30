import React, { useEffect, useRef, useState } from "react";
import "./Snake.css";
import { useNavigate } from 'react-router-dom';
import { useSettings } from "../SettingsContext";
import snakeApi from './snakeApi';
import type { Player, SnakeHighscoreEntry, SnakePlayerStats } from './snakeTypes';

const canvasSize = { width: 700, height: 700 };
const scale = 35;
const rows = Math.floor(canvasSize.height / scale);
const cols = Math.floor(canvasSize.width / scale);

interface Coord {
  x: number;
  y: number;
}

// Food darf nicht in der obersten Zeile (HUD) spawnen
const getRandomFood = (): Coord => ({
  x: Math.floor(Math.random() * cols),
  y: 1 + Math.floor(Math.random() * (rows - 1)),
});

// Optimierte Snake-Rendering-Funktion
const drawOptimizedSnake = (ctx: CanvasRenderingContext2D, snake: Coord[], activeSkin: string) => {
  if (snake.length === 0) return;

  snake.forEach((s, i) => {
    const x = s.x * scale;
    const y = s.y * scale;

    if (i === 0) {
      // Kopf
      ctx.fillStyle = '#4a7c59';
      ctx.fillRect(x, y, scale, scale);

      // Augen
      ctx.fillStyle = '#000';
      ctx.fillRect(x + scale * 0.23, y + scale * 0.23, scale * 0.17, scale * 0.17);
      ctx.fillRect(x + scale * 0.6, y + scale * 0.23, scale * 0.17, scale * 0.17);

      // Pupillen
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(x + scale * 0.29, y + scale * 0.29, scale * 0.06, scale * 0.06);
      ctx.fillRect(x + scale * 0.66, y + scale * 0.29, scale * 0.06, scale * 0.06);
    } else {
      let bodyColor;
      switch (activeSkin) {
        case 'yellow':
          bodyColor = '#ffd700';
          break;
        case 'red':
          bodyColor = '#ff6b6b';
          break;
        case 'green':
          bodyColor = '#6ab04c';
          break;
        default:
          bodyColor = '#555';
      }

      ctx.fillStyle = bodyColor;
      ctx.fillRect(x, y, scale, scale);

      if (i % 3 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fillRect(x + scale * 0.15, y + scale * 0.15, scale * 0.25, scale * 0.25);
      }
    }
  });
};

// Optimierte Apfel-Rendering-Funktion
const drawOptimizedApple = (ctx: CanvasRenderingContext2D, food: Coord[]) => {
  food.forEach(f => {
    const x = f.x * scale;
    const y = f.y * scale;
    const centerX = x + scale / 2;
    const centerY = y + scale / 2;
    const radius = scale * 0.4;

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, y + 5);
    ctx.lineTo(centerX, y);
    ctx.stroke();
  });
};

const SnakeGame: React.FC<{ currentPlayer?: Player }> = ({ currentPlayer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Sound-Refs
  const lobbyMusicRef = useRef<HTMLAudioElement | null>(null);
  const eatSoundRef = useRef<HTMLAudioElement | null>(null);

  const { volume, isMuted } = useSettings();

  const [screen, setScreen] = useState<"menu" | "game" | "shopMenu" | "skinShop" | "abilityShop" | "highscore">("menu");

  // Audio-Initialisierung
  useEffect(() => {
    if (!lobbyMusicRef.current) {
      lobbyMusicRef.current = new Audio('/Sounds/Snake/snake_lobby.mp3');
      lobbyMusicRef.current.loop = true;
    }
    if (!eatSoundRef.current) {
      eatSoundRef.current = new Audio('/Sounds/Snake/snake_eating.mp3');
    }

    return () => {
      lobbyMusicRef.current?.pause();
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  // Lautstärke-Kontrolle
  useEffect(() => {
    const actualVolume = isMuted ? 0 : volume / 100;

    if (lobbyMusicRef.current) {
      lobbyMusicRef.current.volume = actualVolume;
      lobbyMusicRef.current.muted = isMuted;
    }

    if (eatSoundRef.current) {
      eatSoundRef.current.volume = actualVolume;
      eatSoundRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const playAudio = async (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current && !isMuted) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.warn('Audio play failed:', error);
      }
    }
  };

  // Lobby-Musik steuern
  useEffect(() => {
    const shouldPlay = ["menu", "shopMenu", "skinShop", "abilityShop", "highscore"].includes(screen);

    if (shouldPlay && !isMuted) {
      if (lobbyMusicRef.current && lobbyMusicRef.current.paused) {
        lobbyMusicRef.current.currentTime = 0;
        lobbyMusicRef.current.play().catch(() => {});
      }
    } else {
      lobbyMusicRef.current?.pause();
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.currentTime = 0;
      }
    }
  }, [screen, isMuted]);

  // Game State
  const [snake, setSnake] = useState([{ x: Math.floor(cols/2), y: Math.floor(rows/2) }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [food, setFood] = useState([getRandomFood()]);
  const [gameOver, setGameOver] = useState(false);
  const [fruits, setFruits] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [activeSkin, setActiveSkin] = useState("black");
  const [ownedAbilities, setOwnedAbilities] = useState<string[]>([]);
  const [activeAbility, setActiveAbility] = useState("");
  const [started, setStarted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pauseSelected, setPauseSelected] = useState(0);

  // ✅ NEUE STATES FÜR HIGHSCORE NAVIGATION
  const [highscoreSelectedIndex, setHighscoreSelectedIndex] = useState(-1); // -1 = Back Button

  // Backend State
  const [highscores, setHighscores] = useState<SnakeHighscoreEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<SnakePlayerStats | null>(null);
  const [showNewHighscore, setShowNewHighscore] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  const lastDirection = useRef(direction);
  const gameLoopRef = useRef<number>(0);

  const skinOptions = [
    { name: "Gelb", color: "yellow", price: 5 },
    { name: "Rot", color: "red", price: 10 },
    { name: "Grün", color: "green", price: 25 },
  ];

  const abilityOptions = [
    { name: "Worm Hole", id: "wormhole", price: 200, description: "Du kannst durch Wände gehen." },
    { name: "Extra Früchte", id: "extrafruit", price: 50, description: "Drei Früchte gleichzeitig" },
  ];

  const generateFood = (snake: Coord[], existingFoods: Coord[]): Coord => {
    let newFood: Coord;
    do {
      newFood = getRandomFood();
    } while (
        newFood.y === 0 ||
        snake.some(s => s.x === newFood.x && s.y === newFood.y) ||
        existingFoods.some(f => f.x === newFood.x && f.y === newFood.y)
        );
    return newFood;
  };

  // Backend Functions
  const loadPlayerStats = async () => {
    if (!currentPlayer) return;

    try {
      const stats = await snakeApi.getPlayerStats(currentPlayer._id);
      setPlayerStats(stats);
      setFruits(stats.snakeCoins || 400); // ✅ Verwende snakeCoins statt snakeFruits
    } catch (error) {
      console.error('Load player stats failed:', error);
    }
  };

  const loadHighscores = async () => {
    try {
      const data = await snakeApi.getHighscores(10);
      setHighscores(data);
    } catch (error) {
      console.error('Error loading highscores:', error);
      setHighscores([]);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (currentPlayer) {
      loadPlayerStats();
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (screen === 'highscore') {
      loadHighscores();
    }
  }, [screen]);

  const handleStart = () => {
    const midX = Math.floor(cols / 2);
    const midY = Math.floor(rows / 2);
    const initial = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY }
    ];

    setSnake(initial);
    setDirection({ x: 0, y: 0 });
    lastDirection.current = { x: 0, y: 0 };

    if (activeAbility === "extrafruit") {
      setFood([
        generateFood(initial, []),
        generateFood(initial, []),
        generateFood(initial, [])
      ]);
    } else {
      setFood([generateFood(initial, [])]);
    }

    setGameOver(false);
    setScreen("game");
    setStarted(false);
    setGameStartTime(Date.now());
    setShowNewHighscore(false);
  };

  const handleKeyNavigation = (optionsLength: number, actions: (() => void)[]) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === "game") return;

      if (e.key === "ArrowUp") {
        setSelectedIndex(prev => (prev - 1 + optionsLength) % optionsLength);
      } else if (e.key === "ArrowDown") {
        setSelectedIndex(prev => (prev + 1) % optionsLength);
      } else if (e.key === "Enter") {
        actions[selectedIndex]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  };

  const handleHighscore = () => {
    setSelectedIndex(0);
    setHighscoreSelectedIndex(-1); // ✅ Reset highscore navigation
    setScreen('highscore');
  };

  // ✅ ERWEITERTE NAVIGATION MIT HIGHSCORE-SUPPORT
  useEffect(() => {
    let cleanup = () => {};

    if (screen === "menu") {
      const actions = [
        handleStart,
        () => setScreen("shopMenu"),
        handleHighscore,
        () => navigate("/")
      ];
      cleanup = handleKeyNavigation(4, actions);
    } else if (screen === "shopMenu") {
      const actions = [
        () => setScreen("skinShop"),
        () => setScreen("abilityShop"),
        () => setScreen("menu")
      ];
      cleanup = handleKeyNavigation(3, actions);
    } else if (screen === "skinShop") {
      const actions = [
        ...skinOptions.map(({ color, price }) => () =>
            !ownedSkins.includes(color) ? buySkin(color, price) : equipSkin(color)
        ),
        () => setScreen("shopMenu")
      ];
      cleanup = handleKeyNavigation(skinOptions.length + 1, actions);
    } else if (screen === "abilityShop") {
      const actions = [
        ...abilityOptions.map(({ id, price }) => () =>
            !ownedAbilities.includes(id) ? buyAbility(id, price) : equipAbility(id)
        ),
        () => setScreen("shopMenu")
      ];
      cleanup = handleKeyNavigation(abilityOptions.length + 1, actions);
    } else if (screen === "highscore") {
      // ✅ NEUE HIGHSCORE NAVIGATION
      const handleHighscoreNavigation = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighscoreSelectedIndex(prev => {
            const newIndex = prev <= 0 ? -1 : prev - 1; // -1 = Back Button
            return newIndex;
          });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighscoreSelectedIndex(prev => {
            const maxIndex = highscores.length - 1;
            const newIndex = prev >= maxIndex ? -1 : prev + 1;
            return newIndex;
          });
        } else if (e.key === "Enter" || e.key === "Escape") {
          setSelectedIndex(0);
          setHighscoreSelectedIndex(-1);
          setScreen("menu");
        }
      };

      window.addEventListener("keydown", handleHighscoreNavigation);
      cleanup = () => window.removeEventListener("keydown", handleHighscoreNavigation);
    }

    return cleanup;
  }, [screen, selectedIndex, highscoreSelectedIndex, fruits, ownedSkins, activeSkin, ownedAbilities, activeAbility, highscores.length]);

  const buySkin = (color: string, price: number) => {
    if (fruits >= price && !ownedSkins.includes(color)) {
      setFruits(f => f - price);
      setOwnedSkins(s => [...s, color]);
    }
  };

  const equipSkin = (color: string) => {
    setActiveSkin(c => (c === color ? "black" : color));
  };

  const buyAbility = (id: string, price: number) => {
    if (fruits >= price && !ownedAbilities.includes(id)) {
      setFruits(f => f - price);
      setOwnedAbilities(a => [...a, id]);
    }
  };

  const equipAbility = (id: string) => {
    setActiveAbility(c => (c === id ? "" : id));
  };

  // Canvas-Rendering
  const renderGame = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#2d5016' : '#35661e';
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }

    drawOptimizedApple(ctx, food);
    drawOptimizedSnake(ctx, snake, activeSkin);
  };

  useEffect(() => {
    if (screen === "game") {
      renderGame();
    }
  }, [snake, food, activeSkin, screen]);

  // HAUPTSPIEL-LOGIK
  useEffect(() => {
    if (gameOver || screen !== "game") return;

    let lastTime = 0;
    const targetFPS = 10;
    const frameDelay = 1000 / targetFPS;

    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTime >= frameDelay) {
        if (direction.x === 0 && direction.y === 0) {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
          return;
        }

        setStarted(true);

        setSnake(prev => {
          if (!prev[0]) return prev;

          const newHead = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };
          let wrapped = { ...newHead };

          if (activeAbility === "wormhole") {
            wrapped.x = (wrapped.x + cols) % cols;
            wrapped.y = (wrapped.y + rows) % rows;
          }

          const hitWall = wrapped.x < 0 || wrapped.y < 0 || wrapped.x >= cols || wrapped.y >= rows;
          const hitSelf = prev.some(p => p.x === wrapped.x && p.y === wrapped.y);

          // GAME OVER LOGIK
          if ((hitWall && activeAbility !== "wormhole") || hitSelf) {
            setGameOver(true);

            const finalScore = Math.max(0, prev.length - 3);
            const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);

            // Score speichern (falls Player vorhanden)
            if (currentPlayer && finalScore > 0) {
              const submitScore = async () => {
                try {
                  await snakeApi.submitScore(
                      currentPlayer._id,
                      finalScore,
                      1,
                      gameDuration
                  );

                  // Check for new highscore
                  if (playerStats && finalScore > playerStats.snakeHighscore) {
                    setShowNewHighscore(true);
                    setTimeout(() => setShowNewHighscore(false), 5000);
                  }

                  // Stats neu laden
                  loadPlayerStats();
                } catch (error) {
                  console.error('Error submitting Snake score:', error);
                }
              };

              submitScore();
            }

            setTimeout(() => {
              setScreen("menu");
              setGameOver(false);
              setDirection({ x: 0, y: 0 });
            }, 3000);

            return prev;
          }

          const ateIndex = food.findIndex(f => f.x === wrapped.x && f.y === wrapped.y);
          let newSnake = [wrapped, ...prev];

          if (ateIndex !== -1) {
            playAudio(eatSoundRef);

            const newFoodArray = [...food];
            newFoodArray.splice(ateIndex, 1);

            if (activeAbility === "extrafruit") {
              while (newFoodArray.length < 3) {
                newFoodArray.push(generateFood(newSnake, newFoodArray));
              }
            } else {
              if (newFoodArray.length === 0) {
                newFoodArray.push(generateFood(newSnake, newFoodArray));
              }
            }

            setFood(newFoodArray);
            setFruits(f => f + 1);

            if (activeAbility === "wormhole") {
              newSnake = [wrapped, ...prev, prev[prev.length - 1]];
            }
          } else {
            newSnake = newSnake.slice(0, -1);
          }

          return newSnake;
        });

        lastDirection.current = direction;
        lastTime = currentTime;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [direction, food, activeAbility, gameOver, screen, currentPlayer, playerStats, gameStartTime]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started) setStarted(true);

      if (paused) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          setPauseSelected(prev => (prev === 0 ? 1 : 0));
        } else if (e.key === "Enter") {
          if (pauseSelected === 0) setPaused(false);
          else setScreen("menu");
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          if (lastDirection.current.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (lastDirection.current.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (lastDirection.current.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (lastDirection.current.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case "p":
        case "P":
          setPaused(true);
          setPauseSelected(0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paused, pauseSelected, started]);

  const initialLength = 3;
  const score = Math.max(0, snake.length - initialLength);

  const hud = (
      <div className="snake-hud">
        <div>
          <span>SCORE:</span>
          <span className="snake-value">{score}</span>
        </div>
        <div>🍏 {fruits}</div>
        <div>Skin: {activeSkin}</div>
        {activeAbility && <div>{activeAbility}</div>}
        {currentPlayer && (
            <div style={{ fontSize: '0.9em', color: '#4a7c59' }}>
              Player: {currentPlayer.name}
            </div>
        )}
        {playerStats && (
            <div style={{ fontSize: '0.8em', color: '#666' }}>
              Best: {playerStats.snakeHighscore}
            </div>
        )}
      </div>
  );

  const renderArcadeButton = (label: string, index: number, onClick: () => void, colorType: 'default' | 'exit' = 'default') => (
      <button
          className={`snake-btn ${index === selectedIndex ? 'selected' : ''} ${colorType === 'exit' ? 'snake-btn-exit' : ''}`}
          onClick={onClick}
          tabIndex={0}
      >
        {label}
      </button>
  );

  return (
      <>
        <div className="snake-root">
          {/* NEW HIGHSCORE NOTIFICATION */}
          {showNewHighscore && (
              <div className="snake-notification">
                <div className="snake-notification-content">
                  NEW HIGHSCORE!
                </div>
              </div>
          )}

          <div>{hud}</div>

          <div className="snake-area">
            {/* MENU */}
            {screen === "menu" && (
                <div className="snake-menu">
                  <h1>Snake Game</h1>
                  {renderArcadeButton("Start Game", 0, handleStart)}
                  {renderArcadeButton("Shop", 1, () => setScreen("shopMenu"))}
                  {renderArcadeButton("Highscore", 2, handleHighscore)}
                  {renderArcadeButton("Exit", 3, () => navigate("/"), 'exit')}
                </div>
            )}

            {/* ✅ ERWEITERTE HIGHSCORE SEKTION MIT NAVIGATION */}
            {screen === "highscore" && (
                <div className="snake-highscore">
                  <h2 className="snake-highscore-title">🐍HALL OF FAME🐍</h2>
                  <div className="snake-highscore-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {highscores.length > 0 ? (
                        highscores.map((entry, i) => (
                            <div
                                key={entry._id || i}
                                className={`snake-highscore-entry rank-${i + 1} ${i === highscoreSelectedIndex ? 'keyboard-selected' : ''}`}
                                ref={el => {
                                  // Auto-scroll zu selected entry
                                  if (i === highscoreSelectedIndex && el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                  }
                                }}
                            >
                              <span className="snake-rank">#{i + 1}</span>
                              <span className="snake-name">
                                {entry.playerId?.name?.length > 15
                                    ? entry.playerId.name.substring(0, 15) + "..."
                                    : entry.playerId?.name || 'Unknown'
                                }
                              </span>
                              <span className="snake-score">{"🍎" + entry.score}</span>
                            </div>
                        ))
                    ) : (
                        <div className="snake-no-scores">
                          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🐍</div>
                          <div>No legendary snakes yet!</div>
                          <div style={{ fontSize: '0.8em', marginTop: '10px' }}>Be the first to slither into history!</div>
                        </div>
                    )}
                  </div>

                  <div className="snake-highscore-controls">
                    <button
                        className={`snake-btn ${highscoreSelectedIndex === -1 ? 'selected keyboard-selected' : ''}`}
                        onClick={() => {
                          setSelectedIndex(0);
                          setHighscoreSelectedIndex(-1);
                          setScreen("menu");
                        }}
                    >
                      BACK TO MENU
                    </button>

                  </div>
                </div>
            )}

            {screen === "shopMenu" && (
                <div className="snake-menu">
                  <h1>Shop</h1>
                  <p>Früchte: {fruits}</p>
                  {renderArcadeButton("Skins", 0, () => setScreen("skinShop"))}
                  {renderArcadeButton("Fähigkeiten", 1, () => setScreen("abilityShop"))}
                  {renderArcadeButton("Zurück", 2, () => setScreen("menu"))}
                </div>
            )}

            {screen === "skinShop" && (
                <div className="snake-shop">
                  <h2>Skins</h2>
                  <p>Früchte: {fruits}</p>
                  {skinOptions.map(({ name, color, price }, i) => (
                      <div key={i}>
                        <h3>{name}</h3>
                        {!ownedSkins.includes(color) ? (
                            renderArcadeButton(`Kaufen (${price})`, i, () => buySkin(color, price))
                        ) : (
                            renderArcadeButton(activeSkin === color ? "Ausgerüstet" : "Ausrüsten", i, () => equipSkin(color))
                        )}
                      </div>
                  ))}
                  {renderArcadeButton("Zurück", skinOptions.length, () => setScreen("shopMenu"))}
                </div>
            )}

            {screen === "abilityShop" && (
                <div className="snake-shop">
                  <h2>Fähigkeiten</h2>
                  <p>Früchte: {fruits}</p>
                  {abilityOptions.map(({ name, id, price, description }, i) => (
                      <div key={i}>
                        <h3>{name} – {description}</h3>
                        {!ownedAbilities.includes(id) ? (
                            renderArcadeButton(`Kaufen (${price})`, i, () => buyAbility(id, price))
                        ) : (
                            renderArcadeButton(activeAbility === id ? "Aktiviert" : "Aktivieren", i, () => equipAbility(id))
                        )}
                      </div>
                  ))}
                  {renderArcadeButton("Zurück", abilityOptions.length, () => setScreen("shopMenu"))}
                </div>
            )}

            {screen === "game" && (
                <>
                  <canvas
                      ref={canvasRef}
                      className="snake-canvas"
                      width={canvasSize.width}
                      height={canvasSize.height}
                  />
                  {paused && (
                      <div className="snake-gameover">
                        <h2>PAUSE</h2>
                        <p>Spiel pausiert</p>
                        <button
                            className={`snake-btn ${pauseSelected === 0 ? 'selected' : ''}`}
                            onClick={() => setPaused(false)}
                        >
                          Weiterspielen
                        </button>
                        <button
                            className={`snake-btn ${pauseSelected === 1 ? 'selected' : ''}`}
                            onClick={() => setScreen('menu')}
                        >
                          Exit
                        </button>
                      </div>
                  )}
                  {gameOver && !paused && (
                      <div className="snake-gameover">
                        <h2>Game Over</h2>
                        <p>Score: {score}</p>
                        <p>Snake Length: {snake.length}</p>
                        <p>Fruits Eaten: {Math.max(0, fruits - (playerStats?.snakeCoins || 400))}</p>
                        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                          Returning to menu in 3 seconds...
                        </p>
                      </div>
                  )}
                </>
            )}
          </div>
        </div>
      </>
  );
};

export default SnakeGame;
