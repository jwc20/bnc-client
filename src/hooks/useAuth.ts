import { useUserStore } from '../stores/userStore';

/**
 * Convenience hook for common auth operations
 */
export const useAuth = () => {
    const store = useUserStore();

    return {
        // State
        isAuthenticated: store.isAuthenticated(),
        isLoading: store.isLoading,
        user: store.user,
        error: store.error,

        // Actions
        login: store.login,
        fetchProfile: store.fetchProfile,
        logout: store.clearAuth,
        clearError: () => store.setError(null),
    };
};

/**
 * Hook for API calls that require authentication
 */
export const useAuthenticatedApi = () => {
    const token = useUserStore((state) => state.token);

    return {
        getAuthHeaders: (): { Authorization: string } => {
            if (!token) {
                throw new Error('No authentication token available');
            }
            return {
                Authorization: `Bearer ${token}`
            };
        },
        isAuthenticated: !!token,
        token
    };
};

/**
 * Hook for getting just the auth token
 */
export const useAuthToken = () => {
    return useUserStore((state) => state.token);
};

/**
 * Hook for getting just the current user
 */
export const useCurrentUser = () => {
    return useUserStore((state) => state.user);
};