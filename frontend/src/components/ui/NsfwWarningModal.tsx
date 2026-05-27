import { useState } from 'react'

interface Props {
    onConfirm: () => void
    onCancel: () => void
}

/**
 * age verification modal shown before switching to NSFW content filter.
 * stores user preference in localStorage to avoid showing again.
 */
export default function NsfwWarningModal({ onConfirm, onCancel }: Props) {
    const [dontShowAgain, setDontShowAgain] = useState(false)

    const handleConfirm = () => {
        if (dontShowAgain) {
            localStorage.setItem('nsfw-warning-dismissed', 'true')
        }
        onConfirm()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

            {/* modal */}
            <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full flex flex-col gap-6 shadow-2xl">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <h2 className="text-lg font-black tracking-tight">Age verification</h2>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        You are about to view content intended for adults only (18+). This section may contain explicit material.
                    </p>
                    <p className="text-sm text-zinc-500">
                        By continuing, you confirm that you are at least <strong className="text-zinc-300">18 years old</strong> and consent to viewing adult content.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 text-sm font-semibold py-2.5 rounded-lg transition-colors"
                        >
                            No, go back
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                        >
                            Yes, I'm 18+
                        </button>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={e => setDontShowAgain(e.target.checked)}
                            className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Don't show this warning again
                        </span>
                    </label>
                </div>
            </div>
        </div>
    )
}