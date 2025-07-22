import type { Entity, Rectangle, Vector2D } from '../types/GameTypes';
import type { Game } from '../engine/Game';

export class Checkpoint implements Entity {
    public id: string;
    public type: 'checkpoint' = 'checkpoint';
    public position: Vector2D;
    public size: Vector2D = { x: 24, y: 32 };
    public velocity: Vector2D = { x: 0, y: 0 };
    public active: boolean = true;
    
    private game: Game;
    private isActivated: boolean = false;
    private time: number = 0;
    
    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.id = `checkpoint_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
    }
    
    public update(deltaTime: number) {
        this.time += deltaTime;
        
        // Wave flag animation
        if (this.isActivated) {
            // Flag waves when activated
        }
    }
    
    public render(ctx: CanvasRenderingContext2D) {
        const asset = this.game.getAssetManager().getAsset('checkpoint');
        
        if (asset) {
            ctx.drawImage(asset, this.position.x, this.position.y, this.size.x, this.size.y);
        } else {
            // Fallback flag rendering
            // Flag pole
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.position.x + 4, this.position.y + 8, 4, 24);
            
            // Flag
            ctx.fillStyle = this.isActivated ? '#32CD32' : '#888888';
            ctx.beginPath();
            
            if (this.isActivated) {
                // Waving flag
                const waveOffset = Math.sin(this.time * 3) * 2;
                ctx.moveTo(this.position.x + 8, this.position.y + 8);
                ctx.quadraticCurveTo(
                    this.position.x + 16 + waveOffset,
                    this.position.y + 10,
                    this.position.x + 20,
                    this.position.y + 12
                );
                ctx.lineTo(this.position.x + 20, this.position.y + 14);
                ctx.quadraticCurveTo(
                    this.position.x + 16 + waveOffset,
                    this.position.y + 14,
                    this.position.x + 8,
                    this.position.y + 16
                );
            } else {
                // Static flag
                ctx.moveTo(this.position.x + 8, this.position.y + 8);
                ctx.lineTo(this.position.x + 20, this.position.y + 12);
                ctx.lineTo(this.position.x + 8, this.position.y + 16);
            }
            
            ctx.closePath();
            ctx.fill();
            
            // Flag outline
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Activation glow
        if (this.isActivated) {
            ctx.fillStyle = 'rgba(50, 205, 50, 0.3)';
            ctx.beginPath();
            ctx.arc(
                this.position.x + this.size.x / 2,
                this.position.y + this.size.y / 2,
                20 + Math.sin(this.time * 2) * 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    public activate() {
        if (!this.isActivated) {
            this.isActivated = true;
            // Could play a sound effect here
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