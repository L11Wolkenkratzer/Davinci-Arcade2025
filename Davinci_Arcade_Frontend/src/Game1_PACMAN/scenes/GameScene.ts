import Phaser from 'phaser';
import { PacMan } from '../entities/PacMan';
import { Ghost } from '../entities/Ghost';
import { MazeManager } from '../managers/MazeManager';
import { UIManager } from '../managers/UIManager';

export class GameScene extends Phaser.Scene {
    // Game constants
    public static readonly CELL_SIZE = 20;
    public static readonly ROWS = 21;
    public static readonly COLS = 19;
    public static readonly POINTS_DOT = 10;
    public static readonly POINTS_POWER_PELLET = 50;
    public static readonly POINTS_GHOST = 200;

    // Managers
    private mazeManager!: MazeManager;
    private uiManager!: UIManager;

    // Entities
    private pacman!: PacMan;
    private ghosts!: Phaser.GameObjects.Group;

    // Game state
    private gameState: 'playing' | 'paused' = 'playing';
    private powerMode = false;
    private powerModeTimer = 0;
    private dotsRemaining = 0;

    // Fix für Instant Death
    private invulnerable = false;
    private invulnerabilityTimer = 0;
    private lastCollisionTime = 0;

    // Input
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: any;

    // UI DOM Elements
    private gameContainer!: Phaser.GameObjects.DOMElement;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void {
        this.createGameContainer();
        this.initializeGame();
        this.createManagers();
        this.createEntities();
        this.setupInput();
        this.setupCollisions();
        this.startGameLoop();
    }

    private createGameContainer(): void {
        // Create DOM container for UI
        const gameHTML = `
            <div class="game-screen">
                <div class="game-header">
                    <button class="pause-button" id="pauseBtn">⏸️ PAUSE</button>
                    <h2 class="screen-title">PAC-MAN</h2>
                    <button class="quit-button" id="quitBtn">🏠 LOBBY</button>
                </div>
                <div class="game-ui" id="gameUI">
                    <div class="ui-top">
                        <div class="score-info">
                            <span id="scoreDisplay">SCORE: 0</span>
                            <span id="highScoreDisplay">HIGH: 0</span>
                        </div>
                        <div class="level-info" id="levelDisplay">LEVEL 1</div>
                        <div class="lives-info" id="livesDisplay">
                            <span>LIVES: </span>
                            <span id="livesIcons">🟡🟡🟡</span>
                        </div>
                    </div>
                    <div class="power-mode-indicator" id="powerModeIndicator" style="display: none;">
                        POWER MODE! <span id="powerTimer">0</span>s
                    </div>
                </div>
                <div class="game-instructions">
                    <span>🎮 Pfeiltasten: Bewegung</span>
                    <span>⏸️ SPACE: Pause</span>
                    <span>🏠 ESC: Lobby</span>
                </div>
            </div>
        `;

        this.gameContainer = this.add.dom(0, 0).createFromHTML(gameHTML);
        this.gameContainer.setOrigin(0);
        this.gameContainer.setPosition(-190, -210);

        // Setup button events
        const pauseBtn = this.gameContainer.getChildByID('pauseBtn') as HTMLButtonElement;
        const quitBtn = this.gameContainer.getChildByID('quitBtn') as HTMLButtonElement;

        pauseBtn.addEventListener('click', () => this.togglePause());
        quitBtn.addEventListener('click', () => this.scene.start('LobbyScene'));
    }

    private initializeGame(): void {
        // Reset game state
        this.registry.set('score', 0);
        this.registry.set('lives', 3);
        this.registry.set('powerMode', false);
        this.registry.set('powerModeTimer', 0);
        this.gameState = 'playing';
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.lastCollisionTime = 0;
    }

    private createManagers(): void {
        this.mazeManager = new MazeManager(this);
        this.uiManager = new UIManager(this);

        this.dotsRemaining = this.mazeManager.countDots();
    }

