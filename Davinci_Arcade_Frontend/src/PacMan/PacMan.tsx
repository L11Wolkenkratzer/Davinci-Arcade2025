import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// Game Configuration
const GAME_CONFIG = {
  width: 800,
  height: 600,
  tileSize: 20,
  backgroundColor: '#0d0d0d'
};

// Game States Enum
enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

// Direction Enum
enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE'
}

// Ghost Types
enum GhostType {
  BLINKY = 'BLINKY',
  PINKY = 'PINKY',
  INKY = 'INKY',
  CLYDE = 'CLYDE'
}

// Level Map - 1 = wall, 0 = empty, 2 = dot, 3 = power pellet, 4 = pacman start, 5 = ghost start
const LEVEL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,1,1,1,1,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,2,0,0,0,5,5,0,0,0,2,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,2,0,0,1,5,5,1,0,0,2,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,0,2,0,0,0,1,5,5,0,0,2,0,0,1,5,5,1,0,0,2,0,0,5,5,1,0,0,0,2,0,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,5,5,0,0,2,0,0,1,1,1,1,0,0,2,0,0,5,5,1,0,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,3,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,1,1,1,1,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,4,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Entity Interface
interface Entity {
  x: number;
  y: number;
  direction: Direction;
  sprite?: Phaser.GameObjects.Sprite;
}

// Ghost Interface
interface Ghost extends Entity {
  type: GhostType;
  mode: 'chase' | 'scatter' | 'frightened';
  homeX: number;
  homeY: number;
}

// Main Scene Class
class GameScene extends Phaser.Scene {
  private gameState: GameState = GameState.MENU;
  private map: number[][] = [];
  private walls: Phaser.GameObjects.Group;
  private dots: Phaser.GameObjects.Group;
  private powerPellets: Phaser.GameObjects.Group;
  private pacman: Entity;
  private ghosts: Ghost[] = [];
  private score: number = 0;
  private lives: number = 3;
  private level: number = 1;
  
  // UI Elements
  private scoreText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;
  private gameOverText: Phaser.GameObjects.Text;
  private menuText: Phaser.GameObjects.Text;
  private titleText: Phaser.GameObjects.Text;
  
  // Input
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private enterKey: Phaser.Input.Keyboard.Key;
  
