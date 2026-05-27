import React, { useEffect, useRef, useState } from 'react'
import { getProfile, getProfileStats, changePassword, changeEmail, updateProfile } from '../services/api'
import { useAuthStore } from '../store/authStore'
import PasswordInput from '../components/ui/PasswordInput'
import AvatarCropper from '../components/ui/AvatarCropper'
import { Profile } from '../types'

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
    return `${Math.floor(h / 24)}d ${h % 24}h`
}

export default function Profile() {
    const { setUsername } = useAuthStore()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [stats, setStats] = useState<ProfileStats | null>(null)
    const [loading, setLoading] = useState(true)

    // edit mode
    const [editing, setEditing] = useState(false)
    const [editUsername, setEditUsername] = useState('')
    const [editLoading, setEditLoading] = useState(false)
    const [editMsg, setEditMsg] = useState<{ text: string; ok: boolean } | null>(null)

    // avatar flow
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const [rawSrc, setRawSrc] = useState<string | null>(null)
    const [cropSrc, setCropSrc] = useState<string | null>(null)
    const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)

    // password
    const [currentPwd, setCurrentPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [pwdLoading, setPwdLoading] = useState(false)

    // email
    const [newEmail, setNewEmail] = useState('')
    const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [emailLoading, setEmailLoading] = useState(false)

    // explicit content
    const [allowExplicit, setAllowExplicit] = useState(false)

    const load = async () => {
        const [p, s] = await Promise.all([getProfile(), getProfileStats()]) as [Profile, ProfileStats]
        setProfile(p)
        setStats(s)
        setEditUsername(p.username)
        setAllowExplicit(p.allowExplicit ?? false)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { setEditMsg({ text: 'Image too large (max 5MB)', ok: false }); return }
        const reader = new FileReader()
        reader.onload = () => setRawSrc(reader.result as string)
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleProfileSave = async () => {
        setEditLoading(true)
        setEditMsg(null)
        try {
            await updateProfile({
                username: editUsername !== profile?.username ? editUsername : undefined,
                avatarBase64: pendingAvatar ?? undefined,
            })
            if (editUsername !== profile?.username) setUsername(editUsername)
            setPendingAvatar(null)
            setEditing(false)
            setEditMsg({ text: 'Profile updated', ok: true })
            load()
        } catch (e: any) {
            setEditMsg({ text: e?.response?.data?.message ?? 'Failed to update', ok: false })
        } finally {
            setEditLoading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        await updateProfile({ avatarBase64: '' })
        setPendingAvatar(null)
        load()
    }

    const handlePasswordChange = async () => {
        if (newPwd !== confirmPwd) { setPwdMsg({ text: 'Passwords do not match', ok: false }); return }
        if (newPwd.length < 6) { setPwdMsg({ text: 'Min 6 characters', ok: false }); return }
        setPwdLoading(true)
        try {
            await changePassword(currentPwd, newPwd)
            setPwdMsg({ text: 'Password updated', ok: true })
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        } catch (e: any) {
            setPwdMsg({ text: e?.response?.data?.message ?? 'Failed', ok: false })
        } finally { setPwdLoading(false) }
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
        } finally { setEmailLoading(false) }
    }

    const handleExplicitToggle = async (val: boolean) => {
        setAllowExplicit(val)
        try {
            await updateProfile({ allowExplicit: val })
        } catch {
            // revert on error
            setAllowExplicit(!val)
        }
    }

    if (loading) return <p className="text-zinc-500 text-sm">Loading...</p>

    const avatarSrc = pendingAvatar !== null ? pendingAvatar : profile?.avatarUrl
    const joinDate = profile
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : ''
    const scoreEntries = stats
        ? (Object.entries(stats.scoreDistribution) as [string, number][]).sort(([a], [b]) => Number(a) - Number(b))
        : []
    const maxScore = Math.max(...scoreEntries.map(([, v]) => v), 1)

    return (
        <div className="flex flex-col gap-10 max-w-2xl">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Profile</h1>
                <p className="text-zinc-500 text-sm mt-1">Your account and stats</p>
            </header>

            {/* account card */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Account</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 shrink-0">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="avatar" className="w-14 h-14 rounded-full object-cover border border-white/10" />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-xl">
                                    {profile?.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-base truncate">{profile?.username}</p>
                            <p className="text-xs text-zinc-500">{profile?.email}</p>
                            <p className="text-xs text-zinc-600 mt-0.5">Member since {joinDate}</p>
                        </div>
                        <button
                            onClick={() => { setEditing(e => !e); setEditMsg(null); setRawSrc(null); setCropSrc(null) }}
                            className={`p-2 rounded-lg border transition-colors ${
                                editing
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : 'bg-white/5 border-white/5 hover:border-white/10 text-zinc-500 hover:text-zinc-300'
                            }`}
                            title="Edit profile"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                    </div>

                    {editing && (
                        <div className="flex flex-col gap-4 pt-2 border-t border-white/5">
                            {cropSrc ? (
                                <AvatarCropper
                                    src={cropSrc}
                                    onConfirm={cropped => { setPendingAvatar(cropped); setCropSrc(null) }}
                                    onCancel={() => setCropSrc(null)}
                                />
                            ) : rawSrc ? (
                                <div className="flex flex-col gap-3">
                                    <p className="text-xs text-zinc-500">Use this image directly or crop it first?</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setPendingAvatar(rawSrc); setRawSrc(null) }}
                                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold py-2 rounded-lg transition-colors">
                                            Use as is
                                        </button>
                                        <button onClick={() => { setCropSrc(rawSrc); setRawSrc(null) }}
                                                className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold py-2 rounded-lg transition-colors">
                                            Crop & zoom
                                        </button>
                                    </div>
                                    <button onClick={() => setRawSrc(null)} className="text-xs text-zinc-600 hover:text-zinc-400 text-center transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                                    <button onClick={() => avatarInputRef.current?.click()}
                                            className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-lg transition-colors">
                                        {avatarSrc ? 'Change photo' : 'Upload photo'}
                                    </button>
                                    {avatarSrc && (
                                        <button onClick={handleRemoveAvatar} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                                            Remove photo
                                        </button>
                                    )}
                                    {pendingAvatar && <span className="text-xs text-emerald-400">New photo ready ✓</span>}
                                </div>
                            )}

                            {!cropSrc && !rawSrc && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs text-zinc-500">Username</label>
                                        <input
                                            value={editUsername}
                                            onChange={e => setEditUsername(e.target.value)}
                                            className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-white/20 transition-colors"
                                        />
                                    </div>
                                    {editMsg && <p className={`text-xs ${editMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{editMsg.text}</p>}
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditing(false); setEditMsg(null); setPendingAvatar(null) }}
                                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold py-2 rounded-lg transition-colors">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={editLoading || (editUsername === profile?.username && !pendingAvatar)}
                                            className="flex-1 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                                            {editLoading ? 'Saving...' : 'Save changes'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {!editing && editMsg?.ok && <p className="text-xs text-emerald-400">{editMsg.text}</p>}
                </div>
            </section>

            {/* stats */}
            {stats && (
                <section className="flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Stats</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Anime tracked', value: stats.totalAnime, color: 'text-rose-400' },
                            { label: 'Manga tracked', value: stats.totalManga, color: 'text-violet-400' },
                            { label: 'Avg score', value: stats.avgScore ? stats.avgScore.toFixed(1) : '—', color: 'text-yellow-400' },
                            { label: 'Time watched', value: formatTime(stats.estimatedMinutes), color: 'text-emerald-400' },
                        ].map(s => (
                            <div key={s.label} className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                                <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
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
                                            <div className="w-full rounded-sm bg-rose-500/60" style={{ height: `${height}%`, minHeight: count ? '4px' : '0' }} />
                                            <span className="text-[10px] text-zinc-600">{score}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* email */}
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
                        <button onClick={handleEmailChange} disabled={emailLoading || !newEmail}
                                className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-sm font-semibold py-2 rounded-lg transition-colors">
                            {emailLoading ? 'Sending...' : 'Send confirmation'}
                        </button>
                    </div>
                </div>
            </section>

            {/* security */}
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
                        <button onClick={handlePasswordChange} disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
                                className="bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                            {pwdLoading ? 'Updating...' : 'Update password'}
                        </button>
                    </div>
                </div>
            </section>

            {/* content preferences */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Content</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium">Allow explicit content</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Unlocks the "Not Safe" filter in Search and Discover.
                        </p>
                    </div>
                    <button
                        onClick={() => handleExplicitToggle(!allowExplicit)}
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                            allowExplicit ? 'bg-rose-500' : 'bg-zinc-700'
                        }`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            allowExplicit ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                </div>
            </section>

            {/* session */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Session</h2>
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-5">
                    <button
                        onClick={() => useAuthStore.getState().logout()}
                        className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
                        Sign out of all devices
                    </button>
                </div>
            </section>
        </div>
    )
}