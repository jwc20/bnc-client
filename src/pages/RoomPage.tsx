import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { SinglePlayerGamePage } from "./SinglePlayerGamePage";
import { MultiPlayerGamePage } from "./MultiPlayerGamePage";
import { useGame } from "../stores/singlePlayerGameStore";
import { gamesApiGetRoom } from "../api/sdk.gen";
import type { RoomResponse } from "../api/types.gen";

export function RoomPage() {
    const { roomId: roomIdParam } = useParams();
    const navigate = useNavigate();
    const game = useGame();

    const { loadExistingRoom, error: gameError } = game;

    const [room, setRoom] = useState<RoomResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Convert and validate roomId
    const roomId = roomIdParam ? Number(roomIdParam) : null;

    useEffect(() => {
        const loadRoom = async () => {
            if (!roomId || isNaN(roomId)) {
                setError('Invalid room ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await gamesApiGetRoom({
                    path: { room_id: roomId }
                });

                console.log('Room response:', response);

                if (response.data) {
                    setRoom(response.data);

                    if (response.data.type === 0) {
                        const success = await loadExistingRoom(roomId);
                        if (!success && gameError) {
                            setError(gameError);
                        }
                    }
                } else {
                    throw new Error('No room data received');
                }
            } catch (err) {
                console.error('Failed to load room:', err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Failed to load room');
                }
            } finally {
                setLoading(false);
            }
        };

        loadRoom();
    }, [roomId, loadExistingRoom, gameError]);

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

    // Additional safety check
    if (!roomId) {
        return (
            <div>
                <div>No room ID provided</div>
                <button onClick={() => navigate('/lobby')}>
                    Back to Lobby
                </button>
            </div>
        );
    }

    if (room?.type === 0) {
        return <SinglePlayerGamePage roomId={roomId} />;
    } else if (room?.type === 1) {
        return <MultiPlayerGamePage roomId={roomId} />;
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