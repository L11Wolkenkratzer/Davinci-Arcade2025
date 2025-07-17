import React, {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import settingsImage from "../assets/settingsImage.png";
import SettingsModal from "./SettingsModal";
import UserModal from "./UserModal";
import InfoModal from "./InfoModal";

// Typs für euren Player aus App.tsx
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
}

type NavigationMode = "games" | "header";
type HeaderButton = "settings" | "user" | "info";

const Home: React.FC<HomeProps> = ({ currentPlayer, setCurrentPlayer }) => {
  const [time, setTime] = useState("");
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [navigationMode, setNavigationMode] =
    useState<NavigationMode>("games");
  const [selectedHeaderButton, setSelectedHeaderButton] =
    useState<HeaderButton>("settings");
  const [showSettings, setShowSettings] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  // Beispiel-Games
  const games: Game[] = [
    { id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b" },
    { id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4" },
    { id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1" },
    { id: 4, title: "SONIC", icon: "💨", color: "#96ceb4" },
    { id: 5, title: "ZELDA", icon: "⚔️", color: "#feca57" },
    { id: 6, title: "DOOM", icon: "💀", color: "#ff9ff3" },
  ];

  const headerButtons: HeaderButton[] = [
    "settings",
    "user",
    "info",
  ];

  // Responsives Layout
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

  // === Effekte ===

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

  const handleGameSelect = useCallback((title: string) => {
    // Erzeuge einen Pfad wie /pacman, /tetris, ...
    const route = `/${title.toLowerCase()}`;
    navigate(route);
  }, [navigate]);

  const handleHeaderButtonActivate = useCallback((btn: HeaderButton) => {
    if (btn === "settings") setShowSettings(true);
    if (btn === "user") setShowUser(true);
    if (btn === "info") setShowInfo(true);
  }, []);

  // Keyboard-Nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSettings || showUser || showInfo) return;

      if (navigationMode === "games") {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateToGame((selectedGameIndex + 1) % games.length);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateToGame((selectedGameIndex - 1 + games.length) % games.length);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          handleGameSelect(games[selectedGameIndex].title);
        }
        if (e.key === "ArrowUp") {
          setNavigationMode("header");
        }
      } else if (navigationMode === "header") {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const idx = headerButtons.indexOf(selectedHeaderButton);
          const dir = e.key === "ArrowRight" ? 1 : -1;
          setSelectedHeaderButton(
            headerButtons[(idx + dir + headerButtons.length) % headerButtons.length]
          );
        }
        if (e.key === "Enter") {
          e.preventDefault();
          handleHeaderButtonActivate(selectedHeaderButton);
        }
        if (e.key === "ArrowDown") {
          setNavigationMode("games");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    selectedGameIndex,
    navigationMode,
    selectedHeaderButton,
    showSettings,
    showUser,
    showInfo,
    games,
    headerButtons,
    navigateToGame,
    handleGameSelect,
    handleHeaderButtonActivate
  ]);

  // === Actions ===


  const closeAll = () => {
    setShowSettings(false);
    setShowUser(false);
    setShowInfo(false);
    setNavigationMode("games");
  };

  const getBtnClass = (b: HeaderButton) => {
    if (b === "settings") {
      return `settings-button${
        navigationMode === "header" && selectedHeaderButton === b
          ? " keyboard-selected"
          : ""
      }`;
    } else if (b === "user") {
      return `user-text${
        navigationMode === "header" && selectedHeaderButton === b
          ? " keyboard-selected"
          : ""
      }`;
    } else if (b === "info") {
      return `info-circle${
        navigationMode === "header" && selectedHeaderButton === b
          ? " keyboard-selected"
          : ""
      }`;
    }
    return "";
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
              {games.map((g, idx) => (
                <div
                  key={g.id}
                  className={`game-card-carousel ${
                    idx === selectedGameIndex ? "selected" : ""
                  }`}
                  onClick={() => {
                    navigateToGame(idx);
                    if (idx === selectedGameIndex)
                      handleGameSelect(g.title);
                  }}
                  style={{
                    "--game-color": g.color,
                    ...(getCardTransform(idx) as any),
                  }}
                >
                  <div className="game-icon-carousel">{g.icon}</div>
                  <div className="game-title-carousel">{g.title}</div>
                  <div
                    className="game-glow"
                    style={{ "--game-color": g.color } as any}
                  />
                </div>
              ))}
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
              style={{ "--game-color": games[selectedGameIndex].color } as any}
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
            <div className="footer-year">ITS 2025</div>
          </div>
        </footer>
      </div>

      {/* --- Modals --- */}
      {showSettings && currentPlayer && (
        <SettingsModal
          onClose={closeAll}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
        />
      )}
      {showUser && currentPlayer && (
        <UserModal
          onClose={closeAll}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
        />
      )}
      {showInfo && <InfoModal onClose={closeAll} />}
    </div>
  );
};

export default Home;
