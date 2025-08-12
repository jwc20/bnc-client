import { GameFeedBackPegs } from "../board/GameFeedBackPegs.tsx";
import type { GameGuess, GameState as StoreGameState } from "../../../stores";

type OtherPlayersFeedbackProps = {
    gameState: StoreGameState;
    currentPlayerToken: string | null;
};

export const OtherPlayersFeedback = ({ gameState, currentPlayerToken }: OtherPlayersFeedbackProps) => {
    const playerGuesses: Record<string, GameGuess[]> = {};
    gameState.guesses.forEach((guess: GameGuess) => {
        const playerId = guess.player;
        if (!playerId) return;
        if (!playerGuesses[playerId]) {
            playerGuesses[playerId] = [];
        }
        playerGuesses[playerId].push(guess);
    });

    // Sort by timestamp ascending (oldest first)
    Object.keys(playerGuesses).forEach((playerId: string) => {
        playerGuesses[playerId].sort((a: GameGuess, b: GameGuess) => {
            const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return aTime - bTime;
        });
    });

    const uniquePlayerTokens: string[] = Object.keys(playerGuesses).filter(
        (token) => token !== (currentPlayerToken ?? "")
    );

    if (uniquePlayerTokens.length === 0) {
        return null;
    }

    return (
        <div className="other-players-feedback">
            <div className="players-container">
                {uniquePlayerTokens.map((token: string) => {
                    const guesses: GameGuess[] = playerGuesses[token] ?? [];
                    const playerName = token.substring(0, 8);

                    const totalSlots = gameState.config.num_of_guesses;
                    const filledSlots: Array<GameGuess | null> = [...guesses];
                    while (filledSlots.length < totalSlots) {
                        filledSlots.push(null);
                    }

                    // Using flex column-reverse to show bottom-up
                    const slotsBottomUp = [...filledSlots];

                    return (
                        <div key={token} className="player-feedback-section">
                            <div className="player-name">{playerName}</div>
                            <div className="player-guesses">
                                {slotsBottomUp.map((guess, i) => (
                                    <div
                                        key={i}
                                        className={`guess-feedback ${!guess ? "empty-feedback" : ""}`}
                                    >
                                        {guess ? (
                                            <GameFeedBackPegs
                                                bulls={guess.bulls}
                                                cows={guess.cows}
                                                length={gameState.config.code_length}
                                            />
                                        ) : (
                                            <GameFeedBackPegs
                                                bulls={0}
                                                cows={0}
                                                length={gameState.config.code_length}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <style>{styles}</style>
        </div>
    );
};

const styles = `
    .other-players-feedback {
        border: 2px solid #000;
        justify-content: center;
        padding: 16px;
    }
    .other-players-title {
        margin: 0 0 12px 0;
        font-size: 1rem;
        font-weight: bold;
        text-align: center;
        color: #333;
    }
    .players-container {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        align-items: center;
        justify-content: center;
    }
    .player-feedback-section {
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 12px;
        min-width: 120px;
        flex-shrink: 0;
    }
    .player-name {
        font-weight: bold;
        font-size: 0.4rem;
        color: #555;
        margin-bottom: 8px;
        text-align: center;
    }
    .player-guesses {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
    }
    .guess-feedback {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px;
        min-height: 20px;
    }
    .guess-number {
        font-size: 0.8rem;
        font-weight: bold;
        color: #666;
        min-width: 24px;
    }
    .empty-feedback {
        opacity: 0.3;
    }
    .no-guesses {
        text-align: center;
        color: #999;
        font-style: italic;
        font-size: 0.8rem;
        padding: 8px;
    }
`;
