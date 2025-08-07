import { useState } from 'react';
import InputCode from '../InputCode';

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
        style={{
            width: 36,
            height: 36,
            border: '2px solid #000',
            borderRadius: '50%',
            background: color?.color || '#fff',
        }}
    />
);

const GameFeedBackPegs = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1].map(i => (
                <div key={i} style={{ width: 12, height: 12, border: '1px solid #000', borderRadius: '50%', background: '#fff' }}></div>
            ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
            {[2, 3].map(i => (
                <div key={i} style={{ width: 12, height: 12, border: '1px solid #000', borderRadius: '50%', background: '#fff' }}></div>
            ))}
        </div>
    </div>
);

const GameRow = ({ row = [] }) => (
    <div style={{ display: 'flex', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
            <GameColorPeg key={i} color={row[i]} />
        ))}
    </div>
);

export const GameBoard = () => {
    const [gameState, setGameState] = useState({});
    const [currentRow, setCurrentRow] = useState(0);
    const [loading, setLoading] = useState(false);
    const [inputCodeStr, setInputCodeStr] = useState('');


    const handleSubmitCode = (codeStr) => {
        if (loading) return;
        const digits = codeStr.split('').map(Number);
        if (digits.some(d => d < 1 || d > COLORS.length)) {
            alert('Invalid input. Use digits 1-6 only.');
            return;
        }

        const pegColors = digits.map(d => COLORS[d - 1]);

        setGameState(prev => ({
            ...prev,
            [currentRow]: pegColors
        }));

        setInputCodeStr(''); // clear input
        setCurrentRow(prev => prev + 1);
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
            <div style={{ fontWeight: 'bold', fontSize: 40, textDecoration: 'underline', marginBottom: 20 }}>
                Mastermind
            </div>
            <div style={{ border: '2px solid #000', background: '#eee', width: 500, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 36,
                                height: 36,
                                border: '2px solid #000',
                                borderRadius: '50%',
                                margin: '0 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: 20,
                                background: '#333',
                                color: '#fff'
                            }}
                        >
                            ?
                        </div>
                    ))}
                </div>
                {/* Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 10 }).map((_, i) => {
                        const rowIndex = 9 - i;
                        const row = gameState[rowIndex];

                        return (
                            <div key={rowIndex} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                opacity: rowIndex <= currentRow ? 1 : 0.6
                            }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    background: rowIndex === currentRow ? '#90EE90' : '#cce0f7',
                                    color: '#222',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    border: '2px solid #000',
                                    borderRadius: 4
                                }}>
                                    {rowIndex + 1}
                                </div>
                                <GameRow row={row} />
                                <div style={{ marginLeft: 16 }}>
                                    <GameFeedBackPegs />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Input */}
            {currentRow < 10 ? (
                <div style={{ marginTop: 24 }}>
                    <InputCode
                        length={4}
                        label="Enter code (1-6)"
                        loading={loading}
                        onComplete={(val) => setInputCodeStr(val)}
                    />
                    <button
                        style={{
                            marginTop: 8,
                            padding: '8px 16px',
                            fontWeight: 'bold',
                            background: '#4444ff',
                            color: '#fff',
                            border: '2px solid #000',
                            borderRadius: 4,
                            cursor: 'pointer'
                        }}
                        disabled={inputCodeStr.length !== 4}
                        onClick={() => handleSubmitCode(inputCodeStr)}
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: 24, fontStyle: 'italic' }}>
                    Game over!
                </div>
            )}
        </div>
    );
};
