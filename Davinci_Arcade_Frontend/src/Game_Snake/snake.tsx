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

// Erweiterte Schlangen-Rendering-Funktion
const drawRealisticSnake = (ctx: CanvasRenderingContext2D, snake: Coord[], activeSkin: string) => {
  const now = Date.now();
  
  snake.forEach((s, i) => {
    const cx = s.x * scale + scale / 2;
    const cy = s.y * scale + scale / 2;
    const radius = scale * 0.48;
    
    ctx.save();
    
    if (i === 0) {
      // === SCHLANGENKOPF - Ultra realistisch ===
      
      // Kopf-Basis mit Gradient
      const headGradient = ctx.createRadialGradient(cx, cy - 5, 0, cx, cy, radius);
      headGradient.addColorStop(0, '#4a7c59');
      headGradient.addColorStop(0.6, '#2d5016');
      headGradient.addColorStop(1, '#1a2e0a');
      
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Kopf-Schatten
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Schuppen-Muster auf dem Kopf
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = (angle * Math.PI) / 180;
        const scaleX = cx + Math.cos(rad) * (radius * 0.3);
        const scaleY = cy + Math.sin(rad) * (radius * 0.3);
        
        ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
        ctx.beginPath();
        ctx.arc(scaleX, scaleY, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Augen - Ultra realistisch
      const eyeOffset = scale * 0.15;
      const eyeY = cy - scale * 0.1;
      
      // Linkes Auge
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(cx - eyeOffset, eyeY, scale * 0.08, scale * 0.12, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Rechtes Auge
      ctx.beginPath();
      ctx.ellipse(cx + eyeOffset, eyeY, scale * 0.08, scale * 0.12, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      // Pupillen mit Glanz
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(cx - eyeOffset, eyeY, scale * 0.05, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + eyeOffset, eyeY, scale * 0.05, 0, 2 * Math.PI);
      ctx.fill();
      
      // Glanz in den Augen
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - eyeOffset + 2, eyeY - 2, scale * 0.02, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + eyeOffset + 2, eyeY - 2, scale * 0.02, 0, 2 * Math.PI);
      ctx.fill();
      
      // Nasenlöcher
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx - 3, cy + scale * 0.05, 1.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 3, cy + scale * 0.05, 1.5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Animierte Zunge
      const tongueWave = Math.sin(now * 0.008) * 3;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + scale * 0.25);
      ctx.quadraticCurveTo(cx + tongueWave, cy + scale * 0.4, cx + tongueWave * 2, cy + scale * 0.6);
      ctx.stroke();
      
      // Gegabelte Zunge
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + tongueWave * 2, cy + scale * 0.6);
      ctx.lineTo(cx + tongueWave * 2 - 4, cy + scale * 0.65);
      ctx.moveTo(cx + tongueWave * 2, cy + scale * 0.6);
      ctx.lineTo(cx + tongueWave * 2 + 4, cy + scale * 0.65);
      ctx.stroke();
      
    } else {
      // === KÖRPER-SEGMENTE - Ultra realistisch ===
      
      // Körper-Gradient basierend auf Position
      const bodyGradient = ctx.createRadialGradient(cx, cy - 3, 0, cx, cy, radius);
      
      // Verschiedene Farben je nach aktivem Skin
      let baseColor, midColor, darkColor;
      switch (activeSkin) {
        case 'yellow':
          baseColor = '#ffd700';
          midColor = '#ffb347';
          darkColor = '#ff8c00';
          break;
        case 'red':
          baseColor = '#ff6b6b';
          midColor = '#ee5a52';
          darkColor = '#e74c3c';
          break;
        case 'green':
          baseColor = '#6ab04c';
          midColor = '#4caf50';
          darkColor = '#2e7d32';
          break;
        default:
          baseColor = '#555';
          midColor = '#333';
          darkColor = '#111';
      }
      
      bodyGradient.addColorStop(0, baseColor);
      bodyGradient.addColorStop(0.5, midColor);
      bodyGradient.addColorStop(1, darkColor);
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Körper-Schatten
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Schuppen-Muster
      const scaleCount = 6;
      for (let j = 0; j < scaleCount; j++) {
        const angle = (j * 60 + i * 30) * Math.PI / 180;
        const scaleX = cx + Math.cos(angle) * (radius * 0.4);
        const scaleY = cy + Math.sin(angle) * (radius * 0.4);
        
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.beginPath();
        ctx.arc(scaleX, scaleY, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Bauch-Muster (helle Linie)
      if (i % 2 === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - radius * 0.2, cy);
        ctx.lineTo(cx + radius * 0.2, cy);
        ctx.stroke();
      }
      
      // Glanz-Effekt
      const gloss = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx - 5, cy - 5, radius * 0.3);
      gloss.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gloss;
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5, radius * 0.3, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.restore();
  });
};

// Erweiterte Apfel-Rendering-Funktion
const drawRealisticApple = (ctx: CanvasRenderingContext2D, food: Coord[]) => {
  food.forEach(f => {
    const cx = f.x * scale + scale / 2;
    const cy = f.y * scale + scale / 2;
    const radius = scale * 0.4;
    
    ctx.save();
    
    // Apfel-Gradient
    const appleGradient = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, radius);
    appleGradient.addColorStop(0, '#ff6b6b');
    appleGradient.addColorStop(0.3, '#e74c3c');
    appleGradient.addColorStop(1, '#c0392b');
    
    ctx.fillStyle = appleGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Apfel-Schatten
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Stiel
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy - radius - 8);
    ctx.stroke();
    
    // Blatt
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - radius - 5, 4, 8, Math.PI / 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Glanz
    const shine = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx - 8, cy - 8, radius * 0.4);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 8, radius * 0.4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  });
};

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

    // Spielfeld-Hintergrund mit Textur
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
    bgGradient.addColorStop(0, '#2d5016');
    bgGradient.addColorStop(1, '#1a2e0a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Gitter
    ctx.strokeStyle = "rgba(178, 255, 178, 0.1)";
    ctx.lineWidth = 1;
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

    // Realistische Äpfel zeichnen
    drawRealisticApple(ctx, food);
    
    // Realistische Schlange zeichnen
    drawRealisticSnake(ctx, snake, activeSkin);

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
      </div>
    </div>
  );
};

export default SnakeGame;
