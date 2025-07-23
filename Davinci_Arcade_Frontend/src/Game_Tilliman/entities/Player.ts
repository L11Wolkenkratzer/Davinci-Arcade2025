import type { PlayerEntity, InputState, Rectangle, PlayerState, Vector2D } from '../types/GameTypes';
import { PHYSICS } from '../types/GameTypes';
import type { Game } from '../engine/Game';

export class Player implements PlayerEntity {
    public id: string = 'player';
    public type: 'player' = 'player';
    public position: Vector2D;
    public size: Vector2D = { x: 32, y: 32 };
    public velocity: Vector2D = { x: 0, y: 0 };
    public active: boolean = true;
    
    public state: PlayerState = 'idle';
    public lives: number = 3;
    public score: number = 0;
    public isGrounded: boolean = false;
    public canDash: boolean = true;
    public dashCooldown: number = 0;
    public invulnerable: boolean = false;
    public invulnerabilityTimer: number = 0;
    
    private game: Game;
    private jumpPressed: boolean = false;
    private dashDirection: number = 0;
    private dashTimer: number = 0;
    private checkpointPosition: Vector2D;
    private collectedGears: number = 0;
    
    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.position = { x, y };
        this.checkpointPosition = { x, y };
    }
    
    public handleInput(input: InputState) {
        // Horizontal movement
        if (!this.isDashing()) {
            if (input.left) {
                this.velocity.x = -PHYSICS.PLAYER_SPEED;
            } else if (input.right) {
                this.velocity.x = PHYSICS.PLAYER_SPEED;
            } else {
                this.velocity.x *= PHYSICS.FRICTION;
            }
        }
        
        // Jump
        if (input.jump && this.isGrounded && !this.jumpPressed) {
            this.velocity.y = PHYSICS.JUMP_VELOCITY;
            this.jumpPressed = true;
        } else if (!input.jump) {
            this.jumpPressed = false;
            // Cut jump short if released early
            if (this.velocity.y < -200) {
                this.velocity.y = -200;
            }
        }
        
        // Dash
        if (input.dash && this.canDash && !this.isDashing()) {
            this.startDash(input.left ? -1 : 1);
        }
    }
    
    public update(deltaTime: number) {
        // Update dash
        if (this.isDashing()) {
            this.dashTimer -= deltaTime;
            this.velocity.x = this.dashDirection * PHYSICS.DASH_SPEED;
            this.velocity.y = 0;
            
            if (this.dashTimer <= 0) {
                this.endDash();
            }
        } else {
            // Apply gravity
            this.velocity.y += PHYSICS.GRAVITY * deltaTime;
            this.velocity.y = Math.min(this.velocity.y, PHYSICS.MAX_FALL_SPEED);
        }
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Update dash cooldown
        if (!this.canDash) {
            this.dashCooldown -= deltaTime;
            if (this.dashCooldown <= 0) {
                this.canDash = true;
            }
        }
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update state
        this.updateState();
        
        // Keep player in bounds
        this.position.x = Math.max(0, Math.min(800 - this.size.x, this.position.x));
    }
    
    private updateState() {
        if (this.invulnerable && this.invulnerabilityTimer > 0) {
            this.state = 'hit';
        } else if (this.isDashing()) {
            this.state = 'dash';
        } else if (this.velocity.y < -50) {
            this.state = 'jump';
        } else if (this.velocity.y > 50) {
            this.state = 'fall';
        } else {
            this.state = 'idle';
        }
    }
    
    private startDash(direction: number) {
        this.dashDirection = direction;
        this.dashTimer = PHYSICS.DASH_DURATION;
        this.canDash = false;
        this.dashCooldown = PHYSICS.DASH_COOLDOWN;
    }
    
    private endDash() {
        this.dashTimer = 0;
        this.velocity.x = this.dashDirection * PHYSICS.PLAYER_SPEED;
    }
    
    private isDashing(): boolean {
        return this.dashTimer > 0;
    }
    
    public render(ctx: CanvasRenderingContext2D) {
        const asset = this.game.getAssetManager().getAsset(`player_${this.state}`);
        
        if (asset) {
            // Blink when invulnerable
            if (this.invulnerable && Math.floor(this.invulnerabilityTimer * 10) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
            
            ctx.drawImage(asset, this.position.x, this.position.y, this.size.x, this.size.y);
            ctx.globalAlpha = 1;
        } else {
            // Fallback rectangle
            ctx.fillStyle = this.invulnerable ? 'rgba(255, 0, 0, 0.5)' : 'orange';
            ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
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
    
    public takeDamage(damage: number) {
        if (!this.invulnerable) {
            this.lives -= damage;
            this.invulnerable = true;
            this.invulnerabilityTimer = 1.5; // 1.5 seconds of invulnerability
            
            // Knockback
            this.velocity.y = -200;
        }
    }
    
    public addScore(points: number) {
        this.score += points;
        this.game.addScore(points);
    }
    
    public collectGear() {
        this.collectedGears++;
        this.game.collectGear();
    }
    
    public hasAllGears(): boolean {
        return this.collectedGears >= 3;
    }
    
    public setCheckpoint(x: number, y: number) {
        this.checkpointPosition = { x, y };
    }
    
    public respawn() {
        this.position.x = this.checkpointPosition.x;
        this.position.y = this.checkpointPosition.y;
        this.velocity = { x: 0, y: 0 };
        this.state = 'idle';
        this.invulnerable = true;
        this.invulnerabilityTimer = 2;
    }
    
    public reset() {
        this.lives = 3;
        this.score = 0;
        this.collectedGears = 0;
        this.velocity = { x: 0, y: 0 };
        this.state = 'idle';
        this.canDash = true;
        this.dashCooldown = 0;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
    }
    
    public levelComplete() {
        // Handle level completion
        console.log('Level completed!');
        this.game.levelComplete();
    }
} 