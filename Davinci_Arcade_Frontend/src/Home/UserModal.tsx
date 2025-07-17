import React, { useEffect, useState } from 'react';
import './Home.css';
import type { Player } from '../App';

interface UserModalProps {
    onClose: () => void;
    setCurrentPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

interface UserInfo {
    username: string;
    highscore: number;
}

const UserModal: React.FC<UserModalProps> = ({ onClose, setCurrentPlayer }) => {
    const [focusedIndex, setFocusedIndex] = useState<number>(0);

    const userInfo: UserInfo = {
        username: "Mustermann",
        highscore: 99
    };

    const focusableElements = ['close-button', 'logout-button'];

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
                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex === 0) { // Close button
                        onClose();
                    } else if (focusedIndex === 1) { // Logout button
                        logout();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, onClose]);

    const logout = () => {
        localStorage.removeItem('currentPlayer');
        setCurrentPlayer(null);
        window.location.href = '/login';
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
            <div className="modal-content user-modal" onClick={handleModalClick}>
                <div className="modal-header">
                    <h2 className="modal-title">User</h2>
                    <button
                        className={`close-button ${focusedIndex === 0 ? 'keyboard-selected' : ''}`}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="user-info">
                        <p>User: {userInfo.username}</p>
                        <p>Highscore: {userInfo.highscore}</p>
                    </div>

                    <button
                        className={`logout-button ${focusedIndex === 1 ? 'keyboard-selected' : ''}`}
                        onClick={logout}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
