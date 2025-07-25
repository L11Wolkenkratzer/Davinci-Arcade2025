// hooks/useGameState.ts - Enhanced with Backend Integration
import { useState, useCallback, useEffect, useRef } from 'react';
import type {
    GameState, 
    Ship, 
    Upgrade, 
    HighscoreEntry, 
    Player,
    SpaceshipGameResult,
    SpaceshipPlayerProfile,
    PlayerStats,
    GameEvent
} from '../types/gametypes';
import spaceshipApi from '../spaceshipApi';
import basicShip from '../images/spaceships/standart-fighter.png';
import interceptor from '../images/spaceships/interceptor.png';
import destroyer from '../images/spaceships/destroyer.png';

const initialShips: Ship[] = [
    {
        id: 'basic',
        name: 'BASIC FIGHTER',
        icon: basicShip,
        health: 100,
        maxHealth: 100,
        speed: 5,
        fireRate: 10,
        damage: 25,
        cost: 0,
        owned: true,
        equipped: true
    },
    {
        id: 'interceptor',
        name: 'INTERCEPTOR',
        icon: interceptor,
        health: 80,
        maxHealth: 80,
        speed: 8,
        fireRate: 15,
        damage: 20,
        cost: 500,
        owned: false,
        equipped: false
    },
    {
        id: 'destroyer',
        name: 'DESTROYER',
        icon: destroyer,
        health: 150,
        maxHealth: 150,
        speed: 3,
        fireRate: 6,
        damage: 40,
        cost: 1000,
        owned: false,
        equipped: false
    }
];

const initialUpgrades: Upgrade[] = [
    {
        id: 'health1',
        name: 'ARMOR PLATING',
        description: '+25 Health',
        cost: 200,
        type: 'health',
        value: 25,
        owned: false
    },
    {
        id: 'speed1',
        name: 'BOOST ENGINE',
        description: '+2 Speed',
        cost: 300,
        type: 'speed',
        value: 2,
        owned: false
    },
    {
        id: 'fireRate1',
        name: 'RAPID FIRE',
        description: '+5 Fire Rate',
        cost: 400,
        type: 'fireRate',
        value: 5,
        owned: false
    },
    {
        id: 'damage1',
        name: 'PLASMA CANNON',
        description: '+10 Damage',
        cost: 350,
        type: 'damage',
        value: 10,
        owned: false
    }
];

