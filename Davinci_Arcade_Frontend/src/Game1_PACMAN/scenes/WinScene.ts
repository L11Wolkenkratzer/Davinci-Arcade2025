import Phaser from 'phaser';

export class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    create(): void {
        const score = this.registry.get('score');
        const level = this.registry.get('level') - 1; // Previous level
        const bonus = level * 1000;

        // Background
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x003300
        );

        // Title
        this.add.text(this.cameras.main.centerX, 80, '🎉 LEVEL COMPLETE! 🎉', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#00FF00'
        }).setOrigin(0.5);

        // Stats
        this.add.text(this.cameras.main.centerX, 150, `SCORE: ${score.toLocaleString()}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.centerX, 180, `LEVEL: ${level}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.centerX, 210, `LEVEL BONUS: +${bonus}`, {
            fontSize: '16px',
            fontFamily: 'Arial Bold',
            color: '#FFFF00'
        }).setOrigin(0.5);

        // Buttons
        this.createButton(280, 'NÄCHSTES LEVEL', () => {
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
            button.setStyle({ color: '#00FF00', backgroundColor: '#333333' });
        });

        button.on('pointerout', () => {
            button.setStyle({ color: '#FFFFFF', backgroundColor: '#000000' });
        });

        button.on('pointerdown', callback);
    }
}
