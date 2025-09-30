import { useState, useEffect, useCallback } from 'react';
import type { Player, SpaceshipPlayerStats, SpaceshipHighscoreEntry, Ship, Upgrade } from '../types/gametypes';
import spaceshipApi from '../spaceshipApi';

// ✅ BILD-IMPORTS
import asteroidImg from '../images/spaceships/asteroid.png';
import destroyerImg from '../images/spaceships/destroyer.png';
import interceptorImg from '../images/spaceships/interceptor.png';
import powerUpImg from '../images/spaceships/PowerUp.png';
import standartFighterImg from '../images/spaceships/standart-fighter.png';

export const useGameState = (currentPlayer?: Player | null) => {
    // Game State
    const [gameState, setGameState] = useState({
        coins: 400,
        level: 1,
        score: 0,
        ship: 'basic',
        lives: 3
    });

    // ✅ SHIPS MIT KORREKTEN ICONS
    const [ships, setShips] = useState<Ship[]>([
        {
            id: 'basic',
            name: 'Standart Fighter',
            cost: 0,
            owned: true,
            equipped: true,
            maxHealth: 100,
            speed: 5,
            fireRate: 10,
            damage: 25,
            icon: standartFighterImg
        },
        {
            id: 'interceptor',
            name: 'Interceptor',
            cost: 500,
            owned: false,
            equipped: false,
            maxHealth: 80,
            speed: 8,
            fireRate: 15,
            damage: 20,
            icon: interceptorImg
        },
        {
            id: 'destroyer',
            name: 'Destroyer',
            cost: 1000,
            owned: false,
            equipped: false,
            maxHealth: 200,
            speed: 3,
            fireRate: 5,
            damage: 50,
            icon: destroyerImg
        }
    ]);

    const [upgrades, setUpgrades] = useState<Upgrade[]>([
        {
            id: 'damage',
            name: 'Damage Boost',
            cost: 300,
            owned: false,
            description: 'Increases weapon damage by 50%',
            icon: powerUpImg
        },
        {
            id: 'shield',
            name: 'Shield Generator',
            cost: 400,
            owned: false,
            description: 'Provides additional protection',
            icon: powerUpImg
        },
        {
            id: 'speed',
            name: 'Engine Boost',
            cost: 250,
            owned: false,
            description: 'Increases ship speed by 30%',
            icon: powerUpImg
        }
    ]);

    // Backend States
    const [highscores, setHighscores] = useState<SpaceshipHighscoreEntry[]>([]);
    const [playerStats, setPlayerStats] = useState<SpaceshipPlayerStats | null>(null);
    const [showNewHighscore, setShowNewHighscore] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gameStartTime, setGameStartTime] = useState<number>(0);

    // ✅ AKTUELLES SCHIFF ERMITTELN
    const getCurrentShip = useCallback((): Ship => {
        const equippedShip = ships.find(ship => ship.equipped);
        if (equippedShip) {
            console.log('🚀 Found equipped ship:', equippedShip);
            return equippedShip;
        }

        const ownedShip = ships.find(ship => ship.owned);
        if (ownedShip) {
            console.log('🚀 Using first owned ship:', ownedShip);
            return ownedShip;
        }

        console.log('🚀 Using first ship:', ships[0]);
        return ships[0];
    }, [ships]);

    // Backend Functions
    const loadPlayerStats = useCallback(async () => {
        if (!currentPlayer) return;

        try {
            const stats = await spaceshipApi.getPlayerStats(currentPlayer._id);
            setPlayerStats(stats);

            setGameState(prev => ({
                ...prev,
                coins: stats.spaceshipCoins
            }));
        } catch (error) {
            console.error('Load spaceship player stats failed:', error);
        }
    }, [currentPlayer]);

    const loadHighscores = useCallback(async () => {
        try {
            const data = await spaceshipApi.getHighscores(10);
            setHighscores(data);
        } catch (error) {
            console.error('Error loading spaceship highscores:', error);
            setHighscores([]);
        }
    }, []);

    const submitGameResult = useCallback(async (finalScore: number, finalLevel: number) => {
        if (!currentPlayer || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);

            await spaceshipApi.submitScore(
                currentPlayer._id,
                finalScore,
                finalLevel,
                gameDuration
            );

            if (playerStats && finalScore > playerStats.spaceshipHighscore) {
                setShowNewHighscore(true);
                setTimeout(() => setShowNewHighscore(false), 5000);
            }

            await loadPlayerStats();

        } catch (error) {
            console.error('Error submitting spaceship score:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentPlayer, playerStats, gameStartTime, loadPlayerStats, isSubmitting]);

    // Load data on mount
    useEffect(() => {
        if (currentPlayer) {
            loadPlayerStats();
            loadHighscores();
        }
    }, [currentPlayer, loadPlayerStats, loadHighscores]);

    // Game Functions
    const buyShip = useCallback(async (shipId: string) => {
        const ship = ships.find(s => s.id === shipId);
        if (ship && gameState.coins >= ship.cost && !ship.owned) {
            setShips(prev =>
                prev.map(s => s.id === shipId ? { ...s, owned: true } : s)
            );
            setGameState(prev => ({
                ...prev,
                coins: prev.coins - ship.cost
            }));
        }
    }, [ships, gameState.coins]);

    const buyUpgrade = useCallback(async (upgradeId: string) => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade && gameState.coins >= upgrade.cost && !upgrade.owned) {
            setUpgrades(prev =>
                prev.map(u => u.id === upgradeId ? { ...u, owned: true } : u)
            );
            setGameState(prev => ({
                ...prev,
                coins: prev.coins - upgrade.cost
            }));
        }
    }, [upgrades, gameState.coins]);

    const equipShip = useCallback((shipId: string) => {
        const ship = ships.find(s => s.id === shipId);
        if (ship && ship.owned) {
            setShips(prev =>
                prev.map(s => ({
                    ...s,
                    equipped: s.id === shipId
                }))
            );
            setGameState(prev => ({
                ...prev,
                ship: shipId
            }));
        }
    }, [ships]);

    const startGame = useCallback(() => {
        setGameStartTime(Date.now());
        setGameState(prev => ({
            ...prev,
            score: 0,
            level: 1,
            lives: 3
        }));
    }, []);

    const resetGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            score: 0,
            level: 1,
            lives: 3
        }));
    }, []);

    const trackGameEvent = useCallback((event: string, data: any) => {
        console.log(`🚀 Game Event: ${event}`, data);
    }, []);

    return {
        // Game State
        gameState,
        ships,
        upgrades,
        currentShip: getCurrentShip(), // ✅ SHIP-OBJEKT

        // Backend State
        highscores,
        playerStats,
        showNewHighscore,
        isSubmitting,

        // Actions
        buyShip,
        buyUpgrade,
        equipShip,
        startGame,
        resetGame,

        // Backend Actions
        submitGameResult,
        loadHighscores,
        trackGameEvent
    };
};