export const useGameState = (currentPlayer?: Player | null) => {
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        coins: 1000,
        level: 1,
        gameRunning: false,
        gameOver: false,
        paused: false,
        ship: initialShips[0],
        bullets: [],
        asteroids: [],
        
        // Enhanced tracking
        gameStartTime: 0,
        asteroidsDestroyed: 0,
        powerUpsCollected: 0,
        shotsFireed: 0,
        accuracy: 0,
        maxLevelReached: 1,
        survivalTime: 0,
    });

    const [ships, setShips] = useState<Ship[]>(initialShips);
    const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
    const [highscores, setHighscores] = useState<HighscoreEntry[]>([]);
    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNewHighscore, setShowNewHighscore] = useState(false);

    const gameEventsRef = useRef<GameEvent[]>([]);

    // Load player data on mount and when currentPlayer changes
    useEffect(() => {
        if (currentPlayer) {
            loadPlayerData();
            loadHighscores();
        }
    }, [currentPlayer]);

    const loadPlayerData = async () => {
        if (!currentPlayer) return;

        try {
            const stats = await spaceshipApi.getPlayerStats(currentPlayer._id);
            setPlayerStats(stats);

            if (stats.spaceshipProfile) {
                // Apply owned ships and upgrades
                setShips(prev => prev.map(ship => ({
                    ...ship,
                    owned: stats.spaceshipProfile!.ownedShips.includes(ship.id) || ship.id === 'basic',
                    equipped: ship.id === stats.spaceshipProfile!.equippedShip
                })));

                setUpgrades(prev => prev.map(upgrade => ({
                    ...upgrade,
                    owned: stats.spaceshipProfile!.ownedUpgrades.includes(upgrade.id)
                })));

                setGameState(prev => ({
                    ...prev,
                    coins: stats.spaceshipProfile!.coins
                }));
            }
        } catch (error) {
            console.error('Failed to load player data:', error);
        }
    };

    const loadHighscores = async () => {
        try {
            const data = await spaceshipApi.getHighscores(10);
            setHighscores(data);
        } catch (error) {
            console.error('Failed to load highscores:', error);
            setHighscores([]);
        }
    };

    const buyShip = useCallback(async (shipId: string) => {
        const ship = ships.find(s => s.id === shipId);
        if (ship && !ship.owned && gameState.coins >= ship.cost) {
            const newShips = ships.map(s =>
                s.id === shipId ? { ...s, owned: true } : s
            );
            
            setShips(newShips);
            setGameState(prev => ({
                ...prev,
                coins: prev.coins - ship.cost
            }));

            // Save to backend
            if (currentPlayer) {
                const ownedShipIds = newShips.filter(s => s.owned).map(s => s.id);
                const ownedUpgradeIds = upgrades.filter(u => u.owned).map(u => u.id);
                
                try {
                    await spaceshipApi.savePlayerPurchases(currentPlayer._id, ownedShipIds, ownedUpgradeIds);
                    await spaceshipApi.updatePlayerCoins(currentPlayer._id, gameState.coins - ship.cost);
                } catch (error) {
                    console.error('Failed to save ship purchase:', error);
                }
            }

            return true;
        }
        return false;
    }, [ships, upgrades, gameState.coins, currentPlayer]);

    const buyUpgrade = useCallback(async (upgradeId: string) => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade && !upgrade.owned && gameState.coins >= upgrade.cost) {
            const newUpgrades = upgrades.map(u =>
                u.id === upgradeId ? { ...u, owned: true } : u
            );
            
            setUpgrades(newUpgrades);
            setGameState(prev => ({
                ...prev,
                coins: prev.coins - upgrade.cost
            }));

            // Save to backend
            if (currentPlayer) {
                const ownedShipIds = ships.filter(s => s.owned).map(s => s.id);
                const ownedUpgradeIds = newUpgrades.filter(u => u.owned).map(u => u.id);
                
                try {
                    await spaceshipApi.savePlayerPurchases(currentPlayer._id, ownedShipIds, ownedUpgradeIds);
                    await spaceshipApi.updatePlayerCoins(currentPlayer._id, gameState.coins - upgrade.cost);
                } catch (error) {
                    console.error('Failed to save upgrade purchase:', error);
                }
            }

            return true;
        }
        return false;
    }, [upgrades, ships, gameState.coins, currentPlayer]);

    const equipShip = useCallback((shipId: string) => {
        const ship = ships.find(s => s.id === shipId);
        if (ship && ship.owned) {
            setShips(prev => prev.map(s => ({
                ...s,
                equipped: s.id === shipId
            })));

            // Apply upgrades to ship
            let enhancedShip = { ...ship };
            upgrades.forEach(upgrade => {
                if (upgrade.owned) {
                    switch (upgrade.type) {
                        case 'health':
                            enhancedShip.maxHealth += upgrade.value;
                            enhancedShip.health = enhancedShip.maxHealth;
                            break;
                        case 'speed':
                            enhancedShip.speed += upgrade.value;
                            break;
                        case 'fireRate':
                            enhancedShip.fireRate += upgrade.value;
                            break;
                        case 'damage':
                            enhancedShip.damage += upgrade.value;
                            break;
                    }
                }
            });

            setGameState(prev => ({
                ...prev,
                ship: enhancedShip
            }));
        }
    }, [ships, upgrades]);

    const startGame = useCallback(() => {
        const equippedShip = ships.find(s => s.equipped) || ships[0];
        
        setGameState(prev => ({
            ...prev,
            gameRunning: true,
            gameOver: false,
            paused: false,
            score: 0,
            level: 1,
            bullets: [],
            asteroids: [],
            gameStartTime: Date.now(),
            asteroidsDestroyed: 0,
            powerUpsCollected: 0,
            shotsFireed: 0,
            accuracy: 0,
            maxLevelReached: 1,
            survivalTime: 0,
            ship: {
                ...equippedShip,
                health: equippedShip.maxHealth
            }
        }));

        gameEventsRef.current = [];
    }, [ships]);

    const resetGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            gameRunning: false,
            gameOver: false,
            paused: false,
            score: 0,
            level: 1,
            bullets: [],
            asteroids: [],
            ship: {
                ...prev.ship,
                health: prev.ship.maxHealth
            }
        }));
    }, []);

    const trackGameEvent = useCallback((event: GameEvent) => {
        gameEventsRef.current.push(event);
        
        // Update game state based on event
        setGameState(prev => {
            const updates: Partial<GameState> = {};
            
            switch (event.type) {
                case 'asteroid_destroyed':
                    updates.asteroidsDestroyed = prev.asteroidsDestroyed + 1;
                    updates.accuracy = prev.shotsFireed > 0 ? 
                        ((prev.asteroidsDestroyed + 1) / prev.shotsFireed) * 100 : 0;
                    break;
                case 'powerup_collected':
                    updates.powerUpsCollected = prev.powerUpsCollected + 1;
                    break;
                case 'shot_fired':
                    updates.shotsFireed = prev.shotsFireed + 1;
                    updates.accuracy = prev.shotsFireed > 0 ? 
                        (prev.asteroidsDestroyed / (prev.shotsFireed + 1)) * 100 : 0;
                    break;
                case 'level_up':
                    updates.maxLevelReached = Math.max(prev.maxLevelReached, event.data?.level || prev.level);
                    break;
            }
            
            return { ...prev, ...updates };
        });
    }, []);

    const submitGameResult = async (finalScore: number, finalLevel: number) => {
        if (!currentPlayer || isSubmitting) return;

        setIsSubmitting(true);
        
        try {
            const duration = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
            const coinsEarned = Math.floor(finalScore / 10);
            
            const gameResult: SpaceshipGameResult = {
                playerId: currentPlayer._id,
                gameName: 'spaceships',
                score: finalScore,
                level: finalLevel,
                duration,
                gameData: {
                    shipUsed: gameState.ship.id,
                    asteroidsDestroyed: gameState.asteroidsDestroyed,
                    powerUpsCollected: gameState.powerUpsCollected,
                    shotsFireed: gameState.shotsFireed,
                    accuracy: gameState.accuracy,
                    coinsEarned,
                    maxLevelReached: gameState.maxLevelReached,
                    upgradesOwned: upgrades.filter(u => u.owned).map(u => u.id),
                    shipsOwned: ships.filter(s => s.owned).map(s => s.id),
                }
            };

            await spaceshipApi.submitGameResult(gameResult);

            // Update coins
            const newCoins = gameState.coins + coinsEarned;
            setGameState(prev => ({
                ...prev,
                coins: newCoins
            }));

            // Save updated coins to backend
            await spaceshipApi.updatePlayerCoins(currentPlayer._id, newCoins);

            // Check for new highscore
            if (playerStats && finalScore > playerStats.spaceshipHighscore) {
                setShowNewHighscore(true);
                setTimeout(() => setShowNewHighscore(false), 5000);
            }

            // Reload data
            await loadPlayerData();
            await loadHighscores();

        } catch (error) {
            console.error('Failed to submit game result:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addHighscore = useCallback((name: string, score: number) => {
        // This is now handled by submitGameResult, but keeping for compatibility
        if (currentPlayer) {
            submitGameResult(score, gameState.level);
        }
    }, [currentPlayer, gameState.level, submitGameResult]);

    return {
        gameState,
        setGameState,
        ships,
        upgrades,
        highscores,
        playerStats,
        isSubmitting,
        showNewHighscore,
        buyShip,
        buyUpgrade,
        equipShip,
        startGame,
        resetGame,
        addHighscore,
        trackGameEvent,
        submitGameResult,
        loadPlayerData,
        loadHighscores,
    };
};
