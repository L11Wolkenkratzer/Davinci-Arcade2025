// hooks/useGameState.ts
import { useState, useCallback } from 'react';
import type {GameState, Ship, Upgrade, HighscoreEntry} from '../types/gametypes.ts';
import basicShip from '../images/spaceships/standart-fighter.png'
import interceptor from '../images/spaceships/interceptor.png'
import destroyer from '../images/spaceships/destroyer.png'
import asteroid from '../images/spaceships/asteroid.png'

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

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        coins: 0,
        level: 1,
        gameRunning: false,
        gameOver: false,
        paused: false,
        ship: initialShips[0],
        bullets: [],
        asteroids: []
    });

    const [ships, setShips] = useState<Ship[]>(initialShips);
    const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
    const [highscores, setHighscores] = useState<HighscoreEntry[]>([
        { name: 'PLAYER', score: 5000, date: '2025-01-01' },
        { name: 'PLAYER', score: 3500, date: '2025-01-01' },
        { name: 'PLAYER', score: 2000, date: '2025-01-01' }
    ]);

    const buyShip = useCallback((shipId: string) => {
        const ship = ships.find(s => s.id === shipId);
        if (ship && !ship.owned && gameState.coins >= ship.cost) {
            setShips(prev => prev.map(s =>
                s.id === shipId ? { ...s, owned: true } : s
            ));
            setGameState(prev => ({
                ...prev,
                coins: prev.coins - ship.cost
            }));
            return true;
        }
        return false;
    }, [ships, gameState.coins]);

    const buyUpgrade = useCallback((upgradeId: string) => {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (upgrade && !upgrade.owned && gameState.coins >= upgrade.cost) {
            setUpgrades(prev => prev.map(u =>
                u.id === upgradeId ? { ...u, owned: true } : u
            ));
            setGameState(prev => ({
                ...prev,
                coins: prev.coins - upgrade.cost
            }));
            return true;
        }
        return false;
    }, [upgrades, gameState.coins]);

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
        setGameState(prev => ({
            ...prev,
            gameRunning: true,
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

    const addHighscore = useCallback((name: string, score: number) => {
        const newEntry: HighscoreEntry = {
            name,
            score,
            date: new Date().toISOString().split('T')[0]
        };

        setHighscores(prev => {
            const updated = [...prev, newEntry];
            updated.sort((a, b) => b.score - a.score);
            return updated.slice(0, 10);
        });

        setGameState(prev => ({
            ...prev,
            coins: prev.coins + Math.floor(score / 10)
        }));
    }, []);

    return {
        gameState,
        setGameState,
        ships,
        upgrades,
        highscores,
        buyShip,
        buyUpgrade,
        equipShip,
        startGame,
        resetGame,
        addHighscore
    };
};
