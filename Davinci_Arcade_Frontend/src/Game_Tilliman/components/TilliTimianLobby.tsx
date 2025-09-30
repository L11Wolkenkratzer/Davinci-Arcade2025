import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tilliApi } from '../api/tilliApi';
import type { TilliProfile, LeaderboardEntry } from '../api/tilliApi';
import './TilliTimianLobby.css';

// Player type definition (matching App.tsx)
type Player = {
  _id: string;
  badgeId: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string;
  updatedAt?: string;
  createdAt?: string;
  __v?: number;
} | null;


const levelNames = [
  'Die Anfänge der Zeit',
  'Das Uhrwerk läuft', 
  'Zeit läuft ab',
  'Zahnräder im Uhrturm',
  'Die Dampfmaschinen-Ebene',
  'Pendel des Schicksals',
  'Schattenreich der Zeit',
  'Sturm der Rost-Bestien',
  'Das Herz der Zeitmaschine',
  'Meister der Zeit - Finale'
];

interface TilliTimianLobbyProps {
  currentPlayer: Player;

  onOpenInfo: () => void;
}

const TilliTimianLobby: React.FC<TilliTimianLobbyProps> = ({ 
  currentPlayer,

  onOpenInfo 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Profile System
  const [profile, setProfile] = useState<TilliProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Leaderboard System
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  
  // Legacy compatibility
  const [currentLevel, setCurrentLevel] = useState(1);
  const [coins, setCoins] = useState(42);
  
  const [currentSelection, setCurrentSelection] = useState(0);
  
  const [showLevelMap, setShowLevelMap] = useState(false);
  const [mapSelection, setMapSelection] = useState(1);
  const [levelMapFocus, setLevelMapFocus] = useState<'level' | 'exit'>('level');
  
  // Messages
  const [message, setMessage] = useState<string>('');

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Load leaderboard data
  const loadLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const leaderboard = await tilliApi.getLeaderboard();
      console.log('📊 Leaderboard geladen:', leaderboard);
      
      if (leaderboard && leaderboard.length > 0) {
        setLeaderboardData(leaderboard);
        console.log('✅ Top 3 Spieler:', leaderboard.slice(0, 3).map(e => 
          `${e.name} - Level ${e.highestLevel} (${e.bestScore} Punkte)`
        ));
      } else {
        console.warn('⚠️ Leaderboard ist leer');
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('❌ Failed to load leaderboard:', error);
      // Fallback to empty array - cleaner than mock data
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Sync currentPlayer with localStorage for playerManager compatibility
  useEffect(() => {
    if (currentPlayer) {
      console.log('🔄 Lobby syncing currentPlayer with localStorage');
      localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
      localStorage.setItem('playerBadgeId', currentPlayer.badgeId);
      localStorage.setItem('playerName', currentPlayer.name);
      console.log('✅ Lobby localStorage synchronized');
    } else {
      console.warn('⚠️ No currentPlayer in lobby - user needs to login');
    }
  }, [currentPlayer]);

  // Load profile data with improved error handling
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentPlayer) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Check if profile is passed from navigation state (e.g., from game)
        const stateData = location.state as any;
        if (stateData?.profile) {
          setProfile(stateData.profile);
          
          // Update legacy state for compatibility
          setCoins(stateData.profile.coins);
          setCurrentLevel(Math.max(0, stateData.profile.highestLevelReached - 1));
          setMapSelection(Math.max(0, stateData.profile.highestLevelReached - 1));
          
          setMessage('Profil vom Spiel übernommen!');
          setTimeout(() => setMessage(''), 3000);
          setLoading(false);
          return;
        }
        
        // Use improved API
        const profileData = await tilliApi.getProfile();
        setProfile(profileData);
        
        // Update legacy state for compatibility
        setCoins(profileData.coins);
        setCurrentLevel(Math.max(0, profileData.highestLevelReached - 1)); // Convert to 0-based indexing
        setMapSelection(Math.max(0, profileData.highestLevelReached - 1));
        
        // Load leaderboard
        await loadLeaderboard();
        
        setMessage('Profil erfolgreich geladen!');
        setTimeout(() => setMessage(''), 3000);
        
      } catch (error) {
        console.error('Failed to load profile:', error);
        
        if (error instanceof Error) {
          setMessage(`Fehler: ${error.message}`);
        } else {
          setMessage('Unbekannter Fehler beim Laden des Profils');
        }
        setTimeout(() => setMessage(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentPlayer, location]);

  // VERBESSERTE AUTO-SCROLL FUNKTION - flüssiger und präziser
  const scrollToLevel = (levelIndex: number) => {
    if (!scrollRef.current) return;
    
    const levelWidth = 120;
    const containerWidth = scrollRef.current.offsetWidth;
    const levelX = levelIndex * levelWidth + 60;
    
    const scrollTo = Math.max(0, levelX - containerWidth / 2);
    
    console.log(`Scrolling to level ${levelIndex}, X: ${levelX}, ScrollTo: ${scrollTo}`);
    
    scrollRef.current.scrollTo({ 
      left: scrollTo, 
      behavior: 'smooth'
    });
  };

  // VERBESSERTER USE-EFFECT - längeres Timeout für flüssigere Animation
  useEffect(() => {
    if (showLevelMap && scrollRef.current) {
      const timeoutId = setTimeout(() => {
        scrollToLevel(mapSelection);
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mapSelection, showLevelMap]);


  // Tastatur-Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLevelMap) {
        handleLevelMapNavigation(e);
      } else {
        handleLobbyNavigation(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLevelMap, currentSelection, mapSelection]);

  const navMap = [
    [1, 0, 0, 0],  // 0 = Exit
    [2, 0, 1, 1],  // 1 = Info
    [3, 1, 2, 2],  // 2 = Start
    [3, 2, 3, 3],  // 3 = Level Select
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
    } else if (e.key === ' ') { // Space key does nothing in lobby (reserved for game)
      e.preventDefault(); // Prevent page scrolling
      console.log('Space pressed in lobby - no action');
      return; // Exit early
    } else if (e.key === 'Enter') {
      console.log('Enter pressed, currentSelection:', currentSelection);
      switch (currentSelection) {
        case 0: navigate('/'); break;
        case 1: onOpenInfo(); break;
                    case 2: 
              if (profile) {
                // Check if current level is unlocked before starting
                const levelNumber = currentLevel + 1;
                const isUnlocked = profile.unlockedLevels.includes(levelNumber) || levelNumber === 1;
                
                if (isUnlocked) {
                  console.log('🚀 Starting game with:', {
                    profile: !!profile,
                    selectedLevel: currentLevel + 1,
                    currentPlayer: !!currentPlayer,
                    badgeId: currentPlayer?.badgeId
                  });
                  
                  // Navigate to game with profile data and selected level
                  navigate('/tilliman', { 
                    state: { 
                      profile: profile,
                      selectedLevel: currentLevel + 1, // Convert to 1-based indexing
                      playerData: currentPlayer
                    } 
                  });
                } else {
                  setMessage(`Level ${levelNumber} ist noch gesperrt! Spiele vorherige Level zuerst.`);
                  setTimeout(() => setMessage(''), 4000);
                }
              }
              break;
        case 3: 
          console.log('Opening level map');
          setShowLevelMap(true); 
          setMapSelection(currentLevel);
          setLevelMapFocus('level');
          break;
      }
    }
    setCurrentSelection(next);
  };

  // VERBESSERTE LEVEL-MAP NAVIGATION
  const handleLevelMapNavigation = (e: KeyboardEvent) => {
    if (levelMapFocus === 'level') {
      if (e.key === 'ArrowLeft') {
        const newSelection = Math.max(0, mapSelection - 1);
        console.log(`Arrow Left: ${mapSelection} -> ${newSelection}`);
        setMapSelection(newSelection);
      } else if (e.key === 'ArrowRight') {
        const newSelection = Math.min(levelNames.length - 1, mapSelection + 1);
        console.log(`Arrow Right: ${mapSelection} -> ${newSelection}`);
        setMapSelection(newSelection);
      } else if (e.key === 'ArrowDown') {
        setLevelMapFocus('exit');
      } else if (e.key === 'Enter') {
        // Check if level is unlocked before selecting
        const selectedLevelNumber = mapSelection + 1;
        const isUnlocked = profile?.unlockedLevels.includes(selectedLevelNumber) || selectedLevelNumber === 1;
        
        if (isUnlocked) {
          setCurrentLevel(mapSelection);
          setShowLevelMap(false);
          setMessage(`Level ${selectedLevelNumber} ausgewählt!`);
          setTimeout(() => setMessage(''), 2000);
        } else {
          setMessage(`Level ${selectedLevelNumber} ist noch gesperrt!`);
          setTimeout(() => setMessage(''), 3000);
        }
      } else if (e.key === 'Escape') {
        setShowLevelMap(false);
      } else if (e.key === ' ') { // Space key closes level map
        e.preventDefault();
        console.log('Space pressed in level map - closing map');
        setShowLevelMap(false);
      }
    } else if (levelMapFocus === 'exit') {
      if (e.key === 'ArrowUp') {
        setLevelMapFocus('level');
      } else if (e.key === 'Enter') {
        setShowLevelMap(false);
      } else if (e.key === 'Escape') {
        setShowLevelMap(false);
      } else if (e.key === ' ') { // Space key closes level map
        e.preventDefault();
        console.log('Space pressed on exit - closing map');
        setShowLevelMap(false);
      }
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
      let filter = '';
      
      const levelNumber = i + 1;
      const isUnlocked = profile?.unlockedLevels.includes(levelNumber) || levelNumber === 1;
      const isCompleted = profile && levelNumber < profile.highestLevelReached;
      const isCurrent = profile && levelNumber === profile.highestLevelReached;
      
      if (!isUnlocked) {
        fill = '#333';
        stroke = '#666';
      } else if (isCompleted) {
        fill = '#4CAF50';
        stroke = '#388e3c';
      } else if (isCurrent) {
        fill = '#e53935';
        stroke = '#d32f2f';
        strokeWidth = '4';
      } else if (isUnlocked) {
        fill = '#FFA726';
        stroke = '#FF9800';
      }
      
      const isFocused = i === mapSelection;
      let circleClass = 'level-circle';
      let circleFilter = filter;
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

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>Tilli Timian wird geladen...</h1>
          <div className="loading-spinner">⚙️</div>
          <p>Profil wird synchronisiert...</p>
        </div>
      </div>
    );
  }

  if (showLevelMap) {
    const { pathElements, totalWidth } = generateLevelPath();
    
    if (!pathElements || pathElements.length === 0) {
      return (
        <div style={{ color: 'red', background: '#222', padding: 40, borderRadius: 20, textAlign: 'center' }}>
          Fehler: Keine Level-Daten gefunden.<br />
          Bitte prüfe die Level-Konfiguration.<br />
        </div>
      );
    }

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
            
            // SCROLLBAR VERSTECKEN
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            
            // SMOOTH SCROLLING
            scrollBehavior: 'smooth',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
            {(() => {
              const selectedLevelNumber = mapSelection + 1;
              const isUnlocked = profile?.unlockedLevels.includes(selectedLevelNumber) || selectedLevelNumber === 1;
              const isCompleted = profile && selectedLevelNumber < profile.highestLevelReached;
              const isCurrent = profile && selectedLevelNumber === profile.highestLevelReached;
              
              if (!isUnlocked) {
                return <span className="upcoming">🔒 Gesperrt</span>;
              } else if (isCompleted) {
                return <span className="completed">✅ Abgeschlossen</span>;
              } else if (isCurrent) {
                return <span className="current">🎯 Aktuelles Level</span>;
              } else {
                return <span className="unlocked">⭐ Verfügbar</span>;
              }
            })()}
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


  return (
    <div className="tilli-lobby">
      <div className="lobby-title-corner">
        <span className="arcade-title-main">Tilli Timian</span>
        <br />
        <span className="arcade-title-sub">Arcade Adventure</span>
      </div>
      
      <div className="top-right-area">
        <div className="top-row">
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
            setCurrentSelection(3);
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
         
          <div className="skin-title">Klassischer Tilli</div>
        </div>
      </div>

      <div className="right-leaderboard-area" style={{ top: '55%', right: '2.5rem', transform: 'translateY(-50%)', minWidth: '260px' }}>
        <div className="leaderboard-card" style={{ minWidth: '260px', padding: '1.2rem 1.5rem' }}>
          <div className="leaderboard-title">
            {leaderboardLoading ? 'Lade...' : '🏆 Top Spieler'}
          </div>
          <ul className="leaderboard-list">
            {leaderboardData.slice(0, 3).map((entry, index) => {
              const className = index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze';
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
              return (
                <li key={entry.badgeId} className={className} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.3rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '0.2rem' }}>
                    <span style={{ marginRight: '0.5rem' }}>{medal}</span>
                    <span style={{ fontWeight: 'bold', flex: 1 }}>{entry.name}</span>
                  </div>
                  <div style={{ fontSize: '0.8em', opacity: 0.9, paddingLeft: '1.5rem' }}>
                    Level {entry.highestLevel} • {entry.bestScore} Punkte
                  </div>
                </li>
              );
            })}
            {leaderboardData.length === 0 && !leaderboardLoading && (
              <li style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'center', padding: '1rem' }}>
                Noch keine Spieler 🎮
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="lobby-navigation" style={{ flexDirection: 'column', alignItems: 'center', gap: '1.2rem', display: 'flex' }}>
        <button 
          className={`nav-btn start-btn no-radius center-btn ${currentSelection === 2 ? 'selected' : ''}`} 
          onClick={() => {
            setCurrentSelection(2);
            if (profile) {
              navigate('/tilliman', { 
                state: { 
                  profile: profile,
                  selectedLevel: currentLevel,
                  playerData: currentPlayer
                } 
              });
            }
          }}
        >
          <span className="btn-icon" style={{margin: '0 auto', display: 'block', textAlign: 'center'}} >▶</span>
        </button>
        <button 
          className={`nav-btn no-radius center-btn ${currentSelection === 1 ? 'selected' : ''}`} 
          onClick={() => {
            setCurrentSelection(1);
            onOpenInfo();
          }}
        >
          <span className="btn-icon">Info</span> 
        </button>
        <button 
          className={`nav-btn no-radius center-btn exit-btn ${currentSelection === 0 ? 'selected' : ''}`} 
          onClick={() => {
            setCurrentSelection(0);
            navigate('/');
          }}
        >
          <span className="btn-icon">Exit</span>
        </button>
      </div>
      
      {/* Message Display */}
      {message && (
        <div className="message-display" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#0ff',
          padding: '15px 30px',
          borderRadius: '10px',
          border: '2px solid #0ff',
          boxShadow: '0 0 20px #0ff',
          fontFamily: 'Press Start 2P, cursive',
          fontSize: '12px',
          zIndex: 10000
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TilliTimianLobby;
