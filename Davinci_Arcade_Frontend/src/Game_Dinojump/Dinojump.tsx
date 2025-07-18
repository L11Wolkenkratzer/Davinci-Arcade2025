import React, { useState, useEffect, useRef } from 'react';
import './DinojumpGame.css';

interface ScoreEntry {
  name: string;
  score: number;
}

type GameState =
  | 'menu'
  | 'game'
  | 'controls'
  | 'leaderboard'
  | 'gameover'
  | 'shop'
  | 'skinshop'
  | 'backgroundshop';

interface Skin {
  id: string;
  name: string;
  price: number;
  owned: boolean;
}

interface Background {
  id: string;
  name: string;
  price: number;
  owned: boolean;
}

const DinoJump: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [selectedGameOverIndex, setSelectedGameOverIndex] = useState(0);
  const [selectedShopIndex, setSelectedShopIndex] = useState(0);
  const [selectedSkinIndex, setSelectedSkinIndex] = useState(0);
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [gold, setGold] = useState(50);
  const [playerY, setPlayerY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const isJumpingRef = useRef(false); // Sync block
  const [obstacles, setObstacles] = useState<{ x: number }[]>([]);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
  const baseSpeed = 10;
  const jumpRef = useRef<NodeJS.Timeout | null>(null);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  const [skins, setSkins] = useState<Skin[]>([
    { id: 'city', name: 'City Skin (Skateboarder)', price: 10, owned: false },
    { id: 'jungle', name: 'Jungle Skin (Affe)', price: 25, owned: false },
  ]);
  const [equippedSkin, setEquippedSkin] = useState<string | null>(null);

  const [backgrounds, setBackgrounds] = useState<Background[]>([
    { id: 'city', name: 'City Background', price: 10, owned: false },
    { id: 'jungle', name: 'Jungle Background', price: 25, owned: false },
  ]);
  const [equippedBackground, setEquippedBackground] = useState<string | null>(null);

  const menuOptions = ['Play', 'Controls', 'Leaderboard', 'Shop'];
  const subOptions = ['Back'];
  const gameOverOptions = ['Retry', 'Back to Menu'];
  const shopOptions = ['Skin Shop', 'Background Shop', 'Exit'];
  const skinShopOptions = ['City Skin (Skateboarder)', 'Jungle Skin (Affe)', 'None', 'Exit'];
  const backgroundShopOptions = ['City Background', 'Jungle Background', 'None', 'Exit'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['menu', 'controls', 'leaderboard', 'gameover', 'shop', 'skinshop', 'backgroundshop'].includes(gameState)) {
        e.preventDefault();

        // Global navigation handler
        const navHandler = (length: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
          if (e.code === 'ArrowUp') setter(prev => (prev - 1 + length) % length);
          else if (e.code === 'ArrowDown') setter(prev => (prev + 1) % length);
        };

        switch (gameState) {
          case 'menu':
            navHandler(menuOptions.length, setSelectedMenuIndex);
            if (e.code === 'Enter') {
              const choice = menuOptions[selectedMenuIndex];
              if (choice === 'Play') setGameState('game');
              else if (choice === 'Controls') setGameState('controls');
              else if (choice === 'Leaderboard') setGameState('leaderboard');
              else if (choice === 'Shop') setGameState('shop');
            }
            break;

          case 'controls':
          case 'leaderboard':
            navHandler(subOptions.length, setSelectedSubIndex);
            if (e.code === 'Enter' && selectedSubIndex === 0) setGameState('menu');
            break;

          case 'gameover':
            navHandler(gameOverOptions.length, setSelectedGameOverIndex);
            if (e.code === 'Enter') {
              setGameState(selectedGameOverIndex === 0 ? 'game' : 'menu');
            }
            break;

          case 'shop':
            navHandler(shopOptions.length, setSelectedShopIndex);
            if (e.code === 'Enter') {
              const choice = shopOptions[selectedShopIndex];
              if (choice === 'Skin Shop') setGameState('skinshop');
              else if (choice === 'Background Shop') setGameState('backgroundshop');
              else if (choice === 'Exit') setGameState('menu');
            }
            break;

          case 'skinshop':
            navHandler(skinShopOptions.length, setSelectedSkinIndex);
            if (e.code === 'Enter') {
              const option = skinShopOptions[selectedSkinIndex];
              if (option === 'Exit') setGameState('shop');
              else if (option === 'None') setEquippedSkin(null);
              else {
                const skin = skins[selectedSkinIndex];
                if (!skin) return;
                if (!skin.owned && gold >= skin.price) {
                  setGold(g => g - skin.price);
                  setSkins(s => {
                    const newS = [...s];
                    newS[selectedSkinIndex] = { ...skin, owned: true };
                    return newS;
                  });
                }
                setEquippedSkin(skin.id);
              }
            }
            break;

          case 'backgroundshop':
            navHandler(backgroundShopOptions.length, setSelectedBgIndex);
            if (e.code === 'Enter') {
              const option = backgroundShopOptions[selectedBgIndex];
              if (option === 'Exit') setGameState('shop');
              else if (option === 'None') setEquippedBackground(null);
              else {
                const bg = backgrounds[selectedBgIndex];
                if (!bg) return;
                if (!bg.owned && gold >= bg.price) {
                  setGold(g => g - bg.price);
                  setBackgrounds(b => {
                    const newB = [...b];
                    newB[selectedBgIndex] = { ...bg, owned: true };
                    return newB;
                  });
                }
                setEquippedBackground(bg.id);
              }
            }
            break;
        }
      }

      if (e.code === 'Space' && gameState === 'game' && !e.repeat) {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    selectedMenuIndex,
    selectedSubIndex,
    selectedGameOverIndex,
    selectedShopIndex,
    selectedSkinIndex,
    selectedBgIndex,
    skins,
    backgrounds,
    gold,
    equippedSkin,
    equippedBackground,
  ]);

  useEffect(() => {
    if (gameState === 'game') {
      setPlayerY(0);
      setScore(0);
      setObstacles([{ x: 1000 }]);

      gameInterval.current = setInterval(() => {
        setScore(prev => {
          const newScore = prev + 1;
          const speed = baseSpeed * (1 + newScore / 250);

          setObstacles(prevObs => {
            const moved = prevObs.map(o => ({ x: o.x - speed })).filter(o => o.x > -20);
            const last = moved[moved.length - 1];

            if (!last || last.x < 600) {
              if (newScore > 300 && Math.random() < 0.3) {
                moved.push({ x: 1000 }, { x: 1030 });
              } else if (Math.random() < 0.3) {
                moved.push({ x: 1000 });
              }
            }
            return moved;
          });

          return newScore;
        });
      }, 100);

      return () => clearInterval(gameInterval.current!);
    }
  }, [gameState]);

  useEffect(() => {
    obstacles.forEach(ob => {
      if (ob.x < 420 && ob.x > 380 && playerY < 60) {
        endGame();
      }
    });
  }, [obstacles, playerY]);

  const jump = () => {
    if (isJumpingRef.current) return;
    isJumpingRef.current = true;
    setIsJumping(true);

    let velocity = 10;
    let height = 0;

    jumpRef.current = setInterval(() => {
      height += velocity;
      velocity -= height > 120 ? 1 : height > 60 ? 0.3 : 0.5;

      if (height <= 0) {
        height = 0;
        setPlayerY(0);
        clearInterval(jumpRef.current!);
        setIsJumping(false);
        isJumpingRef.current = false;
        return;
      }

      setPlayerY(height);
    }, 20);
  };

  const endGame = () => {
    clearInterval(gameInterval.current!);
    setGameState('gameover');
    setSelectedGameOverIndex(0);

    const newEntry: ScoreEntry = { name: 'Tom', score };
    const existing = highScores.find(e => e.name === 'Tom');
    let updated = existing
      ? highScores.map(e => (e.name === 'Tom' && score > e.score ? newEntry : e))
      : [...highScores, newEntry];

    updated = updated.sort((a, b) => b.score - a.score).slice(0, 5);
    setHighScores(updated);
  };

  // --- Style Helpers ---
  const getPlayerSkinStyle = () => {
    switch (equippedSkin) {
      case 'city': return { backgroundColor: 'blue' };
      case 'jungle': return { backgroundColor: 'darkgreen' };
      default: return { backgroundColor: 'green' };
    }
  };

  const getBackgroundStyle = () => {
    switch (equippedBackground) {
      case 'city': return { backgroundColor: '#a0c4ff' };
      case 'jungle': return { backgroundColor: '#4a7c59' };
      default: return { backgroundColor: '#e1c699' };
    }
  };

  // --- Renders ---
  const renderMenu = () => (
    <div className="dinojump-menu">
      <h1 className="text-4xl font-bold">Dino Jump</h1>
      {menuOptions.map((option, i) => (
        <div key={i} className={`dinojump-btn ${selectedMenuIndex === i ? 'font-bold underline' : ''}`}>{option}</div>
      ))}
      <p className="text-sm">Gold: {gold} | ⬆️⬇️ wählen, ↵ bestätigen</p>
    </div>
  );

  const renderControls = () => (
    <div className="dinojump-controls">
      <h2 className="text-2xl">Controls</h2>
      <p>Drücke <strong>Space</strong> zum Springen</p>
      <div className={`dinojump-btn ${selectedSubIndex === 0 ? 'font-bold underline' : ''}`}>Back</div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="dinojump-leaderboard">
      <h2 className="text-2xl">Leaderboard</h2>
      {highScores.length === 0 ? (
        <p>Keine Einträge</p>
      ) : (
        <ul>{highScores.map((e, i) => <li key={i}>{i + 1}. {e.name} - {e.score}</li>)}</ul>
      )}
      <div className={`dinojump-btn ${selectedSubIndex === 0 ? 'font-bold underline' : ''}`}>Back</div>
    </div>
  );

  const renderGame = () => (
    <div className="dinojump-game" style={getBackgroundStyle()}>
      <div className="dinojump-player" style={{ position: 'absolute', left: 400, bottom: playerY, width: 20, height: 40, borderRadius: 4, ...getPlayerSkinStyle() }} />
      {obstacles.map((o, i) => (
        <div key={i} className="dinojump-obstacle" style={{ position: 'absolute', left: o.x, bottom: 0, width: 20, height: 40 }} />
      ))}
      <div className="dinojump-score" style={{ position: 'absolute', top: 8, left: 8 }}>Score: {score}</div>
      <div className="dinojump-gold" style={{ position: 'absolute', top: 8, right: 8 }}>Gold: {gold}</div>
    </div>
  );

  const renderGameOver = () => (
    <div className="dinojump-gameover">
      <h2 className="text-2xl">Game Over</h2>
      <p>Your Score: {score}</p>
      {gameOverOptions.map((o, i) => (
        <div key={i} className={`dinojump-btn ${selectedGameOverIndex === i ? 'font-bold underline' : ''}`}>{o}</div>
      ))}
    </div>
  );

  const renderShop = () => (
    <div className="dinojump-shop">
      <h2 className="text-2xl">Shop</h2>
      {shopOptions.map((o, i) => (
        <div key={i} className={`dinojump-btn ${selectedShopIndex === i ? 'font-bold underline' : ''}`}>{o}</div>
      ))}
      <p className="text-sm">Gold: {gold}</p>
    </div>
  );

  const renderSkinShop = () => (
    <div className="dinojump-skinshop">
      <h2 className="text-xl font-bold">Skin Shop</h2>
      {skinShopOptions.map((o, i) => {
        let text = o;
        if (i < 2) {
          const s = skins[i];
          text = `${s.name} ${s.owned ? '(Owned)' : `(${s.price} Gold)`}`;
          if (equippedSkin === s.id) text += ' [Equipped]';
        } else if (o === 'None' && equippedSkin === null) {
          text = 'No Skin [Equipped]';
        }
        return (
          <div key={i} className={`dinojump-btn ${selectedSkinIndex === i ? 'font-bold underline' : ''}`}>{text}</div>
        );
      })}
    </div>
  );

  const renderBackgroundShop = () => (
    <div className="dinojump-backgroundshop">
      <h2 className="text-xl font-bold">Background Shop</h2>
      {backgroundShopOptions.map((o, i) => {
        let text = o;
        if (i < 2) {
          const bg = backgrounds[i];
          text = `${bg.name} ${bg.owned ? '(Owned)' : `(${bg.price} Gold)`}`;
          if (equippedBackground === bg.id) text += ' [Equipped]';
        } else if (o === 'None' && equippedBackground === null) {
          text = 'No Background [Equipped]';
        }
        return (
          <div key={i} className={`dinojump-btn ${selectedBgIndex === i ? 'font-bold underline' : ''}`}>{text}</div>
        );
      })}
    </div>
  );

  return (
    <div className="dinojump-container">
      {gameState === 'menu' && renderMenu()}
      {gameState === 'controls' && renderControls()}
      {gameState === 'leaderboard' && renderLeaderboard()}
      {gameState === 'game' && renderGame()}
      {gameState === 'gameover' && renderGameOver()}
      {gameState === 'shop' && renderShop()}
      {gameState === 'skinshop' && renderSkinShop()}
      {gameState === 'backgroundshop' && renderBackgroundShop()}
    </div>
  );
};

export default DinoJump;
