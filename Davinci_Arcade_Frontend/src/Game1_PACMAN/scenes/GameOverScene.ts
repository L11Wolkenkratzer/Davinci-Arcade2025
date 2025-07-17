import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(): void {
        const score = this.registry.get('score');
        const level = this.registry.get('level');
        const highScore = this.registry.get('highScore');
        const isNewRecord = score === highScore;

        // Background
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x330000
        );

        // Title
        this.add.text(this.cameras.main.centerX, 80, 'GAME OVER', {
            fontSize: '36px',
            fontFamily: 'Arial Black',
            color: '#FF0000'
        }).setOrigin(0.5);

        // Stats
        this.add.text(this.cameras.main.centerX, 150, `FINAL SCORE: ${score.toLocaleString()}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.centerX, 180, `LEVEL REACHED: ${level}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        if (isNewRecord) {
            this.add.text(this.cameras.main.centerX, 220, '🏆 NEW HIGH SCORE! 🏆', {
                fontSize: '18px',
                fontFamily: 'Arial Bold',
                color: '#FFD700'
            }).setOrigin(0.5);
        }

        // Buttons
        this.createButton(280, 'NOCHMAL SPIELEN', () => {
            this.scene.start('GameScene');
        });

        this.createButton(320, 'LOBBY', () => {
            this.scene.start('LobbyScene');
        });

        this.createButton(360, 'HAUPTMENÜ', () => {
            const gameConfig = this.registry.get('gameConfig');
            if (gameConfig?.onBack) {
                gameConfig.onBack();
            }
        });
    }

    private createButton(y: number, text: string, callback: () => void): void {
        const button = this.add.text(this.cameras.main.centerX, y, text, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setStyle({ color: '#FFFF00', backgroundColor: '#333333' });
        });

        button.on('pointerout', () => {
            button.setStyle({ color: '#FFFFFF', backgroundColor: '#000000' });
        });

        button.on('pointerdown', callback);
    }
}
