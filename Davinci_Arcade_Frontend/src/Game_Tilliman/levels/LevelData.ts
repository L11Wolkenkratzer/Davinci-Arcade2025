import type { LevelData } from '../types/GameTypes';

export const levelData: LevelData[] = [
    {
        id: 'level1',
        name: 'Die Anfänge der Zeit',
        width: 800,
        height: 600,
        playerStart: { x: 50, y: 400 },
        requiredGears: 3,
        entities: [
            // Ground platforms
            { type: 'platform', x: 0, y: 500, width: 200, height: 100, properties: {} },
            { type: 'platform', x: 250, y: 500, width: 150, height: 100, properties: {} },
            { type: 'platform', x: 450, y: 500, width: 350, height: 100, properties: {} },
            
            // Floating platforms
            { type: 'platform', x: 200, y: 400, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 350, y: 350, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 500, y: 300, width: 100, height: 20, properties: {} },
            
            // Moving platform
            {
                type: 'movingPlatform',
                x: 150,
                y: 250,
                width: 80,
                height: 20,
                properties: {
                    startX: 150,
                    endX: 350,
                    speed: 50
                }
            },
            
            // Enemies
            {
                type: 'enemy',
                x: 300,
                y: 468,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'tickspike',
                    speed: 60,
                    range: 80
                }
            },
            {
                type: 'enemy',
                x: 550,
                y: 200,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'rustling',
                    speed: 40,
                    range: 60
                }
            },
            
            // Collectibles (Gears)
            { type: 'collectible', x: 225, y: 360, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 380, y: 310, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 250, y: 220, width: 24, height: 24, properties: {} },
            
            // Trap
            { type: 'trap', x: 400, y: 480, width: 50, height: 20, properties: {} },
            
            // Checkpoint
            { type: 'checkpoint', x: 350, y: 468, width: 24, height: 32, properties: {} },
            
            // Goal
            { type: 'goal', x: 700, y: 452, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level2',
        name: 'Das Uhrwerk läuft',
        width: 800,
        height: 600,
        playerStart: { x: 30, y: 400 },
        requiredGears: 3,
        entities: [
            // Ground platforms
            { type: 'platform', x: 0, y: 500, width: 150, height: 100, properties: {} },
            { type: 'platform', x: 200, y: 550, width: 100, height: 50, properties: {} },
            { type: 'platform', x: 350, y: 500, width: 100, height: 100, properties: {} },
            { type: 'platform', x: 500, y: 450, width: 100, height: 150, properties: {} },
            { type: 'platform', x: 650, y: 500, width: 150, height: 100, properties: {} },
            
            // Upper platforms
            { type: 'platform', x: 100, y: 350, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 250, y: 300, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 400, y: 250, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 600, y: 200, width: 80, height: 20, properties: {} },
            
            // Moving platforms
            {
                type: 'movingPlatform',
                x: 150,
                y: 450,
                width: 60,
                height: 20,
                properties: {
                    startY: 450,
                    endY: 350,
                    speed: 40
                }
            },
            {
                type: 'movingPlatform',
                x: 500,
                y: 150,
                width: 80,
                height: 20,
                properties: {
                    startX: 500,
                    endX: 650,
                    startY: 150,
                    endY: 250,
                    speed: 60
                }
            },
            
            // Enemies
            {
                type: 'enemy',
                x: 250,
                y: 518,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'tickspike',
                    speed: 80,
                    range: 50
                }
            },
            {
                type: 'enemy',
                x: 450,
                y: 300,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'rustling',
                    speed: 50,
                    range: 100
                }
            },
            {
                type: 'enemy',
                x: 300,
                y: 400,
                width: 32,
                height: 48,
                properties: {
                    enemyType: 'cuckooshadow',
                    speed: 0.5,
                    range: 1.5,
                    phase: 0
                }
            },
            
            // Collectibles
            { type: 'collectible', x: 130, y: 310, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 450, y: 210, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 570, y: 120, width: 24, height: 24, properties: {} },
            
            // Traps
            { type: 'trap', x: 300, y: 530, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 450, y: 480, width: 50, height: 20, properties: {} },
            
            // Checkpoints
            { type: 'checkpoint', x: 270, y: 268, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 520, y: 418, width: 24, height: 32, properties: {} },
            
            // Goal
            { type: 'goal', x: 720, y: 452, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level3',
        name: 'Zeit läuft ab',
        width: 800,
        height: 600,
        playerStart: { x: 30, y: 300 },
        requiredGears: 3,
        entities: [
            // Complex platform layout
            { type: 'platform', x: 0, y: 350, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 150, y: 400, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 0, y: 550, width: 800, height: 50, properties: {} },
            { type: 'platform', x: 280, y: 450, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 410, y: 400, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 540, y: 350, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 670, y: 300, width: 100, height: 20, properties: {} },
            
            // Upper level
            { type: 'platform', x: 50, y: 200, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 200, y: 150, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 350, y: 100, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 500, y: 150, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 650, y: 200, width: 100, height: 20, properties: {} },
            
            // Multiple moving platforms
            {
                type: 'movingPlatform',
                x: 100,
                y: 300,
                width: 60,
                height: 20,
                properties: {
                    startX: 100,
                    endX: 200,
                    speed: 40
                }
            },
            {
                type: 'movingPlatform',
                x: 300,
                y: 250,
                width: 60,
                height: 20,
                properties: {
                    startY: 250,
                    endY: 350,
                    speed: 50
                }
            },
            {
                type: 'movingPlatform',
                x: 450,
                y: 200,
                width: 80,
                height: 20,
                properties: {
                    startX: 450,
                    endX: 550,
                    startY: 200,
                    endY: 300,
                    speed: 60
                }
            },
            
            // Many enemies
            {
                type: 'enemy',
                x: 180,
                y: 518,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'tickspike',
                    speed: 100,
                    range: 60
                }
            },
            {
                type: 'enemy',
                x: 400,
                y: 518,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'tickspike',
                    speed: 80,
                    range: 80
                }
            },
            {
                type: 'enemy',
                x: 250,
                y: 200,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'rustling',
                    speed: 60,
                    range: 120
                }
            },
            {
                type: 'enemy',
                x: 550,
                y: 250,
                width: 32,
                height: 32,
                properties: {
                    enemyType: 'rustling',
                    speed: 70,
                    range: 80
                }
            },
            {
                type: 'enemy',
                x: 150,
                y: 300,
                width: 32,
                height: 48,
                properties: {
                    enemyType: 'cuckooshadow',
                    speed: 0.7,
                    range: 1.2,
                    phase: 0
                }
            },
            {
                type: 'enemy',
                x: 500,
                y: 400,
                width: 32,
                height: 48,
                properties: {
                    enemyType: 'cuckooshadow',
                    speed: 0.5,
                    range: 1.8,
                    phase: 1
                }
            },
            
            // Collectibles in challenging positions
            { type: 'collectible', x: 75, y: 160, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 400, y: 60, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 700, y: 160, width: 24, height: 24, properties: {} },
            
            // More traps
            { type: 'trap', x: 230, y: 530, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 360, y: 530, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 490, y: 530, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 310, y: 430, width: 50, height: 20, properties: {} },
            
            // Checkpoints
            { type: 'checkpoint', x: 300, y: 118, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 580, y: 318, width: 24, height: 32, properties: {} },
            
            // Goal
            { type: 'goal', x: 720, y: 252, width: 48, height: 48, properties: {} }
        ]
    }
]; 