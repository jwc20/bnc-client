import { useEffect } from 'react';
import { useGame } from '../../stores/singlePlayerGameStore.ts';
import { GameRow } from "../board/GameRow.tsx";
import { GameFeedBackPegs } from "../board/GameFeedBackPegs.tsx";
import {InputCode} from '../board/InputCode.tsx';



// Type definitions
interface ColorOption {
    value: string;
    label: string;
    color: string;
}

interface GameState {
    [index: number]: ColorOption[];
}

interface FeedbackState {
    [index: number]: { bulls: number; cows: number };
}

const COLORS: ColorOption[] = [
    { value: 'red', label: 'Red', color: '#ff4444' },
    { value: 'blue', label: 'Blue', color: '#4444ff' },
    { value: 'green', label: 'Green', color: '#44ff44' },
    { value: 'yellow', label: 'Yellow', color: '#ffff44' },
    { value: 'purple', label: 'Purple', color: '#ff44ff' },
    { value: 'orange', label: 'Orange', color: '#ff8844' }
];

export const GameBoard = () => {
    const game = useGame();

    // Convert guesses to the format expected by GameRow
    const convertGuessToRow = (guess: string): ColorOption[] => {
        return guess.split('').map(digit => COLORS[parseInt(digit) - 1]);
    };

    // Create gameState object from store guesses
    const gameState: GameState = game.guesses.reduce<GameState>((acc, guess, index) => {
        acc[index] = convertGuessToRow(guess.guess);
        return acc;
    }, {});

    // Create feedbackState object from store guesses
    const feedbackState: FeedbackState = game.guesses.reduce<FeedbackState>((acc, guess, index) => {
        acc[index] = { bulls: guess.bulls, cows: guess.cows };
        return acc;
    }, {});

    const handleSubmitCode = async (codeStr: string) => {
        if (game.isLoading) return;

        // Validate input
        if (!game.isValidGuess(codeStr)) {
            alert(`Invalid input. Use digits 1-${game.numOfColors} only, with ${game.codeLength} digits.`);
            return;
        }

        const success = await game.submitGuess(codeStr);
        if (!success && game.error) {
            // Error is already set in store, component will show it
            console.error('Failed to submit guess:', game.error);
        }
    };

    // Auto-clear errors after a delay
    useEffect(() => {
        if (game.error) {
            console.error('Game error:', game.error);
            const timer = setTimeout(() => {
                game.clearError();
            }, 5000); // Auto-clear after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [game.error, game.clearError]);

    // Handle game initialization
    useEffect(() => {
        if (!game.room && !game.isLoading) {
            // Auto-create a room if none exists
            game.createRandomRoom();
        }
    }, [game.room, game.isLoading, game.createRandomRoom]);

    // Show loading state if no room
    if (!game.room && game.isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-text">Setting up your game...</div>
            </div>
        );
    }

    // Show error state if room creation failed
    if (!game.room && game.error) {
        return (
            <div className="error-container">
                <div className="error-text">Failed to create game room</div>
                <div className="error-details">{game.error}</div>
                <button
                    onClick={() => game.createRandomRoom()}
                    className="retry-button"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="game-board-container">
            {/* Game Info Header */}
            <div className="game-info">
                <div className="game-stats">
                    Room #{game.room?.id} | {game.codeLength} digits | {game.numOfColors} colors
                </div>
            </div>

            <div className="game-board">
                <div className="game-rows-container">
                    {Array.from({ length: game.numOfGuesses }).map((_, i) => {
                        const rowIndex = game.numOfGuesses - 1 - i;
                        const row = gameState[rowIndex];
                        const isCurrentRow = rowIndex === game.current_row;
                        const isActiveRow = rowIndex <= game.current_row;

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

            {!game.game_over ? (
                <div className="input-section">
                    <InputCode
                        length={game.codeLength}
                        label={`Enter code (1-${game.numOfColors})`}
                        loading={game.isLoading}
                        onSubmit={handleSubmitCode}
                    />
                    <div className="remaining-guesses">
                        Remaining guesses: {game.remaining_guesses}
                    </div>
                </div>
            ) : (
                <div className="game-over-section">
                    <div className="game-over-text">
                        Game Over
                    </div>
                    {game.game_won ? (
                        <div className="win-message">
                            🎉 You Won! 🎉
                            <div className="win-details">
                                Solved in {game.guesses.length} guess{game.guesses.length !== 1 ? 'es' : ''}
                            </div>
                        </div>
                    ) : (
                        <div className="lose-message">
                            Better luck next time!
                        </div>
                    )}
                    <div className="game-actions">
                        <button
                            onClick={game.resetGame}
                            className="play-again-button"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => game.createRandomRoom()}
                            className="new-room-button"
                        >
                            New Room
                        </button>
                    </div>
                </div>
            )}

            {game.error && (
                <div className="error-section">
                    <div className="error-content">
                        <span className="error-icon">⚠️</span>
                        <span className="error-message">{game.error}</span>
                        <button
                            onClick={game.clearError}
                            className="error-close-button"
                            title="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
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