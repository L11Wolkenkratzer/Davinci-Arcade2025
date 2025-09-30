export interface Player {
    _id: string;
    name: string;
    badgeId: string;
    totalScore?: number;
    gamesPlayed?: number;
}

export interface PacmanHighscoreEntry {
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

export interface PacmanPlayerStats {
    totalScore: number;
    gamesPlayed: number;
    pacmanHighscore: number;
    pacmanCoins: number;
    pacmanGamesPlayed: number;
}

export interface PacmanGameResult {
    playerId: string;
    gameName: string;
    score: number;
    level: number;
    duration: number;
}

export type PacmanGameScreen = 'menu' | 'playing' | 'leaderboard';
