import { GameColorPeg } from "./GameColorPeg";

export type GameRowColor = { color: string; value?: string; label?: string };

interface GameRowProps {
    row?: Array<GameRowColor | undefined>;
    length: number;
}

export const GameRow = ({ row = [] as Array<GameRowColor | undefined>, length }: GameRowProps) => {
    return (
        <div className="game-row">
            {Array.from({ length }).map((_, i) => (
                <GameColorPeg key={i} color={row[i]} />
            ))}
        </div>
    );
};