import Phaser from 'phaser';
import { LobbyScene } from './scenes/LobbyScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { WinScene } from './scenes/WinScene';
import { PauseScene } from './scenes/PauseScene';

export interface GameConfig {
    onBack?: () => void;
    onGameComplete?: (score: number, won: boolean) => void;
}

export class PacManPhaserGame {
    private game: Phaser.Game;
    private config: GameConfig;

    constructor(container: HTMLElement, config: GameConfig = {}) {
        this.config = config;

        // Add arcade styling to container
        container.className = 'pacman-game-container';

        const gameConfig: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 380, // 19 * 20
            height: 420, // 21 * 20
            parent: container,
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false,
                    fps: 60
                }
            },
            scene: [
                LobbyScene,
                GameScene,
                GameOverScene,
                WinScene,
                PauseScene
            ],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: container,
                width: 380,
                height: 420
            },
            render: {
                pixelArt: true,
                antialias: false
            },
            dom: {
                createContainer: true
            }
        };

        this.game = new Phaser.Game(gameConfig);
        this.setupGameData();
    }

    private setupGameData(): void {
        // Global game data
        this.game.registry.set('gameConfig', this.config);
        this.game.registry.set('score', 0);
        this.game.registry.set('lives', 3);
        this.game.registry.set('level', 1);
        this.game.registry.set('highScore', this.getHighScore());
        this.game.registry.set('powerMode', false);
        this.game.registry.set('powerModeTimer', 0);
    }

    private getHighScore(): number {
        const saved = localStorage.getItem('pacman-highscore');
        return saved ? parseInt(saved) : 0;
    }

    public destroy(): void {
        if (this.game) {
            this.game.destroy(true);
        }
    }
}