  // Timers
  private ghostModeTimer: Phaser.Time.TimerEvent;
  private gameTime: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create pixel art sprites using graphics
    this.createPixelSprites();
  }

  create() {
    this.map = LEVEL_MAP.map(row => [...row]);
    
    // Initialize groups
    this.walls = this.add.group();
    this.dots = this.add.group();
    this.powerPellets = this.add.group();
    
    // Setup input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
    // Initialize game
    this.initializeLevel();
    this.createUI();
    this.showMenu();
    
    // Setup input handlers
    this.spaceKey.on('down', this.handleSpaceKey, this);
    this.enterKey.on('down', this.handleEnterKey, this);
  }

  private createPixelSprites() {
    // Pac-Man sprite
    const pacmanGraphics = this.add.graphics();
    pacmanGraphics.fillStyle(0xFFFF00);
    pacmanGraphics.fillCircle(10, 10, 8);
    pacmanGraphics.generateTexture('pacman', 20, 20);
    pacmanGraphics.destroy();

    // Ghost sprites
    const ghostColors = [0xFF0000, 0xFFC0CB, 0x00FFFF, 0xFFA500];
    ghostColors.forEach((color, index) => {
      const ghostGraphics = this.add.graphics();
      ghostGraphics.fillStyle(color);
      ghostGraphics.fillRoundedRect(2, 2, 16, 16, 8);
      ghostGraphics.generateTexture(`ghost${index}`, 20, 20);
      ghostGraphics.destroy();
    });

    // Wall sprite
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x0000FF);
    wallGraphics.fillRect(0, 0, 20, 20);
    wallGraphics.generateTexture('wall', 20, 20);
    wallGraphics.destroy();

    // Dot sprite
    const dotGraphics = this.add.graphics();
    dotGraphics.fillStyle(0xFFFFFF);
    dotGraphics.fillCircle(10, 10, 2);
    dotGraphics.generateTexture('dot', 20, 20);
    dotGraphics.destroy();

    // Power pellet sprite
    const powerGraphics = this.add.graphics();
    powerGraphics.fillStyle(0xFFFFFF);
    powerGraphics.fillCircle(10, 10, 6);
    powerGraphics.generateTexture('powerPellet', 20, 20);
    powerGraphics.destroy();
  }

  private initializeLevel() {
    // Clear existing entities
    this.walls.clear(true, true);
    this.dots.clear(true, true);
    this.powerPellets.clear(true, true);
    this.ghosts = [];

    // Create level from map
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const tileType = this.map[y][x];
        const pixelX = x * GAME_CONFIG.tileSize;
        const pixelY = y * GAME_CONFIG.tileSize;

        switch (tileType) {
          case 1: // Wall
            const wall = this.add.sprite(pixelX, pixelY, 'wall');
            wall.setOrigin(0, 0);
            this.walls.add(wall);
            break;
          
          case 2: // Dot
            const dot = this.add.sprite(pixelX, pixelY, 'dot');
            dot.setOrigin(0, 0);
            this.dots.add(dot);
            break;
          
          case 3: // Power pellet
            const powerPellet = this.add.sprite(pixelX, pixelY, 'powerPellet');
            powerPellet.setOrigin(0, 0);
            this.powerPellets.add(powerPellet);
            break;
          
          case 4: // Pac-Man start
            this.pacman = {
              x: x,
              y: y,
              direction: Direction.NONE,
              sprite: this.add.sprite(pixelX, pixelY, 'pacman')
            };
            this.pacman.sprite.setOrigin(0, 0);
            break;
          
          case 5: // Ghost start
            if (this.ghosts.length < 4) {
              const ghostType = [GhostType.BLINKY, GhostType.PINKY, GhostType.INKY, GhostType.CLYDE][this.ghosts.length];
              const ghost: Ghost = {
                x: x,
                y: y,
                direction: Direction.UP,
                type: ghostType,
                mode: 'scatter',
                homeX: x,
                homeY: y,
                sprite: this.add.sprite(pixelX, pixelY, `ghost${this.ghosts.length}`)
              };
              ghost.sprite.setOrigin(0, 0);
              this.ghosts.push(ghost);
            }
            break;
        }
      }
    }
  }

  private createUI() {
    // Score text
    this.scoreText = this.add.text(20, 20, `SCORE: ${this.score}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#00FFFF'
    });

    // Lives text
    this.livesText = this.add.text(20, 50, `LIVES: ${this.lives}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#00FFFF'
    });

    // Title text (hidden initially)
    this.titleText = this.add.text(GAME_CONFIG.width / 2, 150, 'PAC-MAN', {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: '#8B0000'
    }).setOrigin(0.5);

    // Menu text (hidden initially)
    this.menuText = this.add.text(GAME_CONFIG.width / 2, 300, 'PRESS ENTER TO START\nSPACE FOR MENU', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#00FFFF',
      align: 'center'
    }).setOrigin(0.5);

    // Game over text (hidden initially)
    this.gameOverText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, 'GAME OVER\nPRESS ENTER TO RESTART', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#FF0000',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
  }

  private showMenu() {
    this.gameState = GameState.MENU;
    this.titleText.setVisible(true);
    this.menuText.setVisible(true);
    this.gameOverText.setVisible(false);
    
    // Hide game elements
    if (this.pacman.sprite) this.pacman.sprite.setVisible(false);
    this.ghosts.forEach(ghost => ghost.sprite.setVisible(false));
    this.walls.setVisible(false);
    this.dots.setVisible(false);
    this.powerPellets.setVisible(false);
    this.scoreText.setVisible(false);
    this.livesText.setVisible(false);
  }

  private startGame() {
    this.gameState = GameState.PLAYING;
    this.titleText.setVisible(false);
    this.menuText.setVisible(false);
    this.gameOverText.setVisible(false);
    
    // Show game elements
    if (this.pacman.sprite) this.pacman.sprite.setVisible(true);
    this.ghosts.forEach(ghost => ghost.sprite.setVisible(true));
    this.walls.setVisible(true);
    this.dots.setVisible(true);
    this.powerPellets.setVisible(true);
    this.scoreText.setVisible(true);
    this.livesText.setVisible(true);

    // Start ghost mode timer
    this.ghostModeTimer = this.time.addEvent({
      delay: 7000,
      callback: this.switchGhostMode,
      callbackScope: this,
      loop: true
    });
  }

  private handleSpaceKey() {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      this.showMenu();
    } else if (this.gameState === GameState.PAUSED) {
      this.startGame();
    }
  }

  private handleEnterKey() {
    if (this.gameState === GameState.MENU || this.gameState === GameState.GAME_OVER) {
      if (this.gameState === GameState.GAME_OVER) {
        this.resetGame();
      }
      this.startGame();
    }
  }

  private resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.initializeLevel();
    this.updateUI();
  }

  update(time: number, delta: number) {
    if (this.gameState !== GameState.PLAYING) return;

    this.gameTime += delta;
    this.handleInput();
    this.updatePacman();
    this.updateGhosts();
    this.checkCollisions();
    this.checkWinCondition();
  }

  private handleInput() {
    let newDirection = this.pacman.direction;

    if (this.cursors.left.isDown) {
      newDirection = Direction.LEFT;
    } else if (this.cursors.right.isDown) {
      newDirection = Direction.RIGHT;
    } else if (this.cursors.up.isDown) {
      newDirection = Direction.UP;
    } else if (this.cursors.down.isDown) {
      newDirection = Direction.DOWN;
    }

    // Check if new direction is valid
    if (this.canMove(this.pacman.x, this.pacman.y, newDirection)) {
      this.pacman.direction = newDirection;
    }
  }

  private updatePacman() {
    if (this.pacman.direction === Direction.NONE) return;

    let newX = this.pacman.x;
    let newY = this.pacman.y;

    switch (this.pacman.direction) {
      case Direction.LEFT:
        newX--;
        break;
      case Direction.RIGHT:
        newX++;
        break;
      case Direction.UP:
        newY--;
        break;
      case Direction.DOWN:
        newY++;
        break;
    }

    // Handle screen wrapping
    if (newX < 0) newX = this.map[0].length - 1;
    if (newX >= this.map[0].length) newX = 0;

    if (this.canMove(newX, newY, Direction.NONE)) {
      this.pacman.x = newX;
      this.pacman.y = newY;
      this.pacman.sprite.x = newX * GAME_CONFIG.tileSize;
      this.pacman.sprite.y = newY * GAME_CONFIG.tileSize;

      // Rotate pac-man based on direction
      switch (this.pacman.direction) {
        case Direction.LEFT:
          this.pacman.sprite.setRotation(Math.PI);
          break;
        case Direction.RIGHT:
          this.pacman.sprite.setRotation(0);
          break;
        case Direction.UP:
          this.pacman.sprite.setRotation(-Math.PI / 2);
          break;
        case Direction.DOWN:
          this.pacman.sprite.setRotation(Math.PI / 2);
          break;
      }
    } else {
      this.pacman.direction = Direction.NONE;
    }
  }

  private updateGhosts() {
    this.ghosts.forEach(ghost => {
      // Simple AI: random direction changes
      if (Math.random() < 0.02) {
        const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        const validDirections = directions.filter(dir => 
          this.canMove(ghost.x, ghost.y, dir)
        );
        
        if (validDirections.length > 0) {
          ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        }
      }

      let newX = ghost.x;
      let newY = ghost.y;

      switch (ghost.direction) {
        case Direction.LEFT:
          newX--;
          break;
        case Direction.RIGHT:
          newX++;
          break;
        case Direction.UP:
          newY--;
          break;
        case Direction.DOWN:
          newY++;
          break;
      }

      // Handle screen wrapping
      if (newX < 0) newX = this.map[0].length - 1;
      if (newX >= this.map[0].length) newX = 0;

      if (this.canMove(newX, newY, Direction.NONE)) {
        ghost.x = newX;
        ghost.y = newY;
        ghost.sprite.x = newX * GAME_CONFIG.tileSize;
        ghost.sprite.y = newY * GAME_CONFIG.tileSize;
      }
    });
  }

  private canMove(x: number, y: number, direction: Direction): boolean {
    if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) {
      return false;
    }
    return this.map[y][x] !== 1;
  }

  private checkCollisions() {
    // Check dot collection
    this.dots.children.entries.forEach(dot => {
      const dotSprite = dot as Phaser.GameObjects.Sprite;
      const dotX = Math.floor(dotSprite.x / GAME_CONFIG.tileSize);
      const dotY = Math.floor(dotSprite.y / GAME_CONFIG.tileSize);
      
      if (this.pacman.x === dotX && this.pacman.y === dotY) {
        this.collectDot(dotSprite);
      }
    });

    // Check power pellet collection
    this.powerPellets.children.entries.forEach(pellet => {
      const pelletSprite = pellet as Phaser.GameObjects.Sprite;
      const pelletX = Math.floor(pelletSprite.x / GAME_CONFIG.tileSize);
      const pelletY = Math.floor(pelletSprite.y / GAME_CONFIG.tileSize);
      
      if (this.pacman.x === pelletX && this.pacman.y === pelletY) {
        this.collectPowerPellet(pelletSprite);
      }
    });

    // Check ghost collisions
    this.ghosts.forEach(ghost => {
      if (this.pacman.x === ghost.x && this.pacman.y === ghost.y) {
        if (ghost.mode === 'frightened') {
          this.eatGhost(ghost);
        } else {
          this.pacmanDie();
        }
      }
    });
  }

  private collectDot(dot: Phaser.GameObjects.Sprite) {
    dot.destroy();
    this.score += 10;
    this.updateUI();
  }

  private collectPowerPellet(pellet: Phaser.GameObjects.Sprite) {
    pellet.destroy();
    this.score += 50;
    this.frightenGhosts();
    this.updateUI();
  }

  private frightenGhosts() {
    this.ghosts.forEach(ghost => {
      ghost.mode = 'frightened';
      ghost.sprite.setTint(0x0000FF);
    });

    // Timer to end frightened mode
    this.time.delayedCall(8000, () => {
      this.ghosts.forEach(ghost => {
        ghost.mode = 'chase';
        ghost.sprite.clearTint();
      });
    });
  }

  private eatGhost(ghost: Ghost) {
    this.score += 200;
    ghost.x = ghost.homeX;
    ghost.y = ghost.homeY;
    ghost.sprite.x = ghost.homeX * GAME_CONFIG.tileSize;
    ghost.sprite.y = ghost.homeY * GAME_CONFIG.tileSize;
    ghost.mode = 'scatter';
    ghost.sprite.clearTint();
    this.updateUI();
  }

  private pacmanDie() {
    this.lives--;
    this.updateUI();
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.respawnPacman();
    }
  }

  private respawnPacman() {
    // Find pac-man start position
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (LEVEL_MAP[y][x] === 4) {
          this.pacman.x = x;
          this.pacman.y = y;
          this.pacman.sprite.x = x * GAME_CONFIG.tileSize;
          this.pacman.sprite.y = y * GAME_CONFIG.tileSize;
          this.pacman.direction = Direction.NONE;
          return;
        }
      }
    }
  }

  private switchGhostMode() {
    this.ghosts.forEach(ghost => {
      if (ghost.mode !== 'frightened') {
        ghost.mode = ghost.mode === 'chase' ? 'scatter' : 'chase';
      }
    });
  }

  private checkWinCondition() {
    if (this.dots.children.size === 0 && this.powerPellets.children.size === 0) {
      this.level++;
      this.initializeLevel();
      this.updateUI();
    }
  }

  private gameOver() {
    this.gameState = GameState.GAME_OVER;
    this.gameOverText.setVisible(true);
    
    if (this.ghostModeTimer) {
      this.ghostModeTimer.destroy();
    }
  }

  private updateUI() {
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.livesText.setText(`LIVES: ${this.lives}`);
  }
}