    private createEntities(): void {
        // Create Pac-Man
        this.pacman = new PacMan(this, 9 * GameScene.CELL_SIZE, 15 * GameScene.CELL_SIZE);

        // Create ghosts group
        this.ghosts = this.add.group();

        const ghostData = [
            { x: 9, y: 9, color: 0xff0000 },
            { x: 8, y: 10, color: 0xffb8ff },
            { x: 9, y: 10, color: 0xffb852 },
            { x: 10, y: 10, color: 0x00ffff }
        ];

        ghostData.forEach(data => {
            const ghost = new Ghost(
                this,
                data.x * GameScene.CELL_SIZE,
                data.y * GameScene.CELL_SIZE,
                data.color
            );
            this.ghosts.add(ghost);
        });
    }

    private setupInput(): void {
        this.cursors = this.input.keyboard?.createCursorKeys()!;
        this.wasdKeys = this.input.keyboard?.addKeys('W,S,A,D')!;

        this.input.keyboard?.on('keydown-SPACE', () => {
            this.togglePause();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            this.scene.start('LobbyScene');
        });
    }

    private setupCollisions(): void {
        // Pac-Man vs Ghosts collision mit Cooldown
        this.physics.add.overlap(this.pacman, this.ghosts, (pacman, ghost) => {
            const currentTime = this.time.now;
            if (currentTime - this.lastCollisionTime > 500) { // 500ms Cooldown
                this.handlePacManGhostCollision(pacman as PacMan, ghost as Ghost);
                this.lastCollisionTime = currentTime;
            }
        });
    }

    private startGameLoop(): void {
        // Main game update timer
        this.time.addEvent({
            delay: 100, // 10 FPS for game logic
            callback: this.updateGame,
            callbackScope: this,
            loop: true
        });

        // Power mode timer
        this.time.addEvent({
            delay: 50,
            callback: this.updatePowerMode,
            callbackScope: this,
            loop: true
        });

        // Invulnerability timer
        this.time.addEvent({
            delay: 100,
            callback: this.updateInvulnerability,
            callbackScope: this,
            loop: true
        });
    }

    private updateGame(): void {
        if (this.gameState !== 'playing') return;

        // Update Pac-Man
        this.updatePacMan();

        // Update ghosts
        this.ghosts.children.entries.forEach(ghost => {
            (ghost as Ghost).updateMovement(this.pacman, this.powerMode);
        });

        // Check for dots collection
        this.checkDotCollection();

        // Check win condition
        if (this.dotsRemaining <= 0) {
            this.handleLevelComplete();
        }
    }

