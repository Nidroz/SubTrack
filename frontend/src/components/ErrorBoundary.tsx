import {Component, JSX, ReactNode} from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    message: string
}

/**
 * catches unexpected runtime errors and shows a friendly recovery UI
 * instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, message: '' }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message }
    }

    componentDidCatch(error: Error, info: { componentStack: string }) {
        console.error('[ErrorBoundary]', error, info)
    }

    render(): JSX.Element | null {
        if (!this.state.hasError) return <>{this.props.children}</>

        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-rose-400 text-2xl">⬡</span>
                        <span className="font-black text-xl tracking-tight text-zinc-100">SubTrack</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl mb-1">
                            ⚠
                        </div>
                        <h1 className="text-xl font-black tracking-tight">Something went wrong</h1>
                        <p className="text-sm text-zinc-500">
                            An unexpected error occurred. Try refreshing the page.
                        </p>
                        {this.state.message && (
                            <p className="text-xs text-zinc-600 font-mono bg-white/5 px-3 py-2 rounded-lg mt-1 max-w-full break-all">
                                {this.state.message}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white/5 border border-white/[0.06] rounded-full text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => { this.setState({ hasError: false, message: '' }); window.location.href = '/' }}
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 rounded-full text-sm text-white font-semibold transition-colors"
                        >
                            Go to dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}