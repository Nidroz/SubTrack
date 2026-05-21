import { create } from 'zustand'
import { login as apiLogin, register as apiRegister } from '../services/api'

interface AuthStore {
    token: string | null
    username: string | null
    isAuthenticated: boolean
    login: (username: string, password: string) => Promise<void>
    register: (username: string, email: string, password: string) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (username, password) => {
        const data = await apiLogin(username, password)
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        set({ token: data.token, username: data.username, isAuthenticated: true })
    },

    register: async (username, email, password) => {
        const data = await apiRegister(username, email, password)
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        set({ token: data.token, username: data.username, isAuthenticated: true })
    },

    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        set({ token: null, username: null, isAuthenticated: false })
    },
}))