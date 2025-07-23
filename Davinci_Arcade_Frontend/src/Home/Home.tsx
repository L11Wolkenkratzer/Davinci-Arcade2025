import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  startTransition,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { unstable_batchedUpdates } from 'react-dom';

import "./Home.css";
import Header from "./Header";
import Footer from "./Footer";
import Carousel from "./Carousel";
import SettingsModal from "./SettingsModal";
import UserModal from "./UserModal";
import InfoModal from "./InfoModal";

import sonicVideo from '/Videos/sonic-preview2.mp4';
import tetrisVideo from '/Videos/tetris.mp4';
import spaceshipVideo from '/Videos/SpaceShip.mp4';
import snakeVideo from '/Videos/Snake.mp4';

// Types für Player aus App.tsx
export interface Player {
  _id: string;
  badgeId: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string; // ISO-Date
  updatedAt?: string;
  createdAt?: string;
  __v?: number;
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

// Games Array mit Video-Support - Konstante Definition außerhalb der Komponente
const GAMES: Game[] = [
  { id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b", video: tetrisVideo},
  { id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4" },
  { id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1" },
  { id: 4, title: "SONIC", icon: "💨", color: "#96ceb4", video: sonicVideo },
  { id: 5, title: "SPACESHIPS", icon: "🚀", color: "#feca57", video: spaceshipVideo },
  { id: 6, title: "Snake", icon: "💀", color: "#2cea22", video: snakeVideo },
  { id: 7, title: "TILLIMAN", icon: "⏱️", color: "#f06c00" },
];

const Home: React.FC<HomeProps> = ({ currentPlayer, setCurrentPlayer }) => {
  console.log("Home component rendered");
  
  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */
  const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>("games");
  const [selectedHeaderButton, setSelectedHeaderButton] = useState<HeaderButton>("settings");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showUser, setShowUser] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);
  const [videoVisible, setVideoVisible] = useState<boolean>(false);
  const [videoEnded, setVideoEnded] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const navigate = useNavigate();
  const playerFetchInProgressRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Refs for stable handleKeyPress
  const selectedGameIndexRef = useRef<number>(selectedGameIndex);
  selectedGameIndexRef.current = selectedGameIndex;
  const navigationModeRef = useRef<NavigationMode>(navigationMode);
  navigationModeRef.current = navigationMode;
  const selectedHeaderButtonRef = useRef<HeaderButton>(selectedHeaderButton);
  selectedHeaderButtonRef.current = selectedHeaderButton;
  const modalsStateRef = useRef({ showSettings, showUser, showInfo });
  modalsStateRef.current = { showSettings, showUser, showInfo };

  const headerButtons: HeaderButton[] = useMemo(() => ["settings", "user", "info"], []);

  /* ------------------------------------------------------------------ */
  /* Memoized Functions                                                 */
  /* ------------------------------------------------------------------ */
  
  const handleGameSelect = useCallback((game: Game): void => {
    let route = `/${game.title.toLowerCase()}`;
    if (game.title === 'TILLIMAN') {
      route = '/tilliman';
    }
    navigate(route);
  }, [navigate]);

  const handleHeaderButtonActivate = useCallback((button: HeaderButton): void => {
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
  }, []);

  // OPTIMIZED: Use startTransition for smooth updates with transition control
  const navigateToGame = useCallback((newIdx: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    startTransition(() => {
      setSelectedGameIndex(newIdx);
    });
    
    // Reset transition state after animation
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setIsTransitioning(false), 400);
  }, [isTransitioning]);

  // Video Replay Function with ref support
  const replayVideo = useCallback(() => {
    setVideoEnded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Helper Functions                                                   */
  /* ------------------------------------------------------------------ */
  const getCardDimensions = useCallback(() => {
    if (containerWidth <= 1920) {
      return { cardWidth: 280, gap: 200 };
    }
    return { cardWidth: 420, gap: 240 };
  }, [containerWidth]);

  const getCardTransform = useCallback(
    (index: number) => {
      const total = GAMES.length;
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
    [selectedGameIndex, getCardDimensions]
  );

  /* ------------------------------------------------------------------ */
  /* Video Logic                                                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setVideoEnded(false);
    const currentGame = GAMES[selectedGameIndex];
    if (currentGame && currentGame.video) {
      setVideoVisible(true);
    } else {
      setVideoVisible(false);
    }
  }, [selectedGameIndex]);

  /* ------------------------------------------------------------------ */
  /* Effects                                                            */
  /* ------------------------------------------------------------------ */

  // Window resize
  useEffect(() => {
    const onResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // OPTIMIZED: Keyboard handler with batched updates
  const handleKeyPress = useCallback((event: KeyboardEvent): void => {
    // Escape schließt immer alle Modals
    if (event.key === "Escape") {
      unstable_batchedUpdates(() => {
        setShowSettings(false);
        setShowUser(false);
        setShowInfo(false);
        setNavigationMode("games");
      });
      return;
    }

    // ⚠️ WICHTIG: Keyboard-Navigation nur wenn KEINE Modals offen sind
    if (modalsStateRef.current.showSettings || modalsStateRef.current.showUser || modalsStateRef.current.showInfo) {
      return; // Früh aussteigen wenn ein Modal offen ist
    }

    if (navigationModeRef.current === "games") {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          navigateToGame((selectedGameIndexRef.current - 1 + GAMES.length) % GAMES.length);
          break;
        case "ArrowRight":
          event.preventDefault();
          navigateToGame((selectedGameIndexRef.current + 1) % GAMES.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setNavigationMode("header");
          break;
        case "Enter":
          event.preventDefault();
          handleGameSelect(GAMES[selectedGameIndexRef.current]);
          break;
        case " ":
          event.preventDefault();
          if (videoVisible && videoEnded && GAMES[selectedGameIndexRef.current].video) {
            replayVideo();
          }
          break;
      }
    } else if (navigationModeRef.current === "header") {
      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          const currentLeftIdx = headerButtons.indexOf(selectedHeaderButtonRef.current);
          setSelectedHeaderButton(
            headerButtons[(currentLeftIdx - 1 + headerButtons.length) % headerButtons.length]
          );
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          const currentRightIdx = headerButtons.indexOf(selectedHeaderButtonRef.current);
          setSelectedHeaderButton(
            headerButtons[(currentRightIdx + 1) % headerButtons.length]
          );
          break;
        }
        case "ArrowDown":
          event.preventDefault();
          setNavigationMode("games");
          break;
        case "Enter":
          event.preventDefault();
          handleHeaderButtonActivate(selectedHeaderButtonRef.current);
          break;
      }
    }
  }, [navigateToGame, handleGameSelect, handleHeaderButtonActivate, headerButtons, videoVisible, videoEnded, replayVideo]);

  // Event listener registration
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // Player details fetch - optimized version
  useEffect(() => {
    let isMounted = true;
    
    const fetchPlayerDetails = async () => {
      if (!currentPlayer?.badgeId) return;
      if (currentPlayer.updatedAt && currentPlayer.createdAt) return;
      if (playerFetchInProgressRef.current) return;
      
      playerFetchInProgressRef.current = true;
      
      try {
        const res = await fetch(
          `http://localhost:5000/api/players/badge/${currentPlayer.badgeId}`
        );
        const full: Player = await res.json();
        
        if (isMounted && full && (
          full.totalScore !== currentPlayer.totalScore ||
          full.gamesPlayed !== currentPlayer.gamesPlayed ||
          !currentPlayer.updatedAt
        )) {
          setCurrentPlayer(full);
        }
      } catch (err) {
        console.error("Player-Fetch error", err);
      } finally {
        playerFetchInProgressRef.current = false;
      }
    };
    
    const timeoutId = setTimeout(fetchPlayerDetails, 1000);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentPlayer?.badgeId, currentPlayer?.updatedAt, setCurrentPlayer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Handlers                                                           */
  /* ------------------------------------------------------------------ */
  
  const handleGameClick = useCallback((index: number): void => {
    navigateToGame(index);
    setNavigationMode("games");

    if (index === selectedGameIndex) {
      handleGameSelect(GAMES[index]);
    }
  }, [navigateToGame, selectedGameIndex, handleGameSelect]);

  const closeAllModals = useCallback((): void => {
    unstable_batchedUpdates(() => {
      setShowSettings(false);
      setShowUser(false);
      setShowInfo(false);
      setNavigationMode("games");
    });
  }, []);

  return (
    <div>
      <div className="arcade-container">
        <Header
          navigationMode={navigationMode}
          selectedHeaderButton={selectedHeaderButton}
          onHeaderButtonActivate={handleHeaderButtonActivate}
        />

        {/* Navigation Indicator */}
        <div className="navigation-indicator">
          <span className={navigationMode === "games" ? "active" : ""}>
            GAMES
          </span>
          <span className={navigationMode === "header" ? "active" : ""}>
            MENÜ
          </span>
        </div>

        <Carousel
          games={GAMES}
          selectedGameIndex={selectedGameIndex}
          onGameClick={handleGameClick}
          containerWidth={containerWidth}
          videoVisible={videoVisible}
          videoEnded={videoEnded}
          onVideoReplay={replayVideo}
          setVideoEnded={setVideoEnded}
          getCardTransform={getCardTransform}
          videoRef={videoRef}
        />

        <Footer />
      </div>

      {/* Modals */}
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
