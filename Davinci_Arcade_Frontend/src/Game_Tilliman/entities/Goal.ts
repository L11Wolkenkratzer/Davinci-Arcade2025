import type { Entity, Rectangle, Vector2D } from '../types/GameTypes';
import type { Game } from '../engine/Game';

export class Goal implements Entity {
    public id: string;
    public type: 'goal' = 'goal';
    public position: Vector2D;
    public size: Vector2D = { x: 48, y: 48 };
    public velocity: Vector2D = { x: 0, y: 0 };
    public active: boolean = true;
    
    private game: Game;
    private time: number = 0;
    private isActivated: boolean = false;
    
    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.id = `goal_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
    }
    
    public update(deltaTime: number) {
        this.time += deltaTime;
        
        // Check if all gears are collected
        const player = this.game.getPlayer();
        if (player && player.hasAllGears()) {
            this.isActivated = true;
        }
    }
    
    public render(ctx: CanvasRenderingContext2D) {
        const asset = this.game.getAssetManager().getAsset('goal_portal');
        
        if (asset) {
            ctx.drawImage(asset, this.position.x, this.position.y, this.size.x, this.size.y);
        } else {
            // Fallback portal rendering
            this.renderPortal(ctx);
        }
        
        // If not activated, show lock overlay
        if (!this.isActivated) {
            this.renderLock(ctx);
        }
    }
    
    private renderPortal(ctx: CanvasRenderingContext2D) {
        const centerX = this.position.x + this.size.x / 2;
        const centerY = this.position.y + this.size.y / 2;
        
        // Swirling portal effect
        ctx.strokeStyle = this.isActivated ? '#00CED1' : '#555555';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.globalAlpha = this.isActivated ? (1 - i * 0.3) : 0.3;
            
            // Create spiral
            const startAngle = this.time * (i + 1) * 0.5;
            for (let j = 0; j < 20; j++) {
                const angle = startAngle + j * 0.3;
                const radius = 8 + i * 6 - j * 0.5;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        
        // Center glow
        ctx.globalAlpha = 1;
        if (this.isActivated) {
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
            gradient.addColorStop(0, 'rgba(0, 206, 209, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 206, 209, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    private renderLock(ctx: CanvasRenderingContext2D) {
        const centerX = this.position.x + this.size.x / 2;
        const centerY = this.position.y + this.size.y / 2;
        
        // Lock symbol
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Lock body
        ctx.fillRect(centerX - 8, centerY - 4, 16, 12);
        ctx.strokeRect(centerX - 8, centerY - 4, 16, 12);
        
        // Lock shackle
        ctx.beginPath();
        ctx.arc(centerX, centerY - 4, 6, Math.PI, 0, false);
        ctx.stroke();
        
        // Keyhole
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 2, 2, 0, Math.PI * 2);
        ctx.fill();
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