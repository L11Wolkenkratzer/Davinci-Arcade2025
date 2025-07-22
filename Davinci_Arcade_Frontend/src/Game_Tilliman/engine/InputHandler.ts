import type { InputState } from '../types/GameTypes';

export class InputHandler {
    private keys: { [key: string]: boolean } = {};
    private state: InputState = {
        left: false,
        right: false,
        jump: false,
        dash: false,
        pause: false
    };
    
    private keyBindings = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ' ': 'dash', // Space für Dash
        Space: 'dash',
        Enter: 'jump', // Enter für Springen
        // Shift, P und andere entfernen
    };
    
    constructor() {
        this.setupEventListeners();
    }
    
    private setupEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
    
    private handleKeyDown = (event: KeyboardEvent) => {
        this.keys[event.key] = true;
        this.keys[event.code] = true;
        
        // Prevent default for game keys
        if (event.key in this.keyBindings || event.code in this.keyBindings) {
            event.preventDefault();
        }
    };
    
    private handleKeyUp = (event: KeyboardEvent) => {
        this.keys[event.key] = false;
        this.keys[event.code] = false;
    };
    
    public update() {
        // Update state based on current key presses
        this.state.left = this.keys['ArrowLeft'] || false;
        this.state.right = this.keys['ArrowRight'] || false;
        this.state.jump = this.keys['Enter'] || false;
        this.state.dash = this.keys[' '] || this.keys['Space'] || false;
        // Pause wird nicht mehr unterstützt
        this.state.pause = false;
    }
    
    public getState(): InputState {
        return { ...this.state };
    }
    
    public reset() {
        this.keys = {};
        this.state = {
            left: false,
            right: false,
            jump: false,
            dash: false,
            pause: false
        };
    }
    
    public destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
} 