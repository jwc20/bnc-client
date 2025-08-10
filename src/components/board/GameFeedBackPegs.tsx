
export const GameFeedBackPegs = ({ bulls, cows, length = 4 }) => {
    const totalPegs = length;
    const pegsPerRow = Math.ceil(length / 2); // distribute pegs across 2 rows
    
    if (bulls === undefined && cows === undefined) {
        return (
            <div className="feedback-pegs-container">
                <div className="feedback-row">
                    {Array.from({ length: pegsPerRow }).map((_, i) => (
                        <div key={i} className="feedback-peg empty">
                            X
                        </div>
                    ))}
                </div>
                {length > pegsPerRow && (
                    <div className="feedback-row">
                        {Array.from({ length: totalPegs - pegsPerRow }).map((_, i) => (
                            <div key={i + pegsPerRow} className="feedback-peg empty">
                                X
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const pegs = [];
    for (let i = 0; i < (bulls || 0); i++) pegs.push('black');
    for (let i = 0; i < (cows || 0); i++) pegs.push('white');
    while (pegs.length < totalPegs) pegs.push('empty');

    return (
        <div className="feedback-pegs-container">
            <div className="feedback-row">
                {pegs.slice(0, pegsPerRow).map((color, i) => (
                    <div
                        key={i}
                        className={`feedback-peg ${color}`}
                    >
                        {color === 'empty' ? 'X' : ''}
                    </div>
                ))}
            </div>
            {length > pegsPerRow && (
                <div className="feedback-row">
                    {pegs.slice(pegsPerRow, totalPegs).map((color, i) => (
                        <div
                            key={i + pegsPerRow}
                            className={`feedback-peg ${color}`}
                        >
                            {color === 'empty' ? 'X' : ''}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};