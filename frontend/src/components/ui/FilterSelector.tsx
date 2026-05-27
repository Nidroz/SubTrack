import type { ContentFilter } from '../../services/api'

interface Props {
    filter: ContentFilter
    filters: { key: ContentFilter; label: string }[]
    onChange: (f: ContentFilter) => void
}

/**
 * content filter pill selector — Safe / All / Not Safe.
 * "Not Safe" only appears if user has enabled explicit content in profile.
 */
export default function FilterSelector({ filter, filters, onChange }: Props) {
    if (filters.length <= 1) return null

    return (
        <div className="flex items-center gap-2">
            {filters.map(f => (
                <button
                    key={f.key as string}
                    onClick={() => onChange(f.key)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                        filter === f.key
                            ? f.key === 'NSFW'
                                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                : 'border-rose-500 text-rose-400 bg-rose-500/10'
                            : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                    }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    )
}