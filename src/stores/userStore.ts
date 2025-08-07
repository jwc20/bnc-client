export interface ApiError {
    detail?: string;
    message?: string;
    error?: string;
}

import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import type {
    UserLogin as LoginCredentials,
    UserResponse as User,
    AuthResponse as LoginResponse,
    MeResponse
} from '../api/types.gen';
import { usersApiLogin, usersApiMe } from '../api/sdk.gen';

interface UserState {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;

    setToken: (token: string) => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    login: (credentials: LoginCredentials) => Promise<boolean>;
    fetchProfile: () => Promise<boolean>;

    isAuthenticated: () => boolean;

    clearAuth: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isLoading: false,
            error: null,

            setToken: (token: string) => set({token}),
            setUser: (user: User) => set({user}),
            setLoading: (isLoading: boolean) => set({isLoading}),
            setError: (error: string | null) => set({error}),

            login: async (credentials: LoginCredentials): Promise<boolean> => {
                set({isLoading: true, error: null});

                try {
                    const response = await usersApiLogin({
                        body: credentials,
                    });

                    if (response.data) {
                        set({
                            token: response.data.token,
                            user: {
                                id: 0, // Will be populated by fetchProfile
                                username: response.data.username,
                                email: '',
                            },
                            isLoading: false,
                            error: null,
                        });

                        // Fetch full profile after login
                        await get().fetchProfile();
                        return true;
                    } else {
                        throw new Error('No response data received');
                    }
                } catch (error: any) {
                    const errorMessage = error?.message || error?.detail || 'Login failed';
                    set({
                        token: null,
                        user: null,
                        isLoading: false,
                        error: errorMessage,
                    });
                    return false;
                }
            },

            fetchProfile: async (): Promise<boolean> => {
                const { token } = get();
                if (!token) {
                    set({ error: 'No authentication token' });
                    return false;
                }

                try {
                    const response = await usersApiMe({
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.data) {
                        set({
                            user: response.data,
                            error: null,
                        });
                        return true;
                    } else {
                        throw new Error('No profile data received');
                    }
                } catch (error: any) {
                    const errorMessage = error?.message || error?.detail || 'Failed to fetch profile';
                    set({
                        error: errorMessage,
                    });
                    return false;
                }
            },

            isAuthenticated: (): boolean => {
                const {token, user} = get();
                return !!(token && user);
            },

            clearAuth: () => {
                set({
                    token: null,
                    user: null,
                    error: null,
                });
                localStorage.removeItem('user-storage');
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),

            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),

            onRehydrateStorage: () => (state) => {
                if (state?.token && state?.user) {
                    // Optionally refresh profile on rehydration
                    state.fetchProfile().catch(() => {
                        state.clearAuth();
                    });
                }
            },
        }
    )
);

export const useAuth = () => {
    const store = useUserStore();
    return {
        isAuthenticated: store.isAuthenticated(),
        isLoading: store.isLoading,
        user: store.user,
        error: store.error,
        login: store.login,
        fetchProfile: store.fetchProfile,
        clearError: () => store.setError(null),
        logout: store.clearAuth,
    };
};

export const useAuthenticatedApi = () => {
    const token = useUserStore((state) => state.token);

    return {
        getAuthHeaders: () => {
            if (!token) {
                throw new Error('No authentication token available');
            }
            return {
                Authorization: `Bearer ${token}`
            };
        },
        isAuthenticated: !!token
    };
};