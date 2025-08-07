import {useState} from 'react';
import InputCode from './InputCode.tsx';
import type {CheckBullsCowsRequest, CheckBullsCowsResponse} from '../api/types.gen.ts';
import {gamesApiCheckGame} from '../api/sdk.gen.ts';

const COLORS = [
    {value: 'red', label: 'Red', color: '#ff4444'},
    {value: 'blue', label: 'Blue', color: '#4444ff'},
    {value: 'green', label: 'Green', color: '#44ff44'},
    {value: 'yellow', label: 'Yellow', color: '#ffff44'},
    {value: 'purple', label: 'Purple', color: '#ff44ff'},
    {value: 'orange', label: 'Orange', color: '#ff8844'}
];

const GameColorPeg = ({color}) => (
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

const GameFeedBackPegs = ({bulls, cows}: { bulls?: number, cows?: number }) => {
    if (bulls === undefined && cows === undefined) {
        return (
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                <div style={{display: 'flex', gap: 4}}>
                    {[0, 1].map(i => (
                        <div key={i} style={{
                            width: 12,
                            height: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Arial',
                            fontWeight: 'bold',
                            fontSize: 14,
                            border: '1px solid #000',
                            borderRadius: '50%',
                            background: 'gray',
                            color: '#fff'
                        }}>X</div>
                    ))}
                </div>
                <div style={{display: 'flex', gap: 4}}>
                    {[2, 3].map(i => (
                        <div key={i} style={{
                            width: 12,
                            height: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Arial',
                            fontWeight: 'bold',
                            fontSize: 14,
                            border: '1px solid #000',
                            borderRadius: '50%',
                            background: 'gray',
                            color: '#fff'
                        }}>X</div>
                    ))}
                </div>
            </div>
        );
    }
    const pegs = [];
    for (let i = 0; i < (bulls || 0); i++) pegs.push('black');
    for (let i = 0; i < (cows || 0); i++) pegs.push('white');
    while (pegs.length < 4) pegs.push('empty');

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <div style={{display: 'flex', gap: 4}}>
                {pegs.slice(0, 2).map((color, i) => (
                    <div key={i} style={{
                        width: 12,
                        height: 12,
                        border: '1px solid #000',
                        borderRadius: '50%',
                        background: color === 'black' ? '#000' : color === 'white' ? '#fff' : '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fontSize: 13,
                        color: color === 'empty' ? 'black' : 'inherit'
                    }}>{color === 'empty' ? 'X' : ''}</div>
                ))}
            </div>
            <div style={{display: 'flex', gap: 4}}>
                {pegs.slice(2, 4).map((color, i) => (
                    <div key={i} style={{
                        width: 12,
                        height: 12,
                        border: '1px solid #000',
                        borderRadius: '50%',
                        background: color === 'black' ? '#000' : color === 'white' ? '#fff' : '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fontSize: 13,
                        color: color === 'empty' ? 'black' : 'inherit'
                    }}>{color === 'empty' ? 'X' : ''}</div>
                ))}
            </div>
        </div>
    );
};

const GameRow = ({row = []}) => (
    <div style={{display: 'flex', gap: 12}}>
        {Array.from({length: 4}).map((_, i) => (
            <GameColorPeg key={i} color={row[i]}/>
        ))}
    </div>
);

export const GameBoard = ({roomId}) => {
    const [gameState, setGameState] = useState({});
    const [feedbackState, setFeedbackState] = useState({});
    const [currentRow, setCurrentRow] = useState(0);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CheckBullsCowsResponse>();

    const handleSubmitCode = async (codeStr) => {
        if (loading) return;
        const digits = codeStr.split('').map(Number);
        if (digits.some(d => d < 1 || d > COLORS.length)) {
            alert('Invalid input. Use digits 1-6 only.');
            return;
        }

        const pegColors = digits.map(d => COLORS[d - 1]);
        console.log(roomId, codeStr);
        const {data: data} = await gamesApiCheckGame({
            body: {
                room_id: roomId,
                guess: codeStr
            }
        });

        setData(data);
        console.log(data);

        setGameState(prev => ({
            ...prev,
            [currentRow]: pegColors
        }));
        setFeedbackState(prev => ({
            ...prev,
            [currentRow]: {bulls: data.bulls, cows: data.cows}
        }));

        setCurrentRow(prev => prev + 1);
    };


    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40}}>
            <div style={{border: '2px solid #000', width: 500, padding: 24}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
                    {Array.from({length: 10}).map((_, i) => {
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
                                    background: rowIndex === currentRow ? '#90EE90' : 'white',
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
                                <GameRow row={row}/>
                                <div style={{marginLeft: 16}}>
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

            {currentRow < 10 ? (
                <div style={{marginTop: 24}}>
                    <InputCode
                        length={4}
                        label="Enter code (1-6)"
                        loading={loading}
                        onSubmit={handleSubmitCode}
                    />
                </div>
            ) : (
                <div style={{marginTop: 24, fontStyle: 'italic'}}>
                    Game over!
                </div>
            )}
        </div>
    );
};
