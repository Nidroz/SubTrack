import { useState } from 'react'
import { searchMedia } from '../services/api'
import { useListStore } from '../store/listStore'
import { MediaResult, MediaType } from '../types'

export default function Search() {
    const [query, setQuery] = useState('')
    const [type, setType] = useState<MediaType>('ANIME')
    const [results, setResults] = useState<MediaResult[]>([])
    const [loading, setLoading] = useState(false)
    const { addEntry } = useListStore()

    const search = async () => {
        if (!query.trim()) return
        setLoading(true)
        const data = await searchMedia(type, query)
        setResults(data.data ?? [])
        setLoading(false)
    }

    const add = async (item: MediaResult) => {
        await addEntry({ mediaId: item.mal_id, mediaType: type, status: 'PLAN_TO_WATCH', progress: 0 })
        alert(`"${item.title}" added!`)
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
                            onClick={() => setType(t)}
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
                {results.map(item => (
                    <div
                        key={item.mal_id}
                        className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-white/10 transition-colors group"
                    >
                        <img
                            src={item.images.jpg.image_url}
                            alt={item.title}
                            className="w-full aspect-[3/4] object-cover group-hover:scale-[1.02] transition-transform"
                        />
                        <div className="p-3 flex flex-col gap-2 flex-1">
                            <p className="text-sm font-semibold leading-snug line-clamp-2">
                                {item.title_english ?? item.title}
                            </p>
                            <div className="flex gap-2 items-center">
                                {item.score && (
                                    <span className="text-xs text-yellow-400 font-semibold">★ {item.score}</span>
                                )}
                                {(item.episodes || item.chapters) && (
                                    <span className="text-xs text-zinc-500">
                    {item.episodes ? `${item.episodes} eps` : `${item.chapters} ch`}
                  </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-2 flex-1">{item.synopsis}</p>
                            <button
                                onClick={() => add(item)}
                                className="mt-auto bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                            >
                                + Add to list
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}