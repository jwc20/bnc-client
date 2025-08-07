import {Outlet, Link, useLocation, useNavigate} from "react-router";
import {useAuth} from "../auths/AuthContext";
import {useState, useEffect} from "react";

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();

    const handleLogout = () => {
        auth.logout();
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="layout">
            <header className="layout-header">
                <nav className="navbar">
                    <div className="navbar-container">
                        {auth.user && (
                            <div>
                                <div>
                                    <Link
                                        to="/lobby"
                                        className={`nav-link ${isActive('/lobby') ? 'active' : ''}`}
                                    >
                                        <span>Lobby</span>
                                    </Link>
                                </div>
                                <div>
                                    <button onClick={handleLogout}>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main className="layout-main">
                <div className="main-container">
                    <Outlet/>
                </div>
            </main>
        </div>
    );
}