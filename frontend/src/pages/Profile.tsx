import { useEffect, useRef, useState } from 'react'
import { getProfile, getProfileStats, changePassword, changeEmail, updateProfile } from '../services/api'
import { useAuthStore } from '../store/authStore'
import PasswordInput from '../components/ui/PasswordInput'

interface Profile {
    id: number
    username: string
    email: string
    createdAt: string
    avatarUrl?: string
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
    const { username, setUsername } = useAuthStore()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [stats, setStats] = useState<ProfileStats | null>(null)
    const [loading, setLoading] = useState(true)

    // edit profile state
    const [editUsername, setEditUsername] = useState('')
    const [editLoading, setEditLoading] = useState(false)
    const [editMsg, setEditMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)

    // password state
    const [currentPwd, setCurrentPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [pwdLoading, setPwdLoading] = useState(false)

    // email state
    const [newEmail, setNewEmail] = useState('')
    const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [emailLoading, setEmailLoading] = useState(false)

    const load = async () => {
        const [p, s] = await Promise.all([getProfile(), getProfileStats()])
        setProfile(p)
        setStats(s)
        setEditUsername(p.username)
        if (p.avatarUrl) setAvatarPreview(p.avatarUrl)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        // limit to 1MB
        if (file.size > 1024 * 1024) {
            setEditMsg({ text: 'Image too large (max 1MB)', ok: false })
            return
        }
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            setAvatarPreview(result)
            setPendingAvatar(result)
        }
        reader.readAsDataURL(file)
    }

    const handleProfileUpdate = async () => {
        setEditLoading(true)
        setEditMsg(null)
        try {
            await updateProfile({
                username: editUsername !== profile?.username ? editUsername : undefined,
                avatarBase64: pendingAvatar ?? undefined,
            })
            // update username in authStore if changed
            if (editUsername !== profile?.username) {
                setUsername(editUsername)
                localStorage.setItem('username', editUsername)
            }
            setPendingAvatar(null)
            setEditMsg({ text: 'Profile updated', ok: true })
            load()
        } catch (e: any) {
            setEditMsg({ text: e?.response?.data?.message ?? 'Failed to update', ok: false })
        } finally {
            setEditLoading(false)
        }
    }

    const handlePasswordChange = async () => {
        if (newPwd !== confirmPwd) { setPwdMsg({ text: 'Passwords do not match', ok: false }); return }
        if (newPwd.length < 6) { setPwdMsg({ text: 'Min 6 characters', ok: false }); return }
        setPwdLoading(true)
        try {
            await changePassword(currentPwd, newPwd)
            setPwdMsg({ text: 'Password updated successfully', ok: true })
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        } catch (e: any) {
            setPwdMsg({ text: e?.response?.data?.message ?? 'Failed', ok: false })
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

            {/* account + edit */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Account</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-5">
                    {/* avatar + name row */}
                    <div className="flex items-center gap-4">
                        {/* avatar */}
                        <div
                            className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group shrink-0"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-2xl">
                                    {profile?.username[0].toUpperCase()}
                                </div>
                            )}
                            {/* hover overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                    <circle cx="12" cy="13" r="4"/>
                                </svg>
                            </div>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-500 mb-1">Member since {joinDate}</p>
                            <p className="text-xs text-zinc-600">{profile?.email}</p>
                        </div>
                    </div>

                    {/* username edit */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-zinc-500">Username</label>
                        <input
                            value={editUsername}
                            onChange={e => setEditUsername(e.target.value)}
                            className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-white/20 transition-colors"
                        />
                    </div>

                    {editMsg && (
                        <p className={`text-xs ${editMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{editMsg.text}</p>
                    )}

                    <button
                        onClick={handleProfileUpdate}
                        disabled={editLoading || (editUsername === profile?.username && !pendingAvatar)}
                        className="bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                        {editLoading ? 'Saving...' : 'Save changes'}
                    </button>
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

                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Status breakdown</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'watching',    label: 'Watching',      value: stats.watching },
                                { key: 'completed',   label: 'Completed',     value: stats.completed },
                                { key: 'planToWatch', label: 'Plan to watch', value: stats.planToWatch },
                                { key: 'dropped',     label: 'Dropped',       value: stats.dropped },
                                { key: 'onHold',      label: 'On hold',       value: stats.onHold },
                            ].map(s => (
                                <div key={s.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.key]}`}>
                                    <span>{s.label}</span>
                                    <span className="font-black">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {scoreEntries.length > 0 && (
                        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">Score distribution</p>
                            <div className="flex items-end gap-1.5 h-20">
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(score => {
                                    const count = stats.scoreDistribution[score] ?? 0
                                    const height = count ? Math.max((count / maxScore) * 100, 8) : 0
                                    return (
                                        <div key={score} className="flex flex-col items-center gap-1 flex-1">
                                            <div className="w-full rounded-sm bg-rose-500/60 transition-all" style={{ height: `${height}%`, minHeight: count ? '4px' : '0' }} />
                                            <span className="text-[10px] text-zinc-600">{score}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* email change */}
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
                        {emailMsg && <p className={`text-xs ${emailMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{emailMsg.text}</p>}
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

            {/* password */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Security</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                    <p className="text-sm font-medium">Change password</p>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Current password', value: currentPwd, set: setCurrentPwd },
                            { label: 'New password',     value: newPwd,     set: setNewPwd },
                            { label: 'Confirm new',      value: confirmPwd, set: setConfirmPwd },
                        ].map(f => (
                            <div key={f.label} className="flex flex-col gap-1.5">
                                <label className="text-xs text-zinc-500">{f.label}</label>
                                <PasswordInput value={f.value} onChange={f.set} />
                            </div>
                        ))}
                        {pwdMsg && <p className={`text-xs ${pwdMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{pwdMsg.text}</p>}
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

            {/* session */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Session</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
                    <button onClick={() => useAuthStore.getState().logout()} className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
                        Sign out of all devices
                    </button>
                </div>
            </section>
        </div>
    )
}