
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

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [screen, setScreen] = useState<"menu" | "game" | "shopMenu" | "skinShop" | "abilityShop">("menu");
  // Startposition: Snake mittig
  const [snake, setSnake] = useState<Coord[]>([{ x: Math.floor(cols/2), y: Math.floor(rows/2) }]);
  const [direction, setDirection] = useState<Coord>({ x: 0, y: 0 });
  const [food, setFood] = useState<Coord[]>([getRandomFood()]);
  const [gameOver, setGameOver] = useState(false);
  const [fruits, setFruits] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [activeSkin, setActiveSkin] = useState<string>("black");
  const [ownedAbilities, setOwnedAbilities] = useState<string[]>([]);
  const [activeAbility, setActiveAbility] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pauseSelected, setPauseSelected] = useState(0); // 0 = Continue, 1 = Exit
  const lastDirection = useRef<Coord>(direction);

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
    // Snake mittig spawnen
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


  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Spielfeld-Hintergrund sattes Grün
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    ctx.strokeStyle = "#b2ffb2";
    for (let x = 0; x < canvasSize.width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvasSize.height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#2196f3";
    food.forEach(f => {
      ctx.fillRect(f.x * scale, f.y * scale, scale, scale);
    });

    // Draw snake body
    ctx.fillStyle = activeSkin;
    snake.forEach((s, i) => {
      if (i === 0) {
        // Draw head with face
        ctx.fillRect(s.x * scale, s.y * scale, scale, scale);
        // Draw face (simple eyes and smile)
        const cx = s.x * scale;
        const cy = s.y * scale;
        // Eyes
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(cx + scale * 0.32, cy + scale * 0.38, scale * 0.10, 0, 2 * Math.PI);
        ctx.arc(cx + scale * 0.68, cy + scale * 0.38, scale * 0.10, 0, 2 * Math.PI);
        ctx.fill();
        // Smile
        ctx.beginPath();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.arc(cx + scale / 2, cy + scale * 0.62, scale * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = activeSkin;
      } else {
        ctx.fillRect(s.x * scale, s.y * scale, scale, scale);
      }
    });
  }, [snake, food, activeSkin]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (direction.x === 0 && direction.y === 0) return;

      setStarted(true);
      setSnake(prev => {
        if (!prev[0]) return prev;

        const newHead = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };
        let wrapped = { ...newHead };

        // Wrapping für wormhole wiederherstellen
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
    }, 150);

    return () => clearInterval(interval);
  }, [direction, food, activeAbility, gameOver]);

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

  // Removed unused renderButton and btn style for cleaner code


  // Removed unused arrowState and related effect for cleaner code

  // Score calculation: initial snake is 3 segments, so score = snake.length - initialLength, but min 0
  const initialLength = 3;
  const score = Math.max(0, snake.length - initialLength);
  const hud = (
    <div className="snake-hud">
      <span className="snake-label">SCORE:</span>
      <span className="snake-value">{score}</span>
      <span className="snake-fruit-icon" title="Früchte">🍏 {fruits}</span>
      <span className="snake-skin">Skin: <span style={{ color: activeSkin }}>{activeSkin}</span></span>
      {activeAbility && <span className="snake-ability">{activeAbility}</span>}
    </div>
  );

  // Arrow overlay entfernt

  // Modern button
  const renderArcadeButton = (label: string, index: number, onClick: () => void, colorType: 'default' | 'exit' = 'default') => (
    <button
      className={`snake-btn${selectedIndex === index ? " selected" : ""} ${colorType === 'exit' ? 'snake-btn-exit' : ''}`}
      onClick={onClick}
      tabIndex={0}
    >
      {label}
    </button>
  );

  // Main render
  return (
    <div className="snake-root">
      <div className="snake-area">
        {hud}
        {screen === "menu" && (
          <div className="snake-menu">
            <h1 style={{ color: "#6fff6f", textShadow: "0 0 16px #fff" }}>Snake Game</h1>
            {renderArcadeButton("Start Game", 0, handleStart)}
            {renderArcadeButton("Shop", 1, () => setScreen("shopMenu"))}
            {renderArcadeButton("Exit", 2, () => navigate("/"), 'exit')}
          </div>
        )}
        {screen === "shopMenu" && (
          <div className="snake-shop" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'stretch' }}>
            <h2>Shop</h2>
            {renderArcadeButton("Skins", 0, () => setScreen("skinShop"))}
            {renderArcadeButton("Fähigkeiten", 1, () => setScreen("abilityShop"))}
            {renderArcadeButton("Zurück", 2, () => setScreen("menu"))}
          </div>
        )}
        {screen === "skinShop" && (
          <div className="snake-shop" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'stretch' }}>
            <h2>Skins</h2>
            <p>Früchte: {fruits}</p>
            {skinOptions.map(({ name, color, price }, i) => (
              <div key={color} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.2rem' }}>
                <span className="snake-skin" style={{ color }}>{name}</span>
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
          <div className="snake-shop" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'stretch' }}>
            <h2>Fähigkeiten</h2>
            <p>Früchte: {fruits}</p>
            {abilityOptions.map(({ name, id, price, description }, i) => (
              <div key={id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.2rem' }}>
                <span className="snake-ability">{name}</span> – {description}
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
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="snake-canvas" />
            {paused && (
              <div className="snake-gameover" style={{ background: 'rgba(20,40,20,0.98)', border: '2px solid #6fff6f' }}>
                <h2 style={{ color: '#6fff6f', textShadow: '0 0 16px #fff' }}>PAUSE</h2>
                <div style={{ margin: '2rem 0 1.5rem 0', fontSize: '1.2rem' }}>Spiel pausiert</div>
                <button
                  className={`snake-btn${pauseSelected === 0 ? ' selected' : ''}`}
                  style={{ background: '#145c14', color: '#fff', borderColor: '#6fff6f', marginBottom: '1.2rem' }}
                  onClick={() => setPaused(false)}
                  tabIndex={0}
                >
                  Weiterspielen
                </button>
                <button
                  className={`snake-btn${pauseSelected === 1 ? ' selected' : ''} snake-btn-exit`}
                  style={{ background: '#b90a10', color: '#fff', borderColor: '#b90a10' }}
                  onClick={() => setScreen('menu')}
                  tabIndex={0}
                >
                  Exit
                </button>
              </div>
            )}
            {gameOver && !paused && (
              <div className="snake-gameover">
                <h2 style={{ color: "#b388ff", textShadow: "0 0 16px #fff" }}>Game Over</h2>
                <div style={{ margin: "1.5rem 0" }}>Score: <span style={{ color: "#ffe082" }}>{score}</span></div>
                <div style={{ marginBottom: "2.5rem" }}>Früchte: <span style={{ color: "#ffe082" }}>{fruits}</span></div>
                {renderArcadeButton("Zurück zum Menü", 0, () => setScreen("menu"), 'exit')}
              </div>
            )}
          </>
        )}
        {/* Arrow overlay entfernt */}
      </div>
    </div>
  );
};

export default SnakeGame;