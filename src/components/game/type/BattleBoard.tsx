import { GameRow, type GameRowColor } from '../board/GameRow.tsx';
import { GameFeedBackPegs } from "../board/GameFeedBackPegs.tsx";
import type { GameGuess, GameState as StoreGameState } from '../../../stores';

interface BattleBoardProps {
    colors: GameRowColor[];
    gameState: StoreGameState;
    length: number;
    numOfGuesses: number;
    currentPlayerToken: string | null;
}

export const BattleBoard = ({ colors, gameState, length, numOfGuesses, currentPlayerToken }: BattleBoardProps) => {

    const toDigitsArray = (value: unknown): number[] => {
        if (Array.isArray(value)) {
            return (value as Array<number | string>).map(Number);
        }
        if (typeof value === 'string') {
            return value.split('').map(Number);
        }
        return [];
    };

    const convertGuessToRow = (guessLike: unknown): Array<GameRowColor | undefined> => {
        const digits = toDigitsArray(guessLike);
        return digits.map((digit: number) => colors[digit - 1]);
    };

    const isGameEnded = (): boolean => {
        if (gameState.game_won) {
            return true;
        }

        if (gameState.players && gameState.players.length > 0) {
            const playerGuessCounts: Record<string, number> = {};
            gameState.guesses.forEach((guess: GameGuess) => {
                const playerId = guess.player ?? '';
                if (!playerId) return;
                playerGuessCounts[playerId] = (playerGuessCounts[playerId] ?? 0) + 1;
            });

            return gameState.players.every(
                (playerId: string) => (playerGuessCounts[playerId] ?? 0) >= numOfGuesses
            );
        }

        return false;
    };

    const currentPlayerGuesses: GameGuess[] = gameState.guesses.filter(
        (guess: GameGuess) => !!currentPlayerToken && guess.player === currentPlayerToken
    );
    const currentPlayerRow = currentPlayerGuesses.length;

    const gameRows = currentPlayerGuesses.reduce<Record<number, Array<GameRowColor | undefined>>>((acc, guess: GameGuess, index: number) => {
        acc[index] = convertGuessToRow(guess.guess as unknown);
        return acc;
    }, {});

    const feedbackState = currentPlayerGuesses.reduce<Record<number, { bulls: number; cows: number } | undefined>>(
        (acc, guess: GameGuess, index: number) => {
            acc[index] = { bulls: guess.bulls, cows: guess.cows };
            return acc;
        },
        {}
    );

    const gameEnded = isGameEnded();

    return (
        <div className="game-board-container">
            <div className="game-main-layout">
                <div className="game-board">
                    <div className="game-rows-container">
                        {Array.from({ length: numOfGuesses }).map((_, i) => {
                            const rowIndex = numOfGuesses - i - 1;
                            const row = gameRows[rowIndex];
                            const isCurrentRow = rowIndex === currentPlayerRow && !gameEnded;
                            const isActiveRow = rowIndex <= currentPlayerRow;

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