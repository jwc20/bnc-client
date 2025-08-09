import { useState, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";


interface ColorOption {
    value: string;
    label: string;
    color: string;
}


interface InputCodeProps {
    length: number;
    numOfColors: number;
    colors: ColorOption[];
    loading: boolean;
    onSubmit: (code: string) => void;
}

export const InputCode = ({ length, numOfColors, colors, loading, onSubmit }: InputCodeProps) => {
    const [code, setCode] = useState<string[]>(Array(length).fill(""));
    const inputs = useRef<(HTMLInputElement | null)[]>([]);


    const processInput = (e: ChangeEvent<HTMLInputElement>, slot: number) => {
        const val = e.target.value;
        if (/[^0-9]/.test(val)) return;

        const newCode = [...code];
        newCode[slot] = val;
        setCode(newCode);

        if (slot < length - 1 && val !== "") {
            inputs.current[slot + 1]?.focus();
        }
    };

    const onKeyUp = (e: KeyboardEvent<HTMLInputElement>, slot: number) => {
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
        const codeStr = code.join("");
        if (codeStr.length === length) {
            onSubmit(codeStr);
            setCode(Array(length).fill(""));
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
            <label className="code-label">Enter numbers from 1 to {numOfColors - 1}</label>
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
                            readOnly={loading}
                            onChange={(e) => processInput(e, idx)}
                            onKeyUp={(e) => onKeyUp(e, idx)}
                            ref={(ref) => {
                                inputs.current[idx] = ref;
                            }}
                            style={{
                                width: 40,
                                height: 40,
                                textAlign: "center",
                                fontSize: 24,
                                border: "2px solid #000",
                                borderRadius: 6,
                                backgroundColor,
                                color: textColor,
                                fontWeight: 'bold',
                                transition: 'background-color 0.2s ease, color 0.2s ease'
                            }}
                        />
                    );
                })}
            </div>
            <button
                onClick={handleSubmit}
                disabled={code.some(c => c === "") || loading}
                style={{
                    marginTop: 12,
                    padding: "8px 16px",
                    fontWeight: "bold",
                    background: "#4444ff",
                    color: "#fff",
                    border: "2px solid #000",
                    borderRadius: 4,
                    cursor: "pointer",
                }}
            >
                Submit
            </button>
        </div>
    );
};