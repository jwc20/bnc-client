import { Navigate } from 'react-router';
import { useUserStore } from '../stores/userStore.ts';

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated());

    if (isAuthenticated) {
        return <Navigate to="/lobby" replace />;
    }

    return <>{children}</>;
}
