import { useEffect, useState } from 'react'
import { useListStore } from '../store/listStore'
import { WatchStatus } from '../types'

const STATUS_LABELS: Record<WatchStatus, string> = {
    WATCHING: 'Watching',
    COMPLETED: 'Completed',
    PLAN_TO_WATCH: 'Plan to watch',
    DROPPED: 'Dropped',
    ON_HOLD: 'On hold',
}

const STATUS_COLORS: Record<WatchStatus, string> = {
    WATCHING: 'bg-violet-500/10 text-violet-400',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400',
    PLAN_TO_WATCH: 'bg-white/5 text-zinc-400',
    DROPPED: 'bg-red-500/10 text-red-400',
    ON_HOLD: 'bg-yellow-500/10 text-yellow-400',
}

export default function MyList() {
    const { entries, loading, fetchList, removeEntry } = useListStore()
    const [filter, setFilter] = useState<WatchStatus | 'all'>('all')

    useEffect(() => {
        fetchList(filter !== 'all' ? { status: filter } : undefined)
    }, [filter])

    const filters = ['all', ...Object.keys(STATUS_LABELS)] as (WatchStatus | 'all')[]

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-black tracking-tight">My List</h1>
                <p className="text-zinc-500 text-sm mt-1">{entries.length} entries</p>
            </header>

            <div className="flex gap-2 flex-wrap">
                {filters.map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            filter === s
                                ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                                : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                        }`}
                    >
                        {s === 'all' ? 'All' : STATUS_LABELS[s as WatchStatus]}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : entries.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing here yet.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {entries.map(e => (
                        <div
                            key={e.id}
                            className="flex items-center gap-4 bg-zinc-900 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors"
                        >
                            {e.imageUrl && (
                                <img
                                    src={e.imageUrl}
                                    alt={e.title ?? ''}
                                    className="w-11 h-16 object-cover rounded-lg shrink-0"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{e.title ?? `#${e.mediaId}`}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[e.status]}`}>
                    {STATUS_LABELS[e.status]}
                  </span>
                                    <span className="text-xs text-zinc-500">
                    Ep {e.progress}{e.episodes ? ` / ${e.episodes}` : ''}
                  </span>
                                </div>
                            </div>
                            <button
                                onClick={() => removeEntry(e.id)}
                                className="text-zinc-700 hover:text-rose-400 transition-colors px-2 text-sm shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}