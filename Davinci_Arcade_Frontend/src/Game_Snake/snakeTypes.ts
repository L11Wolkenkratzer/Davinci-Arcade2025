// Snake Game Types for Backend Integration
export interface Player {
    _id: string;
    badgeId: string;
    name: string;
    totalScore: number;
    gamesPlayed: number;
    lastPlayed: string;
    updatedAt?: string;
    createdAt?: string;
}

export interface SnakeGameResult {
    playerId: string;
    gameName: 'snake';
    score: number;
    level: number;
    duration: number;
    
    // Snake-specific data
    gameData?: {
        fruitsEaten: number;
        snakeLength: number;
        activeSkin: string;
        activeAbility: string;
        maxLength: number;
    };
}

export interface SnakeHighscoreEntry {
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

export interface SnakePlayerStats {
    totalScore: number;
    gamesPlayed: number;
    snakeHighscore: number;
    snakeFruits: number;
    snakeGamesPlayed: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
} 