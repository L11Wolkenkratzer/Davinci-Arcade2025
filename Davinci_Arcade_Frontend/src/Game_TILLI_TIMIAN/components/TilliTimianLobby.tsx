import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../../SettingsContext';
import './TilliTimianLobby.css';
import LobbySound from '/Sounds/TilliBachgroundMusic.mp3'

const skins = [
    { name: 'Classic', img: '/assets/tilli/classic.png', price: 0 },
    { name: 'Golden Gear', img: '/assets/tilli/gold.png', price: 100 },
    { name: 'Shadow Mechanism', img: '/assets/tilli/shadow.png', price: 250 },
    { name: 'Chrome Clockwork', img: '/assets/tilli/chrome.png', price: 500 },
    { name: 'Ruby Engine', img: '/assets/tilli/ruby.png', price: 1000 }
];

const levelNames = [
    'Erste Schritte', 'Zahnrad-Kammer', 'Pendel-Pfad', 'Feder-Sprung', 'Rost-Ruinen',
    'Tickende Türme', 'Mechanik-Maze', 'Uhrwerk-Untiefen', 'Chrono-Chaos', 'Zeit-Zitadelle',
    'Dampf-Domäne', 'Kupfer-Katakomben', 'Bronze-Brücken', 'Silber-Spiralen', 'Gold-Galerien',
    'Platin-Palast', 'Diamant-Dimensionen', 'Master-Mechanik', 'Ultimatives Uhrwerk', 'Finale: Zeituhr'
];

interface TilliTimianLobbyProps {
    onStartGame: () => void;
    onOpenHighscore: () => void;
    onOpenInfo: () => void;
}

