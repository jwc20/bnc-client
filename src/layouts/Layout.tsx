import { Outlet, Link, useLocation } from "react-router";
import { useAuth } from "../auths/AuthContext";

export function Layout() {
    const location = useLocation();
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
                            <>
                                <div className="nav-center">
                                    {!isActive('/lobby') && (
                                        <Link to="/lobby" className="nav-link">
                                            <span>Lobby</span>
                                        </Link>
                                    )}
                                    {/* {!isActive('/quick-play') && (
                                        <Link to="/quick-play" className="nav-link">
                                            <span>Quick Play</span>
                                        </Link>
                                    )}
                                    {!isActive('/quick-plays') && (
                                        <Link to="/quick-plasy" className="nav-link">
                                            <span>another link</span>
                                        </Link>
                                    )} */}
                                    <div className="nav-right">
                                        <div className="username">
                                            <span>{auth.user.username}</span>
                                        </div>
                                        <div className="logout">
                                            <button onClick={handleLogout} className="logout-btn">
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="layout-main">
                <div className="main-container">
                    <Outlet />
                </div>
            </main>
            <style>{styles}</style>
        </div>
    );
}

const styles = `
    .layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .layout-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
    }

    .navbar {
        width: 100%;
    }

    .navbar-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.7rem 0;
        max-width: 100%;
        position: relative;
    }

    .nav-center {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
    }

    .nav-right {
        display: flex;
        flex-direction: row;
        align-items: center;
        position: absolute;
        right: 0;
        padding-right: 1rem;
    }

    .username {
        font-size: 0.65rem;
        margin-right: 1rem;
    }

    .logout {
        align-items: center;
        margin: auto;
    }

    .nav-link {
        text-decoration: none;
        color: #333;
        font-size: 0.65rem;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .nav-link:hover {
        background-color: #f5f5f5;
    }

    .logout-btn {
        background: none;
        border: 1px solid #ddd;
        color: #333;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.4rem;
        transition: background-color 0.2s;
    }

    .logout-btn:hover {
        background-color: #f5f5f5;
    }

    .layout-main {
        flex: 1;
        margin-top: 60px; /* Account for fixed header height */
    }

    .main-container {

        max-width: 100%;
    }
`