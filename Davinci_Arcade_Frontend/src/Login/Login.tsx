import React, { useState, useEffect, useRef } from 'react';
import '../Home/Home.css';
import type { Player } from '../App';

interface LoginProps {
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

interface KeyboardPopupProps {
  onComplete: (username: string) => void;
  badgeId: string;
}

const KeyboardPopup: React.FC<KeyboardPopupProps> = ({ onComplete, badgeId }) => {
    const [username, setUsername] = useState('');
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedCol, setSelectedCol] = useState(0);

    const keyboard = [
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3'],
        ['4', '5', '6', '7', '8', '9', 'SPACE', 'DELETE', '', 'OK']
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            
            switch (e.key) {
                case 'ArrowUp':
                    setSelectedRow(prev => {
                        const newRow = prev > 0 ? prev - 1 : keyboard.length - 1;
                        // Überprüfe ob die Spalte in der neuen Zeile existiert
                        if (selectedCol >= keyboard[newRow].length || keyboard[newRow][selectedCol] === '') {
                            setSelectedCol(keyboard[newRow].length - 1);
                        }
                        return newRow;
                    });
                    break;
                case 'ArrowDown':
                    setSelectedRow(prev => {
                        const newRow = (prev + 1) % keyboard.length;
                        // Überprüfe ob die Spalte in der neuen Zeile existiert
                        if (selectedCol >= keyboard[newRow].length || keyboard[newRow][selectedCol] === '') {
                            setSelectedCol(keyboard[newRow].length - 1);
                        }
                        return newRow;
                    });
                    break;
                case 'ArrowLeft':
                    setSelectedCol(prev => {
                        let newCol = prev > 0 ? prev - 1 : keyboard[selectedRow].length - 1;
                        // Überspringe leere Felder
                        while (keyboard[selectedRow][newCol] === '' && newCol > 0) {
                            newCol--;
                        }
                        return newCol;
                    });
                    break;
                case 'ArrowRight':
                    setSelectedCol(prev => {
                        let newCol = (prev + 1) % keyboard[selectedRow].length;
                        // Überspringe leere Felder
                        while (keyboard[selectedRow][newCol] === '' && newCol < keyboard[selectedRow].length - 1) {
                            newCol++;
                        }
                        return newCol;
                    });
                    break;
                case 'Enter':
                case ' ':
                    handleKeySelect();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedRow, selectedCol, username]);

    const handleKeySelect = () => {
        const key = keyboard[selectedRow][selectedCol];
        
        if (key === 'OK') {
            if (username.trim().length > 0) {
                onComplete(username.trim());
            }
        } else if (key === 'DELETE') {
            setUsername(prev => prev.slice(0, -1));
        } else if (key === 'SPACE') {
            setUsername(prev => prev + ' ');
        } else if (key && key !== '') {
            setUsername(prev => prev + key);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '20px',
                padding: '40px',
                border: '3px solid var(--primary-cyan)',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
                maxWidth: '900px',
                width: '90%'
            }}>
                <h2 className="arcade-title" style={{ fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center', fontFamily: 'var(--font-family)' }}>
                    Neuer Spieler
                </h2>
                
                <p style={{ 
                    color: 'var(--primary-cyan)', 
                    fontSize: '12px', 
                    marginBottom: '10px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-family)'
                }}>
                    Badge: {badgeId}
                </p>

                <div style={{
                    background: '#0a0a0a',
                    border: '2px solid var(--primary-cyan)',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '30px',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        color: 'var(--primary-cyan)',
                        fontSize: '20px',
                        fontFamily: 'var(--font-family)',
                        letterSpacing: '2px'
                    }}>
                        {username || 'Namen eingeben...'}
                        <span style={{ 
                            animation: 'blink 1s infinite',
                            marginLeft: '5px'
                        }}>|</span>
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    {keyboard.map((row, rowIndex) => (
                        <div key={rowIndex} style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center'
                        }}>
                            {row.map((key, colIndex) => {
                                if (key === '') return <div key={colIndex} style={{ width: '70px' }} />;
                                
                                const isSelected = selectedRow === rowIndex && selectedCol === colIndex;
                                const isSpecial = ['SPACE', 'DELETE', 'OK'].includes(key);
                                
                                return (
                                    <div
                                        key={colIndex}
                                        style={{
                                            width: isSpecial ? '140px' : '70px',
                                            height: '70px',
                                            background: isSelected 
                                                ? 'linear-gradient(135deg, #00ffff 0%, #0088ff 100%)'
                                                : 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
                                            border: `3px solid ${isSelected ? '#00ffff' : 'var(--primary-cyan)'}`,
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isSelected ? '#000' : 'var(--primary-cyan)',
                                            fontSize: key === 'OK' ? '16px' : isSpecial ? '10px' : '20px',
                                            fontFamily: 'var(--font-family)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isSelected 
                                                ? '0 0 20px rgba(0, 255, 255, 0.6)' 
                                                : '0 0 10px rgba(0, 255, 255, 0.2)',
                                            textShadow: isSelected ? 'none' : '0 0 10px rgba(0, 255, 255, 0.5)'
                                        }}
                                    >
                                        {key === 'SPACE' ? 'SPACE' : key}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <p style={{
                    textAlign: 'center',
                    color: '#888',
                    fontSize: '10px',
                    marginTop: '20px',
                    fontFamily: 'var(--font-family)'
                }}>
                    Joystick: Navigation |  unterer Button: OK
                </p>
            </div>

            <style>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}

const Login: React.FC<LoginProps> = ({ setCurrentPlayer }) => {
    console.log('Login component rendering');
    const [badgeInput, setBadgeInput] = useState('');
    const [isReadingBadge, setIsReadingBadge] = useState(false);
    const [showUsernameForm, setShowUsernameForm] = useState(false);
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

    const handleUsernameComplete = async (enteredUsername: string) => {
        setIsProcessing(true);
        setMessage('Registriere Benutzer...');

        try {
            const response = await fetch('http://localhost:5000/api/auth/register-with-badge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    badgeId: currentBadgeId, 
                    username: enteredUsername 
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
                setShowUsernameForm(false);
                setCurrentBadgeId('');
                resetBadgeReading();
            }

        } catch (error) {
            console.error('Registration error:', error);
            setMessage('Fehler bei der Registrierung. Bitte erneut versuchen.');
            setShowUsernameForm(false);
            setCurrentBadgeId('');
            resetBadgeReading();
        }
    };

    return (
        <>
            <div className="arcade-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="arcade-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Arcade Login</h1>
                <div style={{ textAlign: 'center' }}>
                    <p className="simple-text" style={{ marginBottom: '2rem' }}>{message}</p>
                    {isReadingBadge && !isProcessing && !showUsernameForm && (
                        <p style={{ color: '#666', fontSize: '18px', marginBottom: '1rem' }}>
                            Eingabe: {badgeInput}
                        </p>
                    )}
                    {isProcessing && !showUsernameForm && (
                        <p style={{ color: '#007bff', fontSize: '18px', marginBottom: '1rem' }}>
                            Verarbeitung läuft...
                        </p>
                    )}
                </div>
            </div>
            
            {showUsernameForm && (
                <KeyboardPopup 
                    onComplete={handleUsernameComplete}
                    badgeId={currentBadgeId}
                />
            )}
        </>
    );
}

export default Login;
