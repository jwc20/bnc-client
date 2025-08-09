import { create } from 'zustand'

export const useGameStore = create((set) => ({
    gameState: {
        guesses: [],
        currentRow: 0,
        gameOver: false,
        gameWon: false,
        remainingGuesses: 10,
        isLoading: false,
        secretCode: null
    },

    updateGameState: (newState) => {
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
                currentRow: 0,
                gameOver: false,
                gameWon: false,
                remainingGuesses: 10,
                isLoading: false,
                secretCode: null
            }
        })
    }
}))