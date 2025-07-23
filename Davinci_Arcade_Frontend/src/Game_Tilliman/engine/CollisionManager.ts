import type { Rectangle, Entity, PlayerEntity, PlatformEntity, EnemyEntity, CollectibleEntity } from '../types/GameTypes';
import { Player } from '../entities/Player';

export class CollisionManager {
    
    public checkCollisions(player: Player | null, entities: Entity[]) {
        if (!player) return;
        
        const playerBounds = player.getBounds();
        
        for (const entity of entities) {
            if (!entity.active) continue;
            
            const entityBounds = entity.getBounds();
            
            if (this.isColliding(playerBounds, entityBounds)) {
                this.handleCollision(player, entity);
            }
        }
        
        // Check platform collisions for grounding
        this.checkGroundCollisions(player, entities);
    }
    
    private isColliding(a: Rectangle, b: Rectangle): boolean {
        return !(
            a.x + a.width < b.x ||
            b.x + b.width < a.x ||
            a.y + a.height < b.y ||
            b.y + b.height < a.y
        );
    }
    
    private handleCollision(player: Player, entity: Entity) {
        switch (entity.type) {
            case 'enemy':
                this.handleEnemyCollision(player, entity as EnemyEntity);
                break;
            case 'collectible':
                this.handleCollectibleCollision(player, entity as CollectibleEntity);
                break;
            case 'trap':
                this.handleTrapCollision(player, entity);
                break;
            case 'goal':
                this.handleGoalCollision(player, entity);
                break;
            case 'checkpoint':
                this.handleCheckpointCollision(player, entity);
                break;
        }
    }
    
    private handleEnemyCollision(player: Player, enemy: EnemyEntity) {
        // Check if player is jumping on enemy
        if (player.velocity.y > 0 && player.position.y < enemy.position.y) {
            // Player defeats enemy by jumping on it
            enemy.active = false;
            player.velocity.y = -300; // Bounce
            player.addScore(50);
        } else {
            // Enemy damages player
            player.takeDamage(enemy.damage);
        }
    }
    
    private handleCollectibleCollision(player: Player, collectible: CollectibleEntity) {
        if (!collectible.collected) {
            collectible.collected = true;
            collectible.active = false;
            player.collectGear();
        }
    }
    
    private handleTrapCollision(player: Player, trap: Entity) {
        // Traps damage and slow the player
        player.takeDamage(1);
        player.velocity.x *= 0.5;
    }
    
    private handleGoalCollision(player: Player, goal: Entity) {
        // Check if all gears are collected and goal is activated
        if (player.hasAllGears()) {
            // Level completed!
            player.levelComplete();
        }
    }
    
    private handleCheckpointCollision(player: Player, checkpoint: Entity) {
        // Set respawn point and activate checkpoint
        player.setCheckpoint(checkpoint.position.x, checkpoint.position.y);
        if ('activate' in checkpoint && typeof checkpoint.activate === 'function') {
            checkpoint.activate();
        }
    }
    
    private checkGroundCollisions(player: Player, entities: Entity[]) {
        const playerBounds = player.getBounds();
        const feetBounds = {
            x: playerBounds.x + 2,
            y: playerBounds.y + playerBounds.height - 2,
            width: playerBounds.width - 4,
            height: 4
        };
        
        let isGrounded = false;
        
        for (const entity of entities) {
            if (!entity.active) continue;
            if (entity.type !== 'platform' && entity.type !== 'movingPlatform') continue;
            
            const platformBounds = entity.getBounds();
            
            if (this.isColliding(feetBounds, platformBounds) && player.velocity.y >= 0) {
                isGrounded = true;
                player.position.y = platformBounds.y - player.size.y;
                player.velocity.y = 0;
                
                // If on moving platform, add platform velocity
                if (entity.type === 'movingPlatform') {
                    const platform = entity as PlatformEntity;
                    if (platform.velocity) {
                        player.position.x += platform.velocity.x * 0.016; // Approximate frame time
                    }
                }
                
                break;
            }
        }
        
        player.isGrounded = isGrounded;
        
        // Check side collisions
        this.checkSideCollisions(player, entities);
    }
    
    private checkSideCollisions(player: Player, entities: Entity[]) {
        const playerBounds = player.getBounds();
        
        for (const entity of entities) {
            if (!entity.active) continue;
            if (entity.type !== 'platform' && entity.type !== 'movingPlatform') continue;
            
            const platformBounds = entity.getBounds();
            
            if (this.isColliding(playerBounds, platformBounds)) {
                // Calculate overlap
                const overlapX = Math.min(
                    playerBounds.x + playerBounds.width - platformBounds.x,
                    platformBounds.x + platformBounds.width - playerBounds.x
                );
                const overlapY = Math.min(
                    playerBounds.y + playerBounds.height - platformBounds.y,
                    platformBounds.y + platformBounds.height - playerBounds.y
                );
                
                // Resolve collision based on smallest overlap
                if (overlapX < overlapY) {
                    // Horizontal collision
                    if (playerBounds.x < platformBounds.x) {
                        player.position.x = platformBounds.x - playerBounds.width;
                    } else {
                        player.position.x = platformBounds.x + platformBounds.width;
                    }
                    player.velocity.x = 0;
                } else if (player.velocity.y < 0) {
                    // Hitting platform from below
                    player.position.y = platformBounds.y + platformBounds.height;
                    player.velocity.y = 0;
                }
            }
        }
    }
    
    public checkEntityCollisions(entities: Entity[]) {
        // Check collisions between non-player entities if needed
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];
                
                if (!entityA.active || !entityB.active) continue;
                
                const boundsA = entityA.getBounds();
                const boundsB = entityB.getBounds();
                
                if (this.isColliding(boundsA, boundsB)) {
                    // Handle specific entity-entity collisions if needed
                }
            }
        }
    }
} 