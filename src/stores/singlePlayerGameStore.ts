import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import type {
    RoomSchema,
    CreateRandomSingleplayerRoomRequest,
    CheckBullsCowsRequest,
} from '../api/types.gen';
import {
    gamesApiCreateRandomSingleplayerRoom,
    gamesApiCheckGame,
    gamesApiGetRoom
} from '../api/sdk.gen';

export interface ApiError {
    detail?: string;
    message?: string;
    error?: string;
}

export interface GameGuess {
    guess: string;
    bulls: number;
    cows: number;
}

export interface GameState {
    room: RoomSchema | null;
    guesses: GameGuess[];
    currentGuess: string;
    isLoading: boolean;
    error: string | null;
    gameWon: boolean;
    gameOver: boolean;
    codeLength: number;
    numOfColors: number;
    numOfGuesses: number;
}

interface SinglePlayerGameStore extends GameState {
    setRoom: (room: RoomSchema) => void;
    setCurrentGuess: (guess: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    addGuess: (guess: GameGuess) => void;
    // setGameWon: (won: boolean) => void;
    setGameOver: (over: boolean) => void;
    createRandomRoom: (config?: CreateRandomSingleplayerRoomRequest) => Promise<boolean>;
    submitGuess: (guess: string) => Promise<boolean>;
    loadExistingRoom: (roomId: number) => Promise<boolean>;
    resetGame: () => void;
    getCurrentRow: () => number;
    isValidGuess: (guess: string) => boolean;
    getRemainingGuesses: () => number;
}

const getAuthHeaders = () => {
    const userStorage = localStorage.getItem('user-storage');
    if (!userStorage) return {};

    try {
        const {state} = JSON.parse(userStorage);
        if (state?.token) {
            return {
                Authorization: `Bearer ${state.token}`
            };
        }
    } catch (error) {
        console.error('Failed to parse user storage:', error);
    }

    return {};
};

export const useSinglePlayerGameStore = create<SinglePlayerGameStore>()(
    persist(
        (set, get) => ({
            room: null,
            guesses: [],
            currentGuess: '',
            isLoading: false,
            error: null,
            gameWon: false,
            gameOver: false,
            codeLength: 4,
            numOfColors: 6,
            numOfGuesses: 10,

            setRoom: (room: RoomSchema) => {
                set((state) => {
                    const isNewRoom = !state.room || state.room.id !== room.id;
                    return {
                        room,
                        ...(isNewRoom ? {
                            guesses: [],
                            currentGuess: '',
                            game_won: false,
                            gameOver: false,
                            error: null,
                        } : {})
                    };
                });
            },

            setCurrentGuess: (currentGuess: string) => set({currentGuess}),
            setLoading: (isLoading: boolean) => set({isLoading}),
            setError: (error: string | null) => set({error}),
            // setGameWon: (gameWon: boolean) => set({gameWon: game_won}),
            setGameOver: (gameOver: boolean) => set({gameOver}),

            addGuess: (guess: GameGuess) => set((state) => ({
                guesses: [...state.guesses, guess]
            })),

            createRandomRoom: async (config?: CreateRandomSingleplayerRoomRequest): Promise<boolean> => {
                set({isLoading: true, error: null});

                try {
                    const requestBody: CreateRandomSingleplayerRoomRequest = {
                        code_length: config?.code_length || get().codeLength,
                        num_of_colors: config?.num_of_colors || get().numOfColors,
                        num_of_guesses: config?.num_of_guesses || get().numOfGuesses,
                    };

                    const response = await gamesApiCreateRandomSingleplayerRoom({
                        body: requestBody,
                        headers: getAuthHeaders()
                    });

                    if (response.data) {
                        set({
                            room: response.data,
                            guesses: [],
                            currentGuess: '',
                            gameWon: false,
                            gameOver: false,
                            isLoading: false,
                            error: null,
                            codeLength: requestBody.code_length || 4,
                            numOfColors: requestBody.num_of_colors || 6,
                            numOfGuesses: requestBody.num_of_guesses || 10,
                        });
                        return true;
                    } else {
                        throw new Error('No room data received');
                    }
                } catch (error: unknown) {
                    const errorMessage =
                        (error as ApiError)?.message ||
                        (error as ApiError)?.detail ||
                        'Failed to create room';
                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    return false;
                }
            },

            loadExistingRoom: async (roomId: number): Promise<boolean> => {
                set({isLoading: true, error: null});

                try {
                    const response = await gamesApiGetRoom({
                        path: {room_id: roomId},
                        headers: getAuthHeaders()
                    });

                    if (response.data) {
                        get().setRoom(response.data);

                        set({
                            isLoading: false,
                            error: null,
                        });

                        return true;
                    } else {
                        throw new Error('No room data received');
                    }
                } catch (error: unknown) {
                    const errorMessage =
                        (error as ApiError)?.message ||
                        (error as ApiError)?.detail ||
                        'Failed to load room';
                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    return false;
                }
            },


            submitGuess: async (guess: string): Promise<boolean> => {
                const state = get();

                if (!state.room) {
                    set({error: 'No active room'});
                    return false;
                }

                if (!state.isValidGuess(guess)) {
                    set({error: 'Invalid guess format'});
                    return false;
                }

                if (state.gameOver) {
                    set({error: 'Game is already over'});
                    return false;
                }

                set({isLoading: true, error: null});

                try {
                    const requestBody: CheckBullsCowsRequest = {
                        room_id: state.room.id,
                        guess: guess,
                    };

                    const response = await gamesApiCheckGame({
                        body: requestBody,
                        headers: getAuthHeaders()
                    });

                    if (response.data) {
                        const newGuess: GameGuess = {
                            guess: guess,
                            bulls: response.data.bulls,
                            cows: response.data.cows,
                        };

                        const updatedGuesses = [...state.guesses, newGuess];
                        const gameWon = response.data.bulls === state.codeLength;
                        const gameOver = gameWon || updatedGuesses.length >= state.numOfGuesses;

                        set({
                            guesses: updatedGuesses,
                            currentGuess: '',
                            gameWon: gameWon,
                            gameOver,
                            isLoading: false,
                            error: null,
                        });

                        return true;
                    } else {
                        throw new Error('No response data received');
                    }
                } catch (error: unknown) {

                    let errorMessage = 'Failed to submit guess';

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    } else if (typeof error === 'object' && error !== null) {
                        const apiError = error as ApiError;
                        errorMessage = apiError.message || apiError.detail || apiError.error || errorMessage;
                    }

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    return false;
                }
            },

            resetGame: () => {
                set({
                    guesses: [],
                    currentGuess: '',
                    gameWon: false,
                    gameOver: false,
                    error: null,
                    codeLength: 4,
                    numOfColors: 6,
                    numOfGuesses: 10,
                });
            },

            getCurrentRow: (): number => {
                return get().guesses.length;
            },

            isValidGuess: (guess: string): boolean => {
                const state = get();
                if (guess.length !== state.codeLength) return false;

                const validNumbers = Array.from({length: state.numOfColors}, (_, i) => (i + 1).toString());
                return guess.split('').every(char => validNumbers.includes(char));
            },

            getRemainingGuesses: (): number => {
                const state = get();
                return Math.max(0, state.numOfGuesses - state.guesses.length);
            },
        }),
        {
            name: 'singleplayer-game-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                room: state.room,
                guesses: state.guesses,
                gameWon: state.gameWon,
                gameOver: state.gameOver,
                codeLength: state.codeLength,
                numOfColors: state.numOfColors,
                numOfGuesses: state.numOfGuesses,
            }),
        }
    )
);

export const useGame = () => {
    const store = useSinglePlayerGameStore();
    return {
        room: store.room,
        guesses: store.guesses,
        currentGuess: store.currentGuess,
        isLoading: store.isLoading,
        error: store.error,
        game_won: store.gameWon,
        gameOver: store.gameOver,
        codeLength: store.codeLength,
        numOfColors: store.numOfColors,
        numOfGuesses: store.numOfGuesses,
        current_row: store.getCurrentRow(),
        remaining_guesses: store.getRemainingGuesses(),
        createRandomRoom: store.createRandomRoom,
        loadExistingRoom: store.loadExistingRoom,
        submitGuess: store.submitGuess,
        setCurrentGuess: store.setCurrentGuess,
        setRoom: store.setRoom,
        resetGame: store.resetGame,
        isValidGuess: store.isValidGuess,
        clearError: () => store.setError(null),
    };
};