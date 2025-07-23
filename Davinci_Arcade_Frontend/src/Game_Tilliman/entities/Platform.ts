import type { PlatformEntity, Rectangle, Vector2D } from '../types/GameTypes';
import type { Game } from '../engine/Game';

export class Platform implements PlatformEntity {
    public id: string;
    public type: 'platform' | 'movingPlatform';
    public position: Vector2D;
    public size: Vector2D;
    public velocity: Vector2D = { x: 0, y: 0 };
    public active: boolean = true;
    
    public movementPath?: {
        startPos: Vector2D;
        endPos: Vector2D;
        speed: number;
        direction: number;
    };
    
    private game: Game;
    private time: number = 0;
    
    constructor(
        game: Game,
        x: number,
        y: number,
        width: number,
        height: number,
        isMoving: boolean = false,
        properties?: any
    ) {
        this.game = game;
        this.id = `platform_${Math.random().toString(36).substr(2, 9)}`;
        this.type = isMoving ? 'movingPlatform' : 'platform';
        this.position = { x, y };
        this.size = { x: width, y: height };
        
        if (isMoving && properties) {
            this.setupMovementPath(properties);
        }
    }
    
    private setupMovementPath(properties: any) {
        const startX = properties.startX ?? this.position.x;
        const startY = properties.startY ?? this.position.y;
        const endX = properties.endX ?? this.position.x + 100;
        const endY = properties.endY ?? this.position.y;
        const speed = properties.speed ?? 50;
        
        this.movementPath = {
            startPos: { x: startX, y: startY },
            endPos: { x: endX, y: endY },
            speed: speed,
            direction: 1
        };
    }
    
    public update(deltaTime: number) {
        if (this.type === 'movingPlatform' && this.movementPath) {
            this.time += deltaTime;
            
            const path = this.movementPath;
            const totalDistance = Math.sqrt(
                Math.pow(path.endPos.x - path.startPos.x, 2) +
                Math.pow(path.endPos.y - path.startPos.y, 2)
            );
            
            const timeToComplete = totalDistance / path.speed;
            const progress = (this.time % (timeToComplete * 2)) / timeToComplete;
            
            let t = progress;
            if (progress > 1) {
                t = 2 - progress;
            }
            
            // Calculate new position
            const newX = path.startPos.x + (path.endPos.x - path.startPos.x) * t;
            const newY = path.startPos.y + (path.endPos.y - path.startPos.y) * t;
            
            // Calculate velocity for platform movement
            this.velocity.x = (newX - this.position.x) / deltaTime;
            this.velocity.y = (newY - this.position.y) / deltaTime;
            
            // Update position
            this.position.x = newX;
            this.position.y = newY;
        }
    }
    
    public render(ctx: CanvasRenderingContext2D, cameraX: number = 0) {
        const assetName = this.type === 'movingPlatform' ? 'platform_moving' : 'platform_static';
        const asset = this.game.getAssetManager().getAsset(assetName);
        if (asset) {
            // Tile the platform texture
            const tileWidth = 64;
            const tileHeight = 16;
            const tilesX = Math.ceil(this.size.x / tileWidth);
            const tilesY = Math.ceil(this.size.y / tileHeight);
            for (let i = 0; i < tilesX; i++) {
                for (let j = 0; j < tilesY; j++) {
                    const drawX = this.position.x + i * tileWidth - cameraX;
                    const drawY = this.position.y + j * tileHeight;
                    const drawWidth = Math.min(tileWidth, this.size.x - i * tileWidth);
                    const drawHeight = Math.min(tileHeight, this.size.y - j * tileHeight);
                    ctx.drawImage(
                        asset,
                        0, 0, drawWidth, drawHeight,
                        drawX, drawY, drawWidth, drawHeight
                    );
                }
            }
        } else {
            // Fallback rectangle
            ctx.fillStyle = this.type === 'movingPlatform' ? '#A0522D' : '#8B4513';
            ctx.fillRect(this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
            // Add some visual detail
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
        }
    }
    
    public getBounds(): Rectangle {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.x,
            height: this.size.y
        };
    }
} 