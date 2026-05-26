import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import PageLoader from '../../pages/PageLoader'

interface Props {
    children: ReactNode
}

/**
 * protects routes — shows a loader while checking auth,
 * redirects to /login if not authenticated.
 */
export default function AuthGuard({ children }: Props) {
    const { isAuthenticated, tryRefresh, accessToken, expiresAt } = useAuthStore()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const check = async () => {
            // silently refresh if token is expired
            if (accessToken && expiresAt && Date.now() > expiresAt) {
                await tryRefresh()
            }
            setChecking(false)
        }
        check()
    }, [])

    if (checking) return <PageLoader />
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <>{children}</>
}