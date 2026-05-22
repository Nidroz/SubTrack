import { useEffect, useState } from 'react'
import { useListStore } from '../store/listStore'
import { updateEntry } from '../services/api'
import { WatchStatus } from '../types'

const STATUS_LABELS: Record<WatchStatus, string> = {
    WATCHING: 'Watching',
    COMPLETED: 'Completed',
    PLAN_TO_WATCH: 'Plan to watch',
    DROPPED: 'Dropped',
    ON_HOLD: 'On hold',
}

const STATUS_COLORS: Record<WatchStatus, string> = {
    WATCHING:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
    COMPLETED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PLAN_TO_WATCH: 'bg-white/5 text-zinc-400 border-white/10',
    DROPPED:       'bg-red-500/10 text-red-400 border-red-500/20',
    ON_HOLD:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

export default function MyList() {
    const { entries, loading, fetchList, removeEntry } = useListStore()
    const [filter, setFilter] = useState<WatchStatus | 'all'>('all')
    const [editing, setEditing] = useState<number | null>(null)

    useEffect(() => {
        fetchList(filter !== 'all' ? { status: filter } : undefined)
    }, [filter])

    const handleStatusChange = async (entryId: number, newStatus: WatchStatus) => {
        const entry = entries.find(e => e.id === entryId)
        if (!entry) return
        await updateEntry(entryId, {
            mediaId: entry.mediaId,
            mediaType: entry.mediaType,
            status: newStatus,
            progress: entry.progress,
            score: entry.score,
            notes: entry.notes,
        })
        fetchList(filter !== 'all' ? { status: filter } : undefined)
    }

    const handleProgressChange = async (entryId: number, progress: number) => {
        const entry = entries.find(e => e.id === entryId)
        if (!entry) return
        await updateEntry(entryId, {
            mediaId: entry.mediaId,
            mediaType: entry.mediaType,
            status: entry.status,
            progress,
            score: entry.score,
            notes: entry.notes,
        })
        fetchList(filter !== 'all' ? { status: filter } : undefined)
        setEditing(null)
    }

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
                <div className="flex flex-col gap-3">
                    {entries.map(entry => {
                        const total = entry.episodes ?? entry.chapters
                        const displayTitle = entry.title ?? `#${entry.mediaId}`
                        const isEditingProgress = editing === entry.id

                        return (
                            <div
                                key={entry.id}
                                className="flex gap-4 bg-zinc-900 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
                            >
                                {/* cover */}
                                {entry.imageUrl ? (
                                    <img
                                        src={entry.imageUrl}
                                        alt={displayTitle}
                                        className="w-14 h-20 object-cover rounded-lg shrink-0"
                                    />
                                ) : (
                                    <div className="w-14 h-20 bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center text-zinc-600 text-xs">
                                        ?
                                    </div>
                                )}

                                {/* main info */}
                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                    <p className="font-semibold text-sm leading-snug truncate">{displayTitle}</p>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <select
                                            value={entry.status}
                                            onChange={ev => handleStatusChange(entry.id, ev.target.value as WatchStatus)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-lg border bg-transparent outline-none cursor-pointer transition-colors ${STATUS_COLORS[entry.status]}`}
                                        >
                                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                                <option key={val} value={val} className="bg-zinc-900 text-zinc-100">
                                                    {label}
                                                </option>
                                            ))}
                                        </select>

                                        {isEditingProgress ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={total ?? 9999}
                                                    defaultValue={entry.progress}
                                                    className="w-14 bg-zinc-800 border border-white/10 rounded px-2 py-0.5 text-xs text-zinc-100 outline-none"
                                                    onBlur={ev => handleProgressChange(entry.id, parseInt(ev.target.value) || 0)}
                                                    onKeyDown={ev => ev.key === 'Enter' && handleProgressChange(entry.id, parseInt((ev.target as HTMLInputElement).value) || 0)}
                                                    autoFocus
                                                />
                                                {total && <span className="text-xs text-zinc-500">/ {total}</span>}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditing(entry.id)}
                                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                            >
                                                Ep {entry.progress}{total ? ` / ${total}` : ''} ✎
                                            </button>
                                        )}

                                        {entry.apiScore && (
                                            <span className="text-xs text-yellow-400 font-semibold">★ {entry.apiScore}</span>
                                        )}

                                        {/* media type badge */}
                                        <span className="text-xs text-zinc-600 uppercase tracking-wider">
                                          {entry.mediaType.toLowerCase()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeEntry(entry.id)}
                                    className="text-zinc-700 hover:text-rose-400 transition-colors px-1 shrink-0 self-start"
                                >
                                    ✕
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}