import React, { useState, useEffect } from "react";
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

type NavigationMode = 'games' | 'header';
type HeaderButton = 'settings' | 'user' | 'info';

const Home: React.FC = () => {
    const [time, setTime] = useState<string>("");
    const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
    const [navigationMode, setNavigationMode] = useState<NavigationMode>('games');
    const [selectedHeaderButton, setSelectedHeaderButton] = useState<HeaderButton>('settings');
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showUser, setShowUser] = useState<boolean>(false);
    const [showInfo, setShowInfo] = useState<boolean>(false);

    // Game Data
    const games: Game[] = [
        { id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b" },
        { id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4" },
        { id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1" },
        { id: 4, title: "SONIC", icon: "💨", color: "#96ceb4" },
        { id: 5, title: "ZELDA", icon: "⚔️", color: "#feca57" },
        { id: 6, title: "DOOM", icon: "💀", color: "#ff9ff3" }
    ];

    const headerButtons: HeaderButton[] = ['settings', 'user', 'info'];

    // Uhr Logic
    useEffect(() => {
        const updateTime = (): void => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], {
                hour: '2-digit' as const,
                minute: '2-digit' as const,
            }));
        };

        updateTime();
        const intervalId: NodeJS.Timeout = setInterval(updateTime, 1000);

        return (): void => {
            clearInterval(intervalId);
        };
    }, []);

    // Erweiterte Keyboard Navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent): void => {
            // Escape schließt alle Menüs und kehrt zu Games zurück
            if (event.key === 'Escape') {
                setShowSettings(false);
                setShowUser(false);
                setShowInfo(false);
                setNavigationMode('games');
                return;
            }

            // Tab wechselt zwischen Navigation-Modi
            if (event.key === 'Tab') {
                event.preventDefault();
                setNavigationMode(prev => prev === 'games' ? 'header' : 'games');
                return;
            }

            // Nur wenn kein Modal offen ist
            if (!showSettings && !showUser && !showInfo) {

                if (navigationMode === 'games') {
                    // Games Navigation
                    switch(event.key) {
                        case 'ArrowLeft':
                            event.preventDefault();
                            setSelectedGameIndex(prev =>
                                prev > 0 ? prev - 1 : games.length - 1
                            );
                            break;
                        case 'ArrowRight':
                            event.preventDefault();
                            setSelectedGameIndex(prev =>
                                prev < games.length - 1 ? prev + 1 : 0
                            );
                            break;
                        case 'ArrowUp':
                            event.preventDefault();
                            setNavigationMode('header');
                            break;
                        case 'Enter':
                            event.preventDefault();
                            handleGameSelect(games[selectedGameIndex]);
                            break;
                        default:
                            break;
                    }
                } else if (navigationMode === 'header') {
                    // Header Buttons Navigation
                    switch(event.key) {
                        case 'ArrowLeft':
                            event.preventDefault();
                            setSelectedHeaderButton(prev => {
                                const currentIndex = headerButtons.indexOf(prev);
                                const newIndex = currentIndex > 0 ? currentIndex - 1 : headerButtons.length - 1;
                                return headerButtons[newIndex];
                            });
                            break;
                        case 'ArrowRight':
                            event.preventDefault();
                            setSelectedHeaderButton(prev => {
                                const currentIndex = headerButtons.indexOf(prev);
                                const newIndex = currentIndex < headerButtons.length - 1 ? currentIndex + 1 : 0;
                                return headerButtons[newIndex];
                            });
                            break;
                        case 'ArrowDown':
                            event.preventDefault();
                            setNavigationMode('games');
                            break;
                        case 'Enter':
                            event.preventDefault();
                            handleHeaderButtonActivate(selectedHeaderButton);
                            break;
                        default:
                            break;
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return (): void => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [selectedGameIndex, selectedHeaderButton, navigationMode, games.length, showSettings, showUser, showInfo]);

    // Event Handlers
    const handleGameSelect = (game: Game): void => {
        console.log(`Selected game: ${game.title}`);
        // TODO: Spiel-Start Logic hier
    };

    const handleGameClick = (index: number): void => {
        setSelectedGameIndex(index);
        setNavigationMode('games');
    };

    const handleHeaderButtonActivate = (button: HeaderButton): void => {
        switch(button) {
            case 'settings':
                setShowSettings(true);
                break;
            case 'user':
                setShowUser(true);
                break;
            case 'info':
                setShowInfo(true);
                break;
        }
    };

    const handleSettingsClick = (): void => {
        setSelectedHeaderButton('settings');
        setNavigationMode('header');
        setShowSettings(true);
    };

    const handleUserClick = (): void => {
        setSelectedHeaderButton('user');
        setNavigationMode('header');
        setShowUser(true);
    };

    const handleInfoClick = (): void => {
        setSelectedHeaderButton('info');
        setNavigationMode('header');
        setShowInfo(true);
    };

    const closeAllModals = (): void => {
        setShowSettings(false);
        setShowUser(false);
        setShowInfo(false);
        setNavigationMode('games');
    };

    // Helper function to determine button classes
    const getButtonClass = (buttonType: HeaderButton): string => {
        const baseClass = buttonType === 'settings' ? 'settings-button' :
            buttonType === 'user' ? 'user-circle' : 'info-circle';
        const selectedClass = navigationMode === 'header' && selectedHeaderButton === buttonType ? ' keyboard-selected' : '';
        return baseClass + selectedClass;
    };

    const getUserTextClass = (): string => {
        const baseClass = 'user-text';
        const selectedClass = navigationMode === 'header' && selectedHeaderButton === 'user' ? ' keyboard-selected' : '';
        return baseClass + selectedClass;
    };

    return (
        <div>
            <div className="arcade-container">
                <header className="arcade-header">
                    <div className="header-left">
                        <button
                            className={getButtonClass('settings')}
                            onClick={handleSettingsClick}
                            aria-label="Einstellungen öffnen"
                        >
                            <img className="settings-icon" src={settingsImage} alt="Einstellungen" />
                        </button>
                        <button
                            className={getButtonClass('user')}
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
                            className={getButtonClass('info')}
                            onClick={handleInfoClick}
                            aria-label="Informationen anzeigen"
                        >
                            i
                        </button>
                        <p className="clock">{time}</p>
                    </div>
                </header>

                {/* Navigation Indicator */}
                <div className="navigation-indicator">
                    <span className={navigationMode === 'games' ? 'active' : ''}>GAMES</span>
                    <span className={navigationMode === 'header' ? 'active' : ''}>MENÜ</span>
                </div>

                {/* Game Selection */}
                <div className="games-container-static">
                    <div className="games-grid-static">
                        {games.map((game: Game, index: number) => (
                            <div
                                key={game.id}
                                className={`game-card-static ${index === selectedGameIndex && navigationMode === 'games' ? 'selected' : ''}`}
                                onClick={() => handleGameClick(index)}
                                style={{
                                    '--game-color': game.color
                                } as React.CSSProperties}
                            >
                                <div className="game-icon-static">{game.icon}</div>
                                <div className="game-title-static">{game.title}</div>
                            </div>
                        ))}
                    </div>

                    <div className="controls-info-static">
                        <span>← → Navigieren</span>
                        <span>↑ ↓ Bereich wechseln</span>
                        <span>ENTER: Auswählen</span>
                        <span>ESC: Schließen</span>
                    </div>
                </div>

                <footer className="arcade-footer">
                    <div className="footer-content">
                        <div className="footer-names">
                            <span className="footer-text">Livio</span>
                            <span className="footer-divider">&</span>
                            <span className="footer-text">Gian</span>
                            <span className="footer-divider">&</span>
                            <span className="footer-text">Philip</span>
                        </div>
                        <div className="footer-year">ITS 2025</div>
                    </div>
                </footer>
            </div>

            {/* Modals */}
            {showSettings && (
                <SettingsModal onClose={closeAllModals} />
            )}
            {showUser && (
                <UserModal onClose={closeAllModals} />
            )}
            {showInfo && (
                <InfoModal onClose={closeAllModals} />
            )}
        </div>
    );
};

export default Home;
