export const GameColorPeg = ({ color }) => {
    return (
        <div
            className="game-color-peg"
            style={{
                backgroundColor: color?.color || '#fff',
            }}
        />
    )
}
