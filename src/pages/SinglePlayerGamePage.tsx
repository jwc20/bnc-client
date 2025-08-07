import { GameBoard } from "../components/GameBoard.tsx";

type SinglePlayerGamePageProps = {
    roomId: number;
};

export const SinglePlayerGamePage = ({ roomId }: SinglePlayerGamePageProps) => {
    console.log(roomId);
    return (
        <div>
            <GameBoard />
        </div>
    );
};