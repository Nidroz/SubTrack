import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import PasswordInput from "../components/ui/PasswordInput.tsx";

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async () => {
        if (!username || !email || !password) return
        setLoading(true)
        setError('')
        try {
            await register(username, email, password)
            navigate('/')
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-2xl p-8 flex flex-col gap-6">

                <div className="flex items-center gap-2">
                    <span className="text-rose-400 text-xl">⬡</span>
                    <span className="font-black text-lg tracking-tight text-zinc-100">SubTrack</span>
                </div>

                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-100">Create account</h1>
                    <p className="text-sm text-zinc-500 mt-1">Start tracking your anime & manga</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-zinc-400">Username</label>
                        <input
                            type="text"
                            placeholder="your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-zinc-400">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-zinc-400">Password</label>
                        <PasswordInput
                            onChange={setPassword}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            value={password} />
                    </div>

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors mt-1"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </div>

                <p className="text-xs text-zinc-500 text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-rose-400 font-medium hover:text-rose-300">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}