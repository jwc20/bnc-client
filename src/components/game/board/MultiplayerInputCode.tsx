import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

interface ColorOption {
    value: string;
    label: string;
    color: string;
}

interface InputCodeProps {
    codeLength: number;
    numOfColors: number;
    colorsArr: ColorOption[];
    loading: boolean;
    onSubmit: (code: string) => void;
    gameType?: string | number;
    gameState?: {
        players?: string[];
        guesses: Array<{ player?: string }>;
        game_won: boolean;
        game_over: boolean;
    };
    numOfGuesses: number;
}

export const MultiplayerInputCode = ({
    codeLength,
    numOfColors,
    colorsArr,
    loading,
    onSubmit,
    // gameType,
    gameState,
    numOfGuesses
}: InputCodeProps) => {
    const colors = colorsArr.slice(0, numOfColors);

    const [code, setCode] = useState<string[]>(Array(codeLength).fill(""));
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setCode(Array(codeLength).fill(""));
    }, [codeLength]);

    const isGameEnded = () => {
        if (!gameState) return false;

        if (gameState.game_won) {
            return true;
        }

        const playerGuessCounts: Record<string, number> = {};
        gameState.guesses.forEach(guess => {
            const playerId = guess.player ?? "";
            if (!playerId) return;
            playerGuessCounts[playerId] = (playerGuessCounts[playerId] || 0) + 1;
        });

        return gameState.players?.every(player =>
            (playerGuessCounts[player] || 0) >= numOfGuesses
        );
    };

    const gameEnded = isGameEnded();

    const processInput = (e: ChangeEvent<HTMLInputElement>, slot: number) => {
        if (gameEnded) return;

        const val = e.target.value;
        if (/[^0-9]/.test(val)) return;

        const newCode = [...code];
        newCode[slot] = val;
        setCode(newCode);

        if (slot < codeLength - 1 && val !== "") {
            inputs.current[slot + 1]?.focus();
        }
    };

    const onKeyUp = (e: KeyboardEvent<HTMLInputElement>, slot: number) => {
        if (gameEnded) return;

        if (e.key === "Backspace" && !code[slot] && slot > 0) {
            const newCode = [...code];
            newCode[slot - 1] = "";
            setCode(newCode);
            inputs.current[slot - 1]?.focus();
        }

        if (e.key === "Enter" && code.every(c => c !== "")) {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (gameEnded) return;

        const codeStr = code.join("");
        if (codeStr.length === codeLength) {
            onSubmit(codeStr);
            setCode(Array(codeLength).fill(""));
            inputs.current[0]?.focus();
        }
    };

    const getInputBackgroundColor = (value: string) => {
        if (!value) return "#ffffff";
        const colorIndex = parseInt(value) - 1;
        if (colorIndex >= 0 && colorIndex < colors.length) {
            return colors[colorIndex].color;
        }
        return "#ffffff";
    };

    const getTextColor = (backgroundColor: string) => {
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    };

    return (
        <div className="code-input">
            <label className="code-label">
                {gameEnded ? "Game Ended" : `Enter numbers from 1 to ${numOfColors}`}
            </label>
            <div className="code-inputs" style={{ display: "flex", gap: 8 }}>
                {code.map((num, idx) => {
                    const backgroundColor = getInputBackgroundColor(num);
                    const textColor = getTextColor(backgroundColor);

                    return (
                        <input
                            key={idx}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={num}
                            autoFocus={!code[0] && idx === 0}
                            readOnly={loading || gameEnded}
                            onChange={(e) => processInput(e, idx)}
                            onKeyUp={(e) => onKeyUp(e, idx)}
                            ref={(ref) => {
                                inputs.current[idx] = ref;
                            }}
                            style={{
                                width: 40,
                                height: 40,
                                textAlign: "center",
                                fontSize: "0.7rem",
                                border: "2px solid #000",
                                borderRadius: 6,
                                backgroundColor: gameEnded ? "#f0f0f0" : backgroundColor,
                                color: gameEnded ? "#999" : textColor,
                                fontWeight: 'bold',
                                transition: 'background-color 0.2s ease, color 0.2s ease',
                                opacity: gameEnded ? 0.6 : 1
                            }}
                        />
                    );
                })}
            </div>
            <button
                onClick={handleSubmit}
                disabled={code.some(c => c === "") || loading || gameEnded}
                style={{
                    marginTop: 12,
                    padding: "8px 16px",
                    fontWeight: "bold",
                    background: gameEnded ? "#ccc" : "#4444ff",
                    color: gameEnded ? "#666" : "#fff",
                    border: "2px solid #000",
                    borderRadius: 4,
                    cursor: gameEnded ? "not-allowed" : "pointer",
                    opacity: gameEnded ? 0.6 : 1
                }}
            >
                {gameEnded ? "Game Over" : "Submit"}
            </button>
            <style>{style}</style>
        </div>
    );
};

const style = `
    .code-inputs {
        margin-top: 0.5rem;
    }
`