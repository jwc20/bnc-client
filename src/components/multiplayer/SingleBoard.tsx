
import { useEffect } from 'react';
import { InputCode } from './InputCode.tsx';

import { useWebSocketStore } from '../../stores/webSocketStore';

const COLORS = [
    { value: 'red', label: 'Red', color: '#ff4444' },
    { value: 'blue', label: 'Blue', color: '#4444ff' },
    { value: 'green', label: 'Green', color: '#44ff44' },
    { value: 'yellow', label: 'Yellow', color: '#ffff44' },
    { value: 'purple', label: 'Purple', color: '#ff44ff' },
    { value: 'orange', label: 'Orange', color: '#ff8844' }
];


const GameColorPeg = ({ color }) => (
    <div
        className="game-color-peg"
        style={{
            backgroundColor: color?.color || '#fff',
        }}
    />
);


const GameFeedBackPegs = ({ bulls, cows }) => {
    if (bulls === undefined && cows === undefined) {
        return (
            <div className="feedback-pegs-container">
                <div className="feedback-row">
                    {[0, 1].map(i => (
                        <div key={i} className="feedback-peg empty">
                            X
                        </div>
                    ))}
                </div>
                <div className="feedback-row">
                    {[2, 3].map(i => (
                        <div key={i} className="feedback-peg empty">
                            X
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const pegs = [];
    for (let i = 0; i < (bulls || 0); i++) pegs.push('black');
    for (let i = 0; i < (cows || 0); i++) pegs.push('white');
    while (pegs.length < 4) pegs.push('empty');

    return (
        <div className="feedback-pegs-container">
            <div className="feedback-row">
                {pegs.slice(0, 2).map((color, i) => (
                    <div
                        key={i}
                        className={`feedback-peg ${color}`}
                    >
                        {color === 'empty' ? 'X' : ''}
                    </div>
                ))}
            </div>
            <div className="feedback-row">
                {pegs.slice(2, 4).map((color, i) => (
                    <div
                        key={i}
                        className={`feedback-peg ${color}`}
                    >
                        {color === 'empty' ? 'X' : ''}
                    </div>
                ))}
            </div>
        </div>
    );
};


const GameRow = ({ row = [] }) => (
    <div className="game-row">
        {Array.from({ length: 4 }).map((_, i) => (
            <GameColorPeg key={i} color={row[i]} />
        ))}
    </div>
);



export const SingleBoard = ({ roomId }) => {
    const {
        gameState,
        isConnected,
        connect,
        disconnect,
        submitGuess,
        resetGame,
        clearError
    } = useWebSocketStore();

    useEffect(() => {
        if (roomId) {
            connect(roomId);
            return () => disconnect();
        }
    }, [roomId]);

    const convertGuessToRow = (guess) => {
        return guess.split('').map(digit => COLORS[parseInt(digit) - 1]);
    };

    const gameRows = gameState.guesses.reduce((acc, guess, index) => {
        acc[index] = convertGuessToRow(guess.guess);
        return acc;
    }, {});

    const feedbackState = gameState.guesses.reduce((acc, guess, index) => {
        acc[index] = { bulls: guess.bulls, cows: guess.cows };
        return acc;
    }, {});

    const handleSubmitCode = (codeStr) => {
        if (gameState.isLoading) return;

        const digits = codeStr.split('').map(Number);
        if (digits.some(d => d < 1 || d > COLORS.length)) {
            alert('Invalid input. Use digits 1-6 only.');
            return;
        }

        submitGuess(codeStr);
    };

    useEffect(() => {
        if (gameState.error) {
            console.error('Game error:', gameState.error);
        }
    }, [gameState.error]);

    if (!isConnected) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ fontSize: '20px', color: '#666' }}>Connecting to game server...</div>
            </div>
        );
    }

    return (
        <div className="game-board-container">
            <div className="game-board">
                <div className="game-rows-container">
                    {Array.from({ length: 10 }).map((_, i) => {
                        const rowIndex = 9 - i;
                        const row = gameRows[rowIndex];
                        const isCurrentRow = rowIndex === gameState.currentRow;
                        const isActiveRow = rowIndex <= gameState.currentRow;

                        return (
                            <div
                                key={rowIndex}
                                className={`game-board-row ${isActiveRow ? 'active' : 'inactive'}`}
                            >
                                <div className={`row-number ${isCurrentRow ? 'current' : ''}`}>
                                    {rowIndex + 1}
                                </div>
                                <GameRow row={row} />
                                <div className="feedback-section">
                                    <GameFeedBackPegs
                                        bulls={feedbackState[rowIndex]?.bulls}
                                        cows={feedbackState[rowIndex]?.cows}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {!gameState.gameOver ? (
                <div className="input-section">
                    <InputCode
                        length={4}
                        label="Enter code (1-6)"
                        loading={gameState.isLoading}
                        onSubmit={handleSubmitCode}
                    />
                    <div className="remaining-guesses">
                        Remaining guesses: {gameState.remainingGuesses}
                    </div>
                </div>
            ) : (
                <div className="game-over-section">
                    <div className="game-over-text">
                        game over
                    </div>
                    {gameState.gameWon ? (
                        <div className="win-message">
                            you won
                        </div>
                    ) : (
                        <div className="lose-message">
                            you lost
                        </div>
                    )}
                    {gameState.secretCode && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                            Secret code was: {gameState.secretCode}
                        </div>
                    )}
                    <button
                        onClick={resetGame}
                        className="play-again-button"
                    >
                        Play Again
                    </button>
                </div>
            )}

            {gameState.error && (
                <div className="error-section">
                    Error: {gameState.error}
                    <button
                        onClick={clearError}
                        className="error-close-button"
                    >
                        ✕
                    </button>
                </div>
            )}

            <style>{styles}</style>
        </div>
    );
};


const styles = `
    .game-board-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 40px;
    }

    .game-board {
        border: 2px solid #000;
        width: 500px;
        padding: 24px;
    }

    .game-rows-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .game-board-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .game-board-row.active {
        opacity: 1;
    }

    .game-board-row.inactive {
        opacity: 0.6;
    }

    .row-number {
        width: 32px;
        height: 32px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
        border: 2px solid #000;
        border-radius: 4px;
    }

    .row-number.current {
        background: #90EE90;
    }

    .game-row {
        display: flex;
        gap: 12px;
    }

    .game-color-peg {
        width: 36px;
        height: 36px;
        border: 2px solid #000;
        border-radius: 50%;
    }

    .feedback-section {
        margin-left: 16px;
    }

    .feedback-pegs-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .feedback-row {
        display: flex;
        gap: 4px;
    }

    .feedback-peg {
        width: 12px;
        height: 12px;
        border: 1px solid #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial;
        font-weight: bold;
        font-size: 13px;
    }

    .feedback-peg.black {
        background: #000;
    }

    .feedback-peg.white {
        background: #fff;
    }

    .feedback-peg.empty {
        background: #fafafa;
        color: black;
        font-size: 14px;
    }

    .input-section {
        margin-top: 24px;
    }

    .remaining-guesses {
        margin-top: 8px;
        text-align: center;
        font-size: 14px;
        color: #666;
    }

    .game-over-section {
        margin-top: 24px;
        text-align: center;
    }

    .game-over-text {
        font-style: italic;
        font-size: 18px;
        margin-bottom: 8px;
    }

    .win-message {
        color: green;
        font-weight: bold;
    }

    .lose-message {
        color: red;
    }

    .play-again-button {
        margin-top: 12px;
        padding: 8px 16px;
        cursor: pointer;
    }

    .error-section {
        margin-top: 16px;
        color: red;
        text-align: center;
    }

    .error-close-button {
        margin-left: 8px;
        padding: 4px 8px;
        cursor: pointer;
    }

    .code-input {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .code-label {
        font-size: 18px;
        font-weight: 600;
        color: #333;
    }
`;