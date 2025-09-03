import React, { useRef, useEffect, useState } from "react";
import { useSettings } from "../SettingsContext";
import "./DinojumpGame.css";
import dinoImg from './dino.png';
// Sounds aus Public-Ordner
const lobbyMusicUrl = "/Sounds/dinojump/dinojump_lobby_music.mp3";
const gameMusicUrl = "/Sounds/dinojump/dinojump_gameMusic.mp3";
const deathSoundUrl = "/Sounds/dinojump/dinojump_death.mp3";
import cactusImg from './cactus.png';
import birdImg from './bird.png';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 300;
const GROUND_Y = 240;
const DINO_SIZE = 72;
const OBSTACLE_WIDTH = 36;
const OBSTACLE_HEIGHT = 36;
const GRAVITY = 1.2;
const JUMP_VELOCITY = -19;
const OBSTACLE_SPEED = 7;

type GameState = "start" | "playing" | "gameover" | "highscores";

interface HighscoreEntry {
  name: string;
  score: number;
}

function getRandomObstacle() {
  // 70% cactus, 30% bird
  const isBird = Math.random() < 0.3;
  // Double obstacle size
  const size = 96;
  return {
    x: GAME_WIDTH,
    y: isBird ? GROUND_Y - 80 : GROUND_Y,
    width: size,
    height: size,
    type: isBird ? "bird" : "cactus",
  };
}

