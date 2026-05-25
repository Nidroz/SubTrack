import { create } from 'zustand'
import { AuthResponse, login as apiLogin, register as apiRegister, refreshToken as apiRefresh, logout as apiLogout } from '../services/api'

interface AuthStore {
    accessToken: string | null
    refreshToken: string | null
    username: string | null
    isAuthenticated: boolean
    expiresAt: number | null
    login: (username: string, password: string) => Promise<void>
    register: (username: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    tryRefresh: () => Promise<boolean>
    role: string | null
}

function storeAuthData(data: AuthResponse) {
    const expiresAt = Date.now() + data.expiresIn * 1000
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('username', data.username)
    localStorage.setItem('expiresAt', String(expiresAt))
    return expiresAt
}

function clearAuthData() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
    localStorage.removeItem('expiresAt')
    localStorage.removeItem('role')
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    username: localStorage.getItem('username'),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    expiresAt: Number(localStorage.getItem('expiresAt')) || null,
    role: localStorage.getItem('role'),

    login: async (username, password) => {
        const data = await apiLogin(username, password)
        const expiresAt = storeAuthData(data)
        localStorage.setItem('role', data.role ?? 'USER')
        set({ accessToken: data.accessToken, refreshToken: data.refreshToken, username: data.username, isAuthenticated: true, expiresAt, role: data.role ?? 'USER' })
    },

    register: async (username, email, password) => {
        const data = await apiRegister(username, email, password)
        const expiresAt = storeAuthData(data)
        localStorage.setItem('role', data.role ?? 'USER')
        set({ accessToken: data.accessToken, refreshToken: data.refreshToken, username: data.username, isAuthenticated: true, expiresAt, role: data.role ?? 'USER' })
    },

    logout: async () => {
        try { await apiLogout() } catch {}
        clearAuthData()
        set({ accessToken: null, refreshToken: null, username: null, isAuthenticated: false, expiresAt: null, role: null })
    },

    tryRefresh: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
            const data = await apiRefresh(refreshToken)
            const expiresAt = storeAuthData(data)
            localStorage.setItem('role', data.role ?? 'USER')
            set({ accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true, expiresAt, role: data.role ?? 'USER' })
            return true
        } catch {
            clearAuthData()
            set({ accessToken: null, refreshToken: null, username: null, isAuthenticated: false, expiresAt: null })
            return false
        }
    },
}))