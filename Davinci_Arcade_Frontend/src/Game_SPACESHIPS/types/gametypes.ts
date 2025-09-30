export interface Player {
    _id: string;
    name: string;
    badgeId: string;
    totalScore?: number;
    gamesPlayed?: number;
}

export interface Ship {
    id: string;
    name: string;
    cost: number;
    owned: boolean;
    equipped: boolean;
    maxHealth: number;
    speed: number;
    fireRate: number;
    damage: number;
    icon: string;
}

export interface Upgrade {
    id: string;
    name: string;
    cost: number;
    owned: boolean;
    description: string;
    icon?: string;
}

export interface SpaceshipHighscoreEntry {
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
}

export interface SpaceshipPlayerStats {
    totalScore: number;
    gamesPlayed: number;
    spaceshipHighscore: number;
    spaceshipCoins: number;
    spaceshipGamesPlayed: number;
}

export interface SpaceshipGameResult {
    playerId: string;
    gameName: string;
    score: number;
    level: number;
    duration: number;
}

export type GameScreen = 'lobby' | 'game' | 'shop' | 'shipManager' | 'highscore' | 'info';
