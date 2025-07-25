// Complete Overhaul: Tilli Timian API Service v2.0 - Backend Compatible
const API_BASE_URL = 'http://localhost:5000/api';

// Standardized interfaces matching backend expectations
export interface TilliProfile {
  playerId: string;
  badgeId?: string;
  name?: string;
  coins: number;
  totalGearsCollected: number;
  totalEnemiesDefeated: number;
  totalDeaths: number;
  gamesPlayed: number;
  bestScore: number;
  highestLevelReached: number;
  unlockedLevels: number[];
  ownedSkins: string[];
  equippedSkin: string;
  ownedAbilities: string[];
  totalPlayTime: number;
  levelCompletionTimes: Record<number, number> | Map<number, number>;
  perfectRuns: number;
  fastestCompletion: number | null;
  favoriteLevel: number;
  achievements: string[];
  lastPlayed?: string;
}

export interface LevelCompletionData {
  level: number;
  score: number;
  gearsCollected: number;
  enemiesDefeated: number;
  deaths: number;
  playTime: number;
  completionTime: number;
  completed?: boolean;
}

export interface LevelCompletionResponse {
  profile: TilliProfile;
  coinsEarned: number;
  scoreRecord?: any;
  levelUnlocked?: number;
  achievements?: string[];
}

export interface LeaderboardEntry {
  rank?: number;
  name: string;
  badgeId: string;
  bestScore: number;
  highestLevel: number;
  totalGears?: number;
  gamesPlayed?: number;
  lastPlayed?: string;
}

export interface ShopItem {
  id: string;
  type: 'skin' | 'ability';
  name: string;
  description: string;
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

class TilliApiService {
  // Backend uses 'tillitimian' for Player model, 'tilliman' for Score model
  private readonly GAME_NAME_PLAYER = 'tillitimian'; // For Player model
  private readonly GAME_NAME_SCORE = 'tilliman';     // For Score model
  
