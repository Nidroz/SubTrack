import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!email) return
        setLoading(true)
        try {
            await axios.post('/api/auth/forgot-password', { email })
        } finally {
            // always show success to avoid enumeration
            setSent(true)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-rose-400 text-xl">⬡</span>
                    <span className="font-black text-lg tracking-tight">SubTrack</span>
                </div>

                {sent ? (
                    <div className="flex flex-col gap-3">
                        <h1 className="text-xl font-black tracking-tight">Check your inbox</h1>
                        <p className="text-sm text-zinc-400">
                            If an account exists for <strong className="text-zinc-200">{email}</strong>,
                            we sent a reset link. Check your spam folder too.
                        </p>
                        <Link to="/login" className="text-sm text-rose-400 hover:text-rose-300 mt-2">
                            ← Back to login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div>
                            <h1 className="text-xl font-black tracking-tight">Forgot password?</h1>
                            <p className="text-sm text-zinc-500 mt-1">Enter your email to receive a reset link.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-zinc-400">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    placeholder="you@example.com"
                                    className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !email}
                                className="bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                            >
                                {loading ? 'Sending...' : 'Send reset link'}
                            </button>
                        </div>

                        <p className="text-xs text-zinc-500 text-center">
                            <Link to="/login" className="text-rose-400 hover:text-rose-300">← Back to login</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}