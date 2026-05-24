import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMediaById, updateEntry } from '../services/api'
import { useListStore } from '../store/listStore'
import { MediaType, WatchStatus } from '../types'

const STATUS_LABELS: Record<WatchStatus, string> = {
    WATCHING:      'Watching',
    COMPLETED:     'Completed',
    PLAN_TO_WATCH: 'Plan to watch',
    DROPPED:       'Dropped',
    ON_HOLD:       'On hold',
}

export default function MediaDetail() {
    const { type, id } = useParams<{ type: string; id: string }>()
    const navigate = useNavigate()
    const mediaType = type?.toUpperCase() as MediaType

    const [media, setMedia] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [addStatus, setAddStatus] = useState<WatchStatus>('PLAN_TO_WATCH')
    const [showStatusPicker, setShowStatusPicker] = useState(false)
    const [editingProgress, setEditingProgress] = useState(false)
    const [progressValue, setProgressValue] = useState(0)

    const { entries, addEntry, removeEntry, fetchList } = useListStore()

    const malId = parseInt(id ?? '0')
    const tracked = entries.find(e => e.mediaId === malId && e.mediaType === mediaType)

    useEffect(() => {
        if (!id || !type) return
        setLoading(true)
        Promise.all([
            getMediaById(type, malId).then(res => setMedia(res?.data ?? res)),
            fetchList()
        ]).finally(() => setLoading(false))
    }, [id, type])

    useEffect(() => {
        if (tracked) setProgressValue(tracked.progress)
    }, [tracked?.progress])

    const handleAdd = async () => {
        await addEntry({ mediaId: malId, mediaType, status: addStatus, progress: 0 })
        await fetchList()
        setShowStatusPicker(false)
    }

    const handleRemove = async () => {
        if (tracked) {
            await removeEntry(tracked.id)
            await fetchList()
        }
    }

    const handleStatusChange = async (newStatus: WatchStatus) => {
        if (!tracked) return
        await updateEntry(tracked.id, { ...tracked, status: newStatus })
        await fetchList()
    }

    const handleProgressSave = async () => {
        if (!tracked) return
        await updateEntry(tracked.id, { ...tracked, progress: progressValue })
        await fetchList()
        setEditingProgress(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-zinc-500 text-sm">Loading...</p>
            </div>
        )
    }

    if (!media) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-zinc-400">Not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 w-fit px-4 py-2 bg-white/5 border border-white/[0.06] rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors text-sm"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                    Go back
                </button>
            </div>
        )
    }

    const title = media.title_english ?? media.title
    const jpg = (media.images?.jpg ?? {}) as { large_image_url?: string; image_url?: string }
    const imageUrl = jpg.large_image_url ?? jpg.image_url
    const genres: string[] = Array.isArray(media.genres)
        ? media.genres.map((g: any) => g.name ?? g)
        : JSON.parse(media.genres ?? '[]')
    const studios: string[] = ((media.studios ?? []) as { name: string }[]).map(s => s.name)
    const total = (media.episodes || null) ?? (media.chapters || null)

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 w-fit px-4 py-2 bg-white/5 border border-white/[0.06] rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors text-sm"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
            </button>

            <div className="flex gap-8">
                {/* cover */}
                <div className="shrink-0 flex flex-col gap-3" style={{ width: '192px' }}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full rounded-xl object-cover shadow-2xl"
                        />
                    ) : (
                        <div className="w-full h-72 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600">?</div>
                    )}

                    {/* actions */}
                    {tracked ? (
                        <div className="flex flex-col gap-2">
                            {/* status selector */}
                            <select
                                value={tracked.status}
                                onChange={ev => handleStatusChange(ev.target.value as WatchStatus)}
                                className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg outline-none cursor-pointer"
                            >
                                {(Object.entries(STATUS_LABELS) as [WatchStatus, string][]).map(([val, label]) => (
                                    <option key={val} value={val} className="bg-zinc-900 text-zinc-100">{label}</option>
                                ))}
                            </select>

                            {/* progress editor */}
                            <div className="flex flex-col gap-1.5">
                                <p className="text-xs text-zinc-500">
                                    {mediaType === 'ANIME' ? 'Episode' : 'Chapter'} progress
                                </p>
                                {editingProgress ? (
                                    <div className="flex gap-1.5 items-center">
                                        <input
                                            type="number"
                                            min={0}
                                            max={total ?? 9999}
                                            value={progressValue}
                                            onChange={e => setProgressValue(parseInt(e.target.value) || 0)}
                                            onKeyDown={e => e.key === 'Enter' && handleProgressSave()}
                                            className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-white/20"
                                            autoFocus
                                        />
                                        {total && <span className="text-xs text-zinc-500 shrink-0">/ {total}</span>}
                                        <button
                                            onClick={handleProgressSave}
                                            className="bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors"
                                        >
                                            ✓
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingProgress(true)}
                                        className="flex items-center justify-between bg-zinc-800 border border-white/5 hover:border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition-colors"
                                    >
                                        <span>{tracked.progress}{total ? ` / ${total}` : ''}</span>
                                        <span className="text-zinc-500 text-xs">✎</span>
                                    </button>
                                )}
                            </div>

                            {/* remove */}
                            <button
                                onClick={handleRemove}
                                className="w-full bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-zinc-500 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                            >
                                Remove from list
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                                >
                                    + Add to list
                                </button>
                                <button
                                    onClick={() => setShowStatusPicker(p => !p)}
                                    className="bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 px-2.5 rounded-lg transition-colors text-sm"
                                >
                                    ▾
                                </button>
                            </div>

                            {showStatusPicker && (
                                <div className="flex flex-col gap-1 bg-zinc-900 border border-white/10 rounded-xl p-2">
                                    {(Object.entries(STATUS_LABELS) as [WatchStatus, string][]).map(([val, label]) => (
                                        <button
                                            key={val}
                                            onClick={() => { setAddStatus(val); setShowStatusPicker(false) }}
                                            className={`text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                                                addStatus === val
                                                    ? 'bg-rose-500/10 text-rose-400'
                                                    : 'text-zinc-400 hover:bg-white/5'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* info */}
                <div className="flex flex-col gap-5 flex-1 min-w-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
                                {type?.toLowerCase()}
                            </span>
                            {media.status && (
                                <span className="text-xs text-zinc-500">{media.status}</span>
                            )}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight leading-tight">{title}</h1>
                        {media.title !== title && (
                            <p className="text-sm text-zinc-500 mt-1">{media.title}</p>
                        )}
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        {media.score && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-2xl font-black text-yellow-400">★ {media.score}</span>
                                <span className="text-xs text-zinc-500">Score</span>
                            </div>
                        )}
                        {total && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-2xl font-black text-zinc-100">{total}</span>
                                <span className="text-xs text-zinc-500">{media.episodes ? 'Episodes' : 'Chapters'}</span>
                            </div>
                        )}
                        {media.year && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-2xl font-black text-zinc-100">{media.year}</span>
                                <span className="text-xs text-zinc-500">Year</span>
                            </div>
                        )}
                        {media.rank && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-2xl font-black text-zinc-100">#{media.rank}</span>
                                <span className="text-xs text-zinc-500">Rank</span>
                            </div>
                        )}
                    </div>

                    {genres.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {genres.map((g: string) => (
                                <span key={g} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                                    {g}
                                </span>
                            ))}
                        </div>
                    )}

                    {media.synopsis && (
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-2">Synopsis</p>
                            <p className="text-sm text-zinc-300 leading-relaxed">{media.synopsis}</p>
                        </div>
                    )}

                    {studios.length > 0 && (
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-1">Studios</p>
                            <p className="text-sm text-zinc-400">{studios.join(', ')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}