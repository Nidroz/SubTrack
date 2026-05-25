import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') ?? ''
    const navigate = useNavigate()

    const [newPassword, setNewPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (newPassword !== confirm) { setError('Passwords do not match'); return }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
        setLoading(true)
        try {
            await axios.post('/api/auth/reset-password', { token, newPassword })
            navigate('/login', { state: { message: 'Password reset successfully. You can now log in.' } })
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Invalid or expired link')
        } finally {
            setLoading(false)
        }
    }

    if (!token) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <p className="text-zinc-400">Invalid reset link.</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-rose-400 text-xl">⬡</span>
                    <span className="font-black text-lg tracking-tight">SubTrack</span>
                </div>

                <div>
                    <h1 className="text-xl font-black tracking-tight">Set new password</h1>
                    <p className="text-sm text-zinc-500 mt-1">Choose a strong password.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {[
                        { label: 'New password', value: newPassword, set: setNewPassword },
                        { label: 'Confirm password', value: confirm, set: setConfirm },
                    ].map(f => (
                        <div key={f.label} className="flex flex-col gap-1.5">
                            <label className="text-xs text-zinc-400">{f.label}</label>
                            <input
                                type="password"
                                value={f.value}
                                onChange={e => f.set(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="••••••••"
                                className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                            />
                        </div>
                    ))}

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !newPassword || !confirm}
                        className="bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                    >
                        {loading ? 'Updating...' : 'Update password'}
                    </button>
                </div>
            </div>
        </div>
    )
}