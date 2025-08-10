import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { gamesApiListRooms } from "../api/sdk.gen";
import { useRoomStore } from "../stores/gameRoomStore";

export function LobbyPage() {
    const [roomName, setRoomName] = useState("");
    const [gameType, setGameType] = useState(0);
    const [codeLength, setCodeLength] = useState(4);
    const [numOfColors, setNumOfColors] = useState(6);
    const [numOfGuesses, setNumOfGuesses] = useState(10);
    const [quickPlayLoading, setQuickPlayLoading] = useState(false);

    const navigate = useNavigate();

    const {
        roomState,
        setRooms,
        setLoading,
        setError,
        clearError,
        createRoom,
        createQuickPlayRoom
    } = useRoomStore();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const response = await gamesApiListRooms();
                console.log(response);
                setRooms(response.data ?? []);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
                setError('Failed to fetch rooms');
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [setRooms, setLoading, setError]);

    const onCreateQuickPlayRoom = async () => {
        setQuickPlayLoading(true);

        try {
            const newRoom = await createQuickPlayRoom({
                code_length: codeLength,
                num_of_colors: numOfColors,
                num_of_guesses: numOfGuesses,
                game_type: 0 // Single player
            });
            if (newRoom) {
                navigate(`/room/${newRoom.id}`);
            }
        } catch (error) {
            console.error('Quick play creation failed:', error);
        } finally {
            setQuickPlayLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomName.trim()) {
            setError('Room name is required');
            return;
        }
        try {
            const roomData = {
                name: roomName,
                game_type: gameType,
                code_length: codeLength,
                num_of_colors: numOfColors,
                num_of_guesses: numOfGuesses,
                secret_code: null // Let the server generate random code
            };
            const newRoom = await createRoom(roomData);
            if (newRoom) {
                navigate(`/room/${newRoom.id}`);
                setRoomName("");
            }
        } catch (error) {
            console.error('Room creation failed:', error);
        }
    };

    const handleCodeLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value < 4) {
            setCodeLength(4);
        } else if (value > 15) {
            setCodeLength(15);
        } else {
            setCodeLength(value);
        }
    };
    const handleNumOfColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value < 4) {
            setNumOfColors(4);
        } else if (value > 9) {
            setNumOfColors(9);
        } else {
            setNumOfColors(value);
        }
    };
    const handleNumOfGuessesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value < 1) {
            setNumOfGuesses(1);
        } else if (value > 100) {
            setNumOfGuesses(100);
        } else {
            setNumOfGuesses(value);
        }
    };
    const handleGameTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(e.target.value);
        setGameType(value);
    };

    const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value);
    };

    return (
        <div>
            <h4>Lobby</h4>

            {/* <div className="quick-play-section">
                <h5>Quick Play (Single Player)</h5>
                <div className="quick-play-controls">
                    <div className="control-group">
                        <label>Code Length (4-15):</label>
                        <input
                            type="number"
                            min="4"
                            max="15"
                            value={codeLength}
                            onChange={handleCodeLengthChange}
                            disabled={quickPlayLoading}
                        />
                    </div>
                    <div className="control-group">
                        <label>Colors (4-12):</label>
                        <input
                            type="number"
                            min="4"
                            max="12"
                            value={numOfColors}
                            onChange={handleNumOfColorsChange}
                            disabled={quickPlayLoading}
                        />
                    </div>
                    <div className="control-group">
                        <label>Guesses (1-10):</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={numOfGuesses}
                            onChange={handleNumOfGuessesChange}
                            disabled={quickPlayLoading}
                        />
                    </div>
                </div>
                <button
                    onClick={onCreateQuickPlayRoom}
                    disabled={quickPlayLoading || roomState.isLoading}
                    className="quick-play-btn"
                >
                    {quickPlayLoading ? 'Creating...' : 'Quick Play'}
                </button>
            </div> */}
            {/* Create Room Section */}
            <div className="room-create">
                <h5>Create Custom Room</h5>
                <form onSubmit={handleSubmit}>
                    <table>
                        <tr>
                            <td>
                                <label>Room Name:</label>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Room Name"
                                    value={roomName}
                                    onChange={handleRoomNameChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Game Type:</label>
                            </td>
                            <td>
                                <select value={gameType} onChange={handleGameTypeChange}>
                                    <option value={0}>Single Player</option>
                                    <option value={1}>Multiplayer</option>
                                    <option value={2}>Co-op</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Code Length (4-15):</label>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="4"
                                    max="15"
                                    value={codeLength}
                                    onChange={handleCodeLengthChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Num of Colors (4-9):</label>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="4"
                                    max="9"
                                    value={numOfColors}
                                    onChange={handleNumOfColorsChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Num of Guesses (1-100):</label>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={numOfGuesses}
                                    onChange={handleNumOfGuessesChange}
                                />
                            </td>
                        </tr>
                    </table>
                    <button type="submit" disabled={roomState.isLoading}>
                        {roomState.isLoading ? 'Creating...' : 'Create Room'}
                    </button>
                </form>
                {roomState.error && <p style={{ color: 'red' }}>{roomState.error}</p>}
            </div>
            {/* Room List Section */}
            <div className="room-list">
                <h5>Available Rooms</h5>
                {roomState.isLoading ? (
                    <p>Loading rooms...</p>
                ) : (
                    <ul>
                        {/* Use optional chaining or a logical OR with an empty array to safely access the length */}
                        {roomState.rooms?.length > 0 ? (
                            roomState.rooms.map((room) => (
                                <li key={room.id}>
                                    <Link to={`/room/${room.id}`}>{room.name}</Link>
                                </li>
                            ))
                        ) : (
                            <p>No rooms available. Create one!</p>
                        )}
                    </ul>
                )}
            </div>
            <style>{style}</style>
        </div>
    );
}

const style = `
    .room-create {
        margin-top: 20px;
        font-size: 0.7rem;
    }
    .room-list {
        margin-top: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    td {
        padding: 5px;
    }
    label {
        display: block;
        font-weight: bold;
    }
    input[type="text"], input[type="number"], select {
        width: 100%;
        padding: 8px;
        margin: 5px 0;
        box-sizing: border-box;
    }
    button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 15px;
        margin-top: 10px;
        border: none;
        cursor: pointer;
        width: 100%;
        font-size: 16px;
    }
    button:hover:enabled {
        background-color: #45a049;
    }
    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
    .quick-play-section {
        margin-top: 20px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
        text-align: center;
    }
    .quick-play-controls {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 15px;
    }
    .quick-play-btn {
        padding: 12px 24px;
        font-size: 18px;
    }
`;