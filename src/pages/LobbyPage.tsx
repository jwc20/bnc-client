import {useEffect, useState} from "react";
import {Outlet, Link, useLocation, useNavigate} from "react-router";
import {gamesApiListRooms} from "../api/sdk.gen";
import type {GamesApiListRoomsResponses, RoomSchema} from "../api/types.gen";
export function LobbyPage() {
    const [rooms, setRooms] = useState([]);

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


    return (
        <div>
            <h1>Lobby</h1>
            <div>
                <Link to="/room/random">play random single player game</Link>
            </div>
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