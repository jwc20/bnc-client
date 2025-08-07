import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router";

import {SinglePlayerGamePage} from "./SinglePlayerGamePage";
import {MultiPlayerGamePage} from "./MultiPlayerGamePage";
import {useGame} from "../stores/singlePlayerGameStore";
import {gamesApiGetRoom} from "../api/sdk.gen";

export function RoomPage() {
    const {roomId} = useParams();
    const navigate = useNavigate();
    const game = useGame();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRoom = async () => {
            if (!roomId) {
                setError('No room ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await gamesApiGetRoom({
                    path: {room_id: Number(roomId)}
                });

                console.log('Room response:', response);

                if (response.data) {
                    setRoom(response.data);

                    if (response.data.type === 0) {
                        const success = await game.loadExistingRoom(Number(roomId));
                        if (!success && game.error) {
                            setError(game.error);
                        }
                    }
                } else {
                    throw new Error('No room data received');
                }
            } catch (error) {
                console.error('Failed to load room:', error);
                setError(error.message || 'Failed to load room');
            } finally {
                setLoading(false);
            }
        };

        loadRoom();
    }, [roomId, game]);

    if (loading) {
        return <div>Loading room...</div>;
    }

    if (error) {
        return (
            <div>
                <div>Error: {error}</div>
                <button onClick={() => navigate('/lobby')}>
                    Back to Lobby
                </button>
            </div>
        );
    }

    if (room?.type === 0) {
        return <SinglePlayerGamePage roomId={roomId}/>;
    } else if (room?.type === 1) {
        return <MultiPlayerGamePage roomId={roomId}/>;
    }

    return (
        <div>
            <div>Unknown room type: {room?.type}</div>
            <button onClick={() => navigate('/lobby')}>
                Back to Lobby
            </button>
        </div>
    );
}