const TilliTimianLobby: React.FC<TilliTimianLobbyProps> = ({
                                                               onStartGame,
                                                               onOpenHighscore,
                                                               onOpenInfo
                                                           }) => {
    const [selectedSkin, setSelectedSkin] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(3);
    const [coins, setCoins] = useState(42);
    const [ownedSkins, setOwnedSkins] = useState([0]);
    const [unlockedLevels, setUnlockedLevels] = useState(3);

    const [currentSelection, setCurrentSelection] = useState(0);

    const [showLevelMap, setShowLevelMap] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showInventory, setShowInventory] = useState(false);

    const [shopSelection, setShopSelection] = useState(0);
    const [mapSelection, setMapSelection] = useState(3);
    const [levelMapFocus, setLevelMapFocus] = useState<'level' | 'exit'>('level');

    const scrollRef = React.useRef<HTMLDivElement>(null);

    // ✅ VERBESSERTES AUDIO-SYSTEM
    const { volume } = useAudio();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);

    // Audio-Initialisierung
    const initializeAudio = useCallback(() => {
        if (audioRef.current) return;

        console.log('🎵 Initializing Tilli Audio...');

        // Audio-Element erstellen
        const audio = new Audio();
        audioRef.current = audio;

        // Audio-Eigenschaften setzen
        audio.src = LobbySound;
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = (volume / 100) * 0.4; // 40% der eingestellten Lautstärke

        // Event-Listener hinzufügen
        audio.addEventListener('loadeddata', () => {
            console.log('✅ Audio loaded successfully');
            setIsAudioReady(true);
            setAudioError(null);
        });

        audio.addEventListener('canplaythrough', async () => {
            console.log('🎶 Audio can play through - attempting autoplay...');
            try {
                await audio.play();
                console.log('🎵 Autoplay successful!');
                setNeedsUserInteraction(false);
            } catch (error) {
                console.log('🔇 Autoplay blocked - waiting for user interaction');
                setNeedsUserInteraction(true);
            }
        });

        audio.addEventListener('play', () => {
            console.log('▶️ Audio started playing');
            setNeedsUserInteraction(false);
        });

        audio.addEventListener('error', (e) => {
            console.error('❌ Audio error:', e);
            setAudioError('Fehler beim Laden der Musik');
            setIsAudioReady(false);
        });

        // Audio laden
        audio.load();

    }, [volume]);

    // Audio beim Mount initialisieren
    useEffect(() => {
        initializeAudio();

        // Cleanup beim Unmount
        return () => {
            if (audioRef.current) {
                console.log('🛑 Cleaning up audio...');
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, [initializeAudio]);

    // Lautstärke aktualisieren
    useEffect(() => {
        if (audioRef.current && isAudioReady) {
            const newVolume = (volume / 100) * 0.4;
            audioRef.current.volume = newVolume;
            console.log(`🔊 Volume updated: ${volume}% (${(newVolume * 100).toFixed(1)}%)`);
        }
    }, [volume, isAudioReady]);

    // User-Interaction Handler
    const handleUserInteraction = useCallback(async () => {
        if (audioRef.current && needsUserInteraction && isAudioReady) {
            try {
                console.log('👆 User interaction - starting audio...');
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
                console.log('✅ Audio started after user interaction!');
            } catch (error) {
                console.error('❌ Failed to start audio after user interaction:', error);
                setAudioError('Musik konnte nicht gestartet werden');
            }
        }
    }, [needsUserInteraction, isAudioReady]);

    // User-Interaction Events registrieren
    useEffect(() => {
        if (needsUserInteraction) {
            const events = ['click', 'keydown', 'touchstart'];

            events.forEach(event => {
                document.addEventListener(event, handleUserInteraction, { once: true });
            });

            return () => {
                events.forEach(event => {
                    document.removeEventListener(event, handleUserInteraction);
                });
            };
        }
    }, [needsUserInteraction, handleUserInteraction]);

    // Manual Audio Test (für Debugging)
    const testAudio = async () => {
        if (audioRef.current) {
            try {
                console.log('🧪 Manual audio test...');
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
                console.log('✅ Manual test successful!');
            } catch (error) {
                console.error('❌ Manual test failed:', error);
                alert('Audio-Test fehlgeschlagen: ' + error);
            }
        } else {
            console.log('❌ No audio reference');
            alert('Kein Audio-Element gefunden');
        }
    };

    // VERBESSERTE AUTO-SCROLL FUNKTION
    const scrollToLevel = (levelIndex: number) => {
        if (!scrollRef.current) return;

        const levelWidth = 120;
        const containerWidth = scrollRef.current.offsetWidth;
        const levelX = levelIndex * levelWidth + 60;
        const scrollTo = Math.max(0, levelX - containerWidth / 2);

        scrollRef.current.scrollTo({
            left: scrollTo,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        if (showLevelMap && scrollRef.current) {
            const timeoutId = setTimeout(() => {
                scrollToLevel(mapSelection);
            }, 150);
            return () => clearTimeout(timeoutId);
        }
    }, [mapSelection, showLevelMap]);

    // Shop-Navigation
    const handleShopNavigation = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            setShopSelection(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowDown') {
            setShopSelection(prev => Math.min(skins.length, prev + 1));
        } else if (e.key === 'Enter') {
            if (shopSelection < skins.length) {
                buySkin(shopSelection);
            } else {
                setShowShop(false);
            }
        } else if (e.key === 'Escape') {
            setShowShop(false);
        }
    };

    const handleInventoryNavigation = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowInventory(false);
        }
    };

    // Tastatur-Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // User-Interaction für Audio registrieren
            handleUserInteraction();

            if (showLevelMap) {
                handleLevelMapNavigation(e);
            } else if (showShop) {
                handleShopNavigation(e);
            } else if (showInventory) {
                handleInventoryNavigation(e);
            } else {
                handleLobbyNavigation(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showLevelMap, showShop, showInventory, currentSelection, shopSelection, mapSelection, handleUserInteraction]);

    const navMap = [
        [1, 0, 0, 0],
        [2, 0, 1, 1],
        [3, 1, 2, 2],
        [5, 2, 3, 4],
        [6, 4, 3, 4],
        [5, 3, 5, 6],
        [6, 4, 5, 6],
    ];

    const handleLobbyNavigation = (e: KeyboardEvent) => {
        let next = currentSelection;
        if (e.key === 'ArrowUp') {
            next = navMap[currentSelection][0];
        } else if (e.key === 'ArrowDown') {
            next = navMap[currentSelection][1];
        } else if (e.key === 'ArrowLeft') {
            next = navMap[currentSelection][2];
        } else if (e.key === 'ArrowRight') {
            next = navMap[currentSelection][3];
        } else if (e.key === 'Enter') {
            switch (currentSelection) {
                case 0: window.location.href = '/'; break;
                case 1: onOpenInfo(); break;
                case 2: onStartGame(); break;
                case 3:
                    setShowLevelMap(true);
                    setMapSelection(currentLevel);
                    setLevelMapFocus('level');
                    break;
                case 4: onOpenHighscore(); break;
                case 5: setShowShop(true); setShopSelection(0); break;
                case 6: setShowInventory(true); break;
            }
        }
        setCurrentSelection(next);
    };

    const handleLevelMapNavigation = (e: KeyboardEvent) => {
        if (levelMapFocus === 'level') {
            if (e.key === 'ArrowLeft') {
                setMapSelection(prev => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight') {
                setMapSelection(prev => Math.min(levelNames.length - 1, prev + 1));
            } else if (e.key === 'ArrowDown') {
                setLevelMapFocus('exit');
            } else if (e.key === 'Enter') {
                setCurrentLevel(mapSelection);
                setShowLevelMap(false);
            } else if (e.key === 'Escape') {
                setShowLevelMap(false);
            }
        } else if (levelMapFocus === 'exit') {
            if (e.key === 'ArrowUp') {
                setLevelMapFocus('level');
            } else if (e.key === 'Enter') {
                setShowLevelMap(false);
            } else if (e.key === 'Escape') {
                setShowLevelMap(false);
            }
        }
    };

    const buySkin = (skinIndex: number) => {
        const skin = skins[skinIndex];
        if (coins >= skin.price && !ownedSkins.includes(skinIndex)) {
            setCoins(prev => prev - skin.price);
            setOwnedSkins(prev => [...prev, skinIndex]);
        } else if (ownedSkins.includes(skinIndex)) {
            setSelectedSkin(skinIndex);
        }
    };

    const generateLevelPath = () => {
        const pathElements = [];
        const levelWidth = 120;
        const totalWidth = levelNames.length * levelWidth;

        for (let i = 0; i < levelNames.length; i++) {
            const x = i * levelWidth + 60;
            const y = 200 + Math.sin(i * 0.5) * 30;

            let fill = '#bbb';
            let stroke = '#888';
            let strokeWidth = '2';

            if (i < currentLevel) {
                fill = '#4CAF50';
                stroke = '#388e3c';
            } else if (i === currentLevel) {
                fill = '#e53935';
                stroke = '#d32f2f';
                strokeWidth = '4';
            }

            const isFocused = i === mapSelection;
            let circleClass = 'level-circle';
            let circleFilter = '';
            let circleStroke = stroke;
            let circleStrokeWidth = strokeWidth;

            if (isFocused) {
                circleClass += ' focused';
                circleFilter = 'url(#glow)';
                circleStroke = '#FFD700';
                circleStrokeWidth = '6';
            }

            pathElements.push(
                <g key={i}>
                    {i < levelNames.length - 1 && (
                        <line
                            x1={x + 30}
                            y1={y}
                            x2={(i + 1) * levelWidth + 60 - 30}
                            y2={200 + Math.sin((i + 1) * 0.5) * 30}
                            stroke={i < currentLevel ? '#4CAF50' : '#bbb'}
                            strokeWidth="4"
                            strokeDasharray={i < currentLevel ? "none" : "10,5"}
                        />
                    )}
                    <circle
                        cx={x}
                        cy={y}
                        r="25"
                        fill={fill}
                        stroke={circleStroke}
                        strokeWidth={circleStrokeWidth}
                        className={circleClass}
                        filter={circleFilter}
                    />
                    <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="16"
                        fontWeight="bold"
                    >
                        {i + 1}
                    </text>
                    <text
                        x={x}
                        y={y + 50}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="12"
                        fontWeight="bold"
                    >
                        {levelNames[i]}
                    </text>
                </g>
            );
        }
        return { pathElements, totalWidth };
    };

    // Level Map Render
    if (showLevelMap) {
        const { pathElements, totalWidth } = generateLevelPath();

        return (
            <div className="level-selector-card" style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '85vw',
                height: '85vh',
                padding: '2.5em 2em 2em 2em',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'rgba(20,20,30,0.98)',
                border: '4px solid #FFD700',
                borderRadius: '2.5em',
                boxShadow: '0 0 32px #222, 0 0 0 8px #222 inset',
                zIndex: 9999
            }}>
                <div
                    className="level-map-scroll"
                    ref={scrollRef}
                    style={{
                        width: '100%',
                        height: '400px',
                        flex: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        background: 'rgba(30,30,40,0.96)',
                        borderRadius: '1.5em',
                        border: '2px solid #444',
                        boxShadow: '0 0 16px #111 inset',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        scrollBehavior: 'smooth'
                    }}
                >
                    <svg
                        width={Math.max(totalWidth + 120, 900)}
                        height="340"
                        className="level-map-svg"
                        style={{
                            maxWidth: 'none',
                            height: '340px',
                            margin: '0',
                            display: 'block',
                            flexShrink: 0
                        }}
                    >
                        <defs>
                            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        {pathElements}
                    </svg>
                </div>

                <div className="level-map-info" style={{marginTop: '1.5rem', textAlign: 'center'}}>
                    <h2>{levelNames[mapSelection]}</h2>
                    <p>Level {mapSelection + 1} von {levelNames.length}</p>
                    <div className="level-status">
                        {mapSelection < currentLevel ? (
                            <span className="completed">✓ Abgeschlossen</span>
                        ) : mapSelection === currentLevel ? (
                            <span className="current">🎯 Aktuelles Level</span>
                        ) : (
                            <span className="upcoming">⭐ Noch nicht erreicht</span>
                        )}
                    </div>
                    <button
                        className="level-btn"
                        style={{
                            marginTop: '2rem',
                            outline: levelMapFocus === 'exit' ? '3px solid #FFD700' : 'none',
                            boxShadow: levelMapFocus === 'exit' ? '0 0 16px #FFD700' : 'none'
                        }}
                        onClick={() => setShowLevelMap(false)}
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    // Shop Render
    if (showShop) {
        return (
            <div className="fullscreen-overlay">
                <div className="shop-header">
                    <h1>Shop</h1>
                    <div className="coins-info">🪙 {coins}</div>
                </div>

                <div className="shop-grid">
                    {skins.map((skin, index) => (
                        <div
                            key={index}
                            className={`shop-item ${index === shopSelection ? 'selected' : ''} ${ownedSkins.includes(index) ? 'owned' : ''}`}
                        >
                            <img src={skin.img} alt={skin.name} className="shop-skin-img" />
                            <h3>{skin.name}</h3>
                            <div className="shop-price">
                                {ownedSkins.includes(index) ? (
                                    <span className="owned-text">
                                        {index === selectedSkin ? 'Ausgerüstet' : 'Besessen'}
                                    </span>
                                ) : (
                                    <span className="price-text">🪙 {skin.price}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className={`shop-item back-item ${shopSelection === skins.length ? 'selected' : ''}`}>
                        <div className="back-text">← Zurück</div>
                    </div>
                </div>

                <div className="controls-info">
                    <span>↑ ↓ = Navigation | Enter = Kaufen/Ausrüsten | ESC = Zurück</span>
                </div>
            </div>
        );
    }

    // Inventory Render
    if (showInventory) {
        return (
            <div className="fullscreen-overlay">
                <div className="inventory-header">
                    <h1>Inventar</h1>
                </div>

                <div className="inventory-content">
                    <div className="inventory-section">
                        <h2>Skins ({ownedSkins.length})</h2>
                        <div className="inventory-grid">
                            {skins.filter((_, index) => ownedSkins.includes(index)).map((skin, index) => (
                                <div key={index} className="inventory-item">
                                    <img src={skin.img} alt={skin.name} className="inventory-skin-img" />
                                    <div className="inventory-skin-name">{skin.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="inventory-section">
                        <h2>Münzen</h2>
                        <div className="coin-display-large">🪙 {coins}</div>
                    </div>
                </div>

                <div className="controls-info">
                    <span>ESC = Zurück</span>
                </div>
            </div>
        );
    }

    // Main Lobby Render
    return (
        <div className="tilli-lobby" onClick={handleUserInteraction}>
            {/* Audio Status Anzeige */}
            {needsUserInteraction && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 196, 0, 0.9)',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    zIndex: 1000,
                    animation: 'pulse 2s infinite'
                }}>
                    🎵 Klicke irgendwo für Musik
                </div>
            )}

            {audioError && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 0, 0, 0.9)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    zIndex: 1000
                }}>
                    ❌ {audioError}
                </div>
            )}

            {/* Debug Button (nur in Development) */}
            {process.env.NODE_ENV === 'development' && (
                <button
                    onClick={testAudio}
                    style={{
                        position: 'fixed',
                        top: '60px',
                        right: '10px',
                        zIndex: 9999,
                        padding: '8px 12px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    🎵 Test Audio
                </button>
            )}

            <div className="lobby-title-corner">
                <span className="arcade-title-main">Tilli Timian</span>
                <br />
                <span className="arcade-title-sub">Arcade Adventure</span>
            </div>

            <div className="top-right-area">
                <div className="top-row">
                    <button className={`top-btn shop-btn${currentSelection === 5 ? ' selected' : ''}`} onClick={() => setCurrentSelection(5)}>Shop</button>
                    <button className={`top-btn skins-btn${currentSelection === 6 ? ' selected' : ''}`} onClick={() => setCurrentSelection(6)}>Skins</button>
                    <div className="coins-display">
                        <span className="coin-icon">🪙</span>
                        <span className="coin-amount">{coins}</span>
                    </div>
                </div>
            </div>

            <div className="level-section">
                <button
                    className={`level-select-btn ${currentSelection === 3 ? 'selected' : ''}`}
                    onClick={() => {
                        setShowLevelMap(true);
                        setMapSelection(currentLevel);
                        setLevelMapFocus('level');
                    }}
                >
                    Level auswählen
                </button>
                <div className="current-level-display">
                    <div className="level-info">
                        <span className="level-label">Aktuelles Level</span>
                        <span className="level-name">{levelNames[currentLevel]}</span>
                        <span className="level-number">{currentLevel + 1} / {levelNames.length}</span>
                    </div>
                </div>
            </div>

            <div className="lobby-center">
                <div className="selected-skin-showcase">
                    <div className="skin-glow"></div>
                    <img src={skins[selectedSkin].img} alt={skins[selectedSkin].name} className="main-skin-image" />
                    <div className="skin-title">{skins[selectedSkin].name}</div>
                </div>
            </div>

            <div className="right-leaderboard-area" style={{ top: '55%', right: '2.5rem', transform: 'translateY(-50%)', minWidth: '220px' }}>
                <button className={`leaderboard-btn ${currentSelection === 4 ? 'selected' : ''}`} style={{marginTop: '1.2rem'}} onClick={() => setCurrentSelection(4)}>Highscore ansehen</button>
                <div className="leaderboard-card" style={{ minWidth: '220px', padding: '1.2rem 1.5rem' }}>
                    <div className="leaderboard-title">Leaderboard</div>
                    <ul className="leaderboard-list">
                        <li className="gold">Max Mustermann – 9999</li>
                        <li className="silver">Anna Beispiel – 8500</li>
                        <li className="bronze">Tim Test – 7000</li>
                    </ul>
                </div>
            </div>

            <div className="lobby-navigation" style={{ flexDirection: 'column', alignItems: 'center', gap: '1.2rem', display: 'flex' }}>
                <button className={`nav-btn start-btn no-radius center-btn ${currentSelection === 2 ? 'selected' : ''}`} onClick={() => setCurrentSelection(2)}>
                    <span className="btn-icon" style={{margin: '0 auto', display: 'block', textAlign: 'center'}} >▶</span>
                </button>
                <button className={`nav-btn no-radius center-btn ${currentSelection === 1 ? 'selected' : ''}`} onClick={() => setCurrentSelection(1)}>
                    <span className="btn-icon">Info</span>
                </button>
                <button className={`nav-btn no-radius center-btn exit-btn ${currentSelection === 0 ? 'selected' : ''}`} onClick={() => setCurrentSelection(0)}>
                    <span className="btn-icon">Exit</span>
                </button>
            </div>
        </div>
    );
};

export default TilliTimianLobby;
