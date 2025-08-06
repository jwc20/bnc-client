import { Navigate } from 'react-router';
import { useUserStore } from '../../stores/userStore';

export function RequireAuth({ children }: { children: JSX.Element }) {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated());

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
