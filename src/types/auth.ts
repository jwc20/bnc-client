import type {
    LoginCredentials,
    User
} from '../types/auth';

export interface ApiError {
    detail?: string;
    message?: string;
    error?: string;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

export interface AuthActions {
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    fetchProfile: () => Promise<boolean>;
    isAuthenticated: () => boolean;
    clearAuth: () => void;
}

export interface UserStore extends AuthState, AuthActions {}

// Re-export API types for convenience
export type {
    UserLogin as LoginCredentials,
    UserResponse as User,
} from '../api/types.gen';