import { GameFeedBackPegs } from "../board/GameFeedBackPegs.tsx";

export const OtherPlayersFeedback = ({ gameState, currentPlayerToken }) => {
    const otherPlayers = gameState.guesses.filter(player => player !== currentPlayerToken);

    const playerGuesses = {};
    gameState.guesses.forEach(guess => {
        if (!playerGuesses[guess.player]) {
            playerGuesses[guess.player] = [];
        }
        playerGuesses[guess.player].push(guess);
    });

    Object.keys(playerGuesses).forEach(player => {
        playerGuesses[player].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    if (otherPlayers.length === 0) {
        return null;
    }

    return (
        <div className="other-players-feedback">
            <h3 className="other-players-title">Other Players</h3>
            <div className="players-container">
                {otherPlayers.map(player => {
                    const token = player.player
                    const guesses = playerGuesses[player] || [];
                    const playerName = token.substring(0, 8);

                    return (
                        <div key={token} className="player-feedback-section">
                            <div className="player-name">{playerName}</div>
                            <div className="player-guesses">
                                {guesses.length === 0 ? (
                                    <div className="no-guesses">No guesses yet</div>
                                ) : (
                                    guesses.map((guess, index) => (
                                        <div key={index} className="guess-feedback">
                                            <div className="guess-number">#{index + 1}</div>
                                            <GameFeedBackPegs
                                                bulls={guess.bulls}
                                                cows={guess.cows}
                                                length={gameState.config.code_length}
                                            />
                                        </div>
                                    ))
                                )}
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
        flex-direction: column;
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