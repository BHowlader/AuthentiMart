import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Margin around the root
 * @param {boolean} options.triggerOnce - Only trigger animation once
 * @returns {Object} - { ref, isVisible }
 */
export const useScrollAnimation = ({
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
} = {}) => {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (triggerOnce) {
                        observer.unobserve(element)
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false)
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(element)

        return () => {
            if (element) {
                observer.unobserve(element)
            }
        }
    }, [threshold, rootMargin, triggerOnce])

    return { ref, isVisible }
}

/**
 * Hook for staggered animations on multiple elements
 * @param {number} itemCount - Number of items to animate
 * @param {number} staggerDelay - Delay between each item (ms)
 * @returns {Object} - { containerRef, isVisible, getItemStyle }
 */
export const useStaggerAnimation = (itemCount, staggerDelay = 100) => {
    const { ref: containerRef, isVisible } = useScrollAnimation()

    const getItemStyle = (index) => ({
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${index * staggerDelay}ms, transform 0.6s ease ${index * staggerDelay}ms`
    })

    return { containerRef, isVisible, getItemStyle }
}

export default useScrollAnimation
