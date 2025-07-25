// Player Data Interface
interface PlayerData {
  badgeId: string;
  name: string;
}

// Current Player Storage Keys
const STORAGE_KEYS = {
  CURRENT_PLAYER: 'currentPlayer',
  PLAYER_BADGE_ID: 'playerBadgeId', 
  PLAYER_NAME: 'playerName'
} as const;

class PlayerManager {
  
  // Get current player badge ID from localStorage
  getBadgeId(): string | null {
    try {
      // Try structured player data first
      const currentPlayer = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER);
      if (currentPlayer) {
        const playerData = JSON.parse(currentPlayer);
        return playerData.badgeId || null;
      }
      
      // Fallback to individual badge ID
      return localStorage.getItem(STORAGE_KEYS.PLAYER_BADGE_ID);
    } catch (error) {
      console.warn('Failed to get badge ID from localStorage:', error);
      return null;
    }
  }

  // Get current player name from localStorage  
  getPlayerName(): string | null {
    try {
      // Try structured player data first
      const currentPlayer = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER);
      if (currentPlayer) {
        const playerData = JSON.parse(currentPlayer);
        return playerData.name || null;
      }
      
      // Fallback to individual name
      return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
    } catch (error) {
      console.warn('Failed to get player name from localStorage:', error);
      return null;
    }
  }

  // Get current player data
  getCurrentPlayer(): PlayerData | null {
    const badgeId = this.getBadgeId();
    const name = this.getPlayerName();
    
    if (badgeId) {
      return {
        badgeId,
        name: name || `Player-${badgeId.slice(-6)}`
      };
    }
    
    return null;
  }

  // Check if player is logged in (has badge ID in localStorage)
  isPlayerLoggedIn(): boolean {
    return this.getBadgeId() !== null;
  }

  // Get display info for current player
  getPlayerDisplayInfo(): { badgeId: string; name: string; isLoggedIn: boolean } {
    const player = this.getCurrentPlayer();
    
    if (player) {
      return {
        badgeId: player.badgeId,
        name: player.name,
        isLoggedIn: true
      };
    }
    
    return {
      badgeId: 'Nicht angemeldet',
      name: 'Gast',
      isLoggedIn: false
    };
  }

  // Check if localStorage has any player data
  hasStoredPlayerData(): boolean {
    return !!(
      localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER) ||
      localStorage.getItem(STORAGE_KEYS.PLAYER_BADGE_ID)
    );
  }
}

// Singleton instance
export const playerManager = new PlayerManager();

// Type exports
export type { PlayerData }; 