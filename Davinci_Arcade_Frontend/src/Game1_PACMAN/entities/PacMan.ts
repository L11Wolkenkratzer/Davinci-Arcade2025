import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { MazeManager } from '../managers/MazeManager';

export class PacMan extends Phaser.Physics.Arcade.Sprite {
    public currentDirection: 'up' | 'down' | 'left' | 'right' = 'right';
    private nextDirection: 'up' | 'down' | 'left' | 'right' = 'right';
    private mouthAngle = 0;
    private gridX: number;
    private gridY: number;
    private moveSpeed = 2;
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, '');

        this.gridX = Math.floor(x / GameScene.CELL_SIZE);
        this.gridY = Math.floor(y / GameScene.CELL_SIZE);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set collision body
        this.setSize(GameScene.CELL_SIZE - 4, GameScene.CELL_SIZE - 4);
        this.setDisplaySize(GameScene.CELL_SIZE, GameScene.CELL_SIZE);

        // Create graphics object for drawing
        this.graphics = scene.add.graphics();

        this.drawPacMan();
    }

    public updateMovement(nextDirection: string, mazeManager: MazeManager): void {
        this.nextDirection = nextDirection as 'up' | 'down' | 'left' | 'right';

        // Try to change direction if possible
        if (this.canChangeDirection(this.nextDirection, mazeManager)) {
            this.currentDirection = this.nextDirection;
        }

        // Move in current direction
        this.moveInDirection(mazeManager);
        this.updateGridPosition();
    }

    private canChangeDirection(direction: string, mazeManager: MazeManager): boolean {
        let testX = this.gridX;
        let testY = this.gridY;

        switch (direction) {
            case 'up': testY--; break;
            case 'down': testY++; break;
            case 'left': testX--; break;
            case 'right': testX++; break;
        }

        return mazeManager.isValidPosition(testX, testY);
    }

    private moveInDirection(mazeManager: MazeManager): void {
        let newX = this.x;
        let newY = this.y;

        switch (this.currentDirection) {
            case 'up':
                newY -= this.moveSpeed;
                break;
            case 'down':
                newY += this.moveSpeed;
                break;
            case 'left':
                newX -= this.moveSpeed;
                break;
            case 'right':
                newX += this.moveSpeed;
                break;
        }

        // Check if movement is valid
        const gridX = Math.floor(newX / GameScene.CELL_SIZE);
        const gridY = Math.floor(newY / GameScene.CELL_SIZE);

        if (mazeManager.isValidPosition(gridX, gridY)) {
            this.x = newX;
            this.y = newY;

            // Handle tunnel effect
            if (this.x < 0) {
                this.x = (GameScene.COLS - 1) * GameScene.CELL_SIZE;
            } else if (this.x >= GameScene.COLS * GameScene.CELL_SIZE) {
                this.x = 0;
            }
        }
    }

    private updateGridPosition(): void {
        this.gridX = Math.floor(this.x / GameScene.CELL_SIZE);
        this.gridY = Math.floor(this.y / GameScene.CELL_SIZE);
    }

    public updateAnimation(): void {
        this.mouthAngle += 0.3;
        this.drawPacMan();
    }

    private drawPacMan(): void {
        this.graphics.clear();

        const radius = GameScene.CELL_SIZE / 2 - 2;
        const centerX = this.x + GameScene.CELL_SIZE / 2;
        const centerY = this.y + GameScene.CELL_SIZE / 2;

        // Calculate mouth opening
        const mouthSize = Math.sin(this.mouthAngle) * 0.7 + 0.3;
        let startAngle = 0;
        let endAngle = Math.PI * 2;

        switch (this.currentDirection) {
            case 'right':
                startAngle = mouthSize * 0.6;
                endAngle = Math.PI * 2 - mouthSize * 0.6;
                break;
            case 'left':
                startAngle = Math.PI - mouthSize * 0.6;
                endAngle = Math.PI + mouthSize * 0.6;
                break;
            case 'up':
                startAngle = Math.PI * 1.5 - mouthSize * 0.6;
                endAngle = Math.PI * 1.5 + mouthSize * 0.6;
                break;
            case 'down':
                startAngle = Math.PI * 0.5 - mouthSize * 0.6;
                endAngle = Math.PI * 0.5 + mouthSize * 0.6;
                break;
        }

        // Draw Pac-Man with neon glow effect
        this.graphics.fillStyle(0xffff00);
        this.graphics.lineStyle(3, 0xffaa00);

        // Outer glow
        this.graphics.fillStyle(0xffff00, 0.3);
        this.graphics.fillCircle(centerX, centerY, radius + 5);

        // Main body
        this.graphics.fillStyle(0xffff00);
        this.graphics.beginPath();
        this.graphics.arc(centerX, centerY, radius, startAngle, endAngle);
        this.graphics.lineTo(centerX, centerY);
        this.graphics.closePath();
        this.graphics.fillPath();
        this.graphics.strokePath();
    }

    public resetPosition(): void {
        this.x = 9 * GameScene.CELL_SIZE;
        this.y = 15 * GameScene.CELL_SIZE;
        this.gridX = 9;
        this.gridY = 15;
        this.currentDirection = 'right';
        this.nextDirection = 'right';
    }
}
