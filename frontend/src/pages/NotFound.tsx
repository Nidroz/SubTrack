import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex items-center gap-2">
                    <span className="text-rose-400 text-2xl">⬡</span>
                    <span className="font-black text-xl tracking-tight text-zinc-100">SubTrack</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <p className="text-8xl font-black text-white/5 select-none">404</p>
                    <h1 className="text-xl font-black tracking-tight -mt-6">Page not found</h1>
                    <p className="text-sm text-zinc-500 max-w-xs">
                        This page doesn't exist or was moved somewhere else.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/[0.06] rounded-full text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Go back
                    </button>
                    <Link
                        to="/"
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-full text-sm text-white font-semibold transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}