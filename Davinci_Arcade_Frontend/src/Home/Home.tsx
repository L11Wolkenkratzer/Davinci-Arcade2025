import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import settingsImage from "../assets/settingsImage.png";
import SettingsModal from "./SettingsModal";
import UserModal from "./UserModal";
import InfoModal from "./InfoModal";
import sonicVideo from "../assets/videos/sonic-preview2.mp4";

interface Game {
    id: number;
    title: string;
    icon: string;
    color: string;
    video?: string;
}

type NavigationMode = "games" | "header";
type HeaderButton = "settings" | "user" | "info";

// GAMES ARRAY AUSSERHALB DER KOMPONENTE DEFINIEREN
const games: Game[] = [
    {id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b"},
    {id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4"},
    {id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1"},
    {id: 4, title: "SONIC", icon: "💨", color: "#96ceb4", video: sonicVideo},
    {id: 5, title: "SPACESHIPS", icon: "⚔️", color: "#feca57"},
    {id: 6, title: "DOOM", icon: "💀", color: "#ff9ff3"}
];

const Home: React.FC = () => {
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
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const navigate = useNavigate();

    const headerButtons: HeaderButton[] = ["settings", "user", "info"];

    // DIREKTER useEffect OHNE useCallback
    useEffect(() => {
        console.log("Game index changed to:", selectedGameIndex, "Game:", games[selectedGameIndex].title);

        // Timer sofort stoppen
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
            console.log("Timer cleared");
        }

        // Video sofort verstecken und zurücksetzen
        setVideoVisible(false);
        setVideoEnded(false);
        console.log("Video hidden");

        // Prüfen ob aktuelles Spiel ein Video hat
        const currentGame = games[selectedGameIndex];
        if (currentGame && currentGame.video) {
            console.log("Game has video, starting timer...");

            timerRef.current = setTimeout(() => {
                console.log("TIMER TRIGGERED - Showing video for", currentGame.title);
                setVideoVisible(true);
                setVideoEnded(false);
            }, 2000);
        } else {
            console.log("Game has no video");
        }
    }, [selectedGameIndex]); // NUR selectedGameIndex

    // Video Replay-Funktion
    const replayVideo = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setVideoEnded(false);
            console.log("Video replay started");
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

    const getCardDimensions = useCallback(() => {
        const width = containerWidth;
        if (width <= 1920) {
            return { cardWidth: 280, cardHeight: 350, gap: 200 };
        } else {
            return { cardWidth: 420, cardHeight: 530, gap: 240 };
        }
    }, [containerWidth]);

    const getCardTransform = useCallback(
        (index: number, selectedIndex: number, totalCards: number) => {
            const { cardWidth, gap } = getCardDimensions();
            const cardSpacing = cardWidth + gap;

            let relativePosition = index - selectedIndex;

            if (relativePosition > totalCards / 2) {
                relativePosition -= totalCards;
            } else if (relativePosition < -totalCards / 2) {
                relativePosition += totalCards;
            }

            const translateX = relativePosition * cardSpacing;
            const absPosition = Math.abs(relativePosition);

            let scale, opacity, zIndex;
            if (absPosition === 0) {
                scale = 1;
                opacity = 1;
                zIndex = 10;
            } else if (absPosition === 1) {
                scale = 0.8;
                opacity = 0.7;
                zIndex = 5;
            } else if (absPosition === 2) {
                scale = 0.6;
                opacity = 0.4;
                zIndex = 2;
            } else {
                scale = 0.4;
                opacity = 0.2;
                zIndex = 1;
            }

            return {
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity,
                zIndex,
            };
        },
        [getCardDimensions]
    );

    const navigateToGame = useCallback(
        (newIndex: number) => {
            if (isTransitioning) return;

            console.log("NAVIGATION: Moving to game", newIndex);
            setIsTransitioning(true);
            setSelectedGameIndex(newIndex);

            setTimeout(() => setIsTransitioning(false), 400);
        },
        [isTransitioning]
    );

    // Window resize
    useEffect(() => {
        const handleResize = () => setContainerWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Time update
    useEffect(() => {
        const updateTime = (): void => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })
            );
        };
        updateTime();
        const intervalId: NodeJS.Timeout = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Keyboard controls
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
                            navigateToGame(
                                selectedGameIndex > 0
                                    ? selectedGameIndex - 1
                                    : games.length - 1
                            );
                            break;
                        case "ArrowRight":
                            event.preventDefault();
                            navigateToGame(
                                selectedGameIndex < games.length - 1
                                    ? selectedGameIndex + 1
                                    : 0
                            );
                            break;
                        case "ArrowUp":
                            event.preventDefault();
                            setNavigationMode("header");
                            break;
                        case "Enter":
                            event.preventDefault();
                            handleGameSelect(games[selectedGameIndex]);
                            break;
                        case " ": // Leertaste für Video-Replay
                            event.preventDefault();
                            if (videoVisible && videoEnded && selectedGameIndex === 3) {
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
                            setSelectedHeaderButton((prev) => {
                                const current = headerButtons.indexOf(prev);
                                return headerButtons[
                                    current > 0 ? current - 1 : headerButtons.length - 1
                                    ];
                            });
                            break;
                        case "ArrowRight":
                            event.preventDefault();
                            setSelectedHeaderButton((prev) => {
                                const current = headerButtons.indexOf(prev);
                                return headerButtons[
                                    current < headerButtons.length - 1 ? current + 1 : 0
                                    ];
                            });
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

    const handleGameSelect = (game: Game): void => {
        switch (game.title) {
            case "PACMAN":
                navigate("/pacman");
                break;
            case   "SPACESHIPS":
                navigate("/spaceships")
                break;
            default:
                console.log(`Noch keine Route für ${game.title}`);
        }
    };

    const handleGameClick = (index: number): void => {
        navigateToGame(index);
        setNavigationMode("games");
        if (index === selectedGameIndex) handleGameSelect(games[index]);
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

    const handleSettingsClick = (): void => {
        setSelectedHeaderButton("settings");
        setNavigationMode("header");
        setShowSettings(true);
    };

    const handleUserClick = (): void => {
        setSelectedHeaderButton("user");
        setNavigationMode("header");
        setShowUser(true);
    };

    const handleInfoClick = (): void => {
        setSelectedHeaderButton("info");
        setNavigationMode("header");
        setShowInfo(true);
    };

    const closeAllModals = (): void => {
        setShowSettings(false);
        setShowUser(false);
        setShowInfo(false);
        setNavigationMode("games");
    };

    const getButtonClass = (buttonType: HeaderButton): string => {
        const baseClass =
            buttonType === "settings"
                ? "settings-button"
                : buttonType === "user"
                    ? "user-circle"
                    : "info-circle";
        const selectedClass =
            navigationMode === "header" && selectedHeaderButton === buttonType
                ? " keyboard-selected"
                : "";
        return baseClass + selectedClass;
    };

    const getUserTextClass = (): string => {
        const baseClass = "user-text";
        const selectedClass =
            navigationMode === "header" && selectedHeaderButton === "user"
                ? " keyboard-selected"
                : "";
        return baseClass + selectedClass;
    };

    return (
        <div>
            <div className="arcade-container">
                <header className="arcade-header">
                    <div className="header-left">
                        <button
                            className={getButtonClass("settings")}
                            onClick={handleSettingsClick}
                            aria-label="Einstellungen öffnen"
                        >
                            <img className="settings-icon" src={settingsImage} alt="Einstellungen" />
                        </button>

                        <button
                            className={getButtonClass("user")}
                            onClick={handleUserClick}
                            aria-label="Benutzer-Menü öffnen"
                        >
                            .
                        </button>

                        <button
                            className={getUserTextClass()}
                            onClick={handleUserClick}
                            aria-label="Benutzer-Profil öffnen"
                        >
                            USER
                        </button>
                    </div>

                    <div className="header-center">
                        <h1 className="arcade-title">DAVINCI ARCADE</h1>
                    </div>

                    <div className="header-right">
                        <button
                            className={getButtonClass("info")}
                            onClick={handleInfoClick}
                            aria-label="Informationen anzeigen"
                        >
                            i
                        </button>
                        <p className="clock">{time}</p>
                    </div>
                </header>

                <div className="navigation-indicator">
                    <span className={navigationMode === "games" ? "active" : ""}>GAMES</span>
                    <span className={navigationMode === "header" ? "active" : ""}>MENÜ</span>
                </div>

                <div className="games-carousel-container">
                    <div className="games-carousel-viewport">
                        <div className="games-carousel-track">
                            {games.map((game: Game, index: number) => {
                                const transform = getCardTransform(index, selectedGameIndex, games.length);
                                const isSelected = index === selectedGameIndex;
                                const shouldShowVideo = isSelected && videoVisible && game.video;

                                return (
                                    <div
                                        key={game.id}
                                        className={`game-card-carousel ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleGameClick(index)}
                                        style={{
                                            '--game-color': game.color,
                                            transform: transform.transform,
                                            opacity: transform.opacity,
                                            zIndex: transform.zIndex
                                        } as React.CSSProperties}
                                    >
                                        <div className="game-content">
                                            {shouldShowVideo ? (
                                                <div style={{
                                                    width: '90%',
                                                    height: '60%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '1rem',
                                                    backgroundColor: 'rgba(0,255,255,0.1)',
                                                    borderRadius: '15px',
                                                    border: '2px solid #0ff',
                                                    position: 'relative'
                                                }}>
                                                    <video
                                                        ref={videoRef}
                                                        src={game.video}
                                                        autoPlay
                                                        muted
                                                        playsInline
                                                        controls={false}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: '13px'
                                                        }}
                                                        onPlay={() => console.log("Video is playing!")}
                                                        onPause={() => console.log("Video paused")}
                                                        onEnded={() => {
                                                            console.log("Video ended");
                                                            setVideoEnded(true);
                                                        }}
                                                        onError={(e) => console.error("Video error:", e)}
                                                        onLoadedData={() => console.log("Video loaded")}
                                                    />

                                                    {/* Replay-Overlay */}
                                                    {videoEnded && (
                                                        <div style={{
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
                                                            cursor: 'pointer'
                                                        }}
                                                             onClick={replayVideo}
                                                        >
                                                            ↻ REPLAY<br/>
                                                            <span style={{fontSize: '10px'}}>LEERTASTE</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="game-icon-carousel">{game.icon}</div>
                                            )}

                                            <div className="game-title-carousel">{game.title}</div>
                                            <div className="game-glow" style={{'--game-color': game.color} as React.CSSProperties}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="selected-game-info" style={{ marginBottom: "4em", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <h2
                            className="selected-game-title"
                            style={{ "--game-color": games[selectedGameIndex].color, fontSize:'2rem', marginTop:"-2.3rem" } as React.CSSProperties}
                        >
                            {games[selectedGameIndex].title}
                        </h2>
                        <div className="game-description">
                            Drücke ENTER zum Spielen

                        </div>
                    </div>
                </div>

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

            {showSettings && <SettingsModal onClose={closeAllModals} />}
            {showUser && <UserModal onClose={closeAllModals} />}
            {showInfo && <InfoModal onClose={closeAllModals} />}
        </div>
    );
};

export default Home;
