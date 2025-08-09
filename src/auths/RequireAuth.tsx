import type {ReactNode} from "react";
import {Navigate, useLocation} from "react-router";
import {useAuth} from "./AuthContext";

interface RequireAuthProps {
    children: ReactNode;
    redirectTo?: string;
    allowedRoles?: string[];
}

export function RequireAuth({
                                children,
                                redirectTo = "/login",
                                allowedRoles
                            }: RequireAuthProps) {
    const auth = useAuth();
    const location = useLocation();

    if (auth.isLoading) {
        return (
            <div className="center">
                <div className="loading-spinner">
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (!auth.user || !auth.token) {
        return <Navigate to={redirectTo} state={{from: location}} replace/>;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userWithRole = auth.user as { role?: string; roles?: string[] };
        const userRole = userWithRole.role || userWithRole.roles?.[0];

        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to="/unauthorized" replace/>;
        }
    }

    return <>{children}</>;
}

