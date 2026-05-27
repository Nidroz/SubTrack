import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { searchMedia, ContentFilter } from '../services/api'
import { useListStore } from '../store/listStore'
import { getRandom } from '../services/api'
import { MediaResult, MediaType } from '../types'
import { useContentFilter } from '../hooks/useContentFilter'
import FilterSelector from '../components/ui/FilterSelector'
import NsfwWarningModal from '../components/ui/NsfwWarningModal'

const LIMITS = [12, 24] as const
type Limit = typeof LIMITS[number]

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const [type, setType] = useState<MediaType>((searchParams.get('type') as MediaType) ?? 'ANIME')
    const [query, setQuery] = useState(searchParams.get('q') ?? '')
    const [results, setResults] = useState<MediaResult[]>([])
    const [loading, setLoading] = useState(false)
    const [randomLoading, setRandomLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<Limit>(12)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [lastQuery, setLastQuery] = useState({ q: '', type: 'ANIME' as MediaType })
    const [lastPage, setLastPage] = useState(1)
    const [jumpPage, setJumpPage] = useState('')

    const [showNsfwWarning, setShowNsfwWarning] = useState(false)
    const [pendingFilter, setPendingFilter] = useState<ContentFilter | null>(null)

    const { filter, setFilter, filters } = useContentFilter()
    const { entries, addEntry, removeEntry, fetchList } = useListStore()

    useEffect(() => { fetchList() }, [])

    useEffect(() => {
        const q = searchParams.get('q')
        const t = searchParams.get('type') as MediaType
        if (q) {
            setQuery(q)
            setType(t ?? 'ANIME')
            runSearch(q, t ?? 'ANIME', 1, limit, filter)
        }
    }, [])

    const trackedIds = new Set(entries.map(e => e.mediaId))
    const getEntryId = (malId: number) => entries.find(e => e.mediaId === malId)?.id

    const runSearch = async (q: string, t: MediaType, p: number, l: Limit, f: ContentFilter) => {
        if (!q.trim()) return
        setLoading(true)
        try {
            const data = await searchMedia(t, q, p, l, f) as any
            setResults(data.data ?? [])
            setHasNextPage(data.pagination?.has_next_page ?? false)
            setLastPage(data.pagination?.last_visible_page ?? p)
            if ((data.data ?? []).length === 0 && p > 1) {
                setPage(prev => prev - 1)
                return
            }
            setLastQuery({ q, type: t })
        } finally {
            setLoading(false)
        }
    }

    const search = () => {
        setPage(1)
        setSearchParams({ q: query, type })
        runSearch(query, type, 1, limit, filter)
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        runSearch(lastQuery.q, lastQuery.type, newPage, limit, filter)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleLimitChange = (newLimit: Limit) => {
        setLimit(newLimit)
        setPage(1)
        if (lastQuery.q) runSearch(lastQuery.q, lastQuery.type, 1, newLimit, filter)
    }

    const handleFilterChange = (f: ContentFilter) => {
        if (f === 'NSFW' && localStorage.getItem('nsfw-warning-dismissed') !== 'true') {
            setPendingFilter(f)
            setShowNsfwWarning(true)
            return
        }
        setFilter(f)
        setPage(1)
        if (lastQuery.q) runSearch(lastQuery.q, lastQuery.type, 1, limit, f)
    }


    const handleTypeChange = (t: MediaType) => {
        setType(t)
        if (query) setSearchParams({ q: query, type: t })
    }

    const handleSurprise = async () => {
        setRandomLoading(true)
        try {
            const data = await getRandom(type)
            if (data?.data?.mal_id) navigate(`/${type.toLowerCase()}/${data.data.mal_id}`)
        } finally { setRandomLoading(false) }
    }

    const handleAdd = async (item: MediaResult) => {
        await addEntry({ mediaId: item.mal_id, mediaType: type, status: 'PLAN_TO_WATCH', progress: 0 })
        await fetchList()
    }

    const handleRemove = async (malId: number) => {
        const entryId = getEntryId(malId)
        if (entryId) { await removeEntry(entryId); await fetchList() }
    }

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Search</h1>
                <p className="text-zinc-500 text-sm mt-1">Find anime & manga to track</p>
            </header>

            <div className="flex gap-3 items-center flex-wrap">
                <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 gap-1">
                    {(['ANIME', 'MANGA'] as MediaType[]).map(t => (
                        <button key={t} onClick={() => handleTypeChange(t)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${type === t ? 'bg-rose-500 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}>
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                <input
                    className="flex-1 min-w-48 bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                    placeholder={`Search ${type.toLowerCase()}...`}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && search()}
                />

                <button onClick={search} disabled={loading}
                        className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
                    {loading ? '...' : 'Search'}
                </button>

                <button onClick={handleSurprise} disabled={randomLoading}
                        className="bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        title="Random anime or manga">
                    {randomLoading ? '...' : '🎲'}
                </button>
            </div>

            {/* controls row: filter + limit */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <FilterSelector filter={filter} filters={filters} onChange={handleFilterChange} />

                {results.length > 0 && (
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-zinc-500">{results.length} results · page {page}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>Show</span>
                            {LIMITS.map(l => (
                                <button key={l} onClick={() => handleLimitChange(l)}
                                        className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                                            limit === l ? 'border-rose-500 text-rose-400 bg-rose-500/10' : 'border-white/5 text-zinc-500 hover:border-white/10'
                                        }`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
                {results.map(item => {
                    const tracked = trackedIds.has(item.mal_id)
                    return (
                        <div key={item.mal_id}
                             className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group">
                            <div className="cursor-pointer" onClick={() => navigate(`/${type.toLowerCase()}/${item.mal_id}`)}>
                                <img src={item.images.jpg.image_url} alt={item.title}
                                     className="w-full aspect-[3/4] object-cover group-hover:scale-[1.02] transition-transform" />
                            </div>
                            <div className="p-3 flex flex-col gap-2 flex-1">
                                <p className="text-sm font-semibold leading-snug line-clamp-2 cursor-pointer hover:text-rose-400 transition-colors"
                                   onClick={() => navigate(`/${type.toLowerCase()}/${item.mal_id}`)}>
                                    {item.title_english ?? item.title}
                                </p>
                                <div className="flex gap-2 items-center">
                                    {item.score && <span className="text-xs text-yellow-400 font-semibold">★ {item.score}</span>}
                                    {(item.episodes || item.chapters) && (
                                        <span className="text-xs text-zinc-500">
                                            {item.episodes ? `${item.episodes} eps` : `${item.chapters} ch`}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 line-clamp-2 flex-1">{item.synopsis}</p>
                                {tracked ? (
                                    <div className="flex gap-2 mt-auto">
                                        <span className="flex-1 text-center bg-emerald-500/10 text-emerald-400 text-xs font-semibold py-2 rounded-lg">✓ Added</span>
                                        <button onClick={() => handleRemove(item.mal_id)}
                                                className="bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">✕</button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleAdd(item)}
                                            className="mt-auto bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                                        + Add to list
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* pagination */}
            {results.length > 0 && (page > 1 || hasNextPage) && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button onClick={() => handlePageChange(1)} disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">«</button>
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">‹</button>

                    {lastPage > 1 && Array.from({ length: lastPage }, (_, i) => i + 1)
                        .filter(i => i === 1 || i === lastPage || Math.abs(i - page) <= 2)
                        .reduce<(number | '...')[]>((acc, i, idx, arr) => {
                            if (idx > 0 && (i as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                            acc.push(i)
                            return acc
                        }, [])
                        .map((item, idx) =>
                            item === '...' ? (
                                <span key={`e-${idx}`} className="text-zinc-600 text-sm px-1">…</span>
                            ) : (
                                <button key={item as number} onClick={() => handlePageChange(item as number)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            item === page ? 'bg-rose-500 text-white' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200'
                                        }`}>
                                    {item}
                                </button>
                            )
                        )
                    }

                    {!lastPage || lastPage <= 1 && (
                        <span className="text-sm text-zinc-500">Page {page}</span>
                    )}

                    <button onClick={() => handlePageChange(page + 1)} disabled={!hasNextPage}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">›</button>
                    {lastPage > 1 && (
                        <button onClick={() => handlePageChange(lastPage)} disabled={page === lastPage}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">»</button>
                    )}

                    {/* jump to page — only if we know total pages */}
                    {lastPage > 1 && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500 ml-2">
                            <span>Go to</span>
                            <input
                                type="number" min={1} max={lastPage}
                                value={jumpPage}
                                onChange={e => setJumpPage(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        const p = parseInt(jumpPage)
                                        if (!isNaN(p) && p >= 1 && p <= lastPage) {
                                            handlePageChange(p)
                                            setJumpPage('')
                                        }
                                    }
                                }}
                                placeholder={String(page)}
                                className="w-14 bg-zinc-900 border border-white/5 rounded-lg px-2 py-1.5 text-zinc-300 outline-none focus:border-white/20 text-center"
                            />
                            <span>/ {lastPage}</span>
                        </div>
                    )}
                </div>
            )}
            {showNsfwWarning && (
                <NsfwWarningModal
                    onConfirm={() => {
                        setShowNsfwWarning(false)
                        setFilter(pendingFilter!)
                        setPage(1)
                        if (lastQuery.q) runSearch(lastQuery.q, lastQuery.type, 1, limit, pendingFilter!)
                    }}
                    onCancel={() => {
                        setShowNsfwWarning(false)
                        setPendingFilter(null)
                    }}
                />
            )}
        </div>
    )
}