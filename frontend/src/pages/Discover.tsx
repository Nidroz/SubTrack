import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRandom, getTopAiring, getTopPopular, getMyRecommendations } from '../services/api'
import { useListStore } from '../store/listStore'
import { MediaType, MediaResult } from '../types'

type Section = 'airing' | 'popular' | 'recommended'
const LIMITS = [12, 24] as const
type Limit = typeof LIMITS[number]

// extract item type from MAL url (e.g. https://myanimelist.net/anime/123 → 'anime')
const getItemType = (item: any): 'anime' | 'manga' => {
    const url: string = item.url ?? ''
    return url.includes('/manga/') ? 'manga' : 'anime'
}

export default function Discover() {
    const [type, setType] = useState<MediaType>('ANIME')
    const [section, setSection] = useState<Section>('airing')
    const [results, setResults] = useState<MediaResult[]>([])
    const [loading, setLoading] = useState(false)
    const [randomLoading, setRandomLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<Limit>(12)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [lastPage, setLastPage] = useState(1)

    const { entries, addEntry, fetchList } = useListStore()
    const navigate = useNavigate()
    const trackedIds = new Set(entries.map(e => e.mediaId))

    useEffect(() => { fetchList() }, [])

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            setResults([])
            try {
                let data
                if (section === 'airing') data = await getTopAiring(type, page, limit)
                else if (section === 'popular') data = await getTopPopular(type, page, limit)
                else data = await getMyRecommendations(type)

                if (cancelled || !data) return

                if (section === 'recommended') {
                    const items = (data.data ?? [])
                        .map((r: any) => r.entry)
                        .filter(Boolean)
                    setResults(items)
                    setResults(items)
                    setHasNextPage(false)
                } else {
                    setResults(data.data ?? [])
                    setHasNextPage(data.pagination?.has_next_page ?? false)
                    setLastPage(data.pagination?.last_visible_page ?? page)
                    if ((data.data ?? []).length === 0 && page > 1) {
                        setPage(p => p - 1)
                        return
                    }
                }
            } catch {
                if (!cancelled) setResults([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [section, type, page, limit])

    const handleSectionChange = (s: Section) => { setSection(s); setPage(1) }
    const handleTypeChange = (t: MediaType) => { setType(t); setPage(1) }
    const handleLimitChange = (l: Limit) => { setLimit(l); setPage(1) }

    const handleRandom = async () => {
        setRandomLoading(true)
        try {
            const data = await getRandom(type)
            if (data?.data?.mal_id) navigate(`/${type.toLowerCase()}/${data.data.mal_id}`)
        } finally { setRandomLoading(false) }
    }

    const handleAdd = async (item: any) => {
        // use actual item type for recommended section
        const itemType = section === 'recommended' ? getItemType(item).toUpperCase() as MediaType : type
        await addEntry({ mediaId: item.mal_id, mediaType: itemType, status: 'PLAN_TO_WATCH', progress: 0 })
        await fetchList()
    }

    const handleNavigate = (item: any) => {
        const itemType = section === 'recommended' ? getItemType(item) : type.toLowerCase()
        navigate(`/${itemType}/${item.mal_id}`)
    }

    const SECTIONS: { key: Section; label: string }[] = [
        { key: 'airing',      label: type === 'ANIME' ? 'Top Airing' : 'Top Publishing' },
        { key: 'popular',     label: 'Most Popular' },
        { key: 'recommended', label: 'For You' },
    ]

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Discover</h1>
                    <p className="text-zinc-500 text-sm mt-1">Find something new to watch</p>
                </div>
                <button onClick={handleRandom} disabled={randomLoading}
                        className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 font-semibold text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                    <span>{randomLoading ? '...' : '🎲'}</span>
                    Surprise me
                </button>
            </header>

            <div className="flex gap-3 flex-wrap items-center justify-between">
                <div className="flex gap-3 flex-wrap items-center">
                    <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 gap-1">
                        {(['ANIME', 'MANGA'] as MediaType[]).map(t => (
                            <button key={t} onClick={() => handleTypeChange(t)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${type === t ? 'bg-rose-500 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}>
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {SECTIONS.map(s => (
                            <button key={s.key} onClick={() => handleSectionChange(s.key)}
                                    className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                        section === s.key ? 'border-rose-500 text-rose-400 bg-rose-500/10' : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                                    }`}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {section !== 'recommended' && (
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
                )}
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : results.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
                    <p className="text-sm">
                        {section === 'recommended' ? 'Add anime or manga to your list to get recommendations.' : 'Nothing to show.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
                    {results.map((item: any) => {
                        const tracked = trackedIds.has(item.mal_id)
                        const imgUrl = item.images?.jpg?.image_url
                        return (
                            <div key={item.mal_id}
                                 className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group">
                                <div className="cursor-pointer" onClick={() => handleNavigate(item)}>
                                    {imgUrl ? (
                                        <img src={imgUrl} alt={item.title} className="w-full aspect-[3/4] object-cover group-hover:scale-[1.02] transition-transform" />
                                    ) : (
                                        <div className="w-full aspect-[3/4] bg-zinc-800 flex items-center justify-center text-zinc-600">?</div>
                                    )}
                                </div>
                                <div className="p-3 flex flex-col gap-2 flex-1">
                                    <p className="text-sm font-semibold leading-snug line-clamp-2 cursor-pointer hover:text-rose-400 transition-colors"
                                       onClick={() => handleNavigate(item)}>
                                        {item.title_english ?? item.title}
                                    </p>
                                    <div className="flex gap-2 items-center">
                                        {item.score && <span className="text-xs text-yellow-400 font-semibold">★ {item.score}</span>}
                                        {item.episodes && <span className="text-xs text-zinc-500">{item.episodes} eps</span>}
                                        {item.chapters && <span className="text-xs text-zinc-500">{item.chapters} ch</span>}
                                    </div>
                                    {tracked ? (
                                        <span className="mt-auto text-center bg-emerald-500/10 text-emerald-400 text-xs font-semibold py-2 rounded-lg">✓ Added</span>
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
            )}

            {section !== 'recommended' && results.length > 0 && lastPage > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(1)} disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">«</button>
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">‹</button>

                    {Array.from({ length: lastPage }, (_, i) => i + 1)
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
                                <button key={item} onClick={() => setPage(item as number)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            item === page ? 'bg-rose-500 text-white' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200'
                                        }`}>
                                    {item}
                                </button>
                            )
                        )
                    }

                    <button onClick={() => setPage(p => p + 1)} disabled={!hasNextPage}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">›</button>
                    <button onClick={() => setPage(lastPage)} disabled={page === lastPage}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30 transition-colors">»</button>
                </div>
            )}
        </div>
    )
}