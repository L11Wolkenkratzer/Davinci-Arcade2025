import Phaser from 'phaser';

export class LobbyScene extends Phaser.Scene {
    private lobbyContainer!: Phaser.GameObjects.DOMElement;

    constructor() {
        super({ key: 'LobbyScene' });
    }

    create(): void {
        this.createLobbyContainer();
        this.setupEvents();
    }

    private createLobbyContainer(): void {
        const highScore = this.registry.get('highScore');

        const lobbyHTML = `
            <div class="pacman-lobby">
                <div class="lobby-content">
                    <h1 class="game-title">PAC-MAN</h1>
                    <div class="high-score">HIGH SCORE: ${highScore.toLocaleString()}</div>
                    <div class="game-description">
                        <p>🎮 Sammle alle Punkte und weiche den Geistern aus!</p>
                        <p>💊 Power-Pellets machen Geister verwundbar</p>
                        <p>⚡ Nutze die Tunnel an den Seiten</p>
                    </div>
                    <div class="lobby-controls">
                        <h3>STEUERUNG</h3>
                        <div class="control-grid">
                            <div class="control-item">
                                <span class="key">↑ ↓ ← →</span>
                                <span class="action">Bewegung</span>
                            </div>
                            <div class="control-item">
                                <span class="key">SPACE</span>
                                <span class="action">Pause</span>
                            </div>
                            <div class="control-item">
                                <span class="key">ESC</span>
                                <span class="action">Zurück</span>
                            </div>
                        </div>
                    </div>
                    <div class="lobby-buttons">
                        <button class="start-button" id="startBtn">SPIEL STARTEN</button>
                        <button class="back-button" id="backBtn">ZURÜCK ZUM MENÜ</button>
                    </div>
                </div>
            </div>
        `;

        this.lobbyContainer = this.add.dom(0, 0).createFromHTML(lobbyHTML);
        this.lobbyContainer.setOrigin(0);
        this.lobbyContainer.setPosition(-190, -210);
    }

    private setupEvents(): void {
        const startBtn = this.lobbyContainer.getChildByID('startBtn') as HTMLButtonElement;
        const backBtn = this.lobbyContainer.getChildByID('backBtn') as HTMLButtonElement;

        startBtn.addEventListener('click', () => this.startGame());
        backBtn.addEventListener('click', () => this.quitToMenu());

        // Keyboard events
        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard?.on('keydown-ESC', () => this.quitToMenu());
    }

    private startGame(): void {
        this.scene.start('GameScene');
    }

    private quitToMenu(): void {
        const gameConfig = this.registry.get('gameConfig');
        if (gameConfig?.onBack) {
            gameConfig.onBack();
        }
    }
}
