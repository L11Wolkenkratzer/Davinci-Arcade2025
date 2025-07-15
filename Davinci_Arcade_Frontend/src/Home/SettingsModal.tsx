import React, { useState, useEffect, useRef } from 'react';
import './Home.css';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [volume, setVolume] = useState<number>(50);
    const [brightness, setBrightness] = useState<number>(75);
    const [username, setUsername] = useState<string>("Mustermann");
    const [playedMinutes, setPlayedMinutes] = useState<string>("xxxx");
    const [focusedIndex, setFocusedIndex] = useState<number>(0);

    const modalRef = useRef<HTMLDivElement>(null);
    const focusableElements = ['close-button', 'volume-slider', 'brightness-slider', 'edit-user-button'];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
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
                    } else if (focusedIndex === 3) { // Edit user button
                        handleSaveEdit();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, onClose]);

    const handleSaveEdit = (): void => {
        console.log("Settings saved clicked");
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setVolume(parseInt(e.target.value));
    };

    const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setBrightness(parseInt(e.target.value));
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
                        <span className="user-name">{username}</span>
                    </div>

                    <div className="setting-item">
                        <label>Gespielte Minuten:</label>
                        <span className="played-time">{playedMinutes}</span>
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
