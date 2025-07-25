import type { Game } from './Game';
import type { LevelData, LevelObject, Entity } from '../types/GameTypes';
import { Player } from '../entities/Player';
import { Platform } from '../entities/Platform';
import { Enemy } from '../entities/Enemy';
import { Collectible } from '../entities/Collectible';
import { Goal } from '../entities/Goal';
import { Checkpoint } from '../entities/Checkpoint';
import { Trap } from '../entities/Trap';
import { levelData } from '../levels/LevelData';

export class LevelManager {
    private game: Game;
    private currentLevel: number = 0; // SENIOR DEV FIX: Don't default to 1, let loadLevel set it
    private levelData: LevelData | null = null;
    
    constructor(game: Game) {
        this.game = game;
    }
    
    public loadLevel(levelNumber: number) {
        console.log(`🎯 LevelManager.loadLevel() called with level: ${levelNumber}`);
        
        // CRITICAL: Set currentLevel FIRST before any operations
        this.currentLevel = levelNumber;
        
        // Clear existing entities AFTER setting level
        this.clearLevel();
        
        // Clear game entities to prevent duplicates
        this.game.clearEntities();
        
        // Get level data
        this.levelData = levelData[levelNumber - 1];
        if (!this.levelData) {
            console.error(`❌ Level ${levelNumber} not found in levelData array`);
            console.error(`Available levels: 1-${levelData.length}`);
            return;
        }
        
        console.log(`✅ Loading Level ${levelNumber}: ${this.levelData.name} with ${this.levelData.entities.length} entities`);
        
        // Create player
        const player = new Player(
            this.game,
            this.levelData.playerStart.x,
            this.levelData.playerStart.y
        );
        this.game.setPlayer(player);
        
        // Create entities from level data
        for (const obj of this.levelData.entities) {
            const entity = this.createEntity(obj);
            if (entity) {
                this.game.addEntity(entity);
            }
        }
        
        console.log(`✅ Level ${levelNumber} loaded successfully`);
    }
    
    private createEntity(obj: LevelObject): Entity | null {
        let entity: Entity | null = null;
        
        switch (obj.type) {
            case 'platform':
                entity = new Platform(
                    this.game,
                    obj.x,
                    obj.y,
                    obj.width,
                    obj.height,
                    false
                );
                break;
                
            case 'movingPlatform':
                entity = new Platform(
                    this.game,
                    obj.x,
                    obj.y,
                    obj.width,
                    obj.height,
                    true,
                    obj.properties
                );
                break;
                
            case 'enemy':
                entity = new Enemy(
                    this.game,
                    obj.x,
                    obj.y,
                    obj.properties?.enemyType || 'tickspike',
                    obj.properties
                );
                break;
                
            case 'collectible':
                entity = new Collectible(
                    this.game,
                    obj.x,
                    obj.y
                );
                break;
                
            case 'goal':
                entity = new Goal(
                    this.game,
                    obj.x,
                    obj.y
                );
                break;
                
            case 'checkpoint':
                entity = new Checkpoint(
                    this.game,
                    obj.x,
                    obj.y
                );
                break;
                
            case 'trap':
                entity = new Trap(
                    this.game,
                    obj.x,
                    obj.y,
                    obj.width,
                    obj.height
                );
                break;
                
            default:
                console.warn(`Unknown entity type: ${obj.type}`);
                return null;
        }
        
        return entity;
    }
    
    private clearLevel() {
        // Clear all entities from the game
        // Note: This will be handled by the Game class when we load new entities
        const player = this.game.getPlayer();
        if (player) {
            player.reset();
        }
        
        // Reset player position and state for new level
        if (player && this.levelData) {
            player.position.x = this.levelData.playerStart.x;
            player.position.y = this.levelData.playerStart.y;
        }
    }
    
    public respawnPlayer() {
        const player = this.game.getPlayer();
        if (player && this.levelData) {
            player.respawn();
        }
    }
    
    public nextLevel() {
        const nextLevelNumber = this.currentLevel + 1;
        if (nextLevelNumber <= levelData.length) {
            this.loadLevel(nextLevelNumber);
            
            // Unlock next level in profile
            if (this.game.getOptions().onLevelUnlock) {
                this.game.getOptions().onLevelUnlock!(nextLevelNumber);
            }
        } else {
            // Game completed! All levels finished
            console.log('Congratulations! All 10 levels completed!');
            // Could trigger a "game completed" state
        }
    }
    
    public isLevelUnlocked(levelNumber: number): boolean {
        const profile = this.game.getOptions().playerProfile;
        if (!profile) return levelNumber === 1; // Only first level unlocked by default
        
        // Check if level is in unlocked levels array
        const unlockedLevels = profile.unlockedLevels || [1];
        return unlockedLevels.includes(levelNumber);
    }
    
    public getUnlockedLevels(): number[] {
        const profile = this.game.getOptions().playerProfile;
        return profile?.unlockedLevels || [1];
    }
    
    public getTotalLevels(): number {
        return levelData.length;
    }
    
    public getLevelInfo(levelNumber: number) {
        const level = levelData[levelNumber - 1];
        return level ? {
            id: level.id,
            name: level.name,
            requiredGears: level.requiredGears
        } : null;
    }
    
    public getCurrentLevel(): number {
        return this.currentLevel;
    }


    public getLevelWidth(): number {
        return this.levelData?.width || 800;
    }

} 