import { useState } from 'react'

interface Props {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    className?: string
}

/**
 * password input with show/hide toggle button.
 */
export default function PasswordInput({ value, onChange, placeholder = '••••••••', onKeyDown, className }: Props) {
    const [show, setShow] = useState(false)

    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={`w-full pr-10 bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors ${className ?? ''}`}
            />
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
            >
                {show ? (
                    // eye-off
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                ) : (
                    // eye
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                )}
            </button>
        </div>
    )
}