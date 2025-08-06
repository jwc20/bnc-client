import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

const useUserStore = create(
    persist(
        (set, get) => ({
            token: null,
            setToken: (token) => set({token}),

            username: null,
            setUserName: (username) => set({username}),

            isAuthenticated: () => {
                const {token} = get();
                return !!token;
            },

            clearAuth: () => set({
                token: null,
                username: null,
            }),

            signOut: async () => {
                try {
                    set({
                        token: null,
                        username: null,
                    });
                    localStorage.removeItem('user-storage');
                } catch (error) {
                    console.error('Error signing out:', error);
                    set({
                        token: null,
                        username: null,
                    });
                }
            },




            // TODO
            // shouldRefreshToken: () => {},
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),

            // TODO
            // onRehydrateStorage: () => (state) => {},
        }
    )
);

export {useUserStore};