import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
})

export const searchAnime = (q: string, page = 1) =>
    api.get('/media/search/anime', { params: { q, page } }).then(r => r.data)

export const searchManga = (q: string, page = 1) =>
    api.get('/media/search/manga', { params: { q, page } }).then(r => r.data)

export const getAnime = (id: number) =>
    api.get(`/media/anime/${id}`).then(r => r.data)

export const getList = (params?: { media_type?: string; status?: string }) =>
    api.get('/lists/', { params }).then(r => r.data)

export const addToList = (entry: {
    media_id: number
    media_type: string
    status: string
    progress?: number
    score?: number
}) => api.post('/lists/', entry).then(r => r.data)

export const updateEntry = (id: number, entry: object) =>
    api.patch(`/lists/${id}`, entry).then(r => r.data)

export const deleteEntry = (id: number) =>
    api.delete(`/lists/${id}`).then(r => r.data)

export const getStats = () =>
    api.get('/lists/stats').then(r => r.data)