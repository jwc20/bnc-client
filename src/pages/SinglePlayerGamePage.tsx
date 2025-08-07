import {GameBoard} from "../components/GameBoard.tsx";
import {useParams} from "react-router";

export const SinglePlayerGamePage = () => {
    const {roomId} = useParams();
    return (
        <div>
            <GameBoard roomId={roomId}/>
        </div>
    )
};