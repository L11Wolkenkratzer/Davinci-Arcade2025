// types/gametypes.ts - Enhanced with Backend Integration
export interface Player {
    _id: string;
    badgeId: string;
    name: string;
    totalScore: number;
    gamesPlayed: number;
    lastPlayed: string;
    updatedAt?: string;
    createdAt?: string;
    __v?: number;
}

export interface Ship {
    id: string;
    name: string;
    icon: string;
    health: number;
    maxHealth: number;
    speed: number;
    fireRate: number;
    damage: number;
    cost: number;
    owned: boolean;
    equipped: boolean;
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'health' | 'speed' | 'fireRate' | 'damage';
    value: number;
    owned: boolean;
}

export interface Bullet {
    id: string;
    x: number;
    y: number;
    velocity: number;
}

export interface Asteroid {
    id: string;
    x: number;
    y: number;
    size: number;
    velocity: number;
    health: number;
    image: string;
}

export interface PowerUp {
    x: number;
    y: number;
    v: number;
}

// Enhanced GameState with detailed metrics
export interface GameState {
    score: number;
    coins: number;
    level: number;
    gameRunning: boolean;
    gameOver: boolean;
    paused: boolean;
    ship: Ship;
    bullets: Bullet[];
    asteroids: Asteroid[];
    
    // Enhanced tracking for backend
    gameStartTime: number;
    asteroidsDestroyed: number;
    powerUpsCollected: number;
    shotsFireed: number;
    accuracy: number;
    maxLevelReached: number;
    survivalTime: number;
}

// Backend Database Schema for Spaceships Game
export interface SpaceshipGameResult {
    playerId: string;
    gameName: 'spaceships';
    score: number;
    level: number;
    duration: number;
    
    // Spaceships-specific data
    gameData: {
        shipUsed: string;
        asteroidsDestroyed: number;
        powerUpsCollected: number;
        shotsFireed: number;
        accuracy: number;
        coinsEarned: number;
        maxLevelReached: number;
        upgradesOwned: string[];
        shipsOwned: string[];
    };
}

// Player Profile specific to Spaceships
export interface SpaceshipPlayerProfile {
    playerId: string;
    coins: number;
    totalAsteroidsDestroyed: number;
    totalPowerUpsCollected: number;
    gamesPlayed: number;
    bestScore: number;
    bestAccuracy: number;
    totalPlayTime: number;
    
    // Persistent ownership data
    ownedShips: string[];
    ownedUpgrades: string[];
    equippedShip: string;
    
    // Statistics
    averageScore: number;
    averageSurvivalTime: number;
    favoriteShip: string;
}

// Backend Response Types - Unified structure for all games
export interface HighscoreEntry {
    _id: string;
    playerId: {
        _id: string;
        name: string;
        badgeId: string;
    };
    score: number;
    level: number;
    duration: number;
    createdAt: string;
    // Additional fields for spaceship compatibility
    coins?: number;
    gamesPlayed?: number;
}

export interface PlayerStats {
    totalScore: number;
    gamesPlayed: number;
    spaceshipHighscore: number;
    spaceshipCoins: number;
    spaceshipGamesPlayed: number;
    spaceshipProfile?: SpaceshipPlayerProfile;
}

export type GameScreen = 'lobby' | 'game' | 'shop' | 'shipManager' | 'highscore' | 'info';

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Game Events for Analytics
export interface GameEvent {
    type: 'asteroid_destroyed' | 'powerup_collected' | 'shot_fired' | 'level_up' | 'ship_damaged';
    timestamp: number;
    data?: any;
}
