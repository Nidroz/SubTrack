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
    studios?: { name: string }[]
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
    title?: string
    titleEnglish?: string
    imageUrl?: string
    episodes?: number
    chapters?: number
    apiScore?: number
    genres?: string
}

export interface PagedResult<T> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

export interface Stats {
    total: number
    completed: number
    watching: number
    avgScore?: number
}

export interface Profile {
    id: number
    username: string
    email: string
    createdAt: string
    avatarUrl?: string
}

export interface JikanPagination {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: { count: number; total: number; per_page: number }
}

export interface JikanResponse<T> {
    data: T[]
    pagination: JikanPagination
}