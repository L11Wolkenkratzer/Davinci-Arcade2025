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
// Neue Level
levelData.push(
    {
        id: 'level4',
        name: 'Zahnräder im Uhrturm',
        width: 800,
        height: 600,
        playerStart: { x: 50, y: 500 },
        requiredGears: 3,
        entities: [
            // Vertikale Plattformen
            { type: 'platform', x: 0, y: 550, width: 200, height: 50, properties: {} },
            { type: 'platform', x: 300, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 500, y: 350, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 650, y: 250, width: 120, height: 20, properties: {} },
            // Bewegliche Plattformen
            { type: 'movingPlatform', x: 200, y: 500, width: 80, height: 20, properties: { startY: 500, endY: 300, speed: 40 } },
            { type: 'movingPlatform', x: 600, y: 200, width: 80, height: 20, properties: { startX: 600, endX: 700, speed: 60 } },
            // Feinde
            { type: 'enemy', x: 350, y: 418, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 70, range: 100 } },
            { type: 'enemy', x: 700, y: 230, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 60, range: 80 } },
            // Zahnräder
            { type: 'collectible', x: 320, y: 420, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 680, y: 220, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 550, y: 330, width: 24, height: 24, properties: {} },
            // Fallen
            { type: 'trap', x: 400, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 600, y: 370, width: 50, height: 20, properties: {} },
            // Checkpoint
            { type: 'checkpoint', x: 500, y: 330, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 750, y: 210, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level5',
        name: 'Die Zahnräderfabrik',
        width: 900,
        height: 600,
        playerStart: { x: 30, y: 500 },
        requiredGears: 3,
        entities: [
            // Förderbänder (bewegliche Plattformen)
            { type: 'movingPlatform', x: 100, y: 550, width: 120, height: 20, properties: { startX: 100, endX: 300, speed: 50 } },
            { type: 'movingPlatform', x: 400, y: 400, width: 100, height: 20, properties: { startY: 400, endY: 200, speed: 40 } },
            { type: 'movingPlatform', x: 700, y: 300, width: 100, height: 20, properties: { startX: 700, endX: 800, speed: 60 } },
            // Plattformen
            { type: 'platform', x: 0, y: 580, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 350, y: 500, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 600, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 800, y: 200, width: 100, height: 20, properties: {} },
            // Feinde
            { type: 'enemy', x: 200, y: 570, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 90, range: 120 } },
            { type: 'enemy', x: 750, y: 420, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 70, range: 100 } },
            // Zahnräder
            { type: 'collectible', x: 420, y: 380, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 850, y: 180, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 150, y: 530, width: 24, height: 24, properties: {} },
            // Fallen
            { type: 'trap', x: 500, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 800, y: 470, width: 50, height: 20, properties: {} },
            // Checkpoints
            { type: 'checkpoint', x: 400, y: 480, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 800, y: 180, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 870, y: 170, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level6',
        name: 'Finale im Maschinenraum',
        width: 800,
        height: 600,
        playerStart: { x: 30, y: 550 },
        requiredGears: 3,
        entities: [
            // Komplexe Plattformstruktur
            { type: 'platform', x: 0, y: 580, width: 200, height: 20, properties: {} },
            { type: 'platform', x: 250, y: 500, width: 120, height: 20, properties: {} },
            { type: 'platform', x: 450, y: 420, width: 120, height: 20, properties: {} },
            { type: 'platform', x: 700, y: 350, width: 120, height: 20, properties: {} },
            { type: 'platform', x: 900, y: 250, width: 100, height: 20, properties: {} },
            // Viele bewegliche Plattformen
            { type: 'movingPlatform', x: 200, y: 550, width: 80, height: 20, properties: { startY: 550, endY: 400, speed: 50 } },
            { type: 'movingPlatform', x: 600, y: 400, width: 100, height: 20, properties: { startX: 600, endX: 800, speed: 70 } },
            { type: 'movingPlatform', x: 850, y: 200, width: 80, height: 20, properties: { startY: 200, endY: 350, speed: 60 } },
            // Viele Feinde
            { type: 'enemy', x: 300, y: 470, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 100, range: 150 } },
            { type: 'enemy', x: 750, y: 320, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 90, range: 120 } },
            { type: 'enemy', x: 500, y: 400, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 1.0, range: 2.0, phase: 0 } },
            { type: 'enemy', x: 900, y: 230, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.8, range: 1.5, phase: 1 } },
            // Zahnräder schwer erreichbar
            { type: 'collectible', x: 470, y: 400, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 950, y: 230, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 250, y: 480, width: 24, height: 24, properties: {} },
            // Viele Fallen
            { type: 'trap', x: 350, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 800, y: 370, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 950, y: 270, width: 50, height: 20, properties: {} },
            // Checkpoints
            { type: 'checkpoint', x: 450, y: 400, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 900, y: 230, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 970, y: 210, width: 48, height: 48, properties: {} }
        ]
    }
); 

