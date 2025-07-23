import type { Entity, Rectangle, Vector2D } from '../types/GameTypes';
import type { Game } from '../engine/Game';

export class Trap implements Entity {
    public id: string;
    public type: 'trap' = 'trap';
    public position: Vector2D;
    public size: Vector2D;
    public velocity: Vector2D = { x: 0, y: 0 };
    public active: boolean = true;
    
    private game: Game;
    private time: number = 0;
    
    constructor(game: Game, x: number, y: number, width: number = 32, height: number = 32) {
        this.game = game;
        this.id = `trap_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
        this.size = { x: width, y: height };
    }
    
    public update(deltaTime: number) {
        this.time += deltaTime;
        // Traps are static, but we keep time for animation effects
    }
    
    public render(ctx: CanvasRenderingContext2D, cameraX: number = 0) {
        const asset = this.game.getAssetManager().getAsset('trap_rustpatch');
        
        if (asset) {
            ctx.drawImage(asset, this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
        } else {
            // Fallback rust patch rendering
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
            
            // Add rust texture
            ctx.fillStyle = '#A0522D';
            const rustSpots = Math.floor(this.size.x * this.size.y / 200);
            
            for (let i = 0; i < rustSpots; i++) {
                const x = this.position.x + Math.random() * this.size.x;
                const y = this.position.y + Math.random() * this.size.y;
                const size = Math.random() * 6 + 2;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add darker spots
            ctx.fillStyle = '#654321';
            for (let i = 0; i < rustSpots / 2; i++) {
                const x = this.position.x + Math.random() * this.size.x;
                const y = this.position.y + Math.random() * this.size.y;
                const size = Math.random() * 4 + 1;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Add warning particles
        this.renderWarningParticles(ctx);
    }
    
    private renderWarningParticles(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
        
        for (let i = 0; i < 3; i++) {
            const particleTime = (this.time * 0.5 + i * 0.33) % 1;
            const y = this.position.y - particleTime * 20;
            const x = this.position.x + this.size.x / 2 + Math.sin(this.time * 2 + i * 2) * 10;
            const size = 2 + (1 - particleTime) * 2;
            const alpha = 1 - particleTime;
            
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
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