import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
            ? 'bg-rose-500/10 text-rose-400'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
    }`

export default function Layout() {
    const { username, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
            <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col px-4 py-7 sticky top-0 h-screen">
                <div className="flex items-center gap-2 mb-10">
                    <span className="text-rose-400 text-xl">⬡</span>
                    <span className="font-black text-lg tracking-tight">SubTrack</span>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    <NavLink to="/" end className={navLink}>Dashboard</NavLink>
                    <NavLink to="/search" className={navLink}>Search</NavLink>
                    <NavLink to="/discover" className={navLink}>Discover</NavLink>
                    <NavLink to="/list" className={navLink}>My List</NavLink>
                </nav>

                <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                    <span className="text-xs text-zinc-500 truncate">{username}</span>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-zinc-600 hover:text-rose-400 text-left transition-colors"
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