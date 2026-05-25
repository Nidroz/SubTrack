import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import { getProfile } from '../../services/api'
import { Profile} from "../../types";

const navLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
            ? 'bg-rose-500/10 text-rose-400'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
    }`

export default function Layout() {
    const { username, role, logout } = useAuthStore()
    const navigate = useNavigate()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        getProfile().then((p: Profile) => setAvatarUrl(p.avatarUrl ?? null)).catch(() => {})
    }, [username]) // re-fetch when username changes (profile update)

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
            <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col px-4 py-7 sticky top-0 h-screen">
                {/* logo -> dashboard */}
                <Link to="/" className="flex items-center gap-2 mb-10 group">
                    <span className="text-rose-400 text-xl group-hover:text-rose-300 transition-colors">⬡</span>
                    <span className="font-black text-lg tracking-tight group-hover:text-zinc-300 transition-colors">SubTrack</span>
                </Link>

                <nav className="flex flex-col gap-1 flex-1">
                    <NavLink to="/" end className={navLink}>Dashboard</NavLink>
                    <NavLink to="/search" className={navLink}>Search</NavLink>
                    <NavLink to="/discover" className={navLink}>Discover</NavLink>
                    <NavLink to="/list" className={navLink}>My List</NavLink>
                    {role === 'ADMIN' && (
                        <NavLink to="/admin" className={navLink}>
                            <span className="flex items-center gap-2">
                                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-black">A</span>
                                Admin
                            </span>
                        </NavLink>
                    )}
                </nav>

                <div className="border-t border-white/5 pt-4 flex flex-col gap-1">
                    {/* profile link with avatar */}
                    <NavLink to="/profile" className={navLink}>
                        <div className="flex items-center gap-2">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="avatar"
                                    className="w-5 h-5 rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-black shrink-0">
                                    {username?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <span className="truncate">{username}</span>
                        </div>
                    </NavLink>
                    <button
                        onClick={() => { logout(); navigate('/login') }}
                        className="flex items-center px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-red-400 hover:bg-white/5 transition-colors text-left"
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-10 max-w-5xl">
                <Outlet />
            </main>
        </div>
    )
}