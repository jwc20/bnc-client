import { create } from 'zustand'

export const useGameStore = create((set) => ({
    gameState: {
        guesses: [],
        current_row: 0,
        gameOver: false,
        game_won: false,
        remaining_guesses: 10,
        isLoading: false,
        secret_code: null, // TODO: remove
        config: {
            code_length: 4,
            num_of_colors: 6,
            num_of_guesses: 10
        }
    },

    updateGameState: (newState) => {
        console.log("Updating game state:", newState);
        set(state => ({
            gameState: {
                ...state.gameState,
                ...newState,
                isLoading: false
            }
        }))
    },

    setLoading: (loading) => {
        set(state => ({
            gameState: { ...state.gameState, isLoading: loading }
        }))
    },

    resetGameState: () => {
        set({
            gameState: {
                guesses: [],
                current_row: 0,
                game_over: false,
                game_won: false,
                remaining_guesses: 10,
                isLoading: false,
                secret_code: null,
                config: {
                    code_length: 4,
                    num_of_colors: 6,
                    num_of_guesses: 10
                }
            }
        })
    }
}))