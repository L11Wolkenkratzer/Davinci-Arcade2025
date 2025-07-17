import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class UIManager {
    private scene: GameScene;
    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private powerModeIndicator!: Phaser.GameObjects.Text;

    constructor(scene: GameScene) {
        this.scene = scene;
        this.createUI();
    }

    private createUI(): void {
        // Score
        this.scoreText = this.scene.add.text(10, 5, 'SCORE: 0', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });

        // Level
        this.levelText = this.scene.add.text(150, 5, 'LEVEL 1', {
            fontSize: '14px',
            fontFamily: 'Arial Bold',
            color: '#FFFF00'
        });

        // Lives
        this.livesText = this.scene.add.text(250, 5, 'LIVES: 🟡🟡🟡', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });

        // Power mode indicator (initially hidden)
        this.powerModeIndicator = this.scene.add.text(
            this.scene.cameras.main.centerX,
            30,
            'POWER MODE!',
            {
                fontSize: '16px',
                fontFamily: 'Arial Bold',
                color: '#00FF00',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setVisible(false);
    }

    public updateScore(): void {
        const score = this.scene.registry.get('score');
        this.scoreText.setText(`SCORE: ${score.toLocaleString()}`);
    }

    public updateLives(): void {
        const lives = this.scene.registry.get('lives');
        const lifeIcons = '🟡'.repeat(Math.max(0, lives));
        this.livesText.setText(`LIVES: ${lifeIcons}`);
    }

    public updateLevel(): void {
        const level = this.scene.registry.get('level');
        this.levelText.setText(`LEVEL ${level}`);
    }

    public showPowerModeIndicator(): void {
        this.powerModeIndicator.setVisible(true);

        // Pulsing effect
        this.scene.tweens.add({
            targets: this.powerModeIndicator,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    public hidePowerModeIndicator(): void {
        this.powerModeIndicator.setVisible(false);
        this.scene.tweens.killTweensOf(this.powerModeIndicator);
        this.powerModeIndicator.setScale(1);
    }

    public update(): void {
        // Update power mode timer display
        if (this.scene.registry.get('powerMode')) {
            const timer = this.scene.registry.get('powerModeTimer');
            const seconds = Math.ceil(timer / 20); // Assuming 20 FPS for timer
            this.powerModeIndicator.setText(`POWER MODE! ${seconds}s`);
        }
    }
}
