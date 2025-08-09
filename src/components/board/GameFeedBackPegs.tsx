

export const GameFeedBackPegs = ({ bulls, cows }) => {
    if (bulls === undefined && cows === undefined) {
        return (
            <div className="feedback-pegs-container">
                <div className="feedback-row">
                    {[0, 1].map(i => (
                        <div key={i} className="feedback-peg empty">
                            X
                        </div>
                    ))}
                </div>
                <div className="feedback-row">
                    {[2, 3].map(i => (
                        <div key={i} className="feedback-peg empty">
                            X
                        </div>
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
        <div className="feedback-pegs-container">
            <div className="feedback-row">
                {pegs.slice(0, 2).map((color, i) => (
                    <div
                        key={i}
                        className={`feedback-peg ${color}`}
                    >
                        {color === 'empty' ? 'X' : ''}
                    </div>
                ))}
            </div>
            <div className="feedback-row">
                {pegs.slice(2, 4).map((color, i) => (
                    <div
                        key={i}
                        className={`feedback-peg ${color}`}
                    >
                        {color === 'empty' ? 'X' : ''}
                    </div>
                ))}
            </div>
        </div>
    );
};
