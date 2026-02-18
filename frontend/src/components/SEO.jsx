import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    type,
    // Product-specific props
    product
}) => {
    const siteTitle = 'AuthentiMart';
    const siteDescription = 'AuthentiMart - Your trusted destination for authentic cosmetics, home appliances, and electronics in Bangladesh.';
    const siteKeywords = 'cosmetics, electronics, home appliances, authentic products, Bangladesh, online shopping';
    const siteUrl = 'https://www.authentimart.com';
    const siteImage = '/logo-icon.png';

    const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || siteDescription;
    const metaKeywords = keywords || siteKeywords;
    const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}${siteImage}`;
    const metaUrl = url ? `${siteUrl}${url}` : siteUrl;
    const metaType = type || 'website';

    // Generate schema based on type
    const generateSchema = () => {
        if (type === 'product' && product) {
            return {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": product.name || metaTitle,
                "description": product.description || metaDescription,
                "image": product.image || metaImage,
                "url": metaUrl,
                "brand": {
                    "@type": "Brand",
                    "name": product.brand || "AuthentiMart"
                },
                "sku": product.sku || product.id,
                "offers": {
                    "@type": "Offer",
                    "url": metaUrl,
                    "priceCurrency": "BDT",
                    "price": product.price || 0,
                    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    "availability": product.inStock !== false
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                    "seller": {
                        "@type": "Organization",
                        "name": "AuthentiMart"
                    }
                },
                ...(product.rating && {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": product.rating,
                        "reviewCount": product.reviewCount || 1,
                        "bestRating": 5,
                        "worstRating": 1
                    }
                })
            };
        }

        // Default WebSite schema
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteTitle,
            "description": metaDescription,
            "url": siteUrl,
            "image": metaImage,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/products?search={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };
    };

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={metaType} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteTitle} />
            {type === 'product' && product?.price && (
                <>
                    <meta property="product:price:amount" content={product.price} />
                    <meta property="product:price:currency" content="BDT" />
                </>
            )}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {/* Schema.org for Google */}
            <script type="application/ld+json">
                {JSON.stringify(generateSchema())}
            </script>
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string,
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.string,
        price: PropTypes.number,
        brand: PropTypes.string,
        sku: PropTypes.string,
        inStock: PropTypes.bool,
        rating: PropTypes.number,
        reviewCount: PropTypes.number
    })
};

export default SEO;
