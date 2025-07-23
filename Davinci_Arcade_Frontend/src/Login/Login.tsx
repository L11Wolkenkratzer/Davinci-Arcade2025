import React, { useState, useEffect, useRef } from 'react';
import '../Home/Home.css';
import type { Player } from '../App';

interface LoginProps {
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

const Login: React.FC<LoginProps> = ({ setCurrentPlayer }) => {
    console.log('Login component rendering');
    const [badgeInput, setBadgeInput] = useState('');
    const [isReadingBadge, setIsReadingBadge] = useState(false);
    const [showUsernameForm, setShowUsernameForm] = useState(false);
    const [username, setUsername] = useState('');
    const [currentBadgeId, setCurrentBadgeId] = useState('');
    const [message, setMessage] = useState('Badge an das Lesegerät halten...');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const inputTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Separate useEffect für KeyPress Handler - läuft nur einmal
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Ignore if already processing or showing username form
            if (isProcessing || showUsernameForm) return;
            
            // Nur alphanumerische Zeichen akzeptieren
            if (/^[a-zA-Z0-9]$/.test(event.key)) {
                setBadgeInput(prev => {
                    const newInput = prev + event.key;
                    
                    // Clear existing timeout
                    if (inputTimeoutRef.current) {
                        clearTimeout(inputTimeoutRef.current);
                    }
                    
                    // Set new timeout für 1.5 Sekunden
                    inputTimeoutRef.current = setTimeout(() => {
                        processBadgeId(newInput);
                    }, 1000);
                    
                    return newInput;
                });
                
                if (!isReadingBadge) {
                    setIsReadingBadge(true);
                    setMessage('Badge wird gelesen...');
                }
            }
        };

        document.addEventListener('keypress', handleKeyPress);
        
