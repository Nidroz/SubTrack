export type MediaType = 'ANIME' | 'MANGA'

export type WatchStatus = 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'DROPPED' | 'ON_HOLD'

export interface MediaResult {
    mal_id: number
    title: string
    title_english?: string
    synopsis?: string
    images: { jpg: { image_url: string } }
    episodes?: number
    chapters?: number
    status?: string
    genres?: { name: string }[]
    score?: number
}

export interface ListEntry {
    id: number
    mediaId: number
    mediaType: MediaType
    status: WatchStatus
    progress: number
    score?: number
    notes?: string
    updatedAt: string
    // from media_cache
    title?: string
    titleEnglish?: string
    imageUrl?: string
    episodes?: number
    chapters?: number
    apiScore?: number
    genres?: string
}

export interface Stats {
    total: number
    completed: number
    watching: number
    avgScore?: number
}