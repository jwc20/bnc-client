import { GameRow } from '../board/GameRow.tsx';
import { GameFeedBackPegs } from "../board/GameFeedBackPegs.tsx";

export const SingleBoard = ({ roomId, colors, gameState, length, numOfGuesses }) => {
    const convertGuessToRow = (guess) => {
        return guess.split('').map(digit => colors[parseInt(digit) - 1]);
    };

    const gameRows = gameState.guesses.reduce((acc, guess, index) => {
        acc[index] = convertGuessToRow(guess.guess);
        return acc;
    }, {});

    const feedbackState = gameState.guesses.reduce((acc, guess, index) => {
        acc[index] = { bulls: guess.bulls, cows: guess.cows };
        return acc;
    }, {});

    return (
        <div className="game-board-container">
            <div className="game-main-layout">
                <div className="game-board">
                    <div className="game-rows-container">
                        {Array.from({ length: numOfGuesses }).map((_, i) => {
                            const rowIndex = numOfGuesses - i - 1;
                            const row = gameRows[rowIndex];
                            const isCurrentRow = rowIndex === gameState.current_row;
                            const isActiveRow = rowIndex <= gameState.current_row;

                            return (
                                <div
                                    key={rowIndex}
                                    className={`game-board-row ${isActiveRow ? 'active' : 'inactive'}`}
                                >
                                    <div className={`row-number ${isCurrentRow ? 'current' : ''}`}>
                                        {rowIndex + 1}
                                    </div>
                                    <GameRow row={row} length={length} />
                                    <div className="feedback-section">
                                        <GameFeedBackPegs
                                            bulls={feedbackState[rowIndex]?.bulls}
                                            cows={feedbackState[rowIndex]?.cows}
                                            length={length}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style>{styles}</style>
        </div>
    );
};



const styles = `
    .game-board-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .game-main-layout {
        display: flex;
        align-items: flex-start;
        gap: 32px;
    }

    .game-board {
        border: 2px solid #000;
        width: 100%;
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
        font-size: 0.5rem;
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
        font-size: 1rem;
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
        font-size: 0.5rem;
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