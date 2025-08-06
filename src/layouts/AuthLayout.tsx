import { Outlet, Link } from 'react-router';
import { useUserStore } from '../stores/userStore';

export default function AuthLayout() {
    const username = useUserStore((state) => state.username);
    const signOut = useUserStore((state) => state.signOut);

    return (
        <div>
            <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {username ? (
                    <>
                        <Link to="/lobby">Lobby</Link>
                        <Link to="/me">My Page</Link>
                        <button onClick={signOut}>Sign Out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
