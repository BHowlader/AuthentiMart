import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

// Hook to track page views on route changes
const usePageTracking = () => {
    const location = useLocation()

    useEffect(() => {
        // Small delay to ensure page title is updated
        const timer = setTimeout(() => {
            trackPageView()
        }, 100)

        return () => clearTimeout(timer)
    }, [location.pathname])
}

export default usePageTracking
