import { create } from 'zustand'
import { ListEntry, Stats } from '../types'
import { getList, getStats, addToList, updateEntry, deleteEntry } from '../services/api'

interface ListStore {
    entries: ListEntry[]
    stats: Stats | null
    loading: boolean
    fetchList: (params?: { mediaType?: string; status?: string }) => Promise<void>
    fetchStats: () => Promise<void>
    addEntry: (entry: Parameters<typeof addToList>[0]) => Promise<void>
    updateEntry: (id: number, entry: object) => Promise<void>
    removeEntry: (id: number) => Promise<void>
}

export const useListStore = create<ListStore>((set) => ({
    entries: [],
    stats: null,
    loading: false,

    fetchList: async (params) => {
        set({ loading: true })
        const data = await getList(params)
        set({ entries: data, loading: false })
    },

    fetchStats: async () => {
        const data = await getStats()
        set({ stats: data })
    },

    addEntry: async (entry) => {
        await addToList(entry)
        const data = await getList()
        set({ entries: data })
    },

    updateEntry: async (id, entry) => {
        await updateEntry(id, entry)
        const data = await getList()
        set({ entries: data })
    },

    removeEntry: async (id) => {
        await deleteEntry(id)
        set(state => ({ entries: state.entries.filter(e => e.id !== id) }))
    },
}))