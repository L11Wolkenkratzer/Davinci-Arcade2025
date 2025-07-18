import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

import type { Player } from "./Home";

interface SettingsModalProps {
    onClose: () => void;
    currentPlayer: Player;
    setCurrentPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, currentPlayer, setCurrentPlayer }) => {
    const [volume, setVolume] = useState<number>(() => {
        const stored = localStorage.getItem('settings_volume');
        return stored ? parseInt(stored) : 50;
    });
    const [brightness, setBrightness] = useState<number>(() => {
        const stored = localStorage.getItem('settings_brightness');
        return stored ? parseInt(stored) : 75;
    });
    const [focusedIndex, setFocusedIndex] = useState<number>(0);

    const modalRef = useRef<HTMLDivElement>(null);
    const focusableElements = ['close-button', 'volume-slider', 'brightness-slider', 'edit-user-button'];

    // Save settings helper
    const saveSettings = () => {
        localStorage.setItem('settings_volume', volume.toString());
        localStorage.setItem('settings_brightness', brightness.toString());
        console.log("Settings saved clicked");
    };

    // ⚠️ KORRIGIERT: Event-Propagation stoppen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Events immer stoppen, damit sie nicht nach Home durchsickern
            e.stopPropagation();
            
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => (prev + 1) % focusableElements.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => (prev - 1 + focusableElements.length) % focusableElements.length);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (focusedIndex === 1) { // Volume slider
                        setVolume(prev => Math.max(0, prev - 5));
                    } else if (focusedIndex === 2) { // Brightness slider
                        setBrightness(prev => Math.max(0, prev - 5));
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (focusedIndex === 1) { // Volume slider
                        setVolume(prev => Math.min(100, prev + 5));
                    } else if (focusedIndex === 2) { // Brightness slider
                        setBrightness(prev => Math.min(100, prev + 5));
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex === 0) { // Close button
                        onClose();
                    } else if (focusedIndex === 3) { // Save button
                        saveSettings();
                        onClose();
                    }
                    break;
            }
        };

        // Event mit capture=true registrieren für höhere Priorität
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [focusedIndex, onClose, volume, brightness]);

    const handleSaveEdit = (): void => {
        saveSettings();
        onClose();
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = parseInt(e.target.value);
        setVolume(value);
    };

    const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = parseInt(e.target.value);
        setBrightness(value);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleModalClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content settings-modal" onClick={handleModalClick} ref={modalRef}>
                <div className="modal-header">
                    ⚙️<h2 className="modal-title">Einstellungen ️</h2>
                    <button
                        className={`close-button ${focusedIndex === 0 ? 'keyboard-selected' : ''}`}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="setting-item">
                        <label>Lautstärke:</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={volume}
                                onChange={handleVolumeChange}
                                className={`slider ${focusedIndex === 1 ? 'keyboard-selected' : ''}`}
                            />
                            <span className="slider-value">{volume}%</span>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label>Helligkeit:</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={brightness}
                                onChange={handleBrightnessChange}
                                className={`slider ${focusedIndex === 2 ? 'keyboard-selected' : ''}`}
                            />
                            <span className="slider-value">{brightness}%</span>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label>User:</label>
                        <span className="user-name">{currentPlayer.name}</span>
                    </div>

                    <div className="setting-item">
                        <label>Gespielte Spiele:</label>
                        <span className="games-played">{currentPlayer.gamesPlayed}</span>
                    </div>

                    <div className="setting-item">
                        <label>Letztes Spiel:</label>
                        <span className="last-played">{new Date(currentPlayer.lastPlayed).toLocaleString()}</span>
                    </div>

                    <button
                        className={`edit-user-button ${focusedIndex === 3 ? 'keyboard-selected' : ''}`}
                        onClick={handleSaveEdit}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
