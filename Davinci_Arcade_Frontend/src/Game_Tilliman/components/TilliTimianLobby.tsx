import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tilliApi, getCurrentPlayerData } from '../api/tilliApi';
import { playerManager } from '../api/playerManager';
import type { TilliProfile, ShopItem } from '../api/tilliApi';
import type { PlayerData } from '../api/playerManager';
import PlayerLoginModal from './PlayerLoginModal';
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

const skins = [
  { name: 'Klassischer Tilli', img: '/assets/tilli/classic.png', price: 0 },
  { name: 'Steampunk Tilli', img: '/assets/tilli/steampunk.png', price: 150 },
  { name: 'Neon Tilli', img: '/assets/tilli/neon.png', price: 250 },
  { name: 'Golden Tilli', img: '/assets/tilli/golden.png', price: 400 },
  { name: 'Zeit-Herrscher Tilli', img: '/assets/tilli/timeLord.png', price: 1000 }
];

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
  onOpenHighscore: () => void;
  onOpenInfo: () => void;
}

const TilliTimianLobby: React.FC<TilliTimianLobbyProps> = ({ 
  currentPlayer,
  onOpenHighscore, 
  onOpenInfo 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Player Management - Use prop instead of localStorage
  const [playerNotFound, setPlayerNotFound] = useState(false);
  
  // Profile System
  const [profile, setProfile] = useState<TilliProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Leaderboard System
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  
  // Legacy compatibility
  const [selectedSkin, setSelectedSkin] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [coins, setCoins] = useState(42);
  const [ownedSkins, setOwnedSkins] = useState([0]);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  
  // Shop System
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  
  const [currentSelection, setCurrentSelection] = useState(0);
  
  const [showLevelMap, setShowLevelMap] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  
  const [shopSelection, setShopSelection] = useState(0);
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
      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      // Fallback to mock data on error
      setLeaderboardData([
        { name: 'Lade...', badgeId: 'loading', bestScore: 0, highestLevel: 1 },
        { name: 'Daten...', badgeId: 'loading2', bestScore: 0, highestLevel: 1 },
        { name: 'Fehler!', badgeId: 'error', bestScore: 0, highestLevel: 1 }
      ]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Check if player is available and sync with localStorage
  useEffect(() => {
    console.log('🏠 TilliTimianLobby currentPlayer check:', {
      hasCurrentPlayer: !!currentPlayer,
      badgeId: currentPlayer?.badgeId,
      name: currentPlayer?.name
    });
    
    setPlayerNotFound(!currentPlayer);
    
    // Sync currentPlayer with localStorage for playerManager compatibility
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
        setPlayerNotFound(true);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setPlayerNotFound(false);
        
        // Check if profile is passed from navigation state (e.g., from game)
        const stateData = location.state as any;
        if (stateData?.profile) {
          setProfile(stateData.profile);
          
          // Update legacy state for compatibility
          setCoins(stateData.profile.coins);
          setCurrentLevel(Math.max(0, stateData.profile.highestLevelReached - 1));
          setUnlockedLevels(stateData.profile.unlockedLevels.length);
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
        setUnlockedLevels(profileData.unlockedLevels.length);
        setMapSelection(Math.max(0, profileData.highestLevelReached - 1));
        
        // Load shop items
        const items = tilliApi.getShopItems();
        setShopItems(items);
        
        // Load leaderboard
        await loadLeaderboard();
        
        setMessage('Profil erfolgreich geladen!');
        setTimeout(() => setMessage(''), 3000);
        
      } catch (error) {
        console.error('Failed to load profile:', error);
        setPlayerNotFound(true);
        
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

  // Shop-Navigation
  const handleShopNavigation = (e: KeyboardEvent) => {
    const totalItems = shopItems.length + 1; // +1 for back button
    
    if (e.key === 'ArrowUp') {
      setShopSelection(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowDown') {
      setShopSelection(prev => Math.min(totalItems - 1, prev + 1));
    } else if (e.key === 'Enter') {
      if (shopSelection < shopItems.length) {
        const item = shopItems[shopSelection];
        if (item.type === 'skin') {
          const skinIndex = ['classic', 'steampunk', 'neon', 'golden', 'timeLord'].indexOf(item.id);
          const isOwned = profile?.ownedSkins.includes(item.id);
          if (isOwned) {
            equipSkin(skinIndex);
          } else {
            buySkin(skinIndex);
          }
        } else if (item.type === 'ability') {
          buyAbility(item.id);
        }
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
  }, [showLevelMap, showShop, showInventory, currentSelection, shopSelection, mapSelection]);

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
        case 4: 
          // Refresh leaderboard when viewing
          loadLeaderboard();
          onOpenHighscore(); 
          break;
        case 5: setShowShop(true); setShopSelection(0); break;
        case 6: setShowInventory(true); break;
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

  const buySkin = async (skinIndex: number) => {
    if (!profile) return;
    
    const skinIds = ['classic', 'steampunk', 'neon', 'golden', 'timeLord'];
    const skinId = skinIds[skinIndex];
    const shopItem = shopItems.find(item => item.id === skinId);
    
    if (!shopItem) return;
    
    try {
      const result = await tilliApi.purchaseSkin(skinId, shopItem.cost);
      
      if (result.success && result.profile) {
        setProfile(result.profile);
        setCoins(result.profile.coins);
        setSelectedSkin(skinIndex);
        setMessage(`${shopItem.name} gekauft!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorMessage = result.reason === 'insufficient_coins' ? 'Nicht genug Coins!' : 'Bereits besessen!';
        setMessage(errorMessage);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to buy skin:', error);
      setMessage('Fehler beim Kauf!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const buyAbility = async (abilityId: string) => {
    if (!profile) return;
    
    const abilityItem = shopItems.find(item => item.id === abilityId);
    if (!abilityItem) return;
    
    try {
      const result = await tilliApi.purchaseAbility(abilityId, abilityItem.cost);
      
      if (result.success && result.profile) {
        setProfile(result.profile);
        setCoins(result.profile.coins);
        setMessage(`${abilityItem.name} gekauft!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorMessage = result.reason === 'insufficient_coins' ? 'Nicht genug Coins!' : 'Bereits besessen!';
        setMessage(errorMessage);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to buy ability:', error);
      setMessage('Fehler beim Kauf!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const equipSkin = async (skinIndex: number) => {
    if (!profile) return;
    
    const skinIds = ['classic', 'steampunk', 'neon', 'golden', 'timeLord'];
    const skinId = skinIds[skinIndex];
    
    if (!profile.ownedSkins.includes(skinId)) return;
    
    try {
      const updatedProfile = await tilliApi.equipSkin(skinId);
      setProfile(updatedProfile);
      setSelectedSkin(skinIndex);
      setMessage(`${tilliApi.getSkinInfo(skinId).name} ausgerüstet!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to equip skin:', error);
      setMessage('Fehler beim Ausrüsten!');
      setTimeout(() => setMessage(''), 3000);
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

  if (showShop) {
    return (
      <div className="fullscreen-overlay">
        <div className="shop-header">
          <h1>Shop</h1>
          <div className="coins-info">🪙 {profile?.coins || 0}</div>
        </div>
        
        <div className="shop-grid">
          {/* Skins Section */}
          <div className="shop-section">
            <h2>Skins</h2>
            {shopItems.filter(item => item.type === 'skin').map((item, index) => {
              const skinIndex = ['classic', 'steampunk', 'neon', 'golden', 'timeLord'].indexOf(item.id);
              const isOwned = profile?.ownedSkins.includes(item.id);
              const isEquipped = profile?.equippedSkin === item.id;
              
              return (
                <div 
                  key={item.id}
                  className={`shop-item ${index === shopSelection && shopSelection < 5 ? 'selected' : ''} ${isOwned ? 'owned' : ''}`}
                  onClick={() => isOwned ? equipSkin(skinIndex) : buySkin(skinIndex)}
                >
                  <div className="shop-skin-preview">
                    <div className={`skin-color-${item.id}`}></div>
                  </div>
                  <h3>{item.name}</h3>
                  <div className="shop-price">
                    {isOwned ? (
                      <span className="owned-text">
                        {isEquipped ? 'Ausgerüstet' : 'Besessen'}
                      </span>
                    ) : (
                      <span className="price-text">🪙 {item.cost}</span>
                    )}
                  </div>
                  <div className="rarity">{item.rarity}</div>
                </div>
              );
            })}
          </div>
          
          {/* Abilities Section */}
          <div className="shop-section">
            <h2>Fähigkeiten</h2>
            {shopItems.filter(item => item.type === 'ability').map((item, index) => {
              const isOwned = profile?.ownedAbilities.includes(item.id);
              
              return (
                <div 
                  key={item.id}
                  className={`shop-item ${index + 5 === shopSelection ? 'selected' : ''} ${isOwned ? 'owned' : ''}`}
                  onClick={() => !isOwned && buyAbility(item.id)}
                >
                  <div className="ability-icon">⬆️</div>
                  <h3>{item.name}</h3>
                  <p className="ability-desc">{item.description}</p>
                  <div className="shop-price">
                    {isOwned ? (
                      <span className="owned-text">Besessen</span>
                    ) : (
                      <span className="price-text">🪙 {item.cost}</span>
                    )}
                  </div>
                  <div className="rarity">{item.rarity}</div>
                </div>
              );
            })}
          </div>
          
          <div className={`shop-item back-item ${shopSelection === shopItems.length ? 'selected' : ''}`}>
            <div className="back-text">← Zurück</div>
          </div>
        </div>
        
        {message && (
          <div className="message-display">
            {message}
          </div>
        )}
        
        <div className="controls-info">
          <span>↑ ↓ = Navigation | Enter = Kaufen/Ausrüsten | ESC = Zurück</span>
        </div>
      </div>
    );
  }

  if (showInventory) {
    return (
      <div className="fullscreen-overlay">
        <div className="inventory-header">
          <h1>Inventar</h1>
        </div>
        
        <div className="inventory-content">
          <div className="inventory-section">
            <h2>Skins ({profile?.ownedSkins.length || 1})</h2>
            <div className="inventory-grid">
              {profile?.ownedSkins.map((skinId) => {
                const skinInfo = tilliApi.getSkinInfo(skinId);
                return (
                  <div key={skinId} className="inventory-item">
                    <div className="inventory-skin-img">
                      <div className={`skin-color-${skinId}`}></div>
                    </div>
                    <div className="inventory-skin-name">{skinInfo?.name || skinId}</div>
                    {profile.equippedSkin === skinId && (
                      <div className="equipped-badge">✨</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="inventory-section">
            <h2>Fähigkeiten ({profile?.ownedAbilities.length || 0})</h2>
            <div className="inventory-grid">
              {profile?.ownedAbilities.map((abilityId) => {
                const abilityInfo = tilliApi.getAbilityInfo(abilityId);
                return (
                  <div key={abilityId} className="inventory-item">
                    <div className="ability-icon">{abilityInfo?.icon || '⚡'}</div>
                    <div className="inventory-skin-name">{abilityInfo?.name || abilityId}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="inventory-section">
            <h2>Münzen</h2>
            <div className="coin-display-large">🪙 {profile?.coins || 0}</div>
          </div>
        </div>
        
        <div className="controls-info">
          <span>ESC = Zurück</span>
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
          <button 
            className={`top-btn shop-btn${currentSelection === 5 ? ' selected' : ''}`} 
            onClick={() => {
              setCurrentSelection(5);
              setShowShop(true);
              setShopSelection(0);
            }}
          >
            Shop
          </button>
          <button 
            className={`top-btn skins-btn${currentSelection === 6 ? ' selected' : ''}`} 
            onClick={() => {
              setCurrentSelection(6);
              setShowInventory(true);
            }}
          >
            Skins
          </button>
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
          <img src={skins[selectedSkin].img} alt={skins[selectedSkin].name} className="main-skin-image" />
          <div className="skin-title">{skins[selectedSkin].name}</div>
        </div>
      </div>

      <div className="right-leaderboard-area" style={{ top: '55%', right: '2.5rem', transform: 'translateY(-50%)', minWidth: '220px' }}>
        <button 
          className={`leaderboard-btn ${currentSelection === 4 ? 'selected' : ''}`} 
          style={{marginTop: '1.2rem'}} 
          onClick={() => {
            setCurrentSelection(4);
            onOpenHighscore();
          }}
        >
          Highscore ansehen
        </button>
        <div className="leaderboard-card" style={{ minWidth: '220px', padding: '1.2rem 1.5rem' }}>
          <div className="leaderboard-title">
            {leaderboardLoading ? 'Lade...' : 'Leaderboard'}
          </div>
          <ul className="leaderboard-list">
            {leaderboardData.slice(0, 3).map((entry, index) => {
              const className = index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze';
              return (
                <li key={entry.badgeId} className={className}>
                  {entry.name} – {entry.bestScore}
                </li>
              );
            })}
            {leaderboardData.length === 0 && !leaderboardLoading && (
              <li style={{ fontSize: '0.5rem', opacity: 0.7 }}>Keine Daten</li>
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
    </div>
  );
};

export default TilliTimianLobby;
