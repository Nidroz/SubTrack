import { useEffect, useState } from 'react'
import { getProfile, getProfileStats, changePassword } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { changeEmail } from '../services/api'

interface Profile {
    id: number
    username: string
    email: string
    createdAt: string
}

interface ProfileStats {
    total: number
    watching: number
    completed: number
    planToWatch: number
    dropped: number
    onHold: number
    avgScore: number | null
    totalAnime: number
    totalManga: number
    estimatedMinutes: number
    scoreDistribution: Record<number, number>
}

const STATUS_COLORS: Record<string, string> = {
    watching:    'bg-violet-500/10 text-violet-400',
    completed:   'bg-emerald-500/10 text-emerald-400',
    planToWatch: 'bg-white/5 text-zinc-400',
    dropped:     'bg-red-500/10 text-red-400',
    onHold:      'bg-yellow-500/10 text-yellow-400',
}

function formatTime(minutes: number) {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    if (h < 24) return `${h}h`
    const d = Math.floor(h / 24)
    return `${d}d ${h % 24}h`
}

export default function Profile() {
    const { logout } = useAuthStore()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [stats, setStats] = useState<ProfileStats | null>(null)
    const [loading, setLoading] = useState(true)

    const [currentPwd, setCurrentPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [pwdLoading, setPwdLoading] = useState(false)

    const [newEmail, setNewEmail] = useState('')
    const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [emailLoading, setEmailLoading] = useState(false)

    useEffect(() => {
        Promise.all([getProfile(), getProfileStats()])
            .then(([p, s]) => { setProfile(p); setStats(s) })
            .finally(() => setLoading(false))
    }, [])

    const handlePasswordChange = async () => {
        if (newPwd !== confirmPwd) {
            setPwdMsg({ text: 'Passwords do not match', ok: false })
            return
        }
        if (newPwd.length < 6) {
            setPwdMsg({ text: 'Password must be at least 6 characters', ok: false })
            return
        }
        setPwdLoading(true)
        try {
            await changePassword(currentPwd, newPwd)
            setPwdMsg({ text: 'Password updated successfully', ok: true })
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        } catch (e: any) {
            setPwdMsg({ text: e?.response?.data?.message ?? 'Failed to update password', ok: false })
        } finally {
            setPwdLoading(false)
        }
    }

    const handleEmailChange = async () => {
        if (!newEmail) return
        setEmailLoading(true)
        try {
            await changeEmail(newEmail)
            setEmailMsg({ text: `Confirmation sent to ${newEmail}`, ok: true })
            setNewEmail('')
        } catch (e: any) {
            setEmailMsg({ text: e?.response?.data?.message ?? 'Failed', ok: false })
        } finally {
            setEmailLoading(false)
        }
    }

    if (loading) return <p className="text-zinc-500 text-sm">Loading...</p>

    const scoreEntries = stats
        ? Object.entries(stats.scoreDistribution).sort(([a], [b]) => Number(a) - Number(b))
        : []
    const maxScore = Math.max(...scoreEntries.map(([, v]) => v), 1)

    const joinDate = profile
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : ''

    return (
        <div className="flex flex-col gap-10 max-w-2xl">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Profile</h1>
                <p className="text-zinc-500 text-sm mt-1">Your account and stats</p>
            </header>

            {/* account info */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Account</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-xl">
                            {profile?.username[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-base">{profile?.username}</p>
                            <p className="text-sm text-zinc-500">{profile?.email}</p>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-4 flex gap-6 text-sm">
                        <div>
                            <p className="text-zinc-500 text-xs mb-0.5">Member since</p>
                            <p className="text-zinc-300">{joinDate}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 text-xs mb-0.5">Total entries</p>
                            <p className="text-zinc-300">{stats?.total ?? 0}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* stats */}
            {stats && (
                <section className="flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Stats</h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 mb-1">Anime tracked</p>
                            <p className="text-2xl font-black text-rose-400">{stats.totalAnime}</p>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 mb-1">Manga tracked</p>
                            <p className="text-2xl font-black text-violet-400">{stats.totalManga}</p>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 mb-1">Avg score</p>
                            <p className="text-2xl font-black text-yellow-400">
                                {stats.avgScore ? stats.avgScore.toFixed(1) : '—'}
                            </p>
                        </div>
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 mb-1">Time watched</p>
                            <p className="text-2xl font-black text-emerald-400">{formatTime(stats.estimatedMinutes)}</p>
                        </div>
                    </div>

                    {/* status breakdown */}
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Status breakdown</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                {key: 'watching', label: 'Watching', value: stats.watching},
                                {key: 'completed', label: 'Completed', value: stats.completed},
                                {key: 'planToWatch', label: 'Plan to watch', value: stats.planToWatch},
                                {key: 'dropped', label: 'Dropped', value: stats.dropped},
                                {key: 'onHold', label: 'On hold', value: stats.onHold},
                            ].map(s => (
                                <div key={s.key}
                                     className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.key]}`}>
                                    <span>{s.label}</span>
                                    <span className="font-black">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* score distribution */}
                    {scoreEntries.length > 0 && (
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Score distribution</p>
                            <div className="flex items-end gap-1.5 h-20">
                                {Array.from({length: 10}, (_, i) => i + 1).map(score => {
                                    const count = stats.scoreDistribution[score] ?? 0
                                    const height = count ? Math.max((count / maxScore) * 100, 8) : 0
                                    return (
                                        <div key={score} className="flex flex-col items-center gap-1 flex-1">
                                            <div
                                                className="w-full rounded-sm bg-rose-500/60 transition-all"
                                                style={{height: `${height}%`, minHeight: count ? '4px' : '0'}}
                                            />
                                            <span className="text-[10px] text-zinc-600">{score}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* change password */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Security</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                    <p className="text-sm font-medium">Change password</p>
                    <div className="flex flex-col gap-3">
                        {[
                            {label: 'Current password', value: currentPwd, set: setCurrentPwd},
                            {label: 'New password', value: newPwd, set: setNewPwd},
                            {label: 'Confirm new', value: confirmPwd, set: setConfirmPwd},
                        ].map(f => (
                            <div key={f.label} className="flex flex-col gap-1.5">
                                <label className="text-xs text-zinc-500">{f.label}</label>
                                <input
                                    type="password"
                                    value={f.value}
                                    onChange={e => f.set(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                                />
                            </div>
                        ))}

                        {pwdMsg && (
                            <p className={`text-xs ${pwdMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                {pwdMsg.text}
                            </p>
                        )}

                        <button
                            onClick={handlePasswordChange}
                            disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
                            className="bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                        >
                            {pwdLoading ? 'Updating...' : 'Update password'}
                        </button>
                    </div>
                </div>
            </section>
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Email</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                    <div>
                        <p className="text-sm font-medium">Change email</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Current: {profile?.email}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-zinc-500">New email</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                placeholder="new@example.com"
                                className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                            />
                        </div>
                        {emailMsg && (
                            <p className={`text-xs ${emailMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                {emailMsg.text}
                            </p>
                        )}
                        <button
                            onClick={handleEmailChange}
                            disabled={emailLoading || !newEmail}
                            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-sm font-semibold py-2 rounded-lg transition-colors"
                        >
                            {emailLoading ? 'Sending...' : 'Send confirmation'}
                        </button>
                    </div>
                </div>
            </section>

            {/* danger zone */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Session</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
                    <button
                        onClick={logout}
                        className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                        Sign out of all devices
                    </button>
                </div>
            </section>
        </div>
    )
}