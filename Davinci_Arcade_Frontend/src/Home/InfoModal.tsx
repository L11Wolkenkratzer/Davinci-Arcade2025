import React, { useEffect, useState } from 'react';
import './Home.css';

interface InfoModalProps {
    onClose: () => void;
}

interface AppInfo {
    version: string;
    description: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    const [focusedIndex, setFocusedIndex] = useState<number>(0);

    const appInfo: AppInfo = {
        version: "v1.0",
        description: "Erstellt von Gian, Livio & Philip.Unser Davinci Projekt 2025."
    };

    const focusableElements = ['close-button'];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                case 'Enter':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

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
            <div className="modal-content info-modal" onClick={handleModalClick}>
                <div className="modal-header">
                    <h2 className="modal-title"> Info</h2>
                    <button
                        className={`close-button ${focusedIndex === 0 ? 'keyboard-selected' : ''}`}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <div className="info-content">
                        <p>DAVINCI ARCADE </p>
                        <p>{appInfo.version}</p>
                        <p>{appInfo.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
