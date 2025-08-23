
import { useEffect, useMemo } from 'react'
import { useUserStore } from '../stores/userStore'

export const LeaderboardPage = () => {
    const { leaderboard, isLoading, error, fetchLeaderboard } = useUserStore()

    useEffect(() => {
        fetchLeaderboard().catch(() => {})
    }, [fetchLeaderboard])

    const sorted = useMemo(() => {
        if (!leaderboard) return []
        return [...leaderboard].sort((a, b) => b.win_rate - a.win_rate)
    }, [leaderboard])

    if (isLoading) return <div className="loading">Loading…</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-content">
                <h1 className="leaderboard-title">Leaderboard</h1>
                {sorted.length === 0 ? (
                    <p className="no-data">No leaderboard data.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th className="left">Rank</th>
                                    <th className="left">Username</th>
                                    <th className="right">Wins</th>
                                    <th className="right">Joined</th>
                                    <th className="right">Win Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((row, idx) => (
                                    <tr key={row.username}>
                                        <td className="left">{idx + 1}</td>
                                        <td className="left">{row.username}</td>
                                        <td className="right">{row.games_won}</td>
                                        <td className="right">{row.joined_rooms}</td>
                                        <td className="right">{(row.win_rate * 100).toFixed(0)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style>{style}</style>
        </div>
    )
}

const style = `
    .leaderboard-container { display: flex; justify-content: center; padding: 20px; }
    .leaderboard-content { width: 100%; max-width: 800px; }
    .leaderboard-title { font-size: 0.7rem; margin-bottom: 1rem; }
    .loading, .error, .no-data { padding: 20px; text-align: center; }
    .error { color: red; }
    .table-wrapper {  }
    .leaderboard-table { width: 100%; border-collapse: collapse; font-size: 0.5rem;}
    thead tr { border-bottom: 2px solid #ccc; }
    th, td { padding: 10px; }
    .left { text-align: left; }
    .right { text-align: right; }
    tbody tr { border-bottom: 1px solid #eee; }
`

export default LeaderboardPage