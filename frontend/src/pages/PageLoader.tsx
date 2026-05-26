/**
 * full-screen loading state used by AuthGuard while checking auth.
 */
export default function PageLoader() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <span className="text-rose-400 text-2xl animate-pulse">⬡</span>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-rose-500/60 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}