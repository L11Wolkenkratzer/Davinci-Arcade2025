import React, { useState, useEffect } from "react";
import "./Home.css";
import settingsImage from "../assets/settingsImage.png";

function Home() {
    const [time, setTime] = useState("");
    const [selectedGameIndex, setSelectedGameIndex] = useState(0);

    // Dummy Game Data - ersetze mit deinen echten Spielen
    const games = [
        { id: 1, title: "TETRIS", icon: "🎮", color: "#ff6b6b" },
        { id: 2, title: "PACMAN", icon: "👻", color: "#4ecdc4" },
        { id: 3, title: "MARIO", icon: "🍄", color: "#45b7d1" },
        { id: 4, title: "SONIC", icon: "💨", color: "#96ceb4" },
        { id: 5, title: "ZELDA", icon: "⚔️", color: "#feca57" },
        { id: 6, title: "DOOM", icon: "💀", color: "#ff9ff3" }
    ];

    // Uhr Logic
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }));
        };
        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyPress = (event) => {
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
                case 'Enter':
                    event.preventDefault();
                    handleGameSelect(games[selectedGameIndex]);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [selectedGameIndex, games.length]);

    const handleGameSelect = (game) => {
        console.log(`Selected game: ${game.title}`);
        // Hier kannst du die Logik für das Starten des Spiels hinzufügen
    };

    const handleGameClick = (index) => {
        setSelectedGameIndex(index);
    };

    return (
        <div>
            <div className="arcade-container">
                <header className="arcade-header">
                    <div className="header-left">
                        <img className="settings-icon" src={settingsImage} alt="Einstellungen" />
                        <div className="user-circle">.</div>
                        <div className="user-text">USER</div>
                    </div>
                    <div className="header-center">
                        <h1 className="arcade-title">DAVINCI ARCADE</h1>
                    </div>
                    <div className="header-right">
                        <div className="info-circle">i</div>
                        <p className="clock">{time}</p>
                    </div>
                </header>

                {/* Static Game Selection */}
                <div className="games-container-static">
                    <div className="games-grid-static">
                        {games.map((game, index) => (
                            <div
                                key={game.id}
                                className={`game-card-static ${index === selectedGameIndex ? 'selected' : ''}`}
                                onClick={() => handleGameClick(index)}
                                style={{
                                    '--game-color': game.color
                                }}
                            >
                                <div className="game-icon-static">{game.icon}</div>
                                <div className="game-title-static">{game.title}</div>
                            </div>
                        ))}
                    </div>

                    {/* Controls Info */}
                    <div className="controls-info-static">
                        <span>← → Navigieren</span>
                        <span>ENTER Auswählen</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
