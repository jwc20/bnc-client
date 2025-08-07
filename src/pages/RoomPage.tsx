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

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const room = await gamesApiGetRoom({path: {room_id: Number(roomId)}});
                console.log(room);
                setRoom(room.data);
                if (room.data.type === 0) {
                    console.log("SinglePlayerGamePage");
                    return <SinglePlayerGamePage roomId={roomId}/>;
                } else if (room.data.type === 1) {
                    console.log("MultiPlayerGamePage");
                    return <MultiPlayerGamePage roomId={roomId}/>;
                }
            } catch (error) {
                console.error('Failed to fetch room:', error);
            }
        };
        fetchRoom();
    }, [roomId]);



    return <div>RoomPage</div>;
}