  private async fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed [${endpoint}]:`, error);
      
      if (error instanceof Error) {
        throw new Error(`Netzwerkfehler: ${error.message}`);
      }
      throw new Error('Unbekannter API-Fehler');
    }
  }

  // Get current player data from playerManager
  private getCurrentPlayerData(): { badgeId: string; name: string } {
    const player = playerManager.getCurrentPlayer();
    if (!player?.badgeId) {
      throw new Error('Kein Spieler angemeldet. Bitte melde dich zuerst an.');
    }
    return {
      badgeId: player.badgeId,
      name: player.name || `Spieler-${player.badgeId.slice(-6)}`
    };
  }

  // Get player profile with backend auto-creation
  async getProfile(): Promise<TilliProfile> {
    const { badgeId } = this.getCurrentPlayerData();
    
    try {
      // Backend auto-creates player if not exists
      const profile = await this.fetchApi<TilliProfile>(`/players/badge/${badgeId}/tilli`);
      
      // Validate and normalize profile data
      return this.normalizeProfile(profile, badgeId);
      
    } catch (error: any) {
      console.error('Fehler beim Laden des Profils:', error);
      throw new Error(`Profil konnte nicht geladen werden: ${error.message}`);
    }
  }

  // Normalize profile data to handle Map/Record differences
  private normalizeProfile(profile: any, badgeId: string): TilliProfile {
    // Handle levelCompletionTimes which might be a Map or Record
    let completionTimes: Record<number, number> = {};
    if (profile.levelCompletionTimes) {
      if (profile.levelCompletionTimes instanceof Map) {
        profile.levelCompletionTimes.forEach((value: number, key: string) => {
          completionTimes[Number(key)] = value;
        });
      } else if (typeof profile.levelCompletionTimes === 'object') {
        completionTimes = profile.levelCompletionTimes;
      }
    }

    return {
      playerId: profile.playerId || badgeId,
      badgeId: badgeId,
      coins: Math.max(0, Number(profile.coins) || 0),
      totalGearsCollected: Math.max(0, Number(profile.totalGearsCollected) || 0),
      totalEnemiesDefeated: Math.max(0, Number(profile.totalEnemiesDefeated) || 0),
      totalDeaths: Math.max(0, Number(profile.totalDeaths) || 0),
      gamesPlayed: Math.max(0, Number(profile.gamesPlayed) || 0),
      bestScore: Math.max(0, Number(profile.bestScore) || 0),
      highestLevelReached: Math.max(1, Number(profile.highestLevelReached) || 1),
      unlockedLevels: this.validateUnlockedLevels(profile.unlockedLevels),
      ownedSkins: Array.isArray(profile.ownedSkins) ? profile.ownedSkins : ['classic'],
      equippedSkin: profile.equippedSkin || 'classic',
      ownedAbilities: Array.isArray(profile.ownedAbilities) ? profile.ownedAbilities : [],
      totalPlayTime: Math.max(0, Number(profile.totalPlayTime) || 0),
      levelCompletionTimes: completionTimes,
      perfectRuns: Math.max(0, Number(profile.perfectRuns) || 0),
      fastestCompletion: profile.fastestCompletion ? Number(profile.fastestCompletion) : null,
      favoriteLevel: Math.max(1, Number(profile.favoriteLevel) || 1),
      achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
      lastPlayed: profile.lastPlayed || new Date().toISOString()
    };
  }

  // Validate unlocked levels (ensure sequential)
  private validateUnlockedLevels(levels: any): number[] {
    if (!Array.isArray(levels) || levels.length === 0) {
      return [1]; // Always have level 1 unlocked
    }
    
    const validLevels = levels
      .map(l => Number(l))
      .filter(l => Number.isInteger(l) && l >= 1 && l <= 10)
      .sort((a, b) => a - b);
    
    // Ensure sequential unlocking (no gaps)
    const sequential = [1];
    for (let i = 2; i <= Math.max(...validLevels); i++) {
      if (validLevels.includes(i)) {
        sequential.push(i);
      } else {
        break; // Stop at first gap
      }
    }
    
    return sequential;
  }

  // FIXED: Complete a level with correct backend structure
  async completeLevel(levelData: LevelCompletionData): Promise<LevelCompletionResponse> {
    const { badgeId } = this.getCurrentPlayerData();
    
    // Validate level data
    const validatedData = this.validateLevelData(levelData);
    
    try {
      console.log('Submitting level completion data:', validatedData);
      
      // Submit to backend level-complete endpoint (backend auto-creates player)
      const result = await this.fetchApi<LevelCompletionResponse>(
        `/players/badge/${badgeId}/tilli/level-complete`, 
        {
          method: 'POST',
          body: JSON.stringify(validatedData),
        }
      );
      
      console.log('Level completion result:', result);
      
      // Also submit to Score collection for leaderboards (if level was completed)
      if (validatedData.completed !== false) {
        try {
          const player = await this.fetchApi(`/players/badge/${badgeId}`);
          await this.submitScore(player._id, validatedData);
        } catch (scoreError) {
          console.warn('Score record submission failed:', scoreError);
          // Don't fail the whole operation
        }
      }
      
      return {
        profile: this.normalizeProfile(result.profile, badgeId),
        coinsEarned: result.coinsEarned || 0,
        scoreRecord: result.scoreRecord,
        levelUnlocked: result.levelUnlocked,
        achievements: result.achievements
      };
      
    } catch (error: any) {
      console.error('Level completion failed:', error);
      throw new Error(`Speichern fehlgeschlagen: ${error.message}`);
    }
  }

  // Validate level completion data
  private validateLevelData(data: LevelCompletionData): LevelCompletionData {
    return {
      level: Math.max(1, Math.min(10, Number(data.level) || 1)),
      score: Math.max(0, Number(data.score) || 0),
      gearsCollected: Math.max(0, Number(data.gearsCollected) || 0),
      enemiesDefeated: Math.max(0, Number(data.enemiesDefeated) || 0),
      deaths: Math.max(0, Number(data.deaths) || 0),
      playTime: Math.max(0, Number(data.playTime) || 0),
      completionTime: Math.max(0, Number(data.completionTime) || 0),
      completed: data.completed !== false // Default to true unless explicitly false
    };
  }

  // Submit score record (using correct game name for Score model)
  async submitScore(playerId: string, levelData: LevelCompletionData): Promise<any> {
    return this.fetchApi('/scores', {
      method: 'POST',
      body: JSON.stringify({
        playerId,
        gameName: this.GAME_NAME_SCORE, // Use 'tilliman' for Score collection
        score: levelData.score,
        level: levelData.level,
        duration: levelData.completionTime
      }),
    });
  }

  // Get leaderboard (using Score collection)
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const scores = await this.fetchApi<any[]>(`/scores/game/${this.GAME_NAME_SCORE}?limit=10`);
      
      return scores.map((score, index) => ({
        rank: index + 1,
        name: score.playerId?.name || 'Unbekannt',
        badgeId: score.playerId?.badgeId || 'unknown',
        bestScore: Number(score.score) || 0,
        highestLevel: Number(score.level) || 1,
        totalGears: 0, // Not available in score records
        gamesPlayed: 1,
        lastPlayed: score.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Leaderboard laden fehlgeschlagen:', error);
      return [];
    }
  }

  // Shop operations
  async purchaseSkin(skinId: string, cost: number): Promise<{ success: boolean; profile?: TilliProfile; reason?: string }> {
    const { badgeId } = this.getCurrentPlayerData();
    
    try {
      const result = await this.fetchApi(`/players/badge/${badgeId}/tilli/shop/skin`, {
        method: 'POST',
        body: JSON.stringify({ skinId, cost }),
      });
      
      return {
        success: result.success,
        profile: result.profile ? this.normalizeProfile(result.profile, badgeId) : undefined,
        reason: result.reason
      };
    } catch (error: any) {
      return { 
        success: false, 
        reason: error.message.includes('coins') ? 'insufficient_coins' : 'purchase_failed' 
      };
    }
  }

  async purchaseAbility(abilityId: string, cost: number): Promise<{ success: boolean; profile?: TilliProfile; reason?: string }> {
    const { badgeId } = this.getCurrentPlayerData();
    
    try {
      const result = await this.fetchApi(`/players/badge/${badgeId}/tilli/shop/ability`, {
        method: 'POST',
        body: JSON.stringify({ abilityId, cost }),
      });
      
      return {
        success: result.success,
        profile: result.profile ? this.normalizeProfile(result.profile, badgeId) : undefined,
        reason: result.reason
      };
    } catch (error: any) {
      return { 
        success: false, 
        reason: error.message.includes('coins') ? 'insufficient_coins' : 'purchase_failed' 
      };
    }
  }

  async equipSkin(skinId: string): Promise<TilliProfile> {
    const { badgeId } = this.getCurrentPlayerData();
    
    const result = await this.fetchApi(`/players/badge/${badgeId}/tilli/equip-skin`, {
      method: 'PUT',
      body: JSON.stringify({ skinId }),
    });
    
    return this.normalizeProfile(result, badgeId);
  }

  // Static shop items
  getShopItems(): ShopItem[] {
    return [
      {
        id: 'steampunk',
        type: 'skin',
        name: 'Steampunk Tilli',
        description: 'Ein mechanischer Look mit Zahnrädern und Dampf',
        cost: 150,
        rarity: 'common'
      },
      {
        id: 'neon',
        type: 'skin',
        name: 'Neon Tilli',
        description: 'Futuristisches Neon-Design mit Lichteffekten',
        cost: 250,
        rarity: 'rare'
      },
      {
        id: 'golden',
        type: 'skin',
        name: 'Golden Tilli',
        description: 'Vergoldeter Look für wahre Champions',
        cost: 400,
        rarity: 'epic'
      },
      {
        id: 'timeLord',
        type: 'skin',
        name: 'Zeit-Herrscher Tilli',
        description: 'Legendärer Skin mit Zeit-manipulierenden Effekten',
        cost: 1000,
        rarity: 'legendary'
      },
      {
        id: 'doubleJump',
        type: 'ability',
        name: 'Doppelsprung',
        description: 'Ermöglicht einen zusätzlichen Sprung in der Luft',
        cost: 300,
        rarity: 'rare'
      }
    ];
  }

  // Get skin info
  getSkinInfo(skinId: string) {
    const skins = {
      classic: { name: 'Klassischer Tilli', description: 'Der original Tilli Timian Look', rarity: 'common' },
      steampunk: { name: 'Steampunk Tilli', description: 'Ein mechanischer Look mit Zahnrädern und Dampf', rarity: 'common' },
      neon: { name: 'Neon Tilli', description: 'Futuristisches Neon-Design mit Lichteffekten', rarity: 'rare' },
      golden: { name: 'Golden Tilli', description: 'Vergoldeter Look für wahre Champions', rarity: 'epic' },
      timeLord: { name: 'Zeit-Herrscher Tilli', description: 'Legendärer Skin mit Zeit-manipulierenden Effekten', rarity: 'legendary' }
    };
    return skins[skinId as keyof typeof skins] || skins.classic;
  }

  // Get ability info
  getAbilityInfo(abilityId: string) {
    const abilities = {
      doubleJump: { name: 'Doppelsprung', description: 'Ermöglicht einen zusätzlichen Sprung in der Luft', icon: '⬆️' }
    };
    return abilities[abilityId as keyof typeof abilities];
  }

  // Utility method to get current player info
  getCurrentPlayerInfo(): { badgeId: string; name: string; isLoggedIn: boolean } {
    try {
      const player = this.getCurrentPlayerData();
      return { ...player, isLoggedIn: true };
    } catch {
      return { badgeId: 'Nicht angemeldet', name: 'Gast', isLoggedIn: false };
    }
  }

  // Legacy support for backward compatibility
  async syncPlayerLevels(): Promise<any> {
    const { badgeId } = this.getCurrentPlayerData();
    return this.fetchApi(`/players/badge/${badgeId}/tilli/sync-levels`, {
      method: 'POST',
    });
  }

  // Get player scores
  async getPlayerScoreHistory(): Promise<any[]> {
    const { badgeId } = this.getCurrentPlayerData();
    return this.fetchApi(`/players/badge/${badgeId}/tilli/scores`);
  }
}

// Singleton instance
export const tilliApi = new TilliApiService();

// Legacy support - but now dynamic
export const getCurrentPlayerData = () => {
  const player = playerManager.getCurrentPlayer();
  if (player) {
    return {
      badgeId: player.badgeId,
      name: player.name
    };
  }
  
  return {
    badgeId: 'guest-default',
    name: 'Gast'
  };
};

// Backward compatibility
export const mockPlayerData = getCurrentPlayerData();

// Import Player Manager
import { playerManager } from './playerManager'; 