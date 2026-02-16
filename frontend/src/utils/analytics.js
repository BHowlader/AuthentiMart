// Lightweight analytics tracking utility
const API_URL = import.meta.env.VITE_API_URL || ''

// Generate or retrieve session ID
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
        sessionId = crypto.randomUUID ? crypto.randomUUID() :
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0
                const v = c === 'x' ? r : (r & 0x3 | 0x8)
                return v.toString(16)
            })
        sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
}

// Parse UTM parameters from URL
const getUTMParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign')
    }
}

// Track page view
export const trackPageView = async () => {
    // Respect Do Not Track
    if (navigator.doNotTrack === '1') return

    const sessionId = getSessionId()
    const utmParams = getUTMParams()

    const data = {
        page_path: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer || null,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        ...utmParams
    }

    try {
        // Use fetch with keepalive for reliability
        fetch(`${API_URL}/api/v1/visitor-analytics/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify(data),
            keepalive: true
        }).catch(() => { }) // Silently fail - don't impact user experience
    } catch (e) {
        // Silently fail
    }
}

// Initialize tracking (call once on app mount)
export const initAnalytics = () => {
    // Track initial page view
    trackPageView()
}

export default { trackPageView, initAnalytics }
