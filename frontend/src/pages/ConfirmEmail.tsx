import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function ConfirmEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') ?? ''
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) { setStatus('error'); setMessage('Invalid confirmation link.'); return }
        axios.post('/api/profile/email/confirm', { token })
            .then(() => { setStatus('success'); setMessage('Email updated successfully!') })
            .catch(e => { setStatus('error'); setMessage(e?.response?.data?.message ?? 'Invalid or expired link') })
    }, [token])

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-2xl p-8 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-rose-400 text-xl">⬡</span>
                    <span className="font-black text-lg tracking-tight">SubTrack</span>
                </div>

                {status === 'loading' && <p className="text-sm text-zinc-400">Confirming...</p>}
                {status === 'success' && (
                    <div className="flex flex-col gap-3">
                        <p className="text-emerald-400 font-semibold">{message}</p>
                        <Link to="/" className="text-sm text-rose-400 hover:text-rose-300">Go to dashboard</Link>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex flex-col gap-3">
                        <p className="text-red-400 text-sm">{message}</p>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                        <Link to="/login" className="text-sm text-rose-400 hover:text-rose-300">Back to login</Link>
                    </div>
                )}
            </div>
        </div>
    )
}