        return () => {
            document.removeEventListener('keypress', handleKeyPress);
            if (inputTimeoutRef.current) {
                clearTimeout(inputTimeoutRef.current);
            }
        };
    }, [isProcessing, showUsernameForm]); // Nur diese Dependencies

    const processBadgeId = async (badgeId: string) => {
        if (!badgeId || badgeId.length === 0) {
            resetBadgeReading();
            return;
        }

        setIsProcessing(true);
        setMessage('Verarbeite Badge...');

        try {
            const response = await fetch('http://localhost:5000/api/auth/badge-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ badgeId })
            });

            const data = await response.json();

            if (data.success) {
                // Spieler existiert - Login erfolgreich
                const player: NonNullable<Player> = {
                  _id: data.player._id,
                  name: data.player.name,
                  badgeId: data.player.badgeId,
                  totalScore: data.player.totalScore,
                  gamesPlayed: data.player.gamesPlayed,
                  lastPlayed: typeof data.player.lastPlayed === 'string' ? data.player.lastPlayed : new Date(data.player.lastPlayed).toISOString(),
                  updatedAt: data.player.updatedAt || new Date().toISOString(),
                  createdAt: data.player.createdAt,
                  __v: data.player.__v
                };
                localStorage.setItem('currentPlayer', JSON.stringify(player));
                setCurrentPlayer(player);
                setMessage(`Willkommen ${data.player.name}!`);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else if (data.requiresUsername) {
                // Neuer Spieler - Username-Formular anzeigen
                setCurrentBadgeId(badgeId);
                setShowUsernameForm(true);
                setMessage('Neuer Badge erkannt. Bitte Benutzername eingeben:');
                setIsProcessing(false);
            }

        } catch (error) {
            console.error('Login error:', error);
            setMessage('Fehler beim Login. Bitte Badge erneut scannen.');
            resetBadgeReading();
        }
    };

    const resetBadgeReading = () => {
        setBadgeInput('');
        setIsReadingBadge(false);
        setIsProcessing(false);
        setMessage('Badge an das Lesegerät halten...');
        if (inputTimeoutRef.current) {
            clearTimeout(inputTimeoutRef.current);
            inputTimeoutRef.current = null;
        }
    };

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim()) {
            alert('Bitte Benutzername eingeben');
            return;
        }

        setIsProcessing(true);
        setMessage('Registriere Benutzer...');

        try {
            const response = await fetch('http://localhost:5000/api/auth/register-with-badge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    badgeId: currentBadgeId, 
                    username: username.trim() 
                })
            });

            const data = await response.json();

            if (data.success) {
                const player: NonNullable<Player> = {
                  _id: data.player._id,
                  name: data.player.name,
                  badgeId: data.player.badgeId,
                  totalScore: data.player.totalScore,
                  gamesPlayed: data.player.gamesPlayed,
                  lastPlayed: typeof data.player.lastPlayed === 'string' ? data.player.lastPlayed : new Date(data.player.lastPlayed).toISOString(),
                  updatedAt: data.player.updatedAt || new Date().toISOString(),
                  createdAt: data.player.createdAt,
                  __v: data.player.__v
                };
                localStorage.setItem('currentPlayer', JSON.stringify(player));
                setCurrentPlayer(player);
                setMessage(`Willkommen ${data.player.name}!`);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                setMessage('Fehler bei der Registrierung. Bitte erneut versuchen.');
                setIsProcessing(false);
            }

        } catch (error) {
            console.error('Registration error:', error);
            setMessage('Fehler bei der Registrierung. Bitte erneut versuchen.');
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setShowUsernameForm(false);
        setUsername('');
        setCurrentBadgeId('');
        resetBadgeReading();
    };

    const focusableElements = [
        showUsernameForm ? 'input' : null,
        showUsernameForm ? 'submit' : null,
        showUsernameForm ? 'cancel' : null
    ].filter(Boolean);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const submitRef = useRef<HTMLButtonElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!showUsernameForm) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showUsernameForm) return;
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => (prev + 1) % focusableElements.length);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => (prev - 1 + focusableElements.length) % focusableElements.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (focusableElements[focusedIndex] === 'input') {
                        inputRef.current?.focus();
                    } else if (focusableElements[focusedIndex] === 'submit') {
                        submitRef.current?.click();
                    } else if (focusableElements[focusedIndex] === 'cancel') {
                        cancelRef.current?.click();
                    }
                    break;
                default:
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showUsernameForm, focusedIndex, focusableElements.length]);

    useEffect(() => {
        if (!showUsernameForm) return;
        if (focusableElements[focusedIndex] === 'input') {
            inputRef.current?.focus();
        }
    }, [focusedIndex, showUsernameForm]);
    return (
        <div className="arcade-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h1 className="arcade-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Arcade Login</h1>
            {!showUsernameForm ? (
                <div style={{ textAlign: 'center' }}>
                    <p className="simple-text" style={{ marginBottom: '2rem' }}>{message}</p>
                    {isReadingBadge && !isProcessing && (
                        <p style={{ color: '#666', fontSize: '18px', marginBottom: '1rem' }}>
                            Eingabe: {badgeInput}
                        </p>
                    )}
                    {isProcessing && (
                        <p style={{ color: '#007bff', fontSize: '18px', marginBottom: '1rem' }}>
                            Verarbeitung läuft...
                        </p>
                    )}
                </div>
            ) : (
                <form onSubmit={handleUsernameSubmit} style={{ textAlign: 'center' }}>
                    <p className="simple-text" style={{ marginBottom: '1.5rem' }}>{message}</p>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '1.5rem' }}>
                        Badge ID: {currentBadgeId}
                    </p>
                    <div style={{ margin: '20px 0' }}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Benutzername eingeben"
                            className={`user-text${focusableElements[focusedIndex]==='input' ? ' keyboard-selected' : ''}`}
                            style={{
                                padding: '10px',
                                fontSize: '20px',
                                width: '300px',
                                textAlign: 'center',
                                marginBottom: '10px',
                                borderRadius: '8px',
                                border: '2px solid var(--primary-cyan)',
                                background: '#111',
                                color: 'var(--primary-cyan)'
                            }}
                            autoFocus
                            disabled={isProcessing}
                            ref={inputRef}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <button 
                            type="submit"
                            disabled={isProcessing}
                            className={`edit-user-button${focusableElements[focusedIndex]==='submit' ? ' keyboard-selected' : ''}`}
                            style={{
                                backgroundColor: isProcessing ? '#ccc' : undefined,
                                minWidth: 180
                            }}
                            ref={submitRef}
                        >
                            {isProcessing ? 'Registriere...' : 'Registrieren'}
                        </button>
                        <button 
                            type="button"
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className={`logout-button${focusableElements[focusedIndex]==='cancel' ? ' keyboard-selected' : ''}`}
                            style={{ minWidth: 180 }}
                            ref={cancelRef}
                        >
                            Abbrechen
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default Login;
