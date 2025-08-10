import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
    RoomSchema,
    CreateRoomRequest,
    CreateRandomSingleplayerRoomRequest,
    CheckBullsCowsResponse,
    CheckBullsCowsRequest
} from '../api/types.gen'
import { gamesApiCreateRoom, gamesApiCreateRandomSingleplayerRoom } from '../api/sdk.gen'
// Game state types
interface GameGuess {
    guess: string;
    bulls: number;
    cows: number;
}
interface GameConfig {
    code_length: number;
    num_of_colors: number;
    num_of_guesses: number;
}
interface GameState {
    guesses: GameGuess[];
    current_row: number;
    gameOver: boolean;
    game_won: boolean;
    remaining_guesses: number;
    isLoading: boolean;
    secret_code: string | null;
    config: GameConfig | null; // Changed to allow null
    room_id: number | null;
}
interface CreateRoomData {
    id?: number;
    name: string;
    game_type: string;
    code_length: number;
    num_of_colors: number;
    num_of_guesses: number;
    secret_code: string;
    // Add initial game state from backend
    initial_state?: {
        guesses?: GameGuess[];
        current_row?: number;
        remaining_guesses?: number;
        game_won?: boolean;
        gameOver?: boolean;
    };
}
interface GameStore {
    gameState: GameState;
    updateGameState: (newState: Partial<GameState>) => void;
    setLoading: (loading: boolean) => void;
    resetGameState: () => void;
    addGuess: (guess: string, result: CheckBullsCowsResponse) => void;
    setConfig: (config: Partial<GameConfig>) => void;
    setRoomId: (roomId: number | null) => void;
    initializeGameFromRoom: (room: CreateRoomData | RoomSchema) => void;
}
// Default config values (used only as fallback)
const DEFAULT_CONFIG: GameConfig = {
    code_length: 4,
    num_of_colors: 6,
    num_of_guesses: 10
};
// Helper function for logging in development only
const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(message, data);
    }
};
export const useGameStore = create<GameStore>((set, get) => ({
    gameState: {
        guesses: [],
        current_row: 0,
        gameOver: false,
        game_won: false,
        remaining_guesses: 0, // No default value
        isLoading: false,
        secret_code: null,
        room_id: null,
        config: null // No default value
    },
    updateGameState: (newState) => {
        // Validate newState if needed
        if (!newState || typeof newState !== 'object') {
            console.error('Invalid state update provided');
            return;
        }

        debugLog("Updating game state:", newState);
        set(state => ({
            gameState: {
                ...state.gameState,
                ...newState,
                isLoading: false
            }
        }))
    },
    setLoading: (loading) => {
        if (typeof loading !== 'boolean') {
            console.error('Invalid loading state provided');
            return;
        }

        set(state => ({
            gameState: { ...state.gameState, isLoading: loading }
        }))
    },
    addGuess: (guess, result) => {
        // Validate inputs
        if (!guess || typeof guess !== 'string') {
            console.error('Invalid guess provided');
            return;
        }

        if (!result || typeof result.bulls !== 'number' || typeof result.cows !== 'number') {
            console.error('Invalid result provided');
            return;
        }

        set(state => {
            if (!state.gameState.config) {
                console.error("Game config not initialized. Cannot add guess.");
                return state;
            }
            
            const newGuess: GameGuess = {
                guess,
                bulls: result.bulls,
                cows: result.cows
            };

            const newGuesses = [...state.gameState.guesses, newGuess];
            const isWon = result.bulls === state.gameState.config.code_length;
            const newRemainingGuesses = Math.max(0, state.gameState.remaining_guesses - 1);
            const isGameOver = isWon || newRemainingGuesses <= 0;
            return {
                gameState: {
                    ...state.gameState,
                    guesses: newGuesses,
                    current_row: state.gameState.current_row + 1,
                    game_won: isWon,
                    gameOver: isGameOver,
                    remaining_guesses: newRemainingGuesses,
                    isLoading: false
                }
            }
        })
    },
    setConfig: (config) => {
        if (!config || typeof config !== 'object') {
            console.error('Invalid config provided');
            return;
        }
        
        set(state => ({
            gameState: {
                ...state.gameState,
                config: { ...state.gameState.config, ...config },
                remaining_guesses: config.num_of_guesses ?? state.gameState.remaining_guesses
            }
        }))
    },
    setRoomId: (roomId) => {
        if (roomId !== null && typeof roomId !== 'number') {
            console.error('Invalid room ID provided');
            return;
        }

        set(state => ({
            gameState: { ...state.gameState, room_id: roomId }
        }))
    },
    // Initialize game from room data (supports both CreateRoomData and RoomSchema)
    initializeGameFromRoom: (room) => {
        if (!room) {
            console.error('Invalid room data provided');
            return;
        }

        const config: GameConfig = {
            code_length: room.code_length || DEFAULT_CONFIG.code_length,
            num_of_colors: room.num_of_colors || DEFAULT_CONFIG.num_of_colors,
            num_of_guesses: room.num_of_guesses || DEFAULT_CONFIG.num_of_guesses
        };
        // Extract initial state from backend if provided
        const initialState = (room as CreateRoomData).initial_state;

        set({
            gameState: {
                guesses: initialState?.guesses || [],
                current_row: initialState?.current_row || 0,
                gameOver: initialState?.gameOver || false,
                game_won: initialState?.game_won || false,
                remaining_guesses: initialState?.remaining_guesses ?? config.num_of_guesses,
                isLoading: false,
                secret_code: room.secret_code || null,
                room_id: room.id || null, // Fixed: now id is part of CreateRoomData
                config
            }
        });
        debugLog("Game initialized from room:", { roomId: room.id, config, initialState });
    },
    resetGameState: () => {
        const currentConfig = get().gameState.config;
        set(state => ({
            gameState: {
                guesses: [],
                current_row: 0,
                gameOver: false,
                game_won: false,
                // Use the stored config for remaining guesses
                remaining_guesses: currentConfig?.num_of_guesses ?? 0,
                isLoading: false,
                secret_code: null,
                room_id: null,
                config: currentConfig // Preserve config on reset
            }
        }))
    }
}))
// Room store types and implementation
interface RoomState {
    currentRoom: RoomSchema | null;
    rooms: RoomSchema[];
    isLoading: boolean;
    error: string | null;
}
interface RoomStore {
    roomState: RoomState;
    currentOperation: AbortController | null;
    setCurrentRoom: (room: RoomSchema | null) => void;
    setRooms: (rooms: RoomSchema[]) => void;
    addRoom: (room: RoomSchema) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    resetRoomState: () => void;
    createRoom: (roomData: CreateRoomRequest) => Promise<RoomSchema | null>;
    createQuickPlayRoom: (roomData: CreateRandomSingleplayerRoomRequest) => Promise<RoomSchema | null>;
}
// Maximum number of rooms to keep in memory
const MAX_ROOMS_IN_MEMORY = 100;
export const useRoomStore = create<RoomStore>()(
    persist(
        (set, get) => ({
            roomState: {
                currentRoom: null,
                rooms: [],
                isLoading: false,
                error: null
            },
            currentOperation: null,
            setCurrentRoom: (room) => {
                // Fixed: Removed duplicate state initialization
                if (room) {
                    // Only initialize game state once through the game store
                    useGameStore.getState().initializeGameFromRoom(room);
                }

                set(state => ({
                    roomState: { ...state.roomState, currentRoom: room, error: null }
                }))
            },
            setRooms: (rooms) => {
                if (!Array.isArray(rooms)) {
                    console.error('Invalid rooms array provided');
                    return;
                }

                // Limit the number of rooms stored
                const limitedRooms = rooms.slice(-MAX_ROOMS_IN_MEMORY);

                set(state => ({
                    roomState: { ...state.roomState, rooms: limitedRooms, error: null }
                }))
            },
            addRoom: (room) => {
                if (!room || typeof room !== 'object') {
                    console.error('Invalid room provided');
                    return;
                }

                set(state => {
                    const newRooms = [...state.roomState.rooms, room];
                    // Keep only the last MAX_ROOMS_IN_MEMORY rooms
                    const limitedRooms = newRooms.slice(-MAX_ROOMS_IN_MEMORY);

                    return {
                        roomState: {
                            ...state.roomState,
                            rooms: limitedRooms,
                            error: null
                        }
                    }
                })
            },
            setLoading: (loading) => {
                if (typeof loading !== 'boolean') {
                    console.error('Invalid loading state provided');
                    return;
                }

                set(state => ({
                    roomState: { ...state.roomState, isLoading: loading }
                }))
            },
            setError: (error) => {
                set(state => ({
                    roomState: { ...state.roomState, error, isLoading: false }
                }))
            },
            clearError: () => {
                set(state => ({
                    roomState: { ...state.roomState, error: null }
                }))
            },
            resetRoomState: () => {
                // Cancel any pending operations
                const currentOp = get().currentOperation;
                if (currentOp) {
                    currentOp.abort();
                }

                set({
                    currentOperation: null,
                    roomState: {
                        currentRoom: null,
                        rooms: [],
                        isLoading: false,
                        error: null
                    }
                })
            },
            createRoom: async (roomData) => {
                try {
                    // Cancel any pending operation
                    const currentOp = get().currentOperation;
                    if (currentOp) {
                        currentOp.abort();
                    }

                    // Create new abort controller for this operation
                    const controller = new AbortController();

                    set(state => ({
                        currentOperation: controller,
                        roomState: { ...state.roomState, isLoading: true, error: null }
                    }))
                    const response = await gamesApiCreateRoom({
                        body: roomData,
                        // Add signal if API supports it
                        // signal: controller.signal
                    })
                    // Check if operation was aborted
                    if (controller.signal.aborted) {
                        return null;
                    }
                    if (response.data) {
                        const newRoom = response.data

                        // Initialize game state with the new room configuration
                        const gameStore = useGameStore.getState();
                        gameStore.initializeGameFromRoom(newRoom);

                        // Add the new room to the rooms list and set as current room
                        set(state => {
                            const newRooms = [...state.roomState.rooms, newRoom];
                            const limitedRooms = newRooms.slice(-MAX_ROOMS_IN_MEMORY);

                            return {
                                currentOperation: null,
                                roomState: {
                                    ...state.roomState,
                                    rooms: limitedRooms,
                                    currentRoom: newRoom,
                                    isLoading: false,
                                    error: null
                                }
                            }
                        })
                        return newRoom
                    }

                    set(state => ({
                        currentOperation: null,
                        roomState: { ...state.roomState, isLoading: false }
                    }))

                    return null
                } catch (error) {
                    // Check if error is due to abort
                    if (error instanceof Error && error.name === 'AbortError') {
                        return null;
                    }

                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Failed to create room';

                    set(state => ({
                        currentOperation: null,
                        roomState: {
                            ...state.roomState,
                            isLoading: false,
                            error: errorMessage
                        }
                    }))

                    console.error('Room creation error:', error)
                    return null
                }
            },
            createQuickPlayRoom: async (roomData) => {
                try {
                    // Cancel any pending operation
                    const currentOp = get().currentOperation;
                    if (currentOp) {
                        currentOp.abort();
                    }

                    // Create new abort controller for this operation
                    const controller = new AbortController();

                    set(state => ({
                        currentOperation: controller,
                        roomState: { ...state.roomState, isLoading: true, error: null }
                    }))
                    const response = await gamesApiCreateRandomSingleplayerRoom({
                        body: roomData,
                        // Add signal if API supports it
                        // signal: controller.signal
                    })
                    // Check if operation was aborted
                    if (controller.signal.aborted) {
                        return null;
                    }
                    if (response.data) {
                        const newRoom = response.data

                        // Initialize game state with the new room configuration
                        const gameStore = useGameStore.getState();
                        gameStore.initializeGameFromRoom(newRoom);

                        // Set as current room (don't add to rooms list since it's single player)
                        set(state => ({
                            currentOperation: null,
                            roomState: {
                                ...state.roomState,
                                currentRoom: newRoom,
                                isLoading: false,
                                error: null
                            }
                        }))
                        return newRoom
                    }

                    set(state => ({
                        currentOperation: null,
                        roomState: { ...state.roomState, isLoading: false }
                    }))

                    return null
                } catch (error) {
                    // Check if error is due to abort
                    if (error instanceof Error && error.name === 'AbortError') {
                        return null;
                    }

                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Failed to create quick play room';

                    set(state => ({
                        currentOperation: null,
                        roomState: {
                            ...state.roomState,
                            isLoading: false,
                            error: errorMessage
                        }
                    }))

                    console.error('Quick play room creation error:', error)
                    return null
                }
            }
        }),
        {
            name: 'room-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist the current room ID, not the entire room data
                roomState: {
                    currentRoom: state.roomState.currentRoom ? { id: state.roomState.currentRoom.id } : null
                }
            }),
            onRehydrateStorage: (state) => {
                debugLog('Rehydrating room state from storage');
                return (state, error) => {
                    if (error) {
                        console.error('An error occurred during hydration', error);
                    } else if (state && state.roomState.currentRoom) {
                        // After rehydration, if there's a current room, you might want to fetch it from backend
                        debugLog('Room state rehydrated', state.roomState.currentRoom);
                    }
                }
            }
        }
    )
)
// Helper types for creating rooms
export type CreateRoomPayload = CreateRoomRequest;
export type CreateQuickPlayPayload = CreateRandomSingleplayerRoomRequest;
export type CheckGamePayload = CheckBullsCowsRequest;