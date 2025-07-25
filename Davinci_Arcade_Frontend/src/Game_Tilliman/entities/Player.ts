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
    
    // New abilities
    public canDoubleJump: boolean = false;
    public hasDoubleJumped: boolean = false;
    public jumpCount: number = 0;
    public maxJumps: number = 1;
    
    // Skin system
    public equippedSkin: string = 'classic';
    public ownedAbilities: string[] = [];
    
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
        
        // Jump with double jump support
        if (input.jump && !this.jumpPressed) {
            if (this.isGrounded) {
                // Ground jump
                this.velocity.y = PHYSICS.JUMP_VELOCITY;
                this.jumpCount = 1;
                this.hasDoubleJumped = false;
                this.jumpPressed = true;
            } else if (this.canDoubleJump && this.jumpCount < this.maxJumps && !this.hasDoubleJumped) {
                // Double jump
                this.velocity.y = PHYSICS.JUMP_VELOCITY * 0.8; // Slightly weaker second jump
                this.jumpCount++;
                this.hasDoubleJumped = true;
                this.jumpPressed = true;
            }
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
        
        // Reset jump count when grounded
        if (this.isGrounded) {
            this.jumpCount = 0;
            this.hasDoubleJumped = false;
        }
        
        // Keep player in bounds - SENIOR DEV FIX: Use dynamic level width instead of hardcoded 800
        const levelWidth = this.game.getLevelManager().getLevelWidth();
        this.position.x = Math.max(0, Math.min(levelWidth - this.size.x, this.position.x));
        
        // Debug log only when near boundaries
        if (this.position.x > levelWidth - this.size.x - 50) {
            console.log(`🎯 Player near right boundary: x=${this.position.x.toFixed(1)}, levelWidth=${levelWidth}, maxX=${levelWidth - this.size.x}`);
        }
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
    

    public render(ctx: CanvasRenderingContext2D, cameraX: number = 0) {
        // Get the correct skin asset
        const skinSuffix = this.equippedSkin === 'classic' ? '' : `_${this.equippedSkin}`;
        const assetName = `player_${this.state}${skinSuffix}`;
        const asset = this.game.getAssetManager().getAsset(assetName);
        
        if (asset) {
            // Blink when invulnerable
            if (this.invulnerable && Math.floor(this.invulnerabilityTimer * 10) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
            
            ctx.drawImage(asset, this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
            ctx.globalAlpha = 1;
            
            // Add special effects for legendary skin
            if (this.equippedSkin === 'timeLord') {
                this.renderTimeLordEffects(ctx, cameraX);
            }
        } else {
            // Fallback rectangle with skin colors
            const skinColors = {
                classic: this.invulnerable ? 'rgba(255, 0, 0, 0.5)' : 'orange',
                steampunk: this.invulnerable ? 'rgba(255, 0, 0, 0.5)' : '#8B4513',
                neon: this.invulnerable ? 'rgba(255, 0, 0, 0.5)' : '#00FFFF',
                golden: this.invulnerable ? 'rgba(255, 0, 0, 0.5)' : '#FFD700',
                timeLord: this.invulnerable ? 'rgba(255, 0, 0, 0.5)' : '#4B0082'
            };
            
            ctx.fillStyle = skinColors[this.equippedSkin as keyof typeof skinColors] || skinColors.classic;
            ctx.fillRect(this.position.x - cameraX, this.position.y, this.size.x, this.size.y);
        }
    }
    
    private renderTimeLordEffects(ctx: CanvasRenderingContext2D, cameraX: number) {
        // Add floating time particles around the player
        const time = Date.now() * 0.003;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 0; i < 5; i++) {
            const angle = time + i * 1.26;
            const radius = 20 + Math.sin(time * 2 + i) * 5;
            const x = this.position.x - cameraX + this.size.x / 2 + Math.cos(angle) * radius;
            const y = this.position.y + this.size.y / 2 + Math.sin(angle) * radius;
            
            ctx.save();
            ctx.globalAlpha = 0.6 + Math.sin(time * 3 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
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
    
    // Skin and ability management
    public equipSkin(skinId: string) {
        this.equippedSkin = skinId;
    }
    
    public addAbility(abilityId: string) {
        if (!this.ownedAbilities.includes(abilityId)) {
            this.ownedAbilities.push(abilityId);
            this.updateAbilities();
        }
    }
    
    public hasAbility(abilityId: string): boolean {
        return this.ownedAbilities.includes(abilityId);
    }
    
    private updateAbilities() {
        // Update player capabilities based on owned abilities
        this.canDoubleJump = this.hasAbility('doubleJump');
        this.maxJumps = this.canDoubleJump ? 2 : 1;
    }
    
    public initializeFromProfile(profile: any) {
        if (profile) {
            this.equippedSkin = profile.equippedSkin || 'classic';
            this.ownedAbilities = profile.ownedAbilities || [];
            this.updateAbilities();
        }
    }
} 