import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useListStore } from '../store/listStore'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
    const { stats, entries, fetchStats, fetchList } = useListStore()
    const { username } = useAuthStore()

    useEffect(() => {
        fetchStats()
        fetchList({ status: 'WATCHING' })
    }, [])

    return (
        <div className="flex flex-col gap-10">
            <header>
                <h1 className="text-3xl font-black tracking-tight">
                    Hey, {username} 👋
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Here's what's going on with your list</p>
            </header>

            <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total tracked" value={stats?.total ?? 0} color="text-rose-400" />
                <StatCard label="Watching" value={stats?.watching ?? 0} color="text-violet-400" />
                <StatCard label="Completed" value={stats?.completed ?? 0} color="text-emerald-400" />
                <StatCard label="Avg score" value={stats?.avgScore ? stats.avgScore.toFixed(1) : '—'} color="text-rose-400" />
            </div>

            <section className="flex flex-col gap-4">
                <h2 className="font-bold text-base text-zinc-200">Currently watching</h2>
                {entries.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                        Nothing in progress.{' '}
                        <Link to="/search" className="text-rose-400 hover:text-rose-300">Search something</Link>{' '}
                        to start.
                    </p>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
                        {entries.map(e => (
                            <div
                                key={e.id}
                                className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors group"
                            >
                                {e.imageUrl && (
                                    <img
                                        src={e.imageUrl}
                                        alt={e.title ?? ''}
                                        className="w-full aspect-[3/4] object-cover group-hover:scale-[1.02] transition-transform"
                                    />
                                )}
                                <div className="p-2.5">
                                    <p className="text-xs font-medium truncate">{e.title ?? `#${e.mediaId}`}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Ep {e.progress}{e.episodes ? ` / ${e.episodes}` : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
    return (
        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-1 hover:border-white/10 transition-colors">
            <span className={`text-3xl font-black tracking-tight ${color}`}>{value}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
        </div>
    )
}