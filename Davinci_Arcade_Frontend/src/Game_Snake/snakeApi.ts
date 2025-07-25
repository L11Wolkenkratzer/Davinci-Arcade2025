// Snake API Service - Backend Integration
import type { 
    Player, 
    SnakeGameResult, 
    SnakeHighscoreEntry, 
    SnakePlayerStats,
    ApiResponse 
} from './snakeTypes';

class SnakeApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = window.location.origin.replace(/:5173$/, ':5000');
    }

    private async apiCall<T>(url: string, options?: RequestInit): Promise<T> {
        const fullUrl = `${this.baseUrl}${url}`;
        
        try {
            const response = await fetch(fullUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Snake API Error:', error);
            throw error;
        }
    }

    // Score and Game Result Management
    async submitGameResult(gameResult: SnakeGameResult): Promise<ApiResponse> {
        return this.apiCall('/api/scores', {
            method: 'POST',
            body: JSON.stringify(gameResult),
        });
    }

    async getHighscores(limit: number = 10): Promise<SnakeHighscoreEntry[]> {
        return this.apiCall(`/api/scores/game/snake?limit=${limit}`);
    }

    async getPlayerHighscores(playerId: string, limit: number = 5): Promise<SnakeHighscoreEntry[]> {
        try {
            return await this.apiCall(`/api/scores/player/${playerId}/snake?limit=${limit}`);
        } catch (error) {
            console.warn('Player highscores not available:', error);
            return [];
        }
    }

    // Player Statistics
    async getPlayerStats(playerId: string): Promise<SnakePlayerStats> {
        try {
            const [playerData, highscores] = await Promise.all([
                this.apiCall<any>(`/api/players/${playerId}`),
                this.getHighscores(50), // Get larger set to find player
            ]);

            // Find player's best score from highscores
            const playerHighscore = highscores.find(entry => 
                entry.playerId._id === playerId || entry.playerId.name === playerData.name
            );

            const snakeHighscore = playerHighscore?.score || 0;
            const snakeGamesPlayed = highscores.filter(entry => 
                entry.playerId._id === playerId
            ).length;

            // Calculate fruits earned (score = snake length - initial length, fruits = score)
            const snakeFruits = snakeHighscore;

            return {
                totalScore: playerData.totalScore || 0,
                gamesPlayed: playerData.gamesPlayed || 0,
                snakeHighscore,
                snakeFruits,
                snakeGamesPlayed,
            };
        } catch (error) {
            console.error('Failed to get player stats:', error);
            // Return fallback data
            return {
                totalScore: 0,
                gamesPlayed: 0,
                snakeHighscore: 0,
                snakeFruits: 0,
                snakeGamesPlayed: 0,
            };
        }
    }

    // Player Profile Management
    async getPlayerProfile(playerId: string): Promise<any> {
        try {
            return await this.apiCall(`/api/players/${playerId}`);
        } catch (error) {
            console.error('Failed to get player profile:', error);
            return null;
        }
    }

    // Game Analytics
    async getGameAnalytics(playerId: string): Promise<any> {
        try {
            const scores = await this.apiCall<SnakeHighscoreEntry[]>(`/api/scores/game/snake`);
            const playerScores = scores.filter((score: SnakeHighscoreEntry) => 
                score.playerId._id === playerId
            );

            return {
                totalGames: playerScores.length,
                averageScore: playerScores.length > 0 
                    ? Math.round(playerScores.reduce((sum: number, s: SnakeHighscoreEntry) => sum + s.score, 0) / playerScores.length)
                    : 0,
                bestScore: playerScores.length > 0 
                    ? Math.max(...playerScores.map((s: SnakeHighscoreEntry) => s.score))
                    : 0,
                recentGames: playerScores.slice(0, 5),
                improvement: playerScores.length >= 2 
                    ? playerScores[0].score - playerScores[playerScores.length - 1].score 
                    : 0
            };
        } catch (error) {
            console.error('Analytics not available:', error);
            return {
                totalGames: 0,
                averageScore: 0,
                bestScore: 0,
                recentGames: [],
                improvement: 0
            };
        }
    }

    // Leaderboard
    async getLeaderboard(limit: number = 10): Promise<SnakeHighscoreEntry[]> {
        return this.getHighscores(limit);
    }

    // Health Check
    async checkBackendConnection(): Promise<boolean> {
        try {
            await this.apiCall('/api/health');
            return true;
        } catch (error) {
            console.error('Backend connection failed:', error);
            return false;
        }
    }
}

export const snakeApi = new SnakeApiService();
export default snakeApi; 