// React Component
const PacMan: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.width,
        height: GAME_CONFIG.height,
        parent: gameRef.current,
        backgroundColor: GAME_CONFIG.backgroundColor,
        scene: GameScene,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      phaserGameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="pacman-game-container">
      <div className="arcade-header">
        <div className="header-left">
          <div className="user-circle">P</div>
          <div className="user-text">PLAYER</div>
        </div>
        <div className="header-center">
          <h1 className="arcade-title">PAC-MAN ARCADE</h1>
        </div>
        <div className="header-right">
          <div className="clock">2025</div>
          <div className="info-circle">?</div>
        </div>
      </div>
      
      <div className="game-area">
        <div ref={gameRef} className="phaser-game" />
        
        <div className="controls-info">
          <div className="control-item">
            <span className="key">↑↓←→</span>
            <span className="action">MOVE</span>
          </div>
          <div className="control-item">
            <span className="key">SPACE</span>
            <span className="action">MENU</span>
          </div>
          <div className="control-item">
            <span className="key">ENTER</span>
            <span className="action">SELECT</span>
          </div>
        </div>
      </div>
      
      <div className="arcade-footer">
        <div className="footer-content">
          <div className="footer-names">
            <span className="footer-text">CLASSIC</span>
            <span className="footer-divider">•</span>
            <span className="footer-text">ARCADE</span>
            <span className="footer-divider">•</span>
            <span className="footer-text">GAMING</span>
          </div>
          <div className="footer-year">2025</div>
        </div>
      </div>
    </div>
  );
};

export default PacMan;
