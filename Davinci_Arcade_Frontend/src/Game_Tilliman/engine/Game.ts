import type { GameOptions, InputState, GameState, Entity } from '../types/GameTypes';
import { InputHandler } from './InputHandler';
import { AssetManager } from './AssetManager';
import { CollisionManager } from './CollisionManager';
import { LevelManager } from './LevelManager';
import { Player } from '../entities/Player';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private options: GameOptions;
    private inputHandler: InputHandler;
    private assetManager: AssetManager;
    private collisionManager: CollisionManager;
    private levelManager: LevelManager;
    
    private player: Player | null = null;
    private entities: Entity[] = [];
    private gameState: GameState = 'menu';
    private lastTime: number = 0;
    private animationFrameId: number | null = null;
    
    private score: number = 0;
    private lives: number = 3;
    private collectedGears: number = 0;
    
    private textColor: string = '#0ff';
    private strokeColor: string = '#0d0d0d';

    constructor(canvas: HTMLCanvasElement, options: GameOptions) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.options = options;
        
        // Lese CSS-Variablen für Textfarben
        const rootStyle = getComputedStyle(document.documentElement);
        this.textColor = rootStyle.getPropertyValue('--primary-cyan').trim() || this.textColor;
        this.strokeColor = rootStyle.getPropertyValue('--dark-bg').trim() || this.strokeColor;

        this.inputHandler = new InputHandler();
        this.assetManager = new AssetManager();
        this.collisionManager = new CollisionManager();
        this.levelManager = new LevelManager(this);
        
        this.init();
    }
    
    private async init() {
        // Lade Assets
        await this.assetManager.loadAssets();
        
        // Initialisiere Level
        this.levelManager.loadLevel(1);
    }
    
    public start() {
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    public pause() {
        this.gameState = 'paused';
    }
    
    public resume() {
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    public restart() {
        // Reset all game state
        this.score = 0;
        this.lives = 3;
        this.collectedGears = 0;
        this.entities = [];
        
        // Notify UI
        this.options.onScoreChange(this.score);
        this.options.onLivesChange(this.lives);
        this.options.onGearsCollected(this.collectedGears);
        
        // Restart from level 1
        this.levelManager.loadLevel(1);
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    private gameLoop = () => {
        if (this.gameState !== 'playing') {
            return;
        }
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };
    
    private update(deltaTime: number) {
        // Limit deltaTime to prevent large jumps
        const clampedDeltaTime = Math.min(deltaTime, 0.1);
        
        // Update input
        this.inputHandler.update();
        
        // Handle pause
        if (this.inputHandler.getState().pause) {
            this.pause();
            return;
        }
        
        // Update player
        if (this.player) {
            this.player.handleInput(this.inputHandler.getState());
            this.player.update(clampedDeltaTime);
        }
        
        // Update all entities
        for (const entity of this.entities) {
            if (entity.active) {
                entity.update(clampedDeltaTime);
            }
        }
        
        // Check collisions
        this.collisionManager.checkCollisions(this.player, this.entities);
        
        // Remove inactive entities
        this.entities = this.entities.filter(entity => entity.active);
        
        // Check win/lose conditions
        this.checkGameState();
    }
    
    private render() {

        // Kamera-Logik
        let cameraX = 0;
        const levelWidth = this.levelManager.getLevelWidth();
        if (this.player) {
            // Kamera folgt dem Spieler, bleibt aber im Levelbereich
            cameraX = this.player.position.x + this.player.size.x / 2 - this.canvas.width / 2;
            cameraX = Math.max(0, Math.min(cameraX, levelWidth - this.canvas.width));
        }

        // Clear canvas
        this.ctx.fillStyle = '#87CEEB'; // Sky blue background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render background elements (clouds, etc.)
        this.renderBackground(cameraX);

        // Render all entities
        for (const entity of this.entities) {
            if (entity.active) {
                entity.render(this.ctx, cameraX);
            }
        }

        // Render player on top
        if (this.player) {
            this.player.render(this.ctx, cameraX);
        }

        // Render UI elements (nicht verschieben)
        this.renderUI();
    }

    // Passe renderBackground an, damit Wolken mit Kamera mitwandern (optional, für Parallax-Effekt)
    private renderBackground(cameraX: number = 0) {
        this.ctx.save();
        this.ctx.translate(-cameraX * 0.5, 0); // Parallax-Effekt für Hintergrund
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

        // Cloud 1
        this.ctx.beginPath();
        this.ctx.arc(100, 100, 30, 0, Math.PI * 2);
        this.ctx.arc(130, 100, 40, 0, Math.PI * 2);
        this.ctx.arc(160, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // Cloud 2
        this.ctx.beginPath();
        this.ctx.arc(500, 150, 25, 0, Math.PI * 2);
        this.ctx.arc(525, 150, 35, 0, Math.PI * 2);
        this.ctx.arc(550, 150, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

    }
    
    private renderUI() {
        // Setze Textfarben aus CSS-Variablen
        this.ctx.fillStyle = this.textColor;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = 3;
        this.ctx.font = '20px "Press Start 2P", cursive';

        const text = `Leben: ${this.lives} | Zahnräder: ${this.collectedGears}/3 | Punkte: ${this.score}`;
        this.ctx.strokeText(text, 10, 30);
        this.ctx.fillText(text, 10, 30);
    }
    
    private checkGameState() {
        if (!this.player) return;
        
        // Check if player is out of bounds
        if (this.player.position.y > this.canvas.height + 100) {
            this.playerDeath();
        }
        
        // Check if all gears collected
        if (this.collectedGears >= 3) {
            // Enable goal
            const goal = this.entities.find(e => e.type === 'goal');
            if (goal) {
                // Goal becomes active
            }
        }
    }
    
    private playerDeath() {
        this.lives--;
        this.options.onLivesChange(this.lives);
        
        if (this.lives <= 0) {
            this.gameState = 'gameOver';
            this.options.onGameOver();
        } else {
            // Respawn player
            this.levelManager.respawnPlayer();
        }
    }
    
    public addEntity(entity: Entity) {
        this.entities.push(entity);
    }
    
    public removeEntity(entity: Entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
    
    public setPlayer(player: Player) {
        this.player = player;
    }
    
    public getPlayer(): Player | null {
        return this.player;
    }
    
    public getAssetManager(): AssetManager {
        return this.assetManager;
    }
    
    public addScore(points: number) {
        this.score += points;
        this.options.onScoreChange(this.score);
    }
    
    public collectGear() {
        this.collectedGears++;
        this.options.onGearsCollected(this.collectedGears);
        this.addScore(100);
    }
    
    public damagePlayer(damage: number) {
        if (this.player && !this.player.invulnerable) {
            this.player.takeDamage(damage);
            this.lives = this.player.lives;
            this.options.onLivesChange(this.lives);
            
            if (this.lives <= 0) {
                this.gameState = 'gameOver';
                this.options.onGameOver();
            }
        }
    }
    
    public levelComplete() {
        this.gameState = 'levelComplete';
        this.addScore(500); // Bonus points for completing level
        this.options.onLevelComplete();
        
        // Progress to next level after a short delay
        setTimeout(() => {
            this.nextLevel();
        }, 2000);
    }
    
    public nextLevel() {
        // Clear current entities
        this.entities = [];
        this.collectedGears = 0;
        this.options.onGearsCollected(this.collectedGears);
        
        // Load next level
        this.levelManager.nextLevel();
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    public clearEntities() {
        this.entities = [];
    }
    
    public destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.inputHandler.destroy();
    }
} 