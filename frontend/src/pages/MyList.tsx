import { useEffect, useState } from 'react'
import { useListStore } from '../store/listStore'
import { updateEntry } from '../services/api'
import { MediaType, WatchStatus } from '../types'

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
    const [mediaFilter, setMediaFilter] = useState<MediaType | 'all'>('all')
    const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all')
    const [editing, setEditing] = useState<number | null>(null)

    useEffect(() => {
        fetchList({
            ...(mediaFilter !== 'all' && { mediaType: mediaFilter }),
            ...(statusFilter !== 'all' && { status: statusFilter }),
        })
    }, [mediaFilter, statusFilter])

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
        fetchList({
            ...(mediaFilter !== 'all' && { mediaType: mediaFilter }),
            ...(statusFilter !== 'all' && { status: statusFilter }),
        })
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
        fetchList({
            ...(mediaFilter !== 'all' && { mediaType: mediaFilter }),
            ...(statusFilter !== 'all' && { status: statusFilter }),
        })
        setEditing(null)
    }

    const statusFilters = ['all', ...Object.keys(STATUS_LABELS)] as (WatchStatus | 'all')[]

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-black tracking-tight">My List</h1>
                <p className="text-zinc-500 text-sm mt-1">{entries.length} entries</p>
            </header>

            {/* media type switch */}
            <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 gap-1 w-fit">
                {(['all', 'ANIME', 'MANGA'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setMediaFilter(t)}
                        className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            mediaFilter === t
                                ? 'bg-rose-500 text-white'
                                : 'text-zinc-500 hover:text-zinc-200'
                        }`}
                    >
                        {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* status filters */}
            <div className="flex gap-2 flex-wrap">
                {statusFilters.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            statusFilter === s
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
                    {entries.map(e => {
                        const total = e.episodes ?? e.chapters
                        const displayTitle = e.titleEnglish ?? e.title ?? `#${e.mediaId}`
                        const isEditingProgress = editing === e.id

                        return (
                            <div
                                key={e.id}
                                className="flex gap-4 bg-zinc-900 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
                            >
                                {e.imageUrl ? (
                                    <img
                                        src={e.imageUrl}
                                        alt={displayTitle}
                                        className="w-14 h-20 object-cover rounded-lg shrink-0"
                                    />
                                ) : (
                                    <div className="w-14 h-20 bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center text-zinc-600 text-xs">?</div>
                                )}

                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                    <p className="font-semibold text-sm leading-snug truncate">{displayTitle}</p>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <select
                                            value={e.status}
                                            onChange={ev => handleStatusChange(e.id, ev.target.value as WatchStatus)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-lg border bg-transparent outline-none cursor-pointer transition-colors ${STATUS_COLORS[e.status]}`}
                                        >
                                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                                <option key={val} value={val} className="bg-zinc-900 text-zinc-100">{label}</option>
                                            ))}
                                        </select>

                                        {isEditingProgress ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={total ?? 9999}
                                                    defaultValue={e.progress}
                                                    className="w-14 bg-zinc-800 border border-white/10 rounded px-2 py-0.5 text-xs text-zinc-100 outline-none"
                                                    onBlur={ev => handleProgressChange(e.id, parseInt(ev.target.value) || 0)}
                                                    onKeyDown={ev => ev.key === 'Enter' && handleProgressChange(e.id, parseInt((ev.target as HTMLInputElement).value) || 0)}
                                                    autoFocus
                                                />
                                                {total && <span className="text-xs text-zinc-500">/ {total}</span>}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditing(e.id)}
                                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                            >
                                                Ep {e.progress}{total ? ` / ${total}` : ''} ✎
                                            </button>
                                        )}

                                        {e.apiScore && (
                                            <span className="text-xs text-yellow-400 font-semibold">★ {e.apiScore}</span>
                                        )}

                                        <span className="text-xs text-zinc-600 uppercase tracking-wider">
                                          {e.mediaType.toLowerCase()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeEntry(e.id)}
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