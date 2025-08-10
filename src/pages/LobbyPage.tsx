import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router";
import {gamesApiListRooms} from "../api/sdk.gen";
import {useRoomStore} from "../stores/gameRoomStore";

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
        } else if (value > 12) {
            setNumOfColors(12);
        } else {
            setNumOfColors(value);
        }
    };

    const handleNumOfGuessesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value < 1) {
            setNumOfGuesses(1);
        } else if (value > 10) {
            setNumOfGuesses(10);
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
            
            {/* Quick Play Section */}
            <div className="quick-play-section">
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
            </div>

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
                                    disabled={roomState.isLoading}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Game Type:</label>
                            </td>
                            <td>
                                <select 
                                    value={gameType} 
                                    onChange={handleGameTypeChange}
                                    disabled={roomState.isLoading}
                                >
                                    <option value="0">Singleplayer</option>
                                    <option value="1">Multiplayer</option>
                                    <option value="2">Multiplayer with single board</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Secret code length:</label>
                            </td>
                            <td>
                                <input 
                                    type="number"
                                    min="4"
                                    max="15"
                                    value={codeLength} 
                                    onChange={handleCodeLengthChange}
                                    disabled={roomState.isLoading}
                                    placeholder="4-15"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Number of colors:</label>
                            </td>
                            <td>
                                <input 
                                    type="number"
                                    min="4"
                                    max="12"
                                    value={numOfColors} 
                                    onChange={handleNumOfColorsChange}
                                    disabled={roomState.isLoading}
                                    placeholder="4-12"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label>Number of guesses:</label>
                            </td>
                            <td>
                                <input 
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={numOfGuesses} 
                                    onChange={handleNumOfGuessesChange}
                                    disabled={roomState.isLoading}
                                    placeholder="1-10"
                                />
                            </td>
                        </tr>
                    </table>
                    <button 
                        type="submit" 
                        disabled={roomState.isLoading || !roomName.trim()}
                    >
                        {roomState.isLoading ? 'Creating...' : 'Create Room'}
                    </button>
                </form>
            </div>

            {/* Error Display */}
            {roomState.error && (
                <div style={{color: 'red', margin: '10px 0'}}>
                    Error: {roomState.error}
                    <button onClick={clearError} style={{marginLeft: 8}}>✕</button>
                </div>
            )}

            {/* Room List */}
            <div className="room-list">
                <h5>Available Rooms</h5>
                {roomState.isLoading ? (
                    <div>Loading rooms...</div>
                ) : (
                    <table className="room-list-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Room</th>
                            <th>Game Type</th>
                        </tr>
                        </thead>
                        <tbody>
                        {roomState.rooms.map((room) => (
                            <tr key={room.id}>
                                <td>{room.id}</td>
                                <td>
                                    <Link to={`/room/${room.id}`}>{room.name}</Link>
                                </td>
                                <td>
                                    {room.game_type === 0 ? 'Single Player' : 
                                     room.game_type === 1 ? 'Multiplayer' : 
                                     'Multiplayer (Single Board)'}
                                </td>
                            </tr>
                        ))}
                        {roomState.rooms.length === 0 && !roomState.isLoading && (
                            <tr>
                                <td colSpan={3}>No rooms available</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>
            <style>{styles}</style>
        </div>
    );
};

const styles = `
    .quick-play-section {
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
    }
    
    .quick-play-controls {
        display: flex;
        gap: 15px;
        margin: 10px 0;
        flex-wrap: wrap;
    }
    
    .control-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .control-group label {
        font-size: 0.9rem;
        font-weight: bold;
    }
    
    .control-group input {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 80px;
    }
    
    .quick-play-btn {
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }
    
    .quick-play-btn:hover:not(:disabled) {
        background-color: #0056b3;
    }
    
    .quick-play-btn:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }

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
    
    .room-list-table {
        border-collapse: collapse;
        align-items: center;
        width: 100%;
        max-width: 600px;
    }
    
    .room-list-table th, .room-list-table td {
        padding: 8px;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }
    
    .room-list-table tr:hover {
        background-color: #f5f5f5;
    }
    
    .room-create {
        outline: 1px solid #ccc;
        margin-top: 20px;
        box-sizing: content-box;
        margin-inline: auto;
        text-align: center;
        max-inline-size: var(--measure);
        display:flex;
        flex-direction: column;
        align-items: center;
        padding: 15px;
    }
    
    table {
        border-collapse: collapse;
        align-items: center;
    }
    
    table label {
        padding: 8px;
        text-align: center;
        font-size: 0.9rem;
        font-weight: bold;
    }
    
    table select, table input {
        box-sizing: border-box;
        padding: 5px;
        text-align: center;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    
    table tr:hover {
        background-color: #f5f5f5;
    }
    
    button[type="submit"] {
        margin-top: 10px;
        background-color: #28a745;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }
    
    button[type="submit"]:hover:not(:disabled) {
        background-color: #218838;
    }
    
    button[type="submit"]:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
    
    h5 {
        margin-bottom: 10px;
        color: #333;
    }
`