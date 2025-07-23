import type { CollectibleEntity, Rectangle, Vector2D } from '../types/GameTypes';
import type { Game } from '../engine/Game';

export class Collectible implements CollectibleEntity {
    public id: string;
    public type: 'collectible' = 'collectible';
    public position: Vector2D;
    public size: Vector2D = { x: 24, y: 24 };
    public velocity: Vector2D = { x: 0, y: 0 };
    public active: boolean = true;
    public collected: boolean = false;
    public points: number = 100;
    
    private game: Game;
    private time: number = 0;
    private floatOffset: number = 0;
    
    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.id = `collectible_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
        this.floatOffset = Math.random() * Math.PI * 2; // Random starting phase
    }
    
    public update(deltaTime: number) {
        this.time += deltaTime;
        
        // Gentle floating animation
        const floatY = Math.sin(this.time * 2 + this.floatOffset) * 3;
        this.position.y = this.position.y + floatY * deltaTime;
    }
    

    public render(ctx: CanvasRenderingContext2D, cameraX: number = 0) {
        const asset = this.game.getAssetManager().getAsset('collect_gearpart');
        if (asset) {
            ctx.drawImage(asset, this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
        }

    }
    
    private renderSparkles(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 3; i++) {
            const angle = (this.time * 3 + i * 2.094) % (Math.PI * 2);
            const distance = 15 + Math.sin(this.time * 4 + i) * 3;
            const x = this.position.x + this.size.x / 2 + Math.cos(angle) * distance;
            const y = this.position.y + this.size.y / 2 + Math.sin(angle) * distance;
            const size = 2 + Math.sin(this.time * 5 + i) * 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
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