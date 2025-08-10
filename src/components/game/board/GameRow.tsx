import { GameColorPeg } from "./GameColorPeg";

export const GameRow = ({ row = [], length }) => {
    return (
        <div className="game-row">
            {Array.from({ length }).map((_, i) => (
                <GameColorPeg key={i} color={row[i]} />
            ))}
        </div>
    );
};