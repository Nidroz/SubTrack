import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

interface AdminUser {
    id: number
    username: string
    email: string
    role: string
    createdAt: string
    entryCount: number
}

interface GlobalStats {
    totalUsers: number
    totalEntries: number
    totalCachedMedia: number
}

// use the configured api instance from services
import { default as axios } from 'axios'

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export default function Admin() {
    const { username } = useAuthStore()
    const navigate = useNavigate()

    const [users, setUsers] = useState<AdminUser[]>([])
    const [stats, setStats] = useState<GlobalStats | null>(null)
    const [cacheSize, setCacheSize] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

    const load = async () => {
        setLoading(true)
        try {
            const [u, s, c] = await Promise.all([
                api.get('/admin/users').then(r => r.data),
                api.get('/admin/stats').then(r => r.data),
                api.get('/admin/cache/size').then(r => r.data),
            ])
            setUsers(u)
            setStats(s)
            setCacheSize(c.size)
        } catch {
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const flash = (text: string, ok: boolean) => {
        setMsg({ text, ok })
        setTimeout(() => setMsg(null), 3000)
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
        try {
            await api.delete(`/admin/users/${id}`)
            flash('User deleted', true)
            load()
        } catch (e: any) {
            flash(e?.response?.data?.message ?? 'Failed', false)
        }
    }

    const handleRole = async (id: number, currentRole: string) => {
        const endpoint = currentRole === 'ADMIN' ? 'demote' : 'promote'
        try {
            await api.patch(`/admin/users/${id}/${endpoint}`)
            flash(`User ${endpoint}d`, true)
            load()
        } catch (e: any) {
            flash(e?.response?.data?.message ?? 'Failed', false)
        }
    }

    const handleClearCache = async () => {
        if (!confirm('Clear all cached media? They will be re-fetched on next access.')) return
        try {
            await api.delete('/admin/cache')
            flash('Cache cleared', true)
            setCacheSize(0)
        } catch {
            flash('Failed to clear cache', false)
        }
    }

    if (loading) return <p className="text-zinc-500 text-sm">Loading...</p>

    return (
        <div className="flex flex-col gap-10 max-w-4xl">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Admin</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage users and system settings</p>
                </div>
                {msg && (
                    <span className={`text-sm font-medium px-4 py-2 rounded-lg ${msg.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {msg.text}
                    </span>
                )}
            </header>

            {/* global stats */}
            {stats && (
                <section className="flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Global Stats</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
                            <p className="text-xs text-zinc-500 mb-1">Total users</p>
                            <p className="text-2xl font-black text-rose-400">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
                            <p className="text-xs text-zinc-500 mb-1">Total list entries</p>
                            <p className="text-2xl font-black text-violet-400">{stats.totalEntries}</p>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
                            <p className="text-xs text-zinc-500 mb-1">Cached media</p>
                            <p className="text-2xl font-black text-emerald-400">{cacheSize ?? stats.totalCachedMedia}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* cache management */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Media Cache</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Clear media cache</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {cacheSize} entries cached — clears stale metadata from Jikan
                        </p>
                    </div>
                    <button
                        onClick={handleClearCache}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Clear cache
                    </button>
                </div>
            </section>

            {/* users table */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Users ({users.length})</h2>
                <div className="flex flex-col gap-2">
                    {users.map(u => (
                        <div key={u.id} className="flex items-center gap-4 bg-zinc-900 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                            {/* avatar */}
                            <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-sm shrink-0">
                                {u.username[0].toUpperCase()}
                            </div>

                            {/* info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{u.username}</p>
                                    {u.role === 'ADMIN' && (
                                        <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
                                            ADMIN
                                        </span>
                                    )}
                                    {u.username === username && (
                                        <span className="text-[10px] text-zinc-500">(you)</span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500">{u.email} · {u.entryCount} entries</p>
                            </div>

                            {/* joined */}
                            <p className="text-xs text-zinc-600 shrink-0">
                                {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>

                            {/* actions — can't modify yourself */}
                            {u.username !== username && (
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleRole(u.id, u.role)}
                                        className="text-xs bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id, u.username)}
                                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}