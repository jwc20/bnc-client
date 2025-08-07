import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { gamesApiListRooms, gamesApiCreateRandomSingleplayerRoom } from "../api/sdk.gen";
import type { GamesApiListRoomsResponses, RoomSchema } from "../api/types.gen";
export function LobbyPage() {
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState<RoomSchema>();
    const navigate = useNavigate();

    // const onFetchRooms = async () => {
    //     const {rooms: any} = await gamesApiListRooms();
    //     setRooms(rooms);
    // };

    useEffect(() => {
        const fetchRooms = async () => {
            const rooms = await gamesApiListRooms();
            console.log(rooms);
            setRooms(rooms.data);
        };
        fetchRooms();
    }, []);

    const onCreateSinglePlayerGameRoom = async () => {
        const { room: room } = await gamesApiCreateRandomSingleplayerRoom({
            body: {
                code_length: 4,
                num_of_colors: 6,
                num_of_guesses: 10,
            },
        });
        console.log(room);
        if ('data' in room) {
            setRoom(room.data);
            navigate(`/room/random/${room.data.id}`);
        } else {
            console.log(room);
        }
    };

    return (
        <div>
            <h1>Lobby</h1>
            <div>
                <button onClick={() => onCreateSinglePlayerGameRoom()}>quick play</button>
            </div>
            {/* <div>
                <Link to="/room/random">play random single player game</Link>
            </div> */}
            <div>
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
                                {/*<td>{room.players.length}</td>*/}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};