import { SingleBoard } from '../components/multiplayer/SingleBoard';

export const MultiPlayerSingleBoardGamePage = ({ roomId }) => {
    return (
        <div>
            <SingleBoard roomId={roomId} />
        </div>
    );
};