const Dinojump: React.FC = () => {
  // Debug Logs
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(
    `%c[DINOJUMP] Render #${renderCount.current}`,
    "color:white;background:#22c55e;padding:2px 4px;border-radius:2px;"
  );

  const { isMuted, volume } = useSettings();
  // ALLE AUDIO REFS
  const lobbyMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const [gameState, setGameState] = useState<GameState>("start");
  const [dinoY, setDinoY] = useState(GROUND_Y);
  const [dinoVY, setDinoVY] = useState(0);
  const [obstacles, setObstacles] = useState<Array<any>>([]);
  const [score, setScore] = useState(0);
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([]);
  const [menuIndex, setMenuIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [playerName, setPlayerName] = useState("PLAYER");
  const requestRef = useRef<number>(0);

  console.log("[DINOJUMP] gameState:", gameState);
  console.log("[DINOJUMP] score:", score);

  // ALLE AUDIO-OBJEKTE INITIALISIEREN
  useEffect(() => {
    // Lobby Music
    if (!lobbyMusicRef.current) {
      console.log("[DINOJUMP] Initializing lobby music...");
      lobbyMusicRef.current = new Audio(lobbyMusicUrl);
      lobbyMusicRef.current.loop = true;
      lobbyMusicRef.current.volume = volume / 100;
    }

    // Game Music
    if (!gameMusicRef.current) {
      console.log("[DINOJUMP] Initializing game music...");
      gameMusicRef.current = new Audio(gameMusicUrl);
      gameMusicRef.current.loop = true;
      gameMusicRef.current.volume = volume / 100;
    }

    // Death Sound
    if (!deathSoundRef.current) {
      console.log("[DINOJUMP] Initializing death sound...");
      deathSoundRef.current = new Audio(deathSoundUrl);
      deathSoundRef.current.volume = volume / 100;
    }

    // AUTO-UNLOCK FÜR ALLE AUDIO-OBJEKTE
    const attemptAutoPlay = () => {
      if (!isMuted) {
        // Versuche lobby music zu starten (falls im richtigen State)
        if ((gameState === "start" || gameState === "highscores") && lobbyMusicRef.current) {
          lobbyMusicRef.current.play().then(() => {
            console.log("[DINOJUMP] Lobby music auto-play successful!");
          }).catch(() => {
            console.log("[DINOJUMP] Auto-play blocked, setting up user interaction listeners...");
            setupAutoUnlock();
          });
        }
      }
    };

    // Setup für automatisches Unlock bei jeder Benutzerinteraktion
    const setupAutoUnlock = () => {
      const unlockAudio = async () => {
        console.log("[DINOJUMP] Attempting to unlock all audio...");
        try {
          // Versuche alle Audio-Objekte nur zu entsperren, wenn src gesetzt ist
          if (lobbyMusicRef.current && lobbyMusicRef.current.src) {
            await lobbyMusicRef.current.play();
            lobbyMusicRef.current.pause();
            lobbyMusicRef.current.currentTime = 0;
          }
          if (gameMusicRef.current && gameMusicRef.current.src) {
            await gameMusicRef.current.play();
            gameMusicRef.current.pause();
            gameMusicRef.current.currentTime = 0;
          }
          if (deathSoundRef.current && deathSoundRef.current.src) {
            await deathSoundRef.current.play();
            deathSoundRef.current.pause();
            deathSoundRef.current.currentTime = 0;
          }
          console.log("[DINOJUMP] All audio unlocked!");
          
          // Entferne Event Listener nach erfolgreichem Unlock
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('keydown', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
          document.removeEventListener('mousemove', unlockAudio);
        } catch (error) {
          console.log("[DINOJUMP] Audio unlock failed:", error);
        }
      };

      // Füge Event Listener für verschiedene Benutzerinteraktionen hinzu
      document.addEventListener('click', unlockAudio, { once: true, passive: true });
      document.addEventListener('keydown', unlockAudio, { once: true, passive: true });
      document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
      document.addEventListener('mousemove', unlockAudio, { once: true, passive: true });
    };

    // Versuche sofort beim Laden
    attemptAutoPlay();

    return () => {
      // Cleanup: Alle Audio-Objekte stoppen
      lobbyMusicRef.current?.pause();
      lobbyMusicRef.current && (lobbyMusicRef.current.currentTime = 0);
      gameMusicRef.current?.pause();
      gameMusicRef.current && (gameMusicRef.current.currentTime = 0);
      deathSoundRef.current?.pause();
      deathSoundRef.current && (deathSoundRef.current.currentTime = 0);
    };
  }, [volume]); // Neu initialisieren wenn Lautstärke sich ändert
    // Lautstärke dynamisch anpassen
    if (lobbyMusicRef.current) lobbyMusicRef.current.volume = volume / 100;
    if (gameMusicRef.current) gameMusicRef.current.volume = volume / 100;
    if (deathSoundRef.current) deathSoundRef.current.volume = volume / 100;

  // ERWEITERTE MUSIK-STEUERUNG basierend auf gameState
  useEffect(() => {
    if (isMuted) {
      lobbyMusicRef.current?.pause();
      gameMusicRef.current?.pause();
      return;
    }

    // Musiksteuerung nach State
    if (gameState === "start" || gameState === "highscores") {
      // Lobby Musik an, Game Musik aus
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
      if (lobbyMusicRef.current) {
        // Nur abspielen, wenn nicht schon läuft
        if (lobbyMusicRef.current.paused) {
          lobbyMusicRef.current.currentTime = 0;
          lobbyMusicRef.current.play().catch(() => {});
        }
      }
    } else if (gameState === "playing") {
      // Game Musik an, Lobby Musik aus
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.pause();
        lobbyMusicRef.current.currentTime = 0;
      }
      if (gameMusicRef.current) {
        // Nur abspielen, wenn nicht schon läuft
        if (gameMusicRef.current.paused) {
          gameMusicRef.current.currentTime = 0;
          gameMusicRef.current.play().catch(() => {});
        }
      }
    } else if (gameState === "gameover") {
      // Beide Musik stoppen
      lobbyMusicRef.current?.pause();
      lobbyMusicRef.current && (lobbyMusicRef.current.currentTime = 0);
      gameMusicRef.current?.pause();
      gameMusicRef.current && (gameMusicRef.current.currentTime = 0);
    }
  }, [gameState, isMuted]);

  // Startscreen: Enter Name, Start, Highscores, Exit
  useEffect(() => {
    if (gameState === "start") {
      console.log("[DINOJUMP] Resetting game state");
      setDinoY(GROUND_Y);
      setDinoVY(0);
      setObstacles([]);
      setScore(0);
      setIsJumping(false);
    }
  }, [gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const animate = () => {
      // Dino physics
      let newY = dinoY + dinoVY;
      let newVY = dinoVY + GRAVITY;
      if (newY >= GROUND_Y) {
        newY = GROUND_Y;
        newVY = 0;
        setIsJumping(false);
      }
      setDinoY(newY);
      setDinoVY(newVY);

      // Obstacles
      let newObstacles = obstacles
        .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
        .filter((obs) => obs.x + obs.width > 0);

      // Add new obstacle
      if (
        newObstacles.length === 0 ||
        (GAME_WIDTH - newObstacles[newObstacles.length - 1].x > 220 &&
          Math.random() < 0.02)
      ) {
        newObstacles.push(getRandomObstacle());
      }

      // Collision (smaller hitbox)
      for (let obs of newObstacles) {
        // Dino hitbox
        const dinoBox = {
          x: 60 + 10,
          y: dinoY + 10,
          w: DINO_SIZE - 30,
          h: DINO_SIZE - 30,
        };
        // Obstacle hitbox
        const obsBox = {
          x: obs.x + 10,
          y: obs.y + 10,
          w: obs.width - 20,
          h: obs.height - 20,
        };
        if (
          dinoBox.x < obsBox.x + obsBox.w &&
          dinoBox.x + dinoBox.w > obsBox.x &&
          dinoBox.y < obsBox.y + obsBox.h &&
          dinoBox.y + dinoBox.h > obsBox.y
        ) {
          console.log("[DINOJUMP] Game Over - Collision detected");
          
          // DEATH SOUND ABSPIELEN
          if (deathSoundRef.current && !isMuted) {
            console.log("[DINOJUMP] Playing death sound...");
            deathSoundRef.current.currentTime = 0;
            deathSoundRef.current.play().catch((error) => {
              console.log("[DINOJUMP] Death sound play failed:", error);
            });
          }
          
          setGameState("gameover");
          return;
        }
      }

      setObstacles(newObstacles);
      setScore((s) => s + 1);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
    // eslint-disable-next-line
  }, [gameState, dinoY, dinoVY, obstacles, isMuted]);

  // Keyboard Controls
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (gameState === "playing") {
        if (e.key === "ArrowUp" || e.key === " ") {
          if (!isJumping && dinoY === GROUND_Y) {
            setDinoVY(JUMP_VELOCITY);
            setIsJumping(true);
          }
        }
        if (e.key === "Escape") {
          setGameState("start");
        }
      } else if (gameState === "start") {
        const menuItems = [
          () => setGameState("playing"),
          () => setGameState("highscores"),
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
      } else if (gameState === "gameover") {
        // Nur noch BACK TO MENU - kein RESTART mehr
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          console.log("[DINOJUMP] Back to menu via keyboard");
          setGameState("start");
        }
      } else if (gameState === "highscores") {
        if (e.key === "Escape" || e.key === "Enter") {
          e.preventDefault();
          setGameState("start");
        }
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // eslint-disable-next-line
  }, [gameState, menuIndex, dinoY, isJumping]);

  // Highscore speichern
  useEffect(() => {
    if (gameState === "gameover" && score > 0) {
      setHighscores((prev) => {
        const newScores = [...prev, { name: playerName, score }];
        return newScores
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      });
    }
    // eslint-disable-next-line
  }, [gameState]);

  // Startscreen
  if (gameState === "start") {
    return (
      <div className="dino-arcade-bg">
        <div className="dino-startscreen">
          <h1 className="dino-title">DINO JUMP</h1>
          <div className="dino-player-info">
            <div className="dino-player-name">
              <span>NAME:</span>
              <input
                className="dino-input"
                value={playerName}
                maxLength={12}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                style={{ fontFamily: "Press Start 2P, cursive" }}
              />
            </div>
          </div>
          <div className="dino-menu">
            <button className={`dino-menu-btn${menuIndex === 0 ? " selected" : ""}`} tabIndex={-1}>
              START GAME
            </button>
            <button className={`dino-menu-btn${menuIndex === 1 ? " selected" : ""}`} tabIndex={-1}>
              HIGHSCORES
            </button>
            <button className="dino-menu-btn" disabled tabIndex={-1}>
              INFO
            </button>
            <button className={`dino-menu-btn${menuIndex === 3 ? " selected" : ""}`} tabIndex={-1}>
              EXIT
            </button>
          </div>
          <div className="dino-hint">
            Use <span>↑↓</span> arrows to navigate, <span>ENTER</span> to select
          </div>
          <img src={dinoImg} alt="Dino" width={DINO_SIZE} height={DINO_SIZE} />
        </div>
      </div>
    );
  }

  // Highscore Screen
  if (gameState === "highscores") {
    return (
      <div className="dino-arcade-bg">
        <div className="dino-highscores">
          <h2 className="dino-title">HIGHSCORES</h2>
          <div className="dino-highscore-list">
            {highscores.length > 0 ? (
              highscores.map((entry, idx) => (
                <div key={idx} className="dino-highscore-entry">
                  <span className="dino-rank">#{idx + 1}</span>
                  <span className="dino-name">{entry.name}</span>
                  <span className="dino-score">{entry.score}</span>
                </div>
              ))
            ) : (
              <div className="dino-no-scores">No highscores yet!</div>
            )}
          </div>
          <button className="dino-menu-btn" tabIndex={-1}>
            BACK
          </button>
          <div className="dino-hint">
            Press <span>ESC</span> or <span>ENTER</span> to go back
          </div>
        </div>
      </div>
    );
  }

  // Gameover Screen - NUR NOCH BACK TO MENU
  if (gameState === "gameover") {
    return (
      <div className="dino-arcade-bg">
        <div className="dino-gameover">
          <h2 className="dino-title">GAME OVER</h2>
          <div className="dino-score-final">
            <div>Score: {score}</div>
          </div>
          <div className="dino-menu">
            <button
              className="dino-menu-btn selected"
              tabIndex={-1}
              onClick={() => {
                console.log("[DINOJUMP] Back to menu via mouse");
                setGameState("start");
              }}
            >
              BACK TO MENU
            </button>
          </div>
          <div className="dino-hint">
            Press <span>ENTER</span> or <span>ESC</span> to continue
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="dino-arcade-bg">
      <div className="dino-game">
        <div className="dino-game-canvas" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
          {/* Ground */}
          <div className="dino-ground" style={{ top: GROUND_Y + DINO_SIZE, width: GAME_WIDTH }} />
          <img
            src={dinoImg}
            alt="Dino"
            className="dino-sprite"
            style={{
              left: 60,
              top: dinoY - 15,
              width: DINO_SIZE,
              height: DINO_SIZE,
              position: "absolute",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 24px #0ff)",
            }}
          />
          {/* Obstacles */}
          {obstacles.map((obs, idx) => {
            if (obs.type === "cactus") {
              return (
                <img
                  key={idx}
                  src={cactusImg}
                  alt="Cactus"
                  className="dino-obstacle cactus"
                  style={{
                    left: obs.x,
                    top: obs.y - 20,
                    width: obs.width,
                    height: obs.height,
                    position: "absolute",
                    imageRendering: "pixelated",
                    zIndex: 2,
                    filter: "drop-shadow(0 0 24px #0ff)",
                  }}
                />
              );
            } else if (obs.type === "bird") {
              return (
                <img
                  key={idx}
                  src={birdImg}
                  alt="Bird"
                  className="dino-obstacle bird"
                  style={{
                    left: obs.x,
                    top: obs.y - 20,
                    width: obs.width,
                    height: obs.height,
                    position: "absolute",
                    imageRendering: "pixelated",
                    zIndex: 2,
                    filter: "drop-shadow(0 0 24px #0ff)",
                  }}
                />
              );
            }
            return null;
          })}
          {/* Score */}
          <div className="dino-score-display">{score}</div>
        </div>
        <div className="dino-hint" style={{ marginTop: "1.2rem", fontSize: "1.1rem", opacity: 0.7 }}>
          Press <span>ESC</span> to Exit
        </div>
      </div>
    </div>
  );
};

export default Dinojump;
