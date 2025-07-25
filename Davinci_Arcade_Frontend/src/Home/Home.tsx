import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../SettingsContext";

import "./Home.css";
import Header from "./Header";
import Footer from "./Footer";
import Carousel from "./Carousel";
import SettingsModal from "./SettingsModal";
import UserModal from "./UserModal";
import InfoModal from "./InfoModal";

import sonicVideo from "/Videos/sonic-preview2.mp4";
import tetrisVideo from "/Videos/tetris.mp4";
import spaceshipVideo from "/Videos/SpaceShip.mp4";
import snakeVideo from "/Videos/Snake.mp4";
import lobbyMusic from "/Sounds/LobbyMusic.mp3";

/* ---------- Typdefinitionen ---------- */
export interface Player {
  _id: string;
  badgeId: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string;
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
interface NavigationState {
  selectedGameIndex: number;
  isTransitioning: boolean;
  videoVisible: boolean;
  videoEnded: boolean;
}
interface ModalState {
  showSettings: boolean;
  showUser: boolean;
  showInfo: boolean;
}

/* ---------- Daten ---------- */
const GAMES: Game[] = [
  { id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b", video: tetrisVideo },
  { id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4" },
  { id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1" },
  { id: 4, title: "SONIC", icon: "💨", color: "#96ceb4", video: sonicVideo },
  { id: 5, title: "SPACESHIPS", icon: "🚀", color: "#feca57", video: spaceshipVideo },
  { id: 6, title: "Snake", icon: "💀", color: "#2cea22", video: snakeVideo },
  { id: 7, title: "TILLIMAN", icon: "⏱️", color: "#f06c00" },
];

/* ---------- Hauptkomponente ---------- */
const Home: React.FC<HomeProps> = memo(({ currentPlayer, setCurrentPlayer }) => {
  /* ---------- Debug ---------- */
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(
    `%c[HOME] Render #${renderCount.current}`,
    "color:white;background:#007acc;padding:2px 4px;border-radius:2px;"
  );

  /* --- States (danach, damit sie schon im Log auftauchen) --- */
  const [navState, setNavState] = useState<NavigationState>({
    selectedGameIndex: 0,
    isTransitioning: false,
    videoVisible: false,
    videoEnded: false,
  });
  const [modalState, setModalState] = useState<ModalState>({
    showSettings: false,
    showUser: false,
    showInfo: false,
  });
  const [navigationMode, setNavigationMode] = useState<NavigationMode>("games");
  const [selectedHeaderButton, setSelectedHeaderButton] = useState<HeaderButton>("settings");
  const [containerWidth, setContainerWidth] = useState<number>(window.innerWidth);

  /* Logs der wichtigsten States/Props */
  console.log("[HOME] navState", navState);
  console.log("[HOME] modalState", modalState);
  console.log("[HOME] navigationMode", navigationMode);
  console.log("[HOME] selectedHeaderButton", selectedHeaderButton);

  /* --- Refs --- */
  const navigate = useNavigate();
  const navRef = useRef(navState);
  navRef.current = navState;
  const modeRef = useRef(navigationMode);
  modeRef.current = navigationMode;
  const headerBtnRef = useRef(selectedHeaderButton);
  headerBtnRef.current = selectedHeaderButton;
  const modalRef = useRef(modalState);
  modalRef.current = modalState;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerFetchLock = useRef(false);

  /* --- Audio --- */
  const { volume } = useAudio();
  const lobbyMusicRef = useRef<HTMLAudioElement>();

  /* ---------- Memoized Konstanten & Callbacks ---------- */
  const headerButtons: HeaderButton[] = useMemo(() => ["settings", "user", "info"], []);

  const cardDimensions = useMemo(() => {
    return containerWidth <= 1920
      ? { cardWidth: 280, gap: 200 }
      : { cardWidth: 420, gap: 240 };
  }, [containerWidth]);

  const getCardTransform = useCallback(
    (index: number, selected: number) => {
      const { cardWidth, gap } = cardDimensions;
      const total = GAMES.length;
      const spacing = cardWidth + gap;

      let rel = index - selected;
      if (rel > total / 2) rel -= total;
      if (rel < -total / 2) rel += total;

      const translateX = rel * spacing;
      const abs = Math.abs(rel);
      let scale = 0.4,
        opacity = 0.2,
        z = 1;

      if (abs === 0) {
        scale = 1;
        opacity = 1;
        z = 10;
      } else if (abs === 1) {
        scale = 0.8;
        opacity = 0.7;
        z = 5;
      } else if (abs === 2) {
        scale = 0.6;
        opacity = 0.4;
        z = 2;
      }
      return { transform: `translateX(${translateX}px) scale(${scale})`, opacity, zIndex: z };
    },
    [cardDimensions]
  );

  /* ---------- Navigation-Funktionen ---------- */
  const slideToGame = useCallback((newIndex: number) => {
    if (navRef.current.isTransitioning) return;

    setNavState(prev => ({
      ...prev,
      selectedGameIndex: newIndex,
      isTransitioning: true,
      videoVisible: !!GAMES[newIndex].video,
      videoEnded: false,
    }));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setNavState(prev => ({ ...prev, isTransitioning: false }));
    }, 400);
  }, []);

  const launchGame = useCallback(
    (game: Game) => {
      const route = game.title === "TILLIMAN" ? "/tillimanhome" : `/${game.title.toLowerCase()}`;
      navigate(route);
    },
    [navigate]
  );

  const openHeaderModal = useCallback((btn: HeaderButton) => {
    setModalState(prev => ({
      ...prev,
      [btn === "settings" ? "showSettings" : btn === "user" ? "showUser" : "showInfo"]: true,
    }));
  }, []);

  /* ---------- Stabiler Keyboard-Handler ---------- */
  const keyHandler = useCallback(
    (e: KeyboardEvent) => {
      /* ESC → alle Modals schließen */
      if (e.key === "Escape") {
        setModalState({ showSettings: false, showUser: false, showInfo: false });
        setNavigationMode("games");
        return;
      }

      /* solange irgendein Modal offen ist: Tastatur ignorieren */
      const { showSettings, showUser, showInfo } = modalRef.current;
      if (showSettings || showUser || showInfo) return;

      if (modeRef.current === "games") {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          slideToGame((navRef.current.selectedGameIndex - 1 + GAMES.length) % GAMES.length);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          slideToGame((navRef.current.selectedGameIndex + 1) % GAMES.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setNavigationMode("header");
        } else if (e.key === "Enter") {
          e.preventDefault();
          launchGame(GAMES[navRef.current.selectedGameIndex]);
        } else if (e.key === " " && navRef.current.videoVisible && navRef.current.videoEnded) {
          e.preventDefault();
          setNavState(prev => ({ ...prev, videoEnded: false }));
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          }
        }
      } else {
        /* Header-Navigation */
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const idx = headerButtons.indexOf(headerBtnRef.current);
          const next =
            e.key === "ArrowLeft"
              ? (idx - 1 + headerButtons.length) % headerButtons.length
              : (idx + 1) % headerButtons.length;
          setSelectedHeaderButton(headerButtons[next]);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setNavigationMode("games");
        } else if (e.key === "Enter") {
          e.preventDefault();
          openHeaderModal(headerBtnRef.current);
        }
      }
    },
    [headerButtons, slideToGame, launchGame, openHeaderModal]
  );

  /* ---------- useEffect-Blöcke ---------- */
  /* 1. Keyboard-Listener einmalig */
  useEffect(() => {
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [keyHandler]);

  /* 2. Resize-Listener (debounced) */
  useEffect(() => {
    let t: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setContainerWidth(window.innerWidth), 100);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  /* 3. Audio einmalig initialisieren */
  useEffect(() => {
    lobbyMusicRef.current = new Audio(lobbyMusic);
    lobbyMusicRef.current.loop = true;
    lobbyMusicRef.current.volume = volume / 100;

    const startAudio = async () => {
      try {
        await lobbyMusicRef.current!.play();
      } catch {
        const resume = () => {
          lobbyMusicRef.current!.play().catch(() => {});
          document.removeEventListener("click", resume);
          document.removeEventListener("keydown", resume);
        };
        document.addEventListener("click", resume, { once: true });
        document.addEventListener("keydown", resume, { once: true });
      }
    };
    startAudio();

    return () => {
      lobbyMusicRef.current?.pause();
      lobbyMusicRef.current = undefined;
    };
  }, []); // nur 1-mal

  /* 4. Lautstärke-Updates */
  useEffect(() => {
    if (lobbyMusicRef.current) lobbyMusicRef.current.volume = volume / 100;
  }, [volume]);

  /* 5. Player-Daten nachladen */
  useEffect(() => {
    if (!currentPlayer?.badgeId || currentPlayer.updatedAt) return;
    if (playerFetchLock.current) return;
    playerFetchLock.current = true;

    fetch(`http://localhost:5000/api/players/badge/${currentPlayer.badgeId}`)
      .then(r => r.json())
      .then((full: Player) => setCurrentPlayer(full))
      .catch(console.error)
      .finally(() => (playerFetchLock.current = false));
  }, [currentPlayer?.badgeId, currentPlayer?.updatedAt, setCurrentPlayer]);

  /* ---------- Render ---------- */
  return (
    <div className="arcade-container">
      <Header
        navigationMode={navigationMode}
        selectedHeaderButton={selectedHeaderButton}
        onHeaderButtonActivate={openHeaderModal}
      />

      <div className="navigation-indicator">
        <span className={navigationMode === "games" ? "active" : ""}>GAMES</span>
        <span className={navigationMode === "header" ? "active" : ""}>MENÜ</span>
      </div>

      <Carousel
        games={GAMES}
        selectedGameIndex={navState.selectedGameIndex}
        onGameClick={index => {
          slideToGame(index);
          setNavigationMode("games");
          if (index === navState.selectedGameIndex) launchGame(GAMES[index]);
        }}
        containerWidth={containerWidth}
        videoVisible={navState.videoVisible}
        videoEnded={navState.videoEnded}
        setVideoEnded={ended => setNavState(prev => ({ ...prev, videoEnded: ended }))}
        onVideoReplay={() => {
          setNavState(prev => ({ ...prev, videoEnded: false }));
          videoRef.current?.play();
        }}
        getCardTransform={idx => getCardTransform(idx, navState.selectedGameIndex)}
        videoRef={videoRef}
      />

      <Footer />

      {/* Modals */}
      {modalState.showSettings && currentPlayer && (
        <SettingsModal
          onClose={() => setModalState({ ...modalState, showSettings: false })}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
        />
      )}
      {modalState.showUser && currentPlayer && (
        <UserModal
          onClose={() => setModalState({ ...modalState, showUser: false })}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
        />
      )}
      {modalState.showInfo && (
        <InfoModal onClose={() => setModalState({ ...modalState, showInfo: false })} />
      )}
    </div>
  );
});

Home.displayName = "Home";
export default Home;
