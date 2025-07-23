import type { Game } from './Game';
import type { LevelData, LevelObject } from '../types/GameTypes';
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
    private currentLevel: number = 1;
    private levelData: LevelData | null = null;
    
    constructor(game: Game) {
        this.game = game;
    }
    
    public loadLevel(levelNumber: number) {
        // Clear existing entities
        this.clearLevel();
        
        // Get level data
        this.levelData = levelData[levelNumber - 1];
        if (!this.levelData) {
            console.error(`Level ${levelNumber} not found`);
            return;
        }
        
        this.currentLevel = levelNumber;
        
        // Create player
        const player = new Player(
            this.game,
            this.levelData.playerStart.x,
            this.levelData.playerStart.y
        );
        this.game.setPlayer(player);
        
        // Create entities from level data
        for (const obj of this.levelData.entities) {
            this.createEntity(obj);
        }
    }
    
    private createEntity(obj: LevelObject) {
        let entity;
        
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
                return;
        }
        
        if (entity) {
            this.game.addEntity(entity);
        }
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
        } else {
            // Game completed! All levels finished
            console.log('Congratulations! All levels completed!');
            // Could trigger a "game completed" state
        }
    }
    
    public getCurrentLevel(): number {
        return this.currentLevel;
    }

    public getLevelWidth(): number {
        return this.levelData?.width || 800;
    }
} 