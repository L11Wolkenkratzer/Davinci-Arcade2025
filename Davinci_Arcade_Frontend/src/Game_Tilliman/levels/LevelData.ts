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
// Level 4-10: Erweiterte Herausforderungen
levelData.push(
    {
        id: 'level4',
        name: 'Zahnräder im Uhrturm',
        width: 1000,
        height: 600,
        playerStart: { x: 50, y: 500 },
        requiredGears: 3,
        entities: [
            // Vertikale Plattformen
            { type: 'platform', x: 0, y: 550, width: 200, height: 50, properties: {} },
            { type: 'platform', x: 300, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 500, y: 350, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 650, y: 250, width: 120, height: 20, properties: {} },
            { type: 'platform', x: 850, y: 150, width: 100, height: 20, properties: {} },
            // Bewegliche Plattformen
            { type: 'movingPlatform', x: 200, y: 500, width: 80, height: 20, properties: { startY: 500, endY: 300, speed: 40 } },
            { type: 'movingPlatform', x: 600, y: 200, width: 80, height: 20, properties: { startX: 600, endX: 750, speed: 60 } },
            { type: 'movingPlatform', x: 400, y: 100, width: 80, height: 20, properties: { startX: 400, endX: 550, speed: 50 } },
            // Feinde
            { type: 'enemy', x: 350, y: 418, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 70, range: 100 } },
            { type: 'enemy', x: 700, y: 230, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 60, range: 80 } },
            { type: 'enemy', x: 500, y: 200, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.6, range: 1.8, phase: 0 } },
            // Zahnräder
            { type: 'collectible', x: 320, y: 420, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 680, y: 220, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 875, y: 130, width: 24, height: 24, properties: {} },
            // Fallen
            { type: 'trap', x: 400, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 600, y: 370, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 750, y: 270, width: 50, height: 20, properties: {} },
            // Checkpoint
            { type: 'checkpoint', x: 500, y: 330, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 920, y: 110, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level5',
        name: 'Die Dampfmaschinen-Ebene',
        width: 1200,
        height: 600,
        playerStart: { x: 30, y: 500 },
        requiredGears: 3,
        entities: [
            // Förderbänder (bewegliche Plattformen)
            { type: 'movingPlatform', x: 100, y: 550, width: 120, height: 20, properties: { startX: 100, endX: 300, speed: 50 } },
            { type: 'movingPlatform', x: 400, y: 400, width: 100, height: 20, properties: { startY: 400, endY: 200, speed: 40 } },
            { type: 'movingPlatform', x: 700, y: 300, width: 100, height: 20, properties: { startX: 700, endX: 900, speed: 60 } },
            { type: 'movingPlatform', x: 1000, y: 150, width: 80, height: 20, properties: { startY: 150, endY: 350, speed: 45 } },
            // Plattformen
            { type: 'platform', x: 0, y: 580, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 350, y: 500, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 600, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 950, y: 250, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 1100, y: 100, width: 100, height: 20, properties: {} },
            // Feinde
            { type: 'enemy', x: 200, y: 570, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 90, range: 120 } },
            { type: 'enemy', x: 750, y: 420, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 70, range: 100 } },
            { type: 'enemy', x: 550, y: 350, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.7, range: 2.0, phase: 1 } },
            { type: 'enemy', x: 1050, y: 200, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 80, range: 90 } },
            // Zahnräder
            { type: 'collectible', x: 420, y: 380, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 850, y: 280, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 1120, y: 80, width: 24, height: 24, properties: {} },
            // Fallen
            { type: 'trap', x: 500, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 800, y: 470, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 1000, y: 370, width: 50, height: 20, properties: {} },
            // Checkpoints
            { type: 'checkpoint', x: 400, y: 480, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 950, y: 230, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 1150, y: 60, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level6',
        name: 'Pendel des Schicksals',
        width: 1000,
        height: 600,
        playerStart: { x: 30, y: 550 },
        requiredGears: 3,
        entities: [
            // Pendel-ähnliche Bewegungen
            { type: 'platform', x: 0, y: 580, width: 150, height: 20, properties: {} },
            { type: 'movingPlatform', x: 160, y: 520, width: 80, height: 20, properties: { startX: 160, endX: 300, startY: 520, endY: 350, speed: 30 } },
            { type: 'movingPlatform', x: 450, y: 300, width: 80, height: 20, properties: { startX: 450, endX: 600, startY: 300, endY: 500, speed: 35 } },
            { type: 'movingPlatform', x: 700, y: 150, width: 80, height: 20, properties: { startX: 700, endX: 850, startY: 150, endY: 350, speed: 40 } },
            // Statische Plattformen
            { type: 'platform', x: 380, y: 550, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 650, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 900, y: 100, width: 100, height: 20, properties: {} },
            // Feinde mit komplexen Bewegungen
            { type: 'enemy', x: 300, y: 570, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 100, range: 150 } },
            { type: 'enemy', x: 500, y: 350, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 90, range: 120 } },
            { type: 'enemy', x: 750, y: 200, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 1.0, range: 2.2, phase: 0 } },
            { type: 'enemy', x: 450, y: 400, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.8, range: 1.8, phase: 1.5 } },
            // Zahnräder
            { type: 'collectible', x: 275, y: 300, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 525, y: 250, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 925, y: 80, width: 24, height: 24, properties: {} },
            // Viele Fallen
            { type: 'trap', x: 150, y: 560, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 480, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 750, y: 470, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 850, y: 370, width: 50, height: 20, properties: {} },
            // Checkpoints
            { type: 'checkpoint', x: 380, y: 530, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 650, y: 430, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 950, y: 60, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level7',
        name: 'Schattenreich der Zeit',
        width: 1400,
        height: 600,
        playerStart: { x: 50, y: 520 },
        requiredGears: 3,
        entities: [
            // Dunkles Level mit unsichtbaren Plattformen (Cuckooshadow-Thema)
            { type: 'platform', x: 0, y: 550, width: 150, height: 50, properties: {} },
            { type: 'platform', x: 200, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 400, y: 350, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 600, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 800, y: 300, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 1000, y: 200, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 1200, y: 100, width: 200, height: 20, properties: {} },
            // Viele Cuckooshadow-Feinde mit verschiedenen Phasen
            { type: 'enemy', x: 250, y: 430, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.5, range: 2.5, phase: 0 } },
            { type: 'enemy', x: 450, y: 330, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.6, range: 2.0, phase: 0.8 } },
            { type: 'enemy', x: 650, y: 430, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.7, range: 1.8, phase: 1.6 } },
            { type: 'enemy', x: 850, y: 280, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.8, range: 2.2, phase: 2.4 } },
            { type: 'enemy', x: 1050, y: 180, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 0.9, range: 1.5, phase: 3.2 } },
            { type: 'enemy', x: 1300, y: 80, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 1.0, range: 2.8, phase: 4.0 } },
            // Bewegliche Plattformen als Rettung
            { type: 'movingPlatform', x: 300, y: 500, width: 60, height: 15, properties: { startY: 500, endY: 400, speed: 25 } },
            { type: 'movingPlatform', x: 700, y: 350, width: 60, height: 15, properties: { startX: 700, endX: 850, speed: 30 } },
            { type: 'movingPlatform', x: 1100, y: 250, width: 60, height: 15, properties: { startY: 250, endY: 150, speed: 35 } },
            // Zahnräder
            { type: 'collectible', x: 420, y: 330, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 820, y: 280, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 1250, y: 80, width: 24, height: 24, properties: {} },
            // Fallen
            { type: 'trap', x: 150, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 500, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 900, y: 570, width: 50, height: 20, properties: {} },
            // Checkpoints
            { type: 'checkpoint', x: 400, y: 330, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 1000, y: 180, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 1350, y: 60, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level8',
        name: 'Sturm der Rost-Bestien',
        width: 1300,
        height: 600,
        playerStart: { x: 30, y: 520 },
        requiredGears: 3,
        entities: [
            // Rustling-fokussiertes Level mit vielen fliegenden Feinden
            { type: 'platform', x: 0, y: 550, width: 200, height: 50, properties: {} },
            { type: 'platform', x: 300, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 500, y: 350, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 700, y: 450, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 900, y: 300, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 1100, y: 200, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 1200, y: 100, width: 100, height: 20, properties: {} },
            // Viele Rustling-Feinde
            { type: 'enemy', x: 150, y: 400, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 60, range: 150 } },
            { type: 'enemy', x: 350, y: 300, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 70, range: 120 } },
            { type: 'enemy', x: 550, y: 200, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 80, range: 140 } },
            { type: 'enemy', x: 750, y: 300, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 90, range: 100 } },
            { type: 'enemy', x: 950, y: 150, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 100, range: 160 } },
            { type: 'enemy', x: 1150, y: 50, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 110, range: 80 } },
            // Einige Tickspikes am Boden
            { type: 'enemy', x: 250, y: 530, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 120, range: 100 } },
            { type: 'enemy', x: 600, y: 530, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 130, range: 120 } },
            { type: 'enemy', x: 1000, y: 530, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 140, range: 140 } },
            // Bewegliche Plattformen für Schutz
            { type: 'movingPlatform', x: 400, y: 500, width: 80, height: 15, properties: { startY: 500, endY: 300, speed: 40 } },
            { type: 'movingPlatform', x: 800, y: 400, width: 80, height: 15, properties: { startX: 800, endX: 950, speed: 50 } },
            // Zahnräder
            { type: 'collectible', x: 520, y: 330, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 920, y: 280, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 1220, y: 80, width: 24, height: 24, properties: {} },
            // Fallen
            { type: 'trap', x: 150, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 450, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 850, y: 570, width: 50, height: 20, properties: {} },
            // Checkpoints
            { type: 'checkpoint', x: 500, y: 330, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 900, y: 280, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 1250, y: 60, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level9',
        name: 'Das Herz der Zeitmaschine',
        width: 1500,
        height: 600,
        playerStart: { x: 50, y: 500 },
        requiredGears: 3,
        entities: [
            // Komplexeste Plattformstruktur
            { type: 'platform', x: 0, y: 530, width: 150, height: 70, properties: {} },
            { type: 'platform', x: 200, y: 450, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 350, y: 380, width: 60, height: 20, properties: {} },
            { type: 'platform', x: 500, y: 320, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 650, y: 260, width: 60, height: 20, properties: {} },
            { type: 'platform', x: 800, y: 200, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 950, y: 150, width: 60, height: 20, properties: {} },
            { type: 'platform', x: 1100, y: 100, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 1300, y: 50, width: 200, height: 20, properties: {} },
            // Komplexe bewegliche Plattformen
            { type: 'movingPlatform', x: 280, y: 400, width: 60, height: 15, properties: { startX: 280, endX: 320, startY: 400, endY: 350, speed: 30 } },
            { type: 'movingPlatform', x: 430, y: 300, width: 60, height: 15, properties: { startX: 430, endX: 470, startY: 300, endY: 250, speed: 35 } },
            { type: 'movingPlatform', x: 580, y: 220, width: 60, height: 15, properties: { startX: 580, endX: 620, startY: 220, endY: 180, speed: 40 } },
            { type: 'movingPlatform', x: 730, y: 160, width: 60, height: 15, properties: { startX: 730, endX: 770, startY: 160, endY: 120, speed: 45 } },
            { type: 'movingPlatform', x: 880, y: 110, width: 60, height: 15, properties: { startX: 880, endX: 920, startY: 110, endY: 80, speed: 50 } },
            { type: 'movingPlatform', x: 1030, y: 70, width: 60, height: 15, properties: { startX: 1030, endX: 1070, startY: 70, endY: 40, speed: 55 } },
            // Alle Feindtypen in hoher Dichte
            { type: 'enemy', x: 220, y: 430, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 120, range: 60 } },
            { type: 'enemy', x: 370, y: 360, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 100, range: 80 } },
            { type: 'enemy', x: 520, y: 300, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 1.2, range: 1.5, phase: 0 } },
            { type: 'enemy', x: 670, y: 240, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 140, range: 80 } },
            { type: 'enemy', x: 820, y: 180, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 120, range: 100 } },
            { type: 'enemy', x: 970, y: 130, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 1.5, range: 2.0, phase: 1.5 } },
            { type: 'enemy', x: 1120, y: 80, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 160, range: 100 } },
            { type: 'enemy', x: 1350, y: 30, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 150, range: 120 } },
            // Zahnräder auf schwierigsten Positionen
            { type: 'collectible', x: 380, y: 360, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 830, y: 180, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 1400, y: 30, width: 24, height: 24, properties: {} },
            // Viele Fallen
            { type: 'trap', x: 150, y: 550, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 300, y: 470, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 450, y: 400, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 600, y: 340, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 750, y: 280, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 900, y: 220, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 1050, y: 170, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 1200, y: 120, width: 50, height: 20, properties: {} },
            // Checkpoints
            { type: 'checkpoint', x: 350, y: 360, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 650, y: 240, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 950, y: 130, width: 24, height: 32, properties: {} },
            // Ziel
            { type: 'goal', x: 1450, y: 10, width: 48, height: 48, properties: {} }
        ]
    },
    {
        id: 'level10',
        name: 'Meister der Zeit - Finale',
        width: 2000,
        height: 600,
        playerStart: { x: 50, y: 520 },
        requiredGears: 5, // Boss-Level mit 5 Zahnrädern!
        entities: [
            // Riesige Plattformstruktur für Endlevel
            { type: 'platform', x: 0, y: 550, width: 200, height: 50, properties: {} },
            { type: 'platform', x: 300, y: 480, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 500, y: 420, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 700, y: 360, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 900, y: 300, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 1100, y: 240, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 1300, y: 180, width: 80, height: 20, properties: {} },
            { type: 'platform', x: 1500, y: 120, width: 100, height: 20, properties: {} },
            { type: 'platform', x: 1700, y: 60, width: 300, height: 40, properties: {} }, // Boss-Arena
            
            // Epische bewegliche Plattformen
            { type: 'movingPlatform', x: 200, y: 500, width: 80, height: 15, properties: { startX: 200, endX: 280, startY: 500, endY: 450, speed: 25 } },
            { type: 'movingPlatform', x: 400, y: 400, width: 80, height: 15, properties: { startX: 400, endX: 480, startY: 400, endY: 350, speed: 30 } },
            { type: 'movingPlatform', x: 600, y: 340, width: 80, height: 15, properties: { startX: 600, endX: 680, startY: 340, endY: 290, speed: 35 } },
            { type: 'movingPlatform', x: 800, y: 280, width: 80, height: 15, properties: { startX: 800, endX: 880, startY: 280, endY: 230, speed: 40 } },
            { type: 'movingPlatform', x: 1000, y: 220, width: 80, height: 15, properties: { startX: 1000, endX: 1080, startY: 220, endY: 170, speed: 45 } },
            { type: 'movingPlatform', x: 1200, y: 160, width: 80, height: 15, properties: { startX: 1200, endX: 1280, startY: 160, endY: 110, speed: 50 } },
            { type: 'movingPlatform', x: 1400, y: 100, width: 80, height: 15, properties: { startX: 1400, endX: 1480, startY: 100, endY: 50, speed: 55 } },
            
            // Boss-Level Feinde - extrem herausfordernd
            { type: 'enemy', x: 250, y: 460, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 150, range: 120 } },
            { type: 'enemy', x: 450, y: 400, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 130, range: 140 } },
            { type: 'enemy', x: 650, y: 340, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 1.8, range: 2.5, phase: 0 } },
            { type: 'enemy', x: 850, y: 280, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 170, range: 140 } },
            { type: 'enemy', x: 1050, y: 220, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 150, range: 160 } },
            { type: 'enemy', x: 1250, y: 160, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 2.0, range: 3.0, phase: 1.0 } },
            { type: 'enemy', x: 1450, y: 100, width: 32, height: 32, properties: { enemyType: 'tickspike', speed: 190, range: 160 } },
            { type: 'enemy', x: 1650, y: 40, width: 32, height: 32, properties: { enemyType: 'rustling', speed: 170, range: 180 } },
            
            // Boss-Arena Feinde
            { type: 'enemy', x: 1750, y: 40, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 2.5, range: 4.0, phase: 0 } },
            { type: 'enemy', x: 1850, y: 40, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 2.0, range: 3.5, phase: 2.0 } },
            { type: 'enemy', x: 1950, y: 40, width: 32, height: 48, properties: { enemyType: 'cuckooshadow', speed: 1.5, range: 3.0, phase: 4.0 } },
            
            // 5 Zahnräder für Boss-Level
            { type: 'collectible', x: 470, y: 400, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 870, y: 280, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 1270, y: 160, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 1520, y: 100, width: 24, height: 24, properties: {} },
            { type: 'collectible', x: 1900, y: 40, width: 24, height: 24, properties: {} }, // Boss-Zahnrad
            
            // Extreme Fallen
            { type: 'trap', x: 150, y: 570, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 350, y: 500, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 550, y: 440, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 750, y: 380, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 950, y: 320, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 1150, y: 260, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 1350, y: 200, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 1550, y: 140, width: 50, height: 20, properties: {} },
            { type: 'trap', x: 1750, y: 80, width: 50, height: 20, properties: {} },
            
            // Checkpoints für das lange Level
            { type: 'checkpoint', x: 300, y: 460, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 700, y: 340, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 1100, y: 220, width: 24, height: 32, properties: {} },
            { type: 'checkpoint', x: 1500, y: 100, width: 24, height: 32, properties: {} },
            
            // Episches Ziel
            { type: 'goal', x: 1950, y: 20, width: 48, height: 48, properties: {} }
        ]
    }
); 

