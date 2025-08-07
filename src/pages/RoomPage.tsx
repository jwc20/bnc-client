import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router";

// get room
import {gamesApiGetRoom} from "../api/sdk.gen";
import {SinglePlayerGamePage} from "./SinglePlayerGamePage";
import {MultiPlayerGamePage} from "./MultiPlayerGamePage";

export function RoomPage() {
    const {roomId} = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                setLoading(true);
                const response = await gamesApiGetRoom({path: {room_id: Number(roomId)}});
                console.log(response);
                setRoom(response.data);
            } catch (error) {
                console.error('Failed to fetch room:', error);
                setError(error.message || 'Failed to fetch room');
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [roomId]);

    if (loading) {
        return <div>Loading room...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (room?.type === 0) {
        return <SinglePlayerGamePage roomId={roomId}/>;
    } else if (room?.type === 1) {
        return <MultiPlayerGamePage roomId={roomId}/>;
    }
    return <div>Unknown room type</div>;
}