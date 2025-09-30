// snakeTypes.ts - TypeScript-Typen kompatibel mit Backend
export interface Player {
  _id: string;
  name: string;
  badgeId: string;
  totalScore?: number;
  gamesPlayed?: number;
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

export interface SnakeGameResult {
  playerId: string;
  gameName: string;
  score: number;
  level: number;
  duration: number;
}
