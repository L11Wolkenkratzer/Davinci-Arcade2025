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

  const navigate = useNavigate();
  const playerFetchInProgressRef = useRef<boolean>(false);
  
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
    // Spezielle Behandlung für TILLIMAN -> führt zur Lobby
    if (game.title === "TILLIMAN") {
      navigate('/tillimanhome');
    } else {
      // Alle anderen Spiele verwenden die normale Route
      const route = `/${game.title.toLowerCase()}`;
      navigate(route);
    }
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


  // OPTIMIZED: Use startTransition for smooth updates
  const navigateToGame = useCallback((newIdx: number) => {
    startTransition(() => {
      setSelectedGameIndex(newIdx);
    });
  }, []);


  // Video Replay Function  
  const replayVideo = useCallback(() => {
    setVideoEnded(false);
    // Video replay handled in Carousel component
  }, []);

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
    if (event.key === "Escape") {
      unstable_batchedUpdates(() => {
        setShowSettings(false);
        setShowUser(false);
        setShowInfo(false);
        setNavigationMode("games");
      });
      return;
    }

    if (!modalsStateRef.current.showSettings && !modalsStateRef.current.showUser && !modalsStateRef.current.showInfo) {
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
            if (videoEnded && GAMES[selectedGameIndexRef.current].video) {
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
    }
  }, [navigateToGame, handleGameSelect, handleHeaderButtonActivate, headerButtons, videoEnded, replayVideo]);

  // Event listener registration
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // Player details fetch
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
