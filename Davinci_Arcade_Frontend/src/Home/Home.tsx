import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";         // ⬅︎ NEU
import "./Home.css";
import settingsImage from "../assets/settingsImage.png";
import SettingsModal from "./SettingsModal";
import UserModal from "./UserModal";
import InfoModal from "./InfoModal";

interface Game {
    id: number;
    title: string;
    icon: string;
    color: string;
}

type NavigationMode = "games" | "header";
type HeaderButton = "settings" | "user" | "info";

const Home: React.FC = () => {
    /* ------------------------------------------------------------------ */
    /* State                                                              */
    /* ------------------------------------------------------------------ */
    const [time, setTime] = useState<string>("");
    const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
    const [navigationMode, setNavigationMode] = useState<NavigationMode>("games");
    const [selectedHeaderButton, setSelectedHeaderButton] =
        useState<HeaderButton>("settings");
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showUser, setShowUser] = useState<boolean>(false);
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [containerWidth, setContainerWidth] = useState<number>(
        window.innerWidth
    );

    const navigate = useNavigate();                         // ⬅︎ NEU

    /* ------------------------------------------------------------------ */
    /* Daten                                                              */
    /* ------------------------------------------------------------------ */
    const games: Game[] = [
        { id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b" },
        { id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4" },
        { id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1" },
        { id: 4, title: "SONIC", icon: "💨", color: "#96ceb4" },
        { id: 5, title: "ZELDA", icon: "⚔️", color: "#feca57" },
        { id: 6, title: "DOOM", icon: "💀", color: "#ff9ff3" },
    ];

    const headerButtons: HeaderButton[] = ["settings", "user", "info"];

    /* ------------------------------------------------------------------ */
    /* Hilfsfunktionen                                                    */
    /* ------------------------------------------------------------------ */
    // Responsive card dimensions
    const getCardDimensions = useCallback(() => {
        const width = containerWidth;
        if (width <= 1920) {
            return { cardWidth: 280, cardHeight: 350, gap: 200 };
        } else {
            return { cardWidth: 420, cardHeight: 530, gap: 240 };
        }
    }, [containerWidth]);

    // Calculate card position and scale
    const getCardTransform = useCallback(
        (index: number, selectedIndex: number, totalCards: number) => {
            const { cardWidth, gap } = getCardDimensions();
            const cardSpacing = cardWidth + gap;

            let relativePosition = index - selectedIndex;

            // Infinite scroll positioning
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

            setIsTransitioning(true);
            setSelectedGameIndex(newIndex);

            setTimeout(() => setIsTransitioning(false), 400);
        },
        [isTransitioning]
    );

    /* ------------------------------------------------------------------ */
    /* Effekt-Hooks                                                       */
    /* ------------------------------------------------------------------ */
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
    useEffect(
        () => {
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
                                handleGameSelect(games[selectedGameIndex]); // ⬅︎ nutzt navigate
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
        },
        [
            selectedGameIndex,
            selectedHeaderButton,
            navigationMode,
            games.length,
            showSettings,
            showUser,
            showInfo,
            navigateToGame,
        ]
    );

    /* ------------------------------------------------------------------ */
    /* Aktionen                                                           */
    /* ------------------------------------------------------------------ */
    const handleGameSelect = (game: Game): void => {
        switch (game.title) {
            case "PACMAN":
                navigate("/pacman");          // ⬅︎ Route-Wechsel
                break;
            /* case "TETRIS":
              navigate("/tetris");
              break; */
            default:
                console.log(`Noch keine Route für ${game.title}`);
        }
    };

    const handleGameClick = (index: number): void => {
        // Zuerst Karussell bewegen
        navigateToGame(index);
        setNavigationMode("games");

        // Wenn auf bereits selektierte Karte geklickt ➜ Spiel starten
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

    /* ------------------------------------------------------------------ */
    /* Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
        <div>
            <div className="arcade-container">
                {/* ---------------------------------------------------------- */}
                {/* Header                                                    */}
                {/* ---------------------------------------------------------- */}
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

                {/* Navigation-Indicator */}
                <div className="navigation-indicator">
                    <span className={navigationMode === "games" ? "active" : ""}>GAMES</span>
                    <span className={navigationMode === "header" ? "active" : ""}>MENÜ</span>
                </div>

                {/* ---------------------------------------------------------- */}
                {/* Games-Karussell                                           */}
                {/* ---------------------------------------------------------- */}
                <div className="games-carousel-container">
                    <div className="games-carousel-viewport">
                        <div className="games-carousel-track">
                            {games.map((game, index) => {
                                const transform = getCardTransform(
                                    index,
                                    selectedGameIndex,
                                    games.length
                                );
                                return (
                                    <div
                                        key={game.id}
                                        className={`game-card-carousel ${
                                            index === selectedGameIndex ? "selected" : ""
                                        }`}
                                        onClick={() => handleGameClick(index)}
                                        style={
                                            {
                                                "--game-color": game.color,
                                                transform: transform.transform,
                                                opacity: transform.opacity,
                                                zIndex: transform.zIndex,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <div className="game-icon-carousel">{game.icon}</div>
                                        <div className="game-title-carousel">{game.title}</div>
                                        <div
                                            className="game-glow"
                                            style={
                                                { "--game-color": game.color } as React.CSSProperties
                                            }
                                        ></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Titel + Beschreibung */}
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
                            style={
                                {
                                    "--game-color": games[selectedGameIndex].color, fontSize:'2rem', marginTop:"-2.3rem"
                                } as React.CSSProperties
                            }
                        >
                            {games[selectedGameIndex].title}
                        </h2>
                        <div className="game-description">Drücke ENTER zum Spielen</div>
                    </div>
                </div>

                {/* ---------------------------------------------------------- */}
                {/* Footer                                                    */}
                {/* ---------------------------------------------------------- */}
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

            {/* ---------------------------------------------------------- */}
            {/* Modals                                                     */}
            {/* ---------------------------------------------------------- */}
            {showSettings && <SettingsModal onClose={closeAllModals} />}
            {showUser && <UserModal onClose={closeAllModals} />}
            {showInfo && <InfoModal onClose={closeAllModals} />}
        </div>
    );
};

export default Home;
