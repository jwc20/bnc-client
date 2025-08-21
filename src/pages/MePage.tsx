import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import { useAuth } from '../auths/AuthContext';

export const MePage = () => {
    const { token: authToken } = useAuth()
    const { user, activities, isLoading, error, fetchProfile} = useUserStore();

    useEffect(() => {
        if (authToken) {
            fetchProfile(authToken).catch(() => { });
        }
    }, [fetchProfile, authToken]);


    if (isLoading) return <div>Loading…</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h1>Profile</h1>

            {!user ? (
                <p>Not signed in.</p>
            ) : (
                <>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>ID:</strong> {user.id ?? '—'}</p>

                    <h2>Recent Activities</h2>
                    {activities.length === 0 ? (
                        <p>No activities yet.</p>
                    ) : (
                        <ul>
                            {activities.map(a => (
                                <li key={a.id}>
                                    <strong>{a.verb}</strong> — {new Date(a.timestamp as unknown as string).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default MePage;