import { GameColorPeg } from "./GameColorPeg";

export const GameRow = ({ row = [] }) => {
    return (
        <div className="game-row">
            {Array.from({ length: 4 }).map((_, i) => (
                <GameColorPeg key={i} color={row[i]} />
            ))}
        </div>
    );

}