import {GameBoard} from "../components/board/GameBoard";
import {useParams} from "react-router";

export const SinglePlayerGamePage = () => {
    const {roomId} = useParams();
    return (
        <div>
            <GameBoard roomId={roomId}/>
        </div>
    )
};