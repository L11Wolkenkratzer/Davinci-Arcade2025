import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class MazeManager {
    private scene: GameScene;
    private maze: number[][];
    private mazeGraphics: Phaser.GameObjects.Graphics;

    // Maze layout - 0: dot, 1: wall, 2: power pellet, 3: empty
    private readonly initialMaze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,2,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,2,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1],
        [3,3,3,1,0,1,3,3,3,3,3,3,3,1,0,1,3,3,3],
        [1,1,1,1,0,1,3,1,1,3,1,1,3,1,0,1,1,1,1],
        [3,3,3,3,0,3,3,1,3,3,3,1,3,3,0,3,3,3,3],
        [1,1,1,1,0,1,3,1,1,1,1,1,3,1,0,1,1,1,1],
        [3,3,3,1,0,1,3,3,3,3,3,3,3,1,0,1,3,3,3],
        [1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,2,1],
        [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    constructor(scene: GameScene) {
        this.scene = scene;
        this.maze = this.initialMaze.map(row => [...row]);
        this.mazeGraphics = scene.add.graphics();
        this.drawMaze();
    }

    public isValidPosition(x: number, y: number): boolean {
        if (x < 0 || x >= GameScene.COLS || y < 0 || y >= GameScene.ROWS) {
            return x >= 0 && x < GameScene.COLS; // Allow horizontal wrapping
        }
        return this.maze[y][x] !== 1;
    }

    public getCellType(x: number, y: number): number {
        if (x < 0 || x >= GameScene.COLS || y < 0 || y >= GameScene.ROWS) {
            return 3; // Empty
        }
        return this.maze[y][x];
    }

    public setCellType(x: number, y: number, type: number): void {
        if (x >= 0 && x < GameScene.COLS && y >= 0 && y < GameScene.ROWS) {
            this.maze[y][x] = type;
            this.redrawCell(x, y);
        }
    }

    public countDots(): number {
        let count = 0;
        this.maze.forEach(row => {
            row.forEach(cell => {
                if (cell === 0 || cell === 2) count++;
            });
        });
        return count;
    }

    private drawMaze(): void {
        this.mazeGraphics.clear();

        for (let y = 0; y < GameScene.ROWS; y++) {
            for (let x = 0; x < GameScene.COLS; x++) {
                this.drawCell(x, y);
            }
        }
    }

    private drawCell(x: number, y: number): void {
        const cell = this.maze[y][x];
        const drawX = x * GameScene.CELL_SIZE;
        const drawY = y * GameScene.CELL_SIZE;

        switch (cell) {
            case 1: // Wall
                this.mazeGraphics.fillStyle(0x0066ff);
                this.mazeGraphics.fillRect(drawX, drawY, GameScene.CELL_SIZE, GameScene.CELL_SIZE);
                this.mazeGraphics.lineStyle(1, 0x0088ff);
                this.mazeGraphics.strokeRect(drawX, drawY, GameScene.CELL_SIZE, GameScene.CELL_SIZE);
                break;

            case 0: // Dot
                this.mazeGraphics.fillStyle(0xffff00);
                this.mazeGraphics.fillCircle(
                    drawX + GameScene.CELL_SIZE/2,
                    drawY + GameScene.CELL_SIZE/2,
                    2
                );
                break;

            case 2: // Power pellet
                this.mazeGraphics.fillStyle(0xffff00);
                this.mazeGraphics.fillCircle(
                    drawX + GameScene.CELL_SIZE/2,
                    drawY + GameScene.CELL_SIZE/2,
                    6
                );
                break;
        }
    }

    private redrawCell(x: number, y: number): void {
        const drawX = x * GameScene.CELL_SIZE;
        const drawY = y * GameScene.CELL_SIZE;

        // Clear the cell area
        this.mazeGraphics.fillStyle(0x000000);
        this.mazeGraphics.fillRect(drawX, drawY, GameScene.CELL_SIZE, GameScene.CELL_SIZE);

        // Redraw the cell
        this.drawCell(x, y);
    }

    public reset(): void {
        this.maze = this.initialMaze.map(row => [...row]);
        this.drawMaze();
    }
}
