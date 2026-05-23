import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { searchMedia } from '../services/api'
import { useListStore } from '../store/listStore'
import { MediaResult, MediaType } from '../types'

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    // restore state from URL params on mount
    const [type, setType] = useState<MediaType>((searchParams.get('type') as MediaType) ?? 'ANIME')
    const [query, setQuery] = useState(searchParams.get('q') ?? '')
    const [results, setResults] = useState<MediaResult[]>([])
    const [loading, setLoading] = useState(false)

    const { entries, addEntry, removeEntry, fetchList } = useListStore()

    useEffect(() => { fetchList() }, [])

    // re-run search if URL has params on mount (e.g. coming back from detail page)
    useEffect(() => {
        const q = searchParams.get('q')
        const t = searchParams.get('type') as MediaType
        if (q) {
            setQuery(q)
            setType(t ?? 'ANIME')
            runSearch(q, t ?? 'ANIME')
        }
    }, [])

    const trackedIds = new Set(entries.map(e => e.mediaId))
    const isTracked = (malId: number) => trackedIds.has(malId)
    const getEntryId = (malId: number) => entries.find(e => e.mediaId === malId)?.id

    const runSearch = async (q: string, t: MediaType) => {
        if (!q.trim()) return
        setLoading(true)
        const data = await searchMedia(t, q)
        setResults(data.data ?? [])
        setLoading(false)
    }

    const search = () => {
        // persist query in URL so Back restores the search
        setSearchParams({ q: query, type })
        runSearch(query, type)
    }

    const handleTypeChange = (t: MediaType) => {
        setType(t)
        if (query) setSearchParams({ q: query, type: t })
    }

    const handleAdd = async (item: MediaResult) => {
        await addEntry({ mediaId: item.mal_id, mediaType: type, status: 'PLAN_TO_WATCH', progress: 0 })
        await fetchList()
    }

    const handleRemove = async (malId: number) => {
        const entryId = getEntryId(malId)
        if (entryId) {
            await removeEntry(entryId)
            await fetchList()
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Search</h1>
                <p className="text-zinc-500 text-sm mt-1">Find anime & manga to track</p>
            </header>

            <div className="flex gap-3 items-center">
                <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 gap-1">
                    {(['ANIME', 'MANGA'] as MediaType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => handleTypeChange(t)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                type === t ? 'bg-rose-500 text-white' : 'text-zinc-500 hover:text-zinc-200'
                            }`}
                        >
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                <input
                    className="flex-1 bg-zinc-900 border border-white/5 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                    placeholder={`Search ${type.toLowerCase()}...`}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && search()}
                />

                <button
                    onClick={search}
                    disabled={loading}
                    className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
                >
                    {loading ? '...' : 'Search'}
                </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
                {results.map(item => {
                    const tracked = isTracked(item.mal_id)
                    return (
                        <div
                            key={item.mal_id}
                            className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group"
                        >
                            <div
                                className="cursor-pointer"
                                onClick={() => navigate(`/${type.toLowerCase()}/${item.mal_id}`)}
                            >
                                <img
                                    src={item.images.jpg.image_url}
                                    alt={item.title}
                                    className="w-full aspect-[3/4] object-cover group-hover:scale-[1.02] transition-transform"
                                />
                            </div>

                            <div className="p-3 flex flex-col gap-2 flex-1">
                                <p
                                    className="text-sm font-semibold leading-snug line-clamp-2 cursor-pointer hover:text-rose-400 transition-colors"
                                    onClick={() => navigate(`/${type.toLowerCase()}/${item.mal_id}`)}
                                >
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
                                        <span className="flex-1 text-center bg-emerald-500/10 text-emerald-400 text-xs font-semibold py-2 rounded-lg">
                                            ✓ Added
                                        </span>
                                        <button
                                            onClick={() => handleRemove(item.mal_id)}
                                            className="bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAdd(item)}
                                        className="mt-auto bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        + Add to list
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}