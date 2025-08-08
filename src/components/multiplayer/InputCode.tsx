
import { useState, useEffect, useRef } from 'react';



export const InputCode = ({ length, label, loading, onSubmit }) => {
    const [code, setCode] = useState(Array(length).fill(""));
    const inputs = useRef([]);

    const processInput = (e, slot) => {
        const val = e.target.value;
        if (/[^1-6]/.test(val)) return;

        const newCode = [...code];
        newCode[slot] = val;
        setCode(newCode);

        if (slot < length - 1 && val !== "") {
            inputs.current[slot + 1]?.focus();
        }
    };

    const onKeyUp = (e, slot) => {
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

    return (
        <div className="code-input">
            <label className="code-label">{label}</label>
            <div className="code-inputs" style={{ display: "flex", gap: 8 }}>
                {code.map((num, idx) => (
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
                        }}
                    />
                ))}
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
                    opacity: (code.some(c => c === "") || loading) ? 0.5 : 1,
                }}
            >
                Submit
            </button>
        </div>
    );
};