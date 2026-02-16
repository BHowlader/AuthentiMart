import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

// Routes that should NOT be tracked (internal/admin pages)
const EXCLUDED_PATHS = ['/admin', '/login', '/register', '/forgot-password', '/reset-password']

// Hook to track page views on route changes
const usePageTracking = () => {
    const location = useLocation()

    useEffect(() => {
        // Don't track admin or auth pages - these are not public visitor traffic
        const shouldTrack = !EXCLUDED_PATHS.some(path => location.pathname.startsWith(path))

        if (!shouldTrack) {
            return // Skip tracking for internal pages
        }

        // Small delay to ensure page title is updated
        const timer = setTimeout(() => {
            trackPageView()
        }, 100)

        return () => clearTimeout(timer)
    }, [location.pathname])
}

export default usePageTracking
