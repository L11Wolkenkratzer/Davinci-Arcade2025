import React from 'react';
import GamePlayCanvas from './GamePlayCanvas';

interface GamePlayProps {
    onGameOver: (score: number, coins: number) => void;
    onPause: () => void;
    onStart: () => void;
    onReset?: () => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ onGameOver, onPause, onStart }) => {
    return (
        <div className="gameplay-root">
            <GamePlayCanvas onGameOver={onGameOver} onPause={onPause} onStart={onStart} />
        </div>
    );
};

export default GamePlay;