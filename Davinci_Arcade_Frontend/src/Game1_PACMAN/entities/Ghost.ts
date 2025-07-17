import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { PacMan } from './PacMan';

export class Ghost extends Phaser.Physics.Arcade.Sprite {
    private gridX: number;
    private gridY: number;
    private direction: 'up' | 'down' | 'left' | 'right' = 'up';
    private originalColor: number;
    private moveSpeed = 1.5;
    public isVulnerable = false;
    private originalX: number;
    private originalY: number;
    private graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
        super(scene, x, y, '');

        this.originalColor = color;
        this.originalX = x;
        this.originalY = y;
        this.gridX = Math.floor(x / GameScene.CELL_SIZE);
        this.gridY = Math.floor(y / GameScene.CELL_SIZE);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set collision body
        this.setSize(GameScene.CELL_SIZE - 4, GameScene.CELL_SIZE - 4);
        this.setDisplaySize(GameScene.CELL_SIZE, GameScene.CELL_SIZE);

        // Create graphics object for drawing
        this.graphics = scene.add.graphics();

        this.drawGhost();
    }

    public updateMovement(pacman: PacMan, powerMode: boolean): void {
        // Simple AI: move towards/away from Pac-Man
        const targetX = powerMode ?
            this.x + (this.x - pacman.x) : // Move away if vulnerable
            pacman.x; // Move towards if not vulnerable
        const targetY = powerMode ?
            this.y + (this.y - pacman.y) :
            pacman.y;

        // Determine best direction
        const possibleDirections = this.getPossibleDirections();
        if (possibleDirections.length > 0) {
            this.direction = this.chooseBestDirection(possibleDirections, targetX, targetY);
        }

        this.moveInDirection();
        this.updateGridPosition();
    }

    private getPossibleDirections(): string[] {
        const scene = this.scene as GameScene;
        const mazeManager = (scene as any).mazeManager;
        const directions = [];

        if (mazeManager.isValidPosition(this.gridX, this.gridY - 1)) directions.push('up');
        if (mazeManager.isValidPosition(this.gridX, this.gridY + 1)) directions.push('down');
        if (mazeManager.isValidPosition(this.gridX - 1, this.gridY)) directions.push('left');
        if (mazeManager.isValidPosition(this.gridX + 1, this.gridY)) directions.push('right');

        return directions;
    }

    private chooseBestDirection(directions: string[], targetX: number, targetY: number): 'up' | 'down' | 'left' | 'right' {
        let bestDirection = directions[0] as 'up' | 'down' | 'left' | 'right';
        let bestDistance = Infinity;

        directions.forEach(dir => {
            let testX = this.x;
            let testY = this.y;

            switch (dir) {
                case 'up': testY -= GameScene.CELL_SIZE; break;
                case 'down': testY += GameScene.CELL_SIZE; break;
                case 'left': testX -= GameScene.CELL_SIZE; break;
                case 'right': testX += GameScene.CELL_SIZE; break;
            }

            const distance = Phaser.Math.Distance.Between(testX, testY, targetX, targetY);

            if (this.isVulnerable) {
                // Move away from target when vulnerable
                if (distance > bestDistance) {
                    bestDistance = distance;
                    bestDirection = dir as 'up' | 'down' | 'left' | 'right';
                }
            } else {
                // Move towards target when not vulnerable
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestDirection = dir as 'up' | 'down' | 'left' | 'right';
                }
            }
        });

        return bestDirection;
    }

    private moveInDirection(): void {
        switch (this.direction) {
            case 'up': this.y -= this.moveSpeed; break;
            case 'down': this.y += this.moveSpeed; break;
            case 'left': this.x -= this.moveSpeed; break;
            case 'right': this.x += this.moveSpeed; break;
        }
    }

    private updateGridPosition(): void {
        this.gridX = Math.floor(this.x / GameScene.CELL_SIZE);
        this.gridY = Math.floor(this.y / GameScene.CELL_SIZE);
    }

    private drawGhost(): void {
        this.graphics.clear();

        const cellSize = GameScene.CELL_SIZE;
        const centerX = this.x + cellSize / 2;
        const centerY = this.y + cellSize / 2;
        const color = this.isVulnerable ? 0x0000ff : this.originalColor;

        // Outer glow effect
        this.graphics.fillStyle(color, 0.3);
        this.graphics.fillCircle(centerX, centerY, cellSize / 2 + 3);

        // Ghost body
        this.graphics.fillStyle(color);
        this.graphics.lineStyle(2, 0x000000);

        // Main body (semicircle + rectangle)
        this.graphics.beginPath();
        this.graphics.arc(centerX, centerY, cellSize / 2 - 2, Math.PI, 0);
        this.graphics.lineTo(centerX + cellSize / 2 - 2, centerY + cellSize / 2 - 2);

        // Wavy bottom
        for (let i = 0; i < 4; i++) {
            const x = centerX - cellSize / 2 + 2 + (cellSize - 4) * (i / 4);
            const y = centerY + cellSize / 2 - 2 + (i % 2 === 0 ? -4 : 0);
            this.graphics.lineTo(x, y);
        }

        this.graphics.lineTo(centerX - cellSize / 2 + 2, centerY + cellSize / 2 - 2);
        this.graphics.closePath();
        this.graphics.fillPath();
        this.graphics.strokePath();

        // Eyes
        if (this.isVulnerable) {
            // Scared eyes
            this.graphics.fillStyle(0xffffff);
            this.graphics.fillRect(centerX - 6, centerY - 4, 2, 3);
            this.graphics.fillRect(centerX + 4, centerY - 4, 2, 3);
            this.graphics.fillRect(centerX - 4, centerY - 6, 2, 3);
            this.graphics.fillRect(centerX + 6, centerY - 6, 2, 3);
        } else {
            // Normal eyes
            this.graphics.fillStyle(0xffffff);
            this.graphics.fillRect(centerX - 6, centerY - 6, 3, 4);
            this.graphics.fillRect(centerX + 3, centerY - 6, 3, 4);

            this.graphics.fillStyle(0x000000);
            this.graphics.fillRect(centerX - 5, centerY - 5, 2, 2);
            this.graphics.fillRect(centerX + 4, centerY - 5, 2, 2);
        }
    }

    public makeVulnerable(): void {
        this.isVulnerable = true;
        this.drawGhost();
    }

    public makeInvulnerable(): void {
        this.isVulnerable = false;
        this.drawGhost();
    }

    public resetPosition(): void {
        this.x = this.originalX;
        this.y = this.originalY;
        this.gridX = Math.floor(this.originalX / GameScene.CELL_SIZE);
        this.gridY = Math.floor(this.originalY / GameScene.CELL_SIZE);
        this.isVulnerable = false;
        this.drawGhost();
    }
}
