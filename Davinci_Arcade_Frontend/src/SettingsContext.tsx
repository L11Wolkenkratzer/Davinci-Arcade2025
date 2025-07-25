// src/SettingsContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  // Audio-Einstellungen
  volume: number;
  setVolume: (volume: number) => void;
  muteAudio: () => void;
  unmuteAudio: () => void;
  isMuted: boolean;

  // Helligkeit-Einstellungen
  brightness: number;
  setBrightness: (brightness: number) => void;

  // Audio-Funktionen
  playSound: (src: string) => HTMLAudioElement;
  stopAllSounds: () => void;
  pauseAllSounds: () => void;
  resumeAllSounds: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem('settings_volume');
    return stored ? parseInt(stored) : 50;
  });

  const [brightness, setBrightnessState] = useState<number>(() => {
    const stored = localStorage.getItem('settings_brightness');
    return stored ? parseInt(stored) : 75;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeSounds, setActiveSounds] = useState<HTMLAudioElement[]>([]);

  // Volume localStorage sync
  useEffect(() => {
    localStorage.setItem('settings_volume', volume.toString());
    activeSounds.forEach(sound => {
      sound.volume = isMuted ? 0 : volume / 100;
    });
  }, [volume, isMuted, activeSounds]);

  // Brightness localStorage sync und CSS-Anwendung mit Mapping
  useEffect(() => {
    localStorage.setItem('settings_brightness', brightness.toString());

    // Helligkeit von 0-100% auf 25-100% mappen
    // 0% Slider = 25% tatsächliche Helligkeit (dunkel aber sichtbar)
    // 100% Slider = 100% tatsächliche Helligkeit (normal)
    const minBrightness = 25; // Minimale Helligkeit
    const maxBrightness = 110; // Maximale Helligkeit
    const range = maxBrightness - minBrightness;

    const actualBrightness = minBrightness + (brightness / 100) * range;

    document.body.style.filter = `brightness(${actualBrightness}%)`;

    console.log(`🔆 Brightness - Slider: ${brightness}% → Applied: ${actualBrightness}%`);
  }, [brightness]);

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const setBrightness = (newBrightness: number) => {
    setBrightnessState(newBrightness);
  };

  const muteAudio = () => {
    setIsMuted(true);
  };

  const unmuteAudio = () => {
    setIsMuted(false);
  };

  const playSound = (src: string): HTMLAudioElement => {
    const audio = new Audio(src);
    audio.volume = isMuted ? 0 : volume / 100;

    setActiveSounds(prev => [...prev, audio]);

    audio.addEventListener('ended', () => {
      setActiveSounds(prev => prev.filter(sound => sound !== audio));
    });

    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });

    return audio;
  };

  const stopAllSounds = () => {
    activeSounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    setActiveSounds([]);
  };

  const pauseAllSounds = () => {
    activeSounds.forEach(sound => {
      sound.pause();
    });
  };

  const resumeAllSounds = () => {
    activeSounds.forEach(sound => {
      sound.play().catch(console.error);
    });
  };

  return (
      <SettingsContext.Provider
          value={{
            volume,
            setVolume,
            muteAudio,
            unmuteAudio,
            isMuted,
            brightness,
            setBrightness,
            playSound,
            stopAllSounds,
            pauseAllSounds,
            resumeAllSounds
          }}
      >
        {children}
      </SettingsContext.Provider>
  );
};

// Haupthook für Settings
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Backward compatibility für Audio
export const useAudio = () => {
  const { volume, setVolume, muteAudio, unmuteAudio, isMuted, playSound, stopAllSounds, pauseAllSounds, resumeAllSounds } = useSettings();
  return { volume, setVolume, muteAudio, unmuteAudio, isMuted, playSound, stopAllSounds, pauseAllSounds, resumeAllSounds };
};
