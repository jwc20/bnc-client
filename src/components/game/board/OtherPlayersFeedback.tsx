import { GameFeedBackPegs } from "../board/GameFeedBackPegs.tsx";

export const OtherPlayersFeedback = ({ gameState, currentPlayerToken }) => {
    const otherPlayers = gameState.guesses.filter(
        guess => guess.player !== currentPlayerToken
    );

    const playerGuesses = {};
    gameState.guesses.forEach(guess => {
        if (!playerGuesses[guess.player]) {
            playerGuesses[guess.player] = [];
        }
        playerGuesses[guess.player].push(guess);
    });

    // Sort by timestamp ascending (oldest first)
    Object.keys(playerGuesses).forEach(player => {
        playerGuesses[player].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
    });

    const uniquePlayerTokens = [...new Set(otherPlayers.map(guess => guess.player))];

    if (uniquePlayerTokens.length === 0) {
        return null;
    }

    return (
        <div className="other-players-feedback">
            <h3 className="other-players-title">Other Players</h3>
            <div className="players-container">
                {uniquePlayerTokens.map(token => {
                    const guesses = playerGuesses[token] || [];
                    const playerName = token.substring(0, 8);

                    const totalSlots = gameState.config.num_of_guesses;
                    const filledSlots = [...guesses];
                    while (filledSlots.length < totalSlots) {
                        filledSlots.push(null);
                    }

                    // Reverse so that index 0 (top) is guess #totalSlots, and bottom is #1
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
                                        {/*<div className="guess-number">*/}
                                        {/*    #{i + 1}*/}
                                        {/*</div>*/}
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
        background: #f8f9fa;
        border: 2px solid #000;
        border-radius: 8px;
        padding: 16px;
        margin-top: 16px;
        min-width: 300px;
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
    }
    .player-feedback-section {
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 12px;
        background: white;
        min-width: 120px;
        flex-shrink: 0;
    }
    .player-name {
        font-weight: bold;
        font-size: 0.9rem;
        color: #555;
        margin-bottom: 8px;
        text-align: center;
    }
    .player-guesses {
        display: flex;
        flex-direction: column-reverse; /* Bottom-up display */
        gap: 6px;
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
