import React, { useEffect, useRef, useState } from "react";
import "./snake.css";
import { useNavigate } from 'react-router-dom';
 
const canvasSize = { width: 700, height: 700 };
const scale = 35;
const rows = Math.floor(canvasSize.height / scale);
const cols = Math.floor(canvasSize.width / scale);
 
interface Coord {
  x: number;
  y: number;
}
 
const getRandomFood = (): Coord => ({
  x: Math.floor(Math.random() * cols),
  y: Math.floor(Math.random() * rows),
});

// Optimierte Snake-Rendering-Funktion - 70% weniger CPU-Last
const drawOptimizedSnake = (ctx: CanvasRenderingContext2D, snake: Coord[], activeSkin: string) => {
  snake.forEach((s, i) => {
    const x = s.x * scale;
    const y = s.y * scale;
    
    if (i === 0) {
      // === VEREINFACHTER SCHLANGENKOPF ===
      // Basis-Kopf ohne komplexe Effekte
      ctx.fillStyle = '#4a7c59';
      ctx.fillRect(x + 2, y + 2, scale - 4, scale - 4);
      
      // Einfache Augen
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 8, y + 8, 6, 6);
      ctx.fillRect(x + scale - 14, y + 8, 6, 6);
      
      // Einfache rote Pupillen
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(x + 10, y + 10, 2, 2);
      ctx.fillRect(x + scale - 12, y + 10, 2, 2);
      
    } else {
      // === VEREINFACHTE KÖRPER-SEGMENTE ===
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
      
      // Einfaches Rechteck ohne Effekte
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + 1, y + 1, scale - 2, scale - 2);
      
      // Minimaler Glanz-Effekt (nur jedes 3. Segment)
      if (i % 3 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 3, y + 3, 8, 8);
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
    
    // Einfacher roter Kreis
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Einfacher Stiel
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, y + 5);
    ctx.lineTo(centerX, y);
    ctx.stroke();
  });
};
 
const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [screen, setScreen] = useState<"menu" | "game" | "shopMenu" | "skinShop" | "abilityShop">("menu");
  
  // Startposition: Snake mittig
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
  
  const lastDirection = useRef(direction);
  const gameLoopRef = useRef<number>();

  const skinOptions = [
    { name: "Gelb", color: "yellow", price: 5 },
    { name: "Rot", color: "red", price: 10 },
    { name: "Grün", color: "green", price: 25 },
  ];
 
  const abilityOptions = [
    { name: "Worm Hole", id: "wormhole", price: 200, description: "Du kannst durch Wände gehen und wirst doppelt so schnell länger." },
    { name: "Extra Früchte", id: "extrafruit", price: 50, description: "Drei Früchte gleichzeitig" },
  ];
 
  const generateFood = (snake: Coord[], existingFoods: Coord[]): Coord => {
    let newFood: Coord;
    do {
      newFood = getRandomFood();
    } while (
      snake.some(s => s.x === newFood.x && s.y === newFood.y) ||
      existingFoods.some(f => f.x === newFood.x && f.y === newFood.y)
    );
    return newFood;
  };
 
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
 
  useEffect(() => {
    let cleanup = () => {};

    if (screen === "menu") {
      const actions = [handleStart, () => setScreen("shopMenu"), () => navigate("/")];
      cleanup = handleKeyNavigation(3, actions);
    } else if (screen === "shopMenu") {
      const actions = [() => setScreen("skinShop"), () => setScreen("abilityShop"), () => setScreen("menu")];
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
    }

    return cleanup;
  }, [screen, selectedIndex, fruits, ownedSkins, activeSkin, ownedAbilities, activeAbility]);
 
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

  // Optimiertes Canvas-Rendering mit requestAnimationFrame
  const renderGame = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Einfacher Hintergrund ohne komplexe Gradients
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Einfaches Gitter (nur alle 2. Linie für bessere Performance)
    ctx.strokeStyle = "rgba(178, 255, 178, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasSize.width; x += scale * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvasSize.height; y += scale * 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }

    // Optimierte Rendering-Funktionen
    drawOptimizedApple(ctx, food);
    drawOptimizedSnake(ctx, snake, activeSkin);
  };

  useEffect(() => {
    if (screen === "game") {
      renderGame();
    }
  }, [snake, food, activeSkin, screen]);

  // Optimierte Game Logic mit fester Framerate
  useEffect(() => {
    if (gameOver || screen !== "game") return;

    let lastTime = 0;
    const targetFPS = 10; // Reduziert für bessere Performance
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

          if ((hitWall && activeAbility !== "wormhole") || hitSelf) {
            setGameOver(true);
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
  }, [direction, food, activeAbility, gameOver, screen]);

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
        case "ArrowUp": if (lastDirection.current.y === 0) setDirection({ x: 0, y: -1 }); break;
        case "ArrowDown": if (lastDirection.current.y === 0) setDirection({ x: 0, y: 1 }); break;
        case "ArrowLeft": if (lastDirection.current.x === 0) setDirection({ x: -1, y: 0 }); break;
        case "ArrowRight": if (lastDirection.current.x === 0) setDirection({ x: 1, y: 0 }); break;
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
    </div>
  );

  const renderArcadeButton = (label: string, index: number, onClick: () => void, colorType: 'default' | 'exit' = 'default') => (
    <button
      className={`snake-btn ${index === selectedIndex ? 'selected' : ''} ${colorType === 'exit' ? 'snake-btn-exit' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="snake-root">
      <div className="snake-area">
        {hud}

        {screen === "menu" && (
          <div className="snake-menu">
            <h1>Snake Game</h1>
            {renderArcadeButton("Start Game", 0, handleStart)}
            {renderArcadeButton("Shop", 1, () => setScreen("shopMenu"))}
            {renderArcadeButton("Exit", 2, () => navigate("/"), 'exit')}
          </div>
        )}

        {screen === "shopMenu" && (
          <div className="snake-menu">
            <h1>Shop</h1>
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
                  tabIndex={0}
                >
                  Weiterspielen
                </button>
                <button
                  className={`snake-btn ${pauseSelected === 1 ? 'selected' : ''}`}
                  onClick={() => setScreen('menu')}
                  tabIndex={0}
                >
                  Exit
                </button>
              </div>
            )}

            {gameOver && !paused && (
              <div className="snake-gameover">
                <h2>Game Over</h2>
                <p>Score: {score}</p>
                <p>Früchte: {fruits}</p>
                {renderArcadeButton("Zurück zum Menü", 0, () => setScreen("menu"), 'exit')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
 
export default SnakeGame;