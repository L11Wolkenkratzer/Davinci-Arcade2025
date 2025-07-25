// spaceshipApi.ts - Complete Backend Integration
import type { 
    Player, 
    SpaceshipGameResult, 
    SpaceshipPlayerProfile, 
    HighscoreEntry, 
    PlayerStats,
    ApiResponse 
} from './types/gametypes';

class SpaceshipApiService {
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
            console.error('Spaceship API Error:', error);
            throw error;
        }
    }

    // Score and Game Result Management
    async submitGameResult(gameResult: SpaceshipGameResult): Promise<ApiResponse> {
        return this.apiCall('/api/highscores/submit', {
            method: 'POST',
            body: JSON.stringify({
                ...gameResult,
                gameName: 'spaceships'
            }),
        });
    }

    async getHighscores(limit: number = 10): Promise<HighscoreEntry[]> {
        return this.apiCall(`/api/scores/game/spaceships?limit=${limit}`);
    }

    async getPlayerHighscores(playerId: string, limit: number = 5): Promise<HighscoreEntry[]> {
        return this.apiCall(`/api/highscores/player/${playerId}/spaceships?limit=${limit}`);
    }

    // Player Profile Management
    async getPlayerProfile(playerId: string): Promise<SpaceshipPlayerProfile | null> {
        try {
            return await this.apiCall(`/api/highscores/profile/${playerId}/spaceships`);
        } catch (error) {
            console.error('Failed to get player profile:', error);
            // Return null for new players - backend will create profile with starter coins
            return null;
        }
    }

    async updatePlayerProfile(profile: SpaceshipPlayerProfile): Promise<ApiResponse> {
        return this.apiCall(`/api/highscores/profile/${profile.playerId}/spaceships`, {
            method: 'POST',
            body: JSON.stringify(profile),
        });
    }

    async getPlayerStats(playerId: string): Promise<PlayerStats> {
        try {
            const [playerData, highscores, profileData] = await Promise.all([
                this.apiCall<any>(`/api/players/${playerId}`),
                this.getHighscores(50), // Get larger set to find player
                this.getPlayerProfile(playerId),
            ]);

            // Find player's best score from highscores
            const playerHighscore = highscores.find(entry => 
                entry.playerId._id === playerId || entry.playerId.name === playerData.name
            );

            const spaceshipHighscore = playerHighscore?.score || 0;
            const spaceshipGamesPlayed = playerHighscore?.gamesPlayed || 0;

            return {
                totalScore: playerData.totalScore || 0,
                gamesPlayed: playerData.gamesPlayed || 0,
                spaceshipHighscore,
                spaceshipCoins: profileData?.coins || 0,
                spaceshipGamesPlayed,
                spaceshipProfile: profileData || undefined,
            };
        } catch (error) {
            console.error('Failed to get player stats:', error);
            // Return fallback data
            const profile = await this.getPlayerProfile(playerId);
            return {
                totalScore: 0,
                gamesPlayed: 0,
                spaceshipHighscore: profile?.bestScore || 0,
                spaceshipCoins: profile?.coins || 0,
                spaceshipGamesPlayed: profile?.gamesPlayed || 0,
                spaceshipProfile: profile || undefined,
            };
        }
    }

    // Ship and Upgrade Management
    async savePlayerPurchases(playerId: string, ships: string[], upgrades: string[]): Promise<ApiResponse> {
        const profile = await this.getPlayerProfile(playerId);
        
        if (profile) {
            profile.ownedShips = ships;
            profile.ownedUpgrades = upgrades;
            return this.updatePlayerProfile(profile);
        }

        // Create new profile if it doesn't exist - backend will set starter coins
        const newProfile: SpaceshipPlayerProfile = {
            playerId,
            coins: 0, // Let backend handle starter coins
            totalAsteroidsDestroyed: 0,
            totalPowerUpsCollected: 0,
            gamesPlayed: 0,
            bestScore: 0,
            bestAccuracy: 0,
            totalPlayTime: 0,
            ownedShips: ships,
            ownedUpgrades: upgrades,
            equippedShip: 'basic',
            averageScore: 0,
            averageSurvivalTime: 0,
            favoriteShip: 'basic',
        };

        return this.updatePlayerProfile(newProfile);
    }

    async updatePlayerCoins(playerId: string, coins: number): Promise<ApiResponse> {
        const profile = await this.getPlayerProfile(playerId);
        
        if (profile) {
            profile.coins = coins;
            return this.updatePlayerProfile(profile);
        }

        // Create new profile with coins - no default 1000
        const newProfile: SpaceshipPlayerProfile = {
            playerId,
            coins,
            totalAsteroidsDestroyed: 0,
            totalPowerUpsCollected: 0,
            gamesPlayed: 0,
            bestScore: 0,
            bestAccuracy: 0,
            totalPlayTime: 0,
            ownedShips: ['basic'],
            ownedUpgrades: [],
            equippedShip: 'basic',
            averageScore: 0,
            averageSurvivalTime: 0,
            favoriteShip: 'basic',
        };

        return this.updatePlayerProfile(newProfile);
    }

    // Enhanced Ship Management
    async updateEquippedShip(playerId: string, shipId: string): Promise<ApiResponse> {
        const profile = await this.getPlayerProfile(playerId);
        if (profile) {
            profile.equippedShip = shipId;
            // Update favorite ship based on usage
            profile.favoriteShip = shipId;
            return this.updatePlayerProfile(profile);
        }
        throw new Error('Player profile not found');
    }

    async getShipUsageStats(playerId: string): Promise<Record<string, number>> {
        try {
            const analytics = await this.getGameAnalytics(playerId);
            return analytics.shipUsage || {};
        } catch (error) {
            console.warn('Ship usage stats not available:', error);
            return {};
        }
    }

    // Analytics and Statistics
    async getGameAnalytics(playerId: string): Promise<any> {
        return this.apiCall(`/api/highscores/analytics/spaceships/${playerId}`);
    }

    async getLeaderboard(category: 'score' | 'accuracy' | 'survival', limit: number = 10): Promise<any[]> {
        return this.apiCall(`/api/highscores/leaderboard/spaceships/${category}?limit=${limit}`);
    }

    // Advanced Analytics
    async getPlayerPerformanceTrend(playerId: string): Promise<any> {
        try {
            const analytics = await this.getGameAnalytics(playerId);
            return {
                improvement: analytics.improvement || 0,
                recentGames: analytics.recentGames || [],
                trend: analytics.improvement > 0 ? 'improving' : 'stable'
            };
        } catch (error) {
            console.error('Performance trend not available:', error);
            return { improvement: 0, recentGames: [], trend: 'stable' };
        }
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

export const spaceshipApi = new SpaceshipApiService();
export default spaceshipApi;
