import type { EnemyEntity, Rectangle, Vector2D, EnemyType } from '../types/GameTypes';
import type { Game } from '../engine/Game';

export class Enemy implements EnemyEntity {
    public id: string;
    public type: 'enemy' = 'enemy';
    public position: Vector2D;
    public size: Vector2D = { x: 32, y: 32 };
    public velocity: Vector2D = { x: 0, y: 0 };
    public active: boolean = true;
    
    public enemyType: EnemyType;
    public health: number = 1;
    public damage: number = 1;
    public movementPattern?: {
        type: 'horizontal' | 'vertical' | 'circular' | 'periodic';
        speed: number;
        range: number;
        phase?: number;
    };
    
    private game: Game;
    private time: number = 0;
    private initialPosition: Vector2D;
    private isVisible: boolean = true;
    
    constructor(
        game: Game,
        x: number,
        y: number,
        enemyType: EnemyType,
        properties?: any
    ) {
        this.game = game;
        this.id = `enemy_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
        this.initialPosition = { x, y };
        this.enemyType = enemyType;
        
        this.setupEnemyType(properties);
    }
    
    private setupEnemyType(properties?: any) {
        switch (this.enemyType) {
            case 'tickspike':
                // Rolls horizontally back and forth
                this.size = { x: 32, y: 32 };
                this.damage = 1;
                this.movementPattern = {
                    type: 'horizontal',
                    speed: properties?.speed ?? 80,
                    range: properties?.range ?? 100,
                    phase: 0
                };
                break;
                
            case 'rustling':
                // Flies up and down
                this.size = { x: 32, y: 32 };
                this.damage = 1;
                this.movementPattern = {
                    type: 'vertical',
                    speed: properties?.speed ?? 60,
                    range: properties?.range ?? 80,
                    phase: 0
                };
                break;
                
            case 'cuckooshadow':
                // Appears and disappears periodically
                this.size = { x: 32, y: 48 };
                this.damage = 2;
                this.movementPattern = {
                    type: 'periodic',
                    speed: 1, // Frequency of appearance
                    range: 2, // Duration visible
                    phase: properties?.phase ?? 0
                };
                break;
        }
    }
    
    public update(deltaTime: number) {
        this.time += deltaTime;
        
        if (!this.movementPattern) return;
        
        switch (this.movementPattern.type) {
            case 'horizontal':
                this.updateHorizontalMovement();
                break;
            case 'vertical':
                this.updateVerticalMovement();
                break;
            case 'periodic':
                this.updatePeriodicVisibility();
                break;
        }
    }
    
    private updateHorizontalMovement() {
        if (!this.movementPattern) return;
        
        const range = this.movementPattern.range;
        const speed = this.movementPattern.speed;
        
        // Sinusoidal movement
        const offset = Math.sin(this.time * speed * 0.02) * range;
        this.position.x = this.initialPosition.x + offset;
        
        // Update velocity for collision purposes
        this.velocity.x = Math.cos(this.time * speed * 0.02) * range * speed * 0.02;
    }
    
    private updateVerticalMovement() {
        if (!this.movementPattern) return;
        
        const range = this.movementPattern.range;
        const speed = this.movementPattern.speed;
        
        // Sinusoidal movement
        const offset = Math.sin(this.time * speed * 0.02) * range;
        this.position.y = this.initialPosition.y + offset;
        
        // Update velocity for collision purposes
        this.velocity.y = Math.cos(this.time * speed * 0.02) * range * speed * 0.02;
    }
    
    private updatePeriodicVisibility() {
        if (!this.movementPattern) return;
        
        const period = 1 / this.movementPattern.speed; // Total cycle time
        const visibleDuration = this.movementPattern.range;
        const phase = this.movementPattern.phase || 0;
        
        const cycleTime = (this.time + phase) % period;
        this.isVisible = cycleTime < visibleDuration;
        
        // Only collide when visible
        this.active = this.isVisible;
    }
    
    public render(ctx: CanvasRenderingContext2D) {
        if (!this.isVisible && this.enemyType === 'cuckooshadow') return;
        
        const asset = this.game.getAssetManager().getAsset(`enemy_${this.enemyType}`);
        
        if (asset) {
            ctx.drawImage(asset, this.position.x, this.position.y, this.size.x, this.size.y);
        } else {
            // Fallback rendering
            this.renderFallback(ctx);
        }
    }
    
    private renderFallback(ctx: CanvasRenderingContext2D) {
        switch (this.enemyType) {
            case 'tickspike':
                // Purple spiky ball
                ctx.fillStyle = '#800080';
                ctx.beginPath();
                ctx.arc(
                    this.position.x + this.size.x / 2,
                    this.position.y + this.size.y / 2,
                    this.size.x / 3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Draw spikes
                ctx.strokeStyle = '#400040';
                ctx.lineWidth = 2;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(
                        this.position.x + this.size.x / 2 + Math.cos(angle) * this.size.x / 3,
                        this.position.y + this.size.y / 2 + Math.sin(angle) * this.size.y / 3
                    );
                    ctx.lineTo(
                        this.position.x + this.size.x / 2 + Math.cos(angle) * this.size.x / 2,
                        this.position.y + this.size.y / 2 + Math.sin(angle) * this.size.y / 2
                    );
                    ctx.stroke();
                }
                break;
                
            case 'rustling':
                // Dark red flying creature
                ctx.fillStyle = '#8B0000';
                ctx.beginPath();
                ctx.ellipse(
                    this.position.x + this.size.x / 2,
                    this.position.y + this.size.y / 2,
                    this.size.x / 2,
                    this.size.y / 3,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Wings
                ctx.strokeStyle = '#400000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y + this.size.y / 2);
                ctx.quadraticCurveTo(
                    this.position.x,
                    this.position.y,
                    this.position.x + this.size.x / 3,
                    this.position.y + this.size.y / 3
                );
                ctx.moveTo(this.position.x + this.size.x, this.position.y + this.size.y / 2);
                ctx.quadraticCurveTo(
                    this.position.x + this.size.x,
                    this.position.y,
                    this.position.x + this.size.x * 2 / 3,
                    this.position.y + this.size.y / 3
                );
                ctx.stroke();
                break;
                
            case 'cuckooshadow':
                // Indigo shadow creature
                ctx.fillStyle = 'rgba(75, 0, 130, 0.7)';
                ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
                
                // Eyes
                ctx.fillStyle = 'red';
                ctx.fillRect(this.position.x + 8, this.position.y + 8, 4, 4);
                ctx.fillRect(this.position.x + 20, this.position.y + 8, 4, 4);
                break;
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