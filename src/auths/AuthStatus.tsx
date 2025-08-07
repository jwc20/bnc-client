import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function AuthStatus() {
    const auth = useAuth();
    const navigate = useNavigate();

    if (auth.isLoading) {
        return (
            <div className="auth-status">
                <span className="loading-spinner">Loading...</span>
            </div>
        );
    }

    if (!auth.user) {
        return (
            <div className="auth-status">
                <span>You are not logged in.</span>
                <button
                    onClick={() => navigate("/login")}
                    className="btn btn-primary"
                >
                    Sign in
                </button>
            </div>
        );
    }

    return (
        <div className="auth-status">
            <div className="user-info">
        <span className="welcome-text">
          Welcome, <strong>{auth.user.username || auth.user.email}</strong>!
        </span>
                <div className="auth-actions">
                    <button
                        onClick={() => navigate("/user")}
                        className="btn btn-secondary"
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => {
                            auth.logout();
                        }}
                        className="btn btn-outline"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}