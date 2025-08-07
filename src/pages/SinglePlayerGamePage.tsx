import {GameBoard} from "../components/GameBoard.tsx";

export const SinglePlayerGamePage = ({roomId}) => {
    return (
        <div>
            <GameBoard roomId={roomId}/>
        </div>
    )
};