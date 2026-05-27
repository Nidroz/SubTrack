import { useEffect, useState } from 'react'
import { getProfile, ContentFilter } from '../services/api'
import { Profile } from '../types'

/**
 * loads user profile to determine available content filters.
 * defaults to SAFE if explicit content is not enabled in profile.
 */
export function useContentFilter() {
    const [filter, setFilter] = useState<ContentFilter>('SAFE')
    const [allowExplicit, setAllowExplicit] = useState(false)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        getProfile()
            .then((p: Profile) => {
                const explicit = p.allowExplicit ?? false
                setAllowExplicit(explicit)
                // default to SAFE if explicit not allowed, ALL otherwise
                setFilter(explicit ? 'ALL' : 'SAFE')
            })
            .catch(() => {
                setFilter('SAFE')
            })
            .finally(() => setLoaded(true))
    }, [])

    const filters: { key: ContentFilter; label: string }[] = [
        { key: 'SAFE', label: 'Safe' },
        { key: 'ALL',  label: 'All' },
        ...(allowExplicit ? [{ key: 'NSFW' as ContentFilter, label: 'Not Safe' }] : []),
    ]

    return { filter, setFilter, filters, loaded }
}