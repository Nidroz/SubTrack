export type MediaType = 'ANIME' | 'MANGA'

// matches Spring Boot WatchStatus enum values
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
    // joined from media_cache
    title?: string
    imageUrl?: string
    episodes?: number
    updatedAt: string
}

export interface Stats {
    total: number
    completed: number
    watching: number
    avgScore?: number
}