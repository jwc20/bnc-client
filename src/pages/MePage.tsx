import { useEffect, useMemo } from 'react';
import { useUserStore } from '../stores/userStore';
import { useAuth } from '../auths/AuthContext';

export const MePage = () => {
    const { token: authToken } = useAuth()
    const { user, activities, isLoading, error, fetchProfile } = useUserStore();

    useEffect(() => {
        if (authToken) {
            fetchProfile(authToken).catch(() => { });
        }
    }, [fetchProfile, authToken]);

    const stats = useMemo(() => {
        if (!activities || activities.length === 0) return null;

        const activityCounts = activities.reduce<Record<string, number>>((acc, activity) => {
            const verb = activity.verb || 'unknown';
            acc[verb] = (acc[verb] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const joinedGames = activityCounts['joined_room'] || 0;
        const wonGames = activityCounts['won_game'] || 0;
        const winRate = joinedGames > 0 ? ((wonGames / joinedGames) * 100).toFixed(2) : '0.00';

        return {
            counts: activityCounts,
            joinedGames,
            wonGames,
            winRate
        };
    }, [activities]);

    if (isLoading) return <div className="loading">Loading…</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="profile-container">
            <div className="profile-content">

                {!user ? (
                    <p className="not-signed-in">Not signed in.</p>
                ) : (
                    <>
                        <div className="user-info">
                            <p>{user.username}</p>
                            <p>{user.email}</p>
                            {/* <p>{user.id}</p> */}
                        </div>

                        <h2 className="stats-title">Activity Statistics</h2>
                        {!stats ? (
                            <p className="no-activities">No activities yet.</p>
                        ) : (
                            <div className="stats-container">
                                <div className="stats-box">
                                    <table className="stats-table">
                                        <thead>
                                            <tr className="table-header">
                                                <th className="header-cell">Activity Type</th>
                                                <th className="header-cell right-align">Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(stats.counts)
                                                .sort((a, b) => a[0].localeCompare(b[0]))
                                                .map(([activity, count]) => (
                                                    <tr key={activity} className="data-row">
                                                        <td className="data-cell activity-name">
                                                            {activity.replace('_', ' ')}
                                                        </td>
                                                        <td className="data-cell right-align count">
                                                            {count}
                                                        </td>
                                                    </tr>
                                                ))}
                                            <tr className="win-rate-row">
                                                <td className="win-rate-label">
                                                    Win Rate
                                                </td>
                                                <td className="win-rate-value right-align">
                                                    {stats.winRate}% ({stats.wonGames}/{stats.joinedGames})
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <style>{style}</style>
        </div>
    );
};

const style = `
    .profile-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding: 20px;
    }

    .profile-content {
        width: 100%;
        max-width: 800px;
        text-align: center;
    }

    .profile-title {
        font-size: 2rem;
        margin-bottom: 1.5rem;
        color: #333;
    }

    .loading, .error, .not-signed-in, .no-activities {
        text-align: center;
        padding: 20px;
    }

    .error {
        color: red;
    }

    .user-info {
        margin-bottom: 2rem;
        padding: 20px;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .user-info p {
        margin: 8px 0;
    }

    .stats-title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #444;
    }

    .stats-container {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .stats-box {
        border: 2px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        background-color: #f9f9f9;
        min-width: 400px;
        max-width: 600px;
        width: 100%;
    }

    .stats-table {
        width: 100%;
        border-collapse: collapse;
    }

    .table-header {
        border-bottom: 2px solid #ccc;
    }

    .header-cell {
        text-align: left;
        padding: 10px;
        font-weight: bold;
        color: #333;
    }

    .header-cell.right-align {
        text-align: right;
    }

    .data-row {
        border-bottom: 1px solid #e0e0e0;
    }

    .data-cell {
        padding: 8px 10px;
    }

    .activity-name {
        text-transform: capitalize;
        text-align: left;
    }

    .right-align {
        text-align: right;
    }

    .count {
        font-weight: 500;
    }

    .win-rate-row {
        border-top: 2px solid #333;
        background-color: #e8f4f8;
    }

    .win-rate-label, .win-rate-value {
        padding: 10px;
        font-size: 0.5rem;
        color: #0066cc;
    }

    .win-rate-value {
        text-align: right;
    }
`;

export default MePage;