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
    AuthResponse as LoginResponse
} from '../api/types.gen';

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

    isAuthenticated: () => boolean;

    clearAuth: () => void;
}

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const API_BASE_URL = 'http://localhost:8000/api';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const store = useUserStore.getState();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // if (store.token && !endpoint.includes('/auth/login')) {
    //     headers['Bearer'] = store.token;
    // }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || errorData.error || 'Request failed');
    }

    return response.json();
};

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
                    const response: LoginResponse = await apiCall('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                    });

                    set({
                        token: response.token,
                        user: {
                            id: response.user_id,
                            username: response.username,
                            email: '',
                        },
                        isLoading: false,
                        error: null,
                    });
                    localStorage.setItem('user-storage', JSON.stringify({token: response.token}));
                    // await get().fetchProfile();

                    return true;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Login failed';
                    set({
                        token: null,
                        user: null,
                        isLoading: false,
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

            // onRehydrateStorage: () => (state) => {
            //     // if (state?.token && state?.user) {
            //     //     state.fetchProfile().catch(() => {
            //     //         state.clearAuth();
            //     //     });
            //     // }
            // },
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
        clearError: () => store.setError(null),
    };
};

export const useAuthenticatedApi = () => {
    const token = useUserStore((state) => state.token);

    return async (endpoint: string, options: RequestInit = {}) => {
        if (!token) {
            throw new Error('No authentication token available');
        }
        return apiCall(endpoint, options);
    };
};
