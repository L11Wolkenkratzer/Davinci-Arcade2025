// src/utils/audioUtils.ts
import { useAudio } from '../SettingsContext.tsx';

export const SOUND_TYPES = {
    BACKGROUND: 'background',
    EFFECT: 'effect',
    UI: 'ui'
};

export const SOUND_FILES = {
    // Hintergrundmusik
    LOBBY_MUSIC: '/Sounds/LobbyMusic.mp3',
    GAME_BACKGROUND: '/Sounds/background.mp3',

    // Effekte
    LASER: '/Sounds/laserShoot.mp3',
    APPLE_EATEN: '/Sounds/AppleEaten.m4a',
    ASTEROID_BREAK: '/Sounds/asteroid_break.mp3',

    // UI-Sounds
    BUTTON_CLICK: '/Sounds/ui_click.mp3',
    MENU_NAVIGATE: '/Sounds/ui_navigate.mp3'
};

// Hook zum einfachen Abspielen von Sound-Effekten
export const useSoundEffects = () => {
    const { playSound, volume } = useAudio();

    const playEffect = (soundPath: string) => {
        const audio = playSound(soundPath);
        audio.volume = (volume / 100) * 0.8; // Effekte etwas leiser als Musik
        return audio;
    };

    return {
        playLaser: () => playEffect(SOUND_FILES.LASER),
        playAppleEaten: () => playEffect(SOUND_FILES.APPLE_EATEN),
        playAsteroidBreak: () => playEffect(SOUND_FILES.ASTEROID_BREAK),
        playButtonClick: () => playEffect(SOUND_FILES.BUTTON_CLICK),
        playMenuNavigate: () => playEffect(SOUND_FILES.MENU_NAVIGATE)
    };
};
