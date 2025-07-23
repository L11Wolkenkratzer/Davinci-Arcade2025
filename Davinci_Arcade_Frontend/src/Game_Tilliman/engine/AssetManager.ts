import type { AssetMap } from '../types/GameTypes';

export class AssetManager {
    private assets: AssetMap = {};
    private loadedCount = 0;
    private totalCount = 0;
    
    constructor() {}
    
    public async loadAssets(): Promise<void> {
        // Da wir keine echten Bilder haben, erstellen wir Placeholder-Grafiken
        this.createPlaceholderAssets();
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('All placeholder assets created');
    }
    
    private createPlaceholderAssets() {
        // Player sprites
        this.createPlayerSprite('player_idle', '#FFA500'); // Orange
        this.createPlayerSprite('player_jump', '#FFB347'); // Light orange
        this.createPlayerSprite('player_fall', '#FF8C00'); // Dark orange
        this.createPlayerSprite('player_dash', '#FF6347'); // Tomato
        this.createPlayerSprite('player_hit', '#FF0000'); // Red
        
        // Platform sprites
        this.createPlatformSprite('platform_static', '#8B4513'); // Saddle brown
        this.createPlatformSprite('platform_moving', '#A0522D'); // Sienna
        
        // Enemy sprites
        this.createEnemySprite('enemy_tickspike', '#800080'); // Purple
        this.createEnemySprite('enemy_rustling', '#8B0000'); // Dark red
        this.createEnemySprite('enemy_cuckooshadow', '#4B0082'); // Indigo
        
        // Collectible and goal sprites
        this.createCollectibleSprite('collect_gearpart', '#FFD700'); // Gold
        this.createGoalSprite('goal_portal', '#00CED1'); // Dark turquoise
        this.createCheckpointSprite('checkpoint', '#32CD32'); // Lime green
        
        // Trap sprites
        this.createTrapSprite('trap_rustpatch', '#8B4513'); // Rust color
    }
    
    private createPlayerSprite(name: string, color: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        
        // Draw a spring-like character
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Body (coil)
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const y = 8 + i * 6;
            ctx.arc(16, y, 8, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(12, 10, 3, 3);
        ctx.fillRect(17, 10, 3, 3);
        ctx.fillStyle = 'black';
        ctx.fillRect(13, 11, 1, 1);
        ctx.fillRect(18, 11, 1, 1);
        
        this.assets[name] = canvas;
    }
    
    private createPlatformSprite(name: string, color: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 16;
        const ctx = canvas.getContext('2d')!;
        
        // Draw gear-like platform
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 16);
        
        // Add gear teeth
        ctx.fillStyle = '#666';
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(i * 8, 0, 4, 4);
            ctx.fillRect(i * 8, 12, 4, 4);
        }
        
        this.assets[name] = canvas;
    }
    
    private createEnemySprite(name: string, color: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        if (name.includes('tickspike')) {
            // Spiky ball
            ctx.beginPath();
            ctx.arc(16, 16, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Spikes
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(16 + Math.cos(angle) * 10, 16 + Math.sin(angle) * 10);
                ctx.lineTo(16 + Math.cos(angle) * 16, 16 + Math.sin(angle) * 16);
                ctx.stroke();
            }
        } else if (name.includes('rustling')) {
            // Flying rust creature
            ctx.beginPath();
            ctx.ellipse(16, 16, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Wings
            ctx.beginPath();
            ctx.moveTo(4, 16);
            ctx.quadraticCurveTo(4, 8, 12, 12);
            ctx.moveTo(28, 16);
            ctx.quadraticCurveTo(28, 8, 20, 12);
            ctx.stroke();
        } else {
            // Shadow creature
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.rect(8, 4, 16, 24);
            ctx.fill();
            ctx.stroke();
            
            // Eyes
            ctx.fillStyle = 'red';
            ctx.fillRect(12, 8, 3, 3);
            ctx.fillRect(17, 8, 3, 3);
        }
        
        this.assets[name] = canvas;
    }
    
    private createCollectibleSprite(name: string, color: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d')!;
        
        // Draw gear
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Outer circle
        ctx.beginPath();
        ctx.arc(12, 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner hole
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(12, 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Teeth
        ctx.fillStyle = color;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.save();
            ctx.translate(12, 12);
            ctx.rotate(angle);
            ctx.fillRect(-2, 8, 4, 4);
            ctx.strokeRect(-2, 8, 4, 4);
            ctx.restore();
        }
        
        this.assets[name] = canvas;
    }
    
    private createGoalSprite(name: string, color: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d')!;
        
        // Draw portal
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        
        // Swirling portal effect
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(24, 24, 8 + i * 6, 0, Math.PI * 2);
            ctx.globalAlpha = 1 - i * 0.3;
            ctx.stroke();
        }
        
        // Center
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(24, 24, 8, 0, Math.PI * 2);
        ctx.fill();
        
        this.assets[name] = canvas;
    }
    
    private createCheckpointSprite(name: string, color: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        
        // Flag pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(4, 8, 4, 24);
        
        // Flag
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(8, 8);
        ctx.lineTo(20, 12);
        ctx.lineTo(8, 16);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        this.assets[name] = canvas;
    }
    
    private createTrapSprite(name: string, color: string) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        
        // Rust patch texture
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 32, 32);
        
        // Add rust texture
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const size = Math.random() * 6 + 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.assets[name] = canvas;
    }
    
    public getAsset(name: string): HTMLImageElement | HTMLCanvasElement | null {
        return this.assets[name] || null;
    }
    
    public getAllAssets(): AssetMap {
        return this.assets;
    }
} 