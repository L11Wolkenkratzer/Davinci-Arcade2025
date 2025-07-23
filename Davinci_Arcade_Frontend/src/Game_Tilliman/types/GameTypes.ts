// Basis-Vektor für 2D-Positionen und Bewegungen
export interface Vector2D {
    x: number;
    y: number;
}

// Rechteck für Kollisionserkennung
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Player States
export type PlayerState = 'idle' | 'jump' | 'fall' | 'dash' | 'hit';

// Entity Types
export type EntityType = 
    | 'player'
    | 'platform' 
    | 'movingPlatform' 
    | 'trap' 
    | 'enemy' 
    | 'collectible' 
    | 'goal'
    | 'checkpoint';

// Enemy Types
export type EnemyType = 'tickspike' | 'rustling' | 'cuckooshadow';

// Game States
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';

// Basis-Entity Interface
export interface Entity {
    id: string;
    type: EntityType;
    position: Vector2D;
    size: Vector2D;
    velocity: Vector2D;
    active: boolean;
    
    update(deltaTime: number): void;
    render(ctx: CanvasRenderingContext2D, cameraX?: number): void;

    getBounds(): Rectangle;
}

// Player-spezifische Properties
export interface PlayerEntity extends Entity {
    type: 'player';
    state: PlayerState;
    lives: number;
    score: number;
    isGrounded: boolean;
    canDash: boolean;
    dashCooldown: number;
    invulnerable: boolean;
    invulnerabilityTimer: number;
}

// Platform-spezifische Properties
export interface PlatformEntity extends Entity {
    type: 'platform' | 'movingPlatform';
    movementPath?: {
        startPos: Vector2D;
        endPos: Vector2D;
        speed: number;
        direction: number;
    };
}

// Enemy-spezifische Properties
export interface EnemyEntity extends Entity {
    type: 'enemy';
    enemyType: EnemyType;
    health: number;
    damage: number;
    movementPattern?: {
        type: 'horizontal' | 'vertical' | 'circular' | 'periodic';
        speed: number;
        range: number;
        phase?: number;
    };
}

// Collectible-spezifische Properties
export interface CollectibleEntity extends Entity {
    type: 'collectible';
    collected: boolean;
    points: number;
}

// Level-Definition
export interface LevelData {
    id: string;
    name: string;
    width: number;
    height: number;
    playerStart: Vector2D;
    entities: LevelObject[];
    requiredGears: number;
    background?: string;
}

// Level Object für Level-Editor
export interface LevelObject {
    type: EntityType;
    x: number;
    y: number;
    width: number;
    height: number;
    properties?: any;
}

// Input State
export interface InputState {
    left: boolean;
    right: boolean;
    jump: boolean;
    dash: boolean;
    pause: boolean;
}

// Game Options
export interface GameOptions {
    onScoreChange: (score: number) => void;
    onLivesChange: (lives: number) => void;
    onGearsCollected: (gears: number) => void;
    onGameOver: () => void;
    onLevelComplete: () => void;
    onReturnToHome?: () => void;

}

// Asset Types
export interface AssetMap {
    [key: string]: HTMLImageElement | HTMLCanvasElement;
}

// Physics Constants
export const PHYSICS = {
    GRAVITY: 1200,
    PLAYER_SPEED: 250,
    JUMP_VELOCITY: -600,
    DASH_SPEED: 500,
    DASH_DURATION: 0.15,
    DASH_COOLDOWN: 0.8,
    MAX_FALL_SPEED: 500,
    FRICTION: 0.85
}; 