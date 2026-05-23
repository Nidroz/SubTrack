import { create } from 'zustand'
import { ListEntry, PagedResult, Stats } from '../types'
import { getList, getStats, addToList, updateEntry, deleteEntry, ListParams } from '../services/api'

interface ListStore {
    entries: ListEntry[]
    stats: Stats | null
    loading: boolean
    totalPages: number
    totalElements: number
    fetchList: (params?: ListParams) => Promise<void>
    fetchStats: () => Promise<void>
    addEntry: (entry: Parameters<typeof addToList>[0]) => Promise<void>
    updateEntry: (id: number, entry: object) => Promise<void>
    removeEntry: (id: number) => Promise<void>
}

export const useListStore = create<ListStore>((set, get) => ({
    entries: [],
    stats: null,
    loading: false,
    totalPages: 0,
    totalElements: 0,

    fetchList: async (params) => {
        set({ loading: true })
        try {
            const data: PagedResult<ListEntry> = await getList(params)
            set({
                entries: data.content,
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                loading: false,
            })
        } finally {
            set({ loading: false })
        }
    },

    fetchStats: async () => {
        const data = await getStats()
        set({ stats: data })
    },

    addEntry: async (entry) => {
        await addToList(entry)
        // refresh with current params, store doesn't track them so caller re-fetches
    },

    updateEntry: async (id, entry) => {
        await updateEntry(id, entry)
    },

    removeEntry: async (id) => {
        await deleteEntry(id)
        set(state => ({ entries: state.entries.filter(e => e.id !== id) }))
    },
}))