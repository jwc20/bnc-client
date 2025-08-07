import {ReactNode} from "react";
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
            <div className="loading-container">
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
        const userRole = (auth.user as any).role || (auth.user as any).roles?.[0];

        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to="/unauthorized" replace/>;
        }
    }

    return <>{children}</>;
}