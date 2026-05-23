import { useEffect, useState } from 'react'
import { useListStore } from '../store/listStore'
import { updateEntry } from '../services/api'
import { MediaType, WatchStatus } from '../types'
import { useNavigate } from 'react-router-dom'

const STATUS_LABELS: Record<WatchStatus, string> = {
    WATCHING:      'Watching',
    COMPLETED:     'Completed',
    PLAN_TO_WATCH: 'Plan to watch',
    DROPPED:       'Dropped',
    ON_HOLD:       'On hold',
}

const STATUS_COLORS: Record<WatchStatus, string> = {
    WATCHING:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
    COMPLETED:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PLAN_TO_WATCH: 'bg-white/5 text-zinc-400 border-white/10',
    DROPPED:       'bg-red-500/10 text-red-400 border-red-500/20',
    ON_HOLD:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

const PAGE_SIZE = 15

export default function MyList() {
    const navigate = useNavigate()
    const { entries, loading, totalPages, totalElements, fetchList, removeEntry } = useListStore()

    const [mediaFilter, setMediaFilter]   = useState<MediaType | 'all'>('all')
    const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all')
    const [sortBy, setSortBy]             = useState('updatedAt')
    const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc')
    const [search, setSearch]             = useState('')
    const [page, setPage]                 = useState(0)
    const [editing, setEditing]           = useState<number | null>(null)

    const params = {
        ...(mediaFilter !== 'all' && { mediaType: mediaFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy,
        sortDir,
        page,
        size: PAGE_SIZE,
    }

    useEffect(() => {
        fetchList(params)
    }, [mediaFilter, statusFilter, sortBy, sortDir, page])

    // reset to page 0 when filters change
    useEffect(() => {
        setPage(0)
    }, [mediaFilter, statusFilter, sortBy, sortDir])

    const refetch = () => fetchList(params)

    const handleStatusChange = async (entryId: number, newStatus: WatchStatus) => {
        const entry = entries.find(e => e.id === entryId)
        if (!entry) return
        await updateEntry(entryId, { ...entry, status: newStatus })
        refetch()
    }

    const handleProgressChange = async (entryId: number, progress: number) => {
        const entry = entries.find(e => e.id === entryId)
        if (!entry) return
        await updateEntry(entryId, { ...entry, progress })
        refetch()
        setEditing(null)
    }

    // client-side search filter (title already loaded in page)
    const filtered = search.trim()
        ? entries.filter(e =>
            (e.titleEnglish ?? e.title ?? '').toLowerCase().includes(search.toLowerCase())
        )
        : entries

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-black tracking-tight">My List</h1>
                <p className="text-zinc-500 text-sm mt-1">{totalElements} entries</p>
            </header>

            {/* controls row */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* media type switch */}
                <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 gap-1">
                    {(['all', 'ANIME', 'MANGA'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setMediaFilter(t)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                mediaFilter === t ? 'bg-rose-500 text-white' : 'text-zinc-500 hover:text-zinc-200'
                            }`}
                        >
                            {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* search */}
                <input
                    className="flex-1 min-w-40 bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                    placeholder="Search by title..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {/* sort */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none cursor-pointer"
                >
                    <option value="updatedAt">Date added</option>
                    <option value="status">Status</option>
                </select>

                <button
                    onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                    className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    title={sortDir === 'desc' ? 'Descending' : 'Ascending'}
                >
                    {sortDir === 'desc' ? '↓' : '↑'}
                </button>
            </div>

            {/* status filters */}
            <div className="flex gap-2 flex-wrap">
                {(['all', ...Object.keys(STATUS_LABELS)] as (WatchStatus | 'all')[]).map(s => (
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

            {/* list */}
            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing here yet.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(e => {
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
                                        className="w-14 h-20 object-cover rounded-lg shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => navigate(`/${e.mediaType.toLowerCase()}/${e.mediaId}`)}
                                    />
                                ) : (
                                    <div
                                        className="w-14 h-20 bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center text-zinc-600 text-xs cursor-pointer hover:bg-zinc-700 transition-colors"
                                        onClick={() => navigate(`/${e.mediaType.toLowerCase()}/${e.mediaId}`)}
                                    >?</div>
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
                                            <button onClick={() => setEditing(e.id)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                                                Ep {e.progress}{total ? ` / ${total}` : ''} ✎
                                            </button>
                                        )}

                                        {e.apiScore && <span className="text-xs text-yellow-400 font-semibold">★ {e.apiScore}</span>}
                                        <span className="text-xs text-zinc-600 uppercase tracking-wider">{e.mediaType.toLowerCase()}</span>
                                    </div>
                                </div>

                                <button onClick={() => removeEntry(e.id)} className="text-zinc-700 hover:text-rose-400 transition-colors px-1 shrink-0 self-start">✕</button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors"
                    >
                        ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i).map(i => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                i === page
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    )
}