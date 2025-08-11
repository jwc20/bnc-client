type Color = { color: string; value?: string; label?: string };

interface GameColorPegProps {
    color?: Color;
}

export const GameColorPeg = ({ color }: GameColorPegProps) => {
    return (
        <div
            className="game-color-peg"
            style={{
                backgroundColor: color?.color || '#fff',
            }}
        />
    )
}
