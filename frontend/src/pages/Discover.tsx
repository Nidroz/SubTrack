import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRandom, getTopAiring, getTopPopular, getMyRecommendations } from '../services/api'
import { useListStore } from '../store/listStore'
import { MediaType, MediaResult } from '../types'

type Section = 'airing' | 'popular' | 'recommended'

export default function Discover() {
    const [type, setType] = useState<MediaType>('ANIME')
    const [section, setSection] = useState<Section>('airing')
    const [results, setResults] = useState<MediaResult[]>([])
    const [loading, setLoading] = useState(false)
    const [randomLoading, setRandomLoading] = useState(false)

    const { entries, addEntry, fetchList } = useListStore()
    const navigate = useNavigate()

    const trackedIds = new Set(entries.map(e => e.mediaId))

    useEffect(() => {
        fetchList()
        loadSection(section, type)
    }, [])

    useEffect(() => {
        loadSection(section, type)
    }, [section, type])

    const loadSection = async (s: Section, t: MediaType) => {
        setLoading(true)
        try {
            let data
            if (s === 'airing') data = await getTopAiring(t)
            else if (s === 'popular') data = await getTopPopular(t)
            else data = await getMyRecommendations()

            if (!data) { setResults([]); return }  // ← guard

            if (s === 'recommended') {
                setResults((data.data ?? []).map((r: any) => r.entry).filter(Boolean))
            } else {
                setResults(data.data ?? [])
            }
        } catch (e) {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleRandom = async () => {
        setRandomLoading(true)
        try {
            const data = await getRandom(type)
            const item = data?.data
            if (item?.mal_id) {
                navigate(`/${type.toLowerCase()}/${item.mal_id}`)
            }
        } finally {
            setRandomLoading(false)
        }
    }

    const handleAdd = async (item: MediaResult) => {
        await addEntry({ mediaId: item.mal_id, mediaType: type, status: 'PLAN_TO_WATCH', progress: 0 })
        await fetchList()
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

                {/* surprise me button */}
                <button
                    onClick={handleRandom}
                    disabled={randomLoading}
                    className="flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 font-semibold text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                    <span>{randomLoading ? '...' : '🎲'}</span>
                    Surprise me
                </button>
            </header>

            {/* type + section controls */}
            <div className="flex gap-3 flex-wrap items-center">
                <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-1 gap-1">
                    {(['ANIME', 'MANGA'] as MediaType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                type === t ? 'bg-rose-500 text-white' : 'text-zinc-500 hover:text-zinc-200'
                            }`}
                        >
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    {SECTIONS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                section === s.key
                                    ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                                    : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* results grid */}
            {loading ? (
                <p className="text-sm text-zinc-500">Loading...</p>
            ) : results.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
                    <p className="text-sm">
                        {section === 'recommended'
                            ? 'Add some anime or manga to your list to get recommendations.'
                            : 'Nothing to show.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
                    {results.map((item: any) => {
                        const malId = item.mal_id
                        const tracked = trackedIds.has(malId)
                        const imgUrl = item.images?.jpg?.image_url

                        return (
                            <div
                                key={malId}
                                className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group"
                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/${type.toLowerCase()}/${malId}`)}
                                >
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt={item.title}
                                            className="w-full aspect-[3/4] object-cover group-hover:scale-[1.02] transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full aspect-[3/4] bg-zinc-800 flex items-center justify-center text-zinc-600">?</div>
                                    )}
                                </div>

                                <div className="p-3 flex flex-col gap-2 flex-1">
                                    <p
                                        className="text-sm font-semibold leading-snug line-clamp-2 cursor-pointer hover:text-rose-400 transition-colors"
                                        onClick={() => navigate(`/${type.toLowerCase()}/${malId}`)}
                                    >
                                        {item.title_english ?? item.title}
                                    </p>
                                    <div className="flex gap-2 items-center">
                                        {item.score && <span
                                            className="text-xs text-yellow-400 font-semibold">★ {item.score}</span>}
                                        {item.episodes &&
                                            <span className="text-xs text-zinc-500">{item.episodes} eps</span>}
                                        {item.chapters &&
                                            <span className="text-xs text-zinc-500">{item.chapters} ch</span>}
                                    </div>

                                    {tracked ? (
                                        <span
                                            className="mt-auto text-center bg-emerald-500/10 text-emerald-400 text-xs font-semibold py-2 rounded-lg">
                                            ✓ Added
                                        </span>
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
            )}
        </div>
    )
}