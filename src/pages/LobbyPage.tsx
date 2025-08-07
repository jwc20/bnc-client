import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router";
import {gamesApiListRooms} from "../api/sdk.gen";
import type {RoomSchema} from "../api/types.gen";
import {useGame} from "../stores/singlePlayerGameStore.ts";

export function LobbyPage() {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();
    const game = useGame();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const rooms = await gamesApiListRooms();
                console.log(rooms);
                setRooms(rooms.data);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            }
        };
        fetchRooms();
    }, []);

    const onCreateSinglePlayerGameRoom = async () => {
        const success = await game.createRandomRoom({
            code_length: 4,
            num_of_colors: 6,
            num_of_guesses: 10,
        });

        if (success && game.room) {
            navigate(`/room/${game.room.id}`);
        } else if (game.error) {
            alert(`Failed to create room: ${game.error}`);
            game.clearError();
        }
    };

    return (
        <div>
            <h1>Lobby</h1>
            <div>
                <button
                    onClick={onCreateSinglePlayerGameRoom}
                    disabled={game.isLoading}
                >
                    {game.isLoading ? 'Creating...' : 'Quick Play'}
                </button>
            </div>

            {game.error && (
                <div style={{color: 'red', margin: '10px 0'}}>
                    Error: {game.error}
                    <button onClick={game.clearError} style={{marginLeft: 8}}>✕</button>
                </div>
            )}

            <div className="room-list">
                <table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Room</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rooms.map((room: RoomSchema) => (
                        <tr key={room.id}>
                            <td>{room.id}</td>
                            <td>
                                <Link to={`/room/${room.id}`}>{room.name}</Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <style>{styles}</style>
        </div>
    );
};

const styles = `
    .room-list {
        margin-top: 20px;
        box-sizing: content-box;
        margin-inline: auto;
        text-align: center;
        max-inline-size: var(--measure);
        display:flex;
        flex-direction: column;
        align-items: center;
    }
`