    private updatePacMan(): void {
        let nextDirection = this.pacman.currentDirection;

        // Handle input
        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            nextDirection = 'up';
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            nextDirection = 'down';
        } else if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            nextDirection = 'left';
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            nextDirection = 'right';
        }

        this.pacman.updateMovement(nextDirection, this.mazeManager);
    }

    private updatePowerMode(): void {
        if (!this.powerMode || this.gameState !== 'playing') return;

        this.powerModeTimer--;
        this.registry.set('powerModeTimer', this.powerModeTimer);

        // Update UI
        const powerTimer = this.gameContainer.getChildByID('powerTimer') as HTMLSpanElement;
        if (powerTimer) {
            powerTimer.textContent = Math.ceil(this.powerModeTimer / 20).toString();
        }

        if (this.powerModeTimer <= 0) {
            this.endPowerMode();
        }
    }

    private updateInvulnerability(): void {
        if (this.invulnerable && this.invulnerabilityTimer > 0) {
            this.invulnerabilityTimer--;

            // Flicker effect
            this.pacman.setAlpha(this.invulnerabilityTimer % 10 < 5 ? 0.5 : 1);

            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
                this.pacman.setAlpha(1);
            }
        }
    }

    private checkDotCollection(): void {
        const gridX = Math.floor(this.pacman.x / GameScene.CELL_SIZE);
        const gridY = Math.floor(this.pacman.y / GameScene.CELL_SIZE);

        const cellType = this.mazeManager.getCellType(gridX, gridY);

        if (cellType === 0) { // Regular dot
            this.mazeManager.setCellType(gridX, gridY, 3); // Empty
            this.addScore(GameScene.POINTS_DOT);
            this.dotsRemaining--;
        } else if (cellType === 2) { // Power pellet
            this.mazeManager.setCellType(gridX, gridY, 3); // Empty
            this.addScore(GameScene.POINTS_POWER_PELLET);
            this.dotsRemaining--;
            this.startPowerMode();
        }
    }

    private startPowerMode(): void {
        this.powerMode = true;
        this.powerModeTimer = 600; // 30 seconds at 20 FPS
        this.registry.set('powerMode', true);
        this.registry.set('powerModeTimer', this.powerModeTimer);

        // Make ghosts vulnerable
        this.ghosts.children.entries.forEach(ghost => {
            (ghost as Ghost).makeVulnerable();
        });

        // Show power mode indicator
        const powerIndicator = this.gameContainer.getChildByID('powerModeIndicator') as HTMLDivElement;
        if (powerIndicator) {
            powerIndicator.style.display = 'block';
        }
    }

    private endPowerMode(): void {
        this.powerMode = false;
        this.registry.set('powerMode', false);

        // Reset ghosts
        this.ghosts.children.entries.forEach(ghost => {
            (ghost as Ghost).makeInvulnerable();
        });

        // Hide power mode indicator
        const powerIndicator = this.gameContainer.getChildByID('powerModeIndicator') as HTMLDivElement;
        if (powerIndicator) {
            powerIndicator.style.display = 'none';
        }
    }

    private handlePacManGhostCollision(pacman: PacMan, ghost: Ghost): void {
        if (this.invulnerable) return;

        if (ghost.isVulnerable) {
            // Eat ghost
            this.addScore(GameScene.POINTS_GHOST);
            ghost.resetPosition();
            ghost.makeInvulnerable();
        } else {
            // Pac-Man dies
            this.handlePacManDeath();
        }
    }

    private handlePacManDeath(): void {
        const lives = this.registry.get('lives') - 1;
        this.registry.set('lives', lives);
        this.updateLivesDisplay();

        if (lives <= 0) {
            this.handleGameOver();
        } else {
            this.invulnerable = true;
            this.invulnerabilityTimer = 60; // 3 seconds at 20 FPS
            this.resetPositions();
        }
    }

    private resetPositions(): void {
        this.pacman.resetPosition();
        this.ghosts.children.entries.forEach(ghost => {
            (ghost as Ghost).resetPosition();
        });
    }

    private handleLevelComplete(): void {
        const score = this.registry.get('score');
        const level = this.registry.get('level');
        const bonus = level * 1000;

        this.registry.set('score', score + bonus);
        this.registry.set('level', level + 1);

        const gameConfig = this.registry.get('gameConfig');
        if (gameConfig?.onGameComplete) {
            gameConfig.onGameComplete(score + bonus, true);
        }

        this.scene.start('WinScene');
    }

    private handleGameOver(): void {
        const score = this.registry.get('score');
        const gameConfig = this.registry.get('gameConfig');

        if (gameConfig?.onGameComplete) {
            gameConfig.onGameComplete(score, false);
        }

        this.scene.start('GameOverScene');
    }

    private addScore(points: number): void {
        const currentScore = this.registry.get('score');
        const newScore = currentScore + points;
        this.registry.set('score', newScore);

        // Update high score
        const highScore = this.registry.get('highScore');
        if (newScore > highScore) {
            this.registry.set('highScore', newScore);
            localStorage.setItem('pacman-highscore', newScore.toString());
        }

        this.updateScoreDisplay();
    }

    private updateScoreDisplay(): void {
        const scoreDisplay = this.gameContainer.getChildByID('scoreDisplay') as HTMLSpanElement;
        const highScoreDisplay = this.gameContainer.getChildByID('highScoreDisplay') as HTMLSpanElement;

        if (scoreDisplay) {
            scoreDisplay.textContent = `SCORE: ${this.registry.get('score').toLocaleString()}`;
        }
        if (highScoreDisplay) {
            highScoreDisplay.textContent = `HIGH: ${this.registry.get('highScore').toLocaleString()}`;
        }
    }

    private updateLivesDisplay(): void {
        const livesIcons = this.gameContainer.getChildByID('livesIcons') as HTMLSpanElement;
        if (livesIcons) {
            const lives = this.registry.get('lives');
            livesIcons.textContent = '🟡'.repeat(Math.max(0, lives));
        }
    }

    private togglePause(): void {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.scene.pause();
            this.scene.launch('PauseScene');
        } else {
            this.gameState = 'playing';
            this.scene.resume();
            this.scene.stop('PauseScene');
        }
    }

    update(): void {
        // Continuous updates (60 FPS)
        if (this.gameState === 'playing') {
            this.pacman.updateAnimation();
        }
    }
}
