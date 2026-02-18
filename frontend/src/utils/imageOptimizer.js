/**
 * Cloudinary Image Optimizer
 * Uses Cloudinary's fetch feature to optimize external images on-the-fly
 * No image upload needed - works with any URL
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''

/**
 * Optimize an image URL using Cloudinary's fetch feature
 * @param {string} imageUrl - The original image URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height
 * @param {string} options.quality - Quality (auto, auto:low, auto:eco, auto:good, auto:best)
 * @param {string} options.format - Format (auto, webp, avif)
 * @param {string} options.crop - Crop mode (fill, fit, scale, thumb)
 * @returns {string} Optimized image URL
 */
export const optimizeImage = (imageUrl, options = {}) => {
    // If no Cloudinary cloud name configured, return original URL
    if (!CLOUDINARY_CLOUD_NAME) {
        return imageUrl
    }

    // Skip if already a Cloudinary URL
    if (imageUrl?.includes('res.cloudinary.com')) {
        return imageUrl
    }

    // Skip local/relative URLs (starting with /)
    if (!imageUrl || imageUrl.startsWith('/')) {
        return imageUrl
    }

    // Skip data URLs
    if (imageUrl.startsWith('data:')) {
        return imageUrl
    }

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
    } = options

    // Build transformation string
    const transforms = ['f_' + format, 'q_' + quality]

    if (width) transforms.push('w_' + width)
    if (height) transforms.push('h_' + height)
    if (width || height) transforms.push('c_' + crop)

    const transformString = transforms.join(',')

    // Use Cloudinary fetch to optimize external URL
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformString}/${encodeURIComponent(imageUrl)}`
}

/**
 * Preset optimizers for common use cases
 */
export const imagePresets = {
    // Product card thumbnail (small, fast loading)
    productCard: (url) => optimizeImage(url, { width: 300, height: 300, quality: 'auto:good' }),

    // Product detail page (larger, high quality)
    productDetail: (url) => optimizeImage(url, { width: 600, height: 600, quality: 'auto:best' }),

    // Category thumbnail
    categoryThumb: (url) => optimizeImage(url, { width: 200, height: 200, quality: 'auto:good' }),

    // Hero/banner images
    hero: (url) => optimizeImage(url, { width: 1200, quality: 'auto:eco' }),

    // Avatar/profile images
    avatar: (url) => optimizeImage(url, { width: 100, height: 100, quality: 'auto', crop: 'thumb' }),
}

export default optimizeImage
