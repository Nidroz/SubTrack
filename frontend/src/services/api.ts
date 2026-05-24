import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    withCredentials: false,
})

// attach jwt token to every request if present
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// redirect to login on 401
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

// ── auth ──────────────────────────────────────────────────────────────────
export const login = (username: string, password: string) =>
    api.post('/auth/login', { username, password }).then(r => r.data)

export const register = (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }).then(r => r.data)

// ── media ─────────────────────────────────────────────────────────────────
export const searchMedia = (type: 'ANIME' | 'MANGA', query: string, page = 1) =>
    api.get('/media/search', { params: { type, query, page } }).then(r => r.data)

export const getMediaById = (type: 'ANIME' | 'MANGA', id: number) =>
    api.get(`/media/${type}/${id}`).then(r => r.data)

export const getEpisodes = (type: 'ANIME' | 'MANGA', id: number) =>
    api.get(`/media/${type}/${id}/episodes`).then(r => r.data)

// ── user list ─────────────────────────────────────────────────────────────
export interface ListParams {
    mediaType?: string
    status?: string
    page?: number
    size?: number
    sortBy?: string
    sortDir?: string
}

export const getList = (params?: ListParams) =>
    api.get('/lists', { params }).then(r => r.data)

export const addToList = (entry: {
    mediaId: number
    mediaType: 'ANIME' | 'MANGA'
    status: string
    progress?: number
    score?: number
    notes?: string
}) => api.post('/lists', entry).then(r => r.data)

export const updateEntry = (id: number, entry: object) =>
    api.patch(`/lists/${id}`, entry).then(r => r.data)

export const deleteEntry = (id: number) =>
    api.delete(`/lists/${id}`).then(r => r.data)

export const getStats = () =>
    api.get('/lists/stats').then(r => r.data)

// ── discover ──────────────────────────────────────────────────────────────
export const getRandom = (type: 'ANIME' | 'MANGA') =>
    api.get('/media/random', { params: { type } }).then(r => r.data)

export const getTopAiring = (type: 'ANIME' | 'MANGA', page = 1) =>
    api.get('/media/top/airing', { params: { type, page } }).then(r => r.data)

export const getTopPopular = (type: 'ANIME' | 'MANGA', page = 1) =>
    api.get('/media/top/popular', { params: { type, page } }).then(r => r.data)

export const getRecommendations = (type: 'ANIME' | 'MANGA', id: number) =>
    api.get(`/media/${type}/${id}/recommendations`).then(r => r.data)

export const getMyRecommendations = () =>
    api.get('/media/recommendations/me').then(r => r.data)