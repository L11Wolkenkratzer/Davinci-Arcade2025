import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create(): void {
        // Semi-transparent overlay
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );

        // Pause content
        this.add.text(this.cameras.main.centerX, 180, 'SPIEL PAUSIERT', {
            fontSize: '24px',
            fontFamily: 'Arial Bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.centerX, 220, 'Drücke SPACE zum Fortfahren', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#CCCCCC'
        }).setOrigin(0.5);

        const continueButton = this.add.text(this.cameras.main.centerX, 260, 'WEITER SPIELEN', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#00FF00',
            backgroundColor: '#003300',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        continueButton.on('pointerdown', () => {
            this.resumeGame();
        });

        // Input handling
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.resumeGame();
        });
    }

    private resumeGame(): void {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
