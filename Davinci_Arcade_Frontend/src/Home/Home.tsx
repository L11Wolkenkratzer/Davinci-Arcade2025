import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import settingsImage from "../assets/settingsImage.png";
import SettingsModal from "./SettingsModal";
import UserModal from "./UserModal";
import InfoModal from "./InfoModal";
import sonicVideo from '/Videos/sonic-preview2.mp4';
import tetrisVideo from '/Videos/tetris.mp4';

// Types für Player aus App.tsx
export interface Player {
  _id: string;
  badgeId: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string; // ISO-Date
}

interface HomeProps {
  currentPlayer: Player | null;
  setCurrentPlayer: Dispatch<SetStateAction<Player | null>>;
}

interface Game {
  id: number;
  title: string;
  icon: string;
  color: string;
  video?: string;
}

type NavigationMode = "games" | "header";
type HeaderButton = "settings" | "user" | "info";

const Home: React.FC<HomeProps> = ({ currentPlayer, setCurrentPlayer }) => {
  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */
  const [time, setTime] = useState<string>("");
  const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>("games");
  const [selectedHeaderButton, setSelectedHeaderButton] = useState<HeaderButton>("settings");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showUser, setShowUser] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
  const [videoVisible, setVideoVisible] = useState<boolean>(false);
  const [videoEnded, setVideoEnded] = useState<boolean>(false);
  const [videoFadeIn, setVideoFadeIn] = useState<boolean>(false);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Games Array mit Video-Support
  const games: Game[] = [
    { id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b", video: tetrisVideo},
    { id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4" },
    { id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1" },
    { id: 4, title: "SONIC", icon: "💨", color: "#96ceb4", video: sonicVideo },
    { id: 5, title: "SPACESHIPS", icon: "🚀", color: "#feca57" },
    { id: 6, title: "DOOM", icon: "💀", color: "#ff9ff3" },
  ];

  const headerButtons: HeaderButton[] = ["settings", "user", "info"];


  /* ------------------------------------------------------------------ */
  /* Video Logic                                                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Super smooth fade-in for video
    setVideoEnded(false);
    const currentGame = games[selectedGameIndex];
    if (currentGame && currentGame.video) {
      setVideoVisible(true);
      setVideoFadeIn(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVideoFadeIn(true);
        });
      });
    } else {
      setVideoVisible(false);
      setVideoFadeIn(false);
    }
  }, [selectedGameIndex]);

  // Video Replay-Funktion
  const replayVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setVideoEnded(false);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Hilfsfunktionen                                                    */
  /* ------------------------------------------------------------------ */
  const getCardDimensions = useCallback(() => {
    if (containerWidth <= 1920) {
      return { cardWidth: 280, gap: 200 };
    }
    return { cardWidth: 420, gap: 240 };
  }, [containerWidth]);

  const getCardTransform = useCallback(
    (index: number) => {
      const total = games.length;
      const { cardWidth, gap } = getCardDimensions();
      const spacing = cardWidth + gap;
      let rel = index - selectedGameIndex;

      if (rel > total / 2) rel -= total;
      if (rel < -total / 2) rel += total;

      const translateX = rel * spacing;
      const abs = Math.abs(rel);
      let scale = 0.4,
        opacity = 0.2,
        zIndex = 1;
      if (abs === 0) {
        scale = 1;
        opacity = 1;
        zIndex = 10;
      } else if (abs === 1) {
        scale = 0.8;
        opacity = 0.7;
        zIndex = 5;
      } else if (abs === 2) {
        scale = 0.6;
        opacity = 0.4;
        zIndex = 2;
      }

      return {
        transform: `translateX(${translateX}px) scale(${scale})`,
        opacity,
        zIndex,
      } as React.CSSProperties;
    },
    [games.length, selectedGameIndex, getCardDimensions]
  );

  const navigateToGame = useCallback(
    (newIdx: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setSelectedGameIndex(newIdx);
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [isTransitioning]
  );

  /* ------------------------------------------------------------------ */
  /* Effekt-Hooks                                                       */
  /* ------------------------------------------------------------------ */
  
  // Zeit-Update
  useEffect(() => {
    const upd = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);

  // Fenstergröße
  useEffect(() => {
    const onResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Player-Details nachladen
  useEffect(() => {
    if (!currentPlayer?.badgeId) return;
    fetch(
      `http://localhost:5000/api/players/badge/${currentPlayer.badgeId}`
    )
      .then((res) => res.json())
      .then((full: Player) => {
        setCurrentPlayer(full);
      })
      .catch((err) => console.error("Player-Fetch error", err));
  }, [currentPlayer?.badgeId, setCurrentPlayer]);

  // Keyboard-Navigation (Kombiniert aus beiden Branches)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setShowSettings(false);
        setShowUser(false);
        setShowInfo(false);
        setNavigationMode("games");
        return;
      }

      if (!showSettings && !showUser && !showInfo) {
        if (navigationMode === "games") {
          switch (event.key) {
            case "ArrowLeft":
              event.preventDefault();
              navigateToGame((selectedGameIndex - 1 + games.length) % games.length);
              break;
            case "ArrowRight":
              event.preventDefault();
              navigateToGame((selectedGameIndex + 1) % games.length);
              break;
            case "ArrowUp":
              event.preventDefault();
              setNavigationMode("header");
              break;
            case "Enter":
              event.preventDefault();
              handleGameSelect(games[selectedGameIndex]);
              break;
            case " ":
              event.preventDefault();
              if (videoVisible && videoEnded && games[selectedGameIndex].video) {
                replayVideo();
              }
              break;
            default:
              break;
          }
        } else if (navigationMode === "header") {
          switch (event.key) {
            case "ArrowLeft":
              event.preventDefault();
              const currentLeftIdx = headerButtons.indexOf(selectedHeaderButton);
              setSelectedHeaderButton(
                headerButtons[(currentLeftIdx - 1 + headerButtons.length) % headerButtons.length]
              );
              break;
            case "ArrowRight":
              event.preventDefault();
              const currentRightIdx = headerButtons.indexOf(selectedHeaderButton);
              setSelectedHeaderButton(
                headerButtons[(currentRightIdx + 1) % headerButtons.length]
              );
              break;
            case "ArrowDown":
              event.preventDefault();
              setNavigationMode("games");
              break;
            case "Enter":
              event.preventDefault();
              handleHeaderButtonActivate(selectedHeaderButton);
              break;
            default:
              break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    selectedGameIndex,
    selectedHeaderButton,
    navigationMode,
    showSettings,
    showUser,
    showInfo,
    navigateToGame,
    videoVisible,
    videoEnded,
    replayVideo,
  ]);

  /* ------------------------------------------------------------------ */
  /* Aktionen                                                           */
  /* ------------------------------------------------------------------ */
  const handleGameSelect = (game: Game): void => {
    const route = `/${game.title.toLowerCase()}`;
    navigate(route);
  };

  const handleGameClick = (index: number): void => {
    navigateToGame(index);
    setNavigationMode("games");

    if (index === selectedGameIndex) {
      handleGameSelect(games[index]);
    }
  };

  const handleHeaderButtonActivate = (button: HeaderButton): void => {
    switch (button) {
      case "settings":
        setShowSettings(true);
        break;
      case "user":
        setShowUser(true);
        break;
      case "info":
        setShowInfo(true);
        break;
    }
  };

  const closeAllModals = (): void => {
    setShowSettings(false);
    setShowUser(false);
    setShowInfo(false);
    setNavigationMode("games");
  };

  const getBtnClass = (button: HeaderButton): string => {
    const baseClass = button === "user" ? "user-text" : 
                     button === "info" ? "info-circle" : 
                     `${button}-button`;
    
    return `${baseClass}${
      navigationMode === "header" && selectedHeaderButton === button
        ? " keyboard-selected"
        : ""
    }`;
  };

  return (
    <div>
      <div className="arcade-container">
        {/* --- Header --- */}
        <header className="arcade-header">
          <div className="header-left">
            <button
              className={getBtnClass("settings")}
              onClick={() => handleHeaderButtonActivate("settings")}
              aria-label="Einstellungen öffnen"
            >
              <img
                className="settings-icon"
                src={settingsImage}
                alt="Einstellungen"
              />
            </button>
            <button
              className={getBtnClass("user")}
              onClick={() => handleHeaderButtonActivate("user")}
              aria-label="Benutzer-Menü öffnen"
            >
              USER
            </button>
          </div>
          <div className="header-center">
            <h1 className="arcade-title">DAVINCI ARCADE</h1>
          </div>
          <div className="header-right">
            <button
              className={getBtnClass("info")}
              onClick={() => handleHeaderButtonActivate("info")}
              aria-label="Informationen anzeigen"
            >
              i
            </button>
            <p className="clock">{time}</p>
          </div>
        </header>

        {/* --- Navigation Indicator --- */}
        <div className="navigation-indicator">
          <span className={navigationMode === "games" ? "active" : ""}>
            GAMES
          </span>
          <span className={navigationMode === "header" ? "active" : ""}>
            MENÜ
          </span>
        </div>

        {/* --- Game Carousel --- */}
        <div className="games-carousel-container">
          <div className="games-carousel-viewport">
            <div className="games-carousel-track">
              {games.map((game: Game, index: number) => {
                const isSelected = index === selectedGameIndex;
                const shouldShowVideo = isSelected && videoVisible && game.video;

                return (
                  <div
                    key={game.id}
                    className={`game-card-carousel ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleGameClick(index)}
                    style={{
                      "--game-color": game.color,
                      ...getCardTransform(index),
                    } as React.CSSProperties & Record<string, any>}
                  >
                    
                    <div className="game-content">

                      {shouldShowVideo ? (
                        <>
                          <video
                            ref={videoRef}
                            src={game.video}
                            autoPlay
                            muted
                            playsInline
                            controls={false}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              zIndex: 1,
                              borderRadius: '32px',
                              pointerEvents: 'none',
                              background: 'black',
                              opacity: videoFadeIn ? 1 : 0,
                              transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)',
                              willChange: 'opacity',
                            }}
                            onEnded={() => setVideoEnded(true)}
                          />
                          {/* Overlay for replay button */}
                          {videoEnded && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: '#0ff',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontFamily: 'Press Start 2P',
                                textAlign: 'center',
                                border: '1px solid #0ff',
                                cursor: 'pointer',
                                zIndex: 2,
                              }}
                              onClick={replayVideo}
                            >
                              ↻ REPLAY<br />
                              <span style={{ fontSize: '10px' }}>LEERTASTE</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="game-icon-carousel">{game.icon}</div>
                      )}

                      <div className="game-title-carousel">{game.title}</div>
                      <div
                        className="game-glow"
                        style={{ "--game-color": game.color } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="selected-game-info"
            style={{
              marginBottom: "4em",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2
              className="selected-game-title"
              style={{ 
                "--game-color": games[selectedGameIndex].color,
                fontSize: '2rem',
                marginTop: "-2.3rem"
              } as React.CSSProperties}
            >
              {games[selectedGameIndex].title}
            </h2>
            <div className="game-description">
              Drücke ENTER zum Spielen
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <footer className="arcade-footer">
          <div className="footer-content">
            <div className="footer-names">
              <span className="footer-text">Livio</span>
              <span className="footer-divider">&amp;</span>
              <span className="footer-text">Gian</span>
              <span className="footer-divider">&amp;</span>
              <span className="footer-text">Philip</span>
            </div>
            <div className="footer-year">ITS 2024</div>
          </div>
        </footer>
      </div>

      {/* --- Modals --- */}
      {showSettings && currentPlayer && (
        <SettingsModal
          onClose={closeAllModals}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
        />
      )}
      {showUser && currentPlayer && (
        <UserModal
          onClose={closeAllModals}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
        />
      )}
      {showInfo && <InfoModal onClose={closeAllModals} />}
    </div>
  );
};

export default Home;
