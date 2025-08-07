import BoardCanvas from "../canvas/GameBoardCanvas.tsx";

export const GameBoard = () => {
    return (
        <div>
            <div className="gameBoardHeader">
                <h1>GameBoard</h1>
            </div>

            <div className="gameBoard">
                <BoardCanvas/>
            </div>
        </div>
    )
}

const styles = {
    gameBoardHeader: {
        display: 'block',
        border: '1px solid #000',
        width: '500px',
        height: '50px',
    },
    gameBoard: {
        // boxSizing: 'content-box',
        // marginInline: 'auto',
        // maxInlineSize: 'var(--measure)',
        // minWidth: "100px",
        display: 'block',
        border: '1px solid #000',
        // width: '100px',
        // height: '100px',
    }
}
