export interface Ship {
    id: string;
    name: string;
    icon: string;
    health: number;
    maxHealth: number;
    speed: number;
    fireRate: number;
    damage: number;
    cost: number;
    owned: boolean;
    equipped: boolean;
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'health' | 'speed' | 'fireRate' | 'damage';
    value: number;
    owned: boolean;
}

export interface Bullet {
    id: string;
    x: number;
    y: number;
    velocity: number;
}

export interface Asteroid {
    id: string;
    x: number;
    y: number;
    size: number;
    velocity: number;
    health: number;
}

export interface GameState {
    score: number;
    coins: number;
    level: number;
    gameRunning: boolean;
    gameOver: boolean;
    paused: boolean;
    ship: Ship;
    bullets: Bullet[];
    asteroids: Asteroid[];
}

export interface HighscoreEntry {
    name: string;
    score: number;
    date: string;
}

export type GameScreen = 'lobby' | 'game' | 'shop' | 'shipManager' | 'highscore' | 'info';
