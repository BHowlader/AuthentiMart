// Comprehensive Product Catalog - AuthentiMart Bangladesh
const allProducts = [
    // ===== CATEGORY 1: LIP PRODUCTS =====
    {
        id: 1, name: "MAC Matte Lipstick - Ruby Woo", price: 1200, originalPrice: 1500,
        image: "/images/products/mac_lipstick_1770316650108.png",
        images: ["/images/products/mac_lipstick_1770316650108.png"],
        category: "Lip Products", categorySlug: "lip-products", brand: "MAC",
        rating: 4.9, reviewCount: 412, stock: 30, isNew: false, discount: 20,
        description: "MAC's iconic Ruby Woo - a vivid blue-red matte lipstick. Long-lasting, highly pigmented formula that delivers intense color payoff.",
        features: ["Iconic blue-red matte shade", "Long-lasting formula", "Highly pigmented", "Creamy matte finish"],
        specifications: { "Size": "3g", "Finish": "Matte", "Shade": "Ruby Woo", "Country": "USA" }
    },
    {
        id: 2, name: "NYX Soft Matte Lip Cream", price: 550, originalPrice: 700,
        image: "/images/products/matte_liquid_lipstick_1770316667658.png",
        images: ["/images/products/matte_liquid_lipstick_1770316667658.png"],
        category: "Lip Products", categorySlug: "lip-products", brand: "NYX",
        rating: 4.6, reviewCount: 567, stock: 100, isNew: true, discount: 21,
        description: "NYX Soft Matte Lip Cream delivers a matte finish with a lightweight, moussey texture. Available in multiple shades.",
        features: ["Soft matte finish", "Lightweight formula", "High pigment", "Easy application"],
        specifications: { "Size": "8ml", "Finish": "Matte", "Type": "Liquid Lipstick", "Country": "USA" }
    },
    {
        id: 3, name: "Rom&nd Juicy Lasting Tint", price: 550, originalPrice: 700,
        image: "/images/products/korean_lip_tint_1770316710139.png",
        images: ["/images/products/korean_lip_tint_1770316710139.png"],
        category: "Lip Products", categorySlug: "lip-products", brand: "Rom&nd",
        rating: 4.8, reviewCount: 823, stock: 75, isNew: true, discount: 21,
        description: "Korean cult-favorite lip tint with juicy, glossy finish. Long-lasting hydrating formula with vibrant colors.",
        features: ["Juicy glossy finish", "Long-lasting color", "Hydrating formula", "K-Beauty favorite"],
        specifications: { "Size": "5.5g", "Finish": "Glossy", "Type": "Lip Tint", "Country": "South Korea" }
    },
    {
        id: 4, name: "Laneige Lip Sleeping Mask", price: 950, originalPrice: 1200,
        image: "/images/products/product_04_laneige_lip_mask.png",
        images: ["/images/products/product_04_laneige_lip_mask.png"],
        category: "Lip Products", categorySlug: "lip-products", brand: "Laneige",
        rating: 4.9, reviewCount: 1234, stock: 45, isNew: false, discount: 21,
        description: "Overnight lip treatment with Berry Fruit Complex. Wake up to soft, supple lips. A K-Beauty bestseller.",
        features: ["Overnight treatment", "Berry Fruit Complex", "Intense hydration", "Softens lips"],
        specifications: { "Size": "20g", "Type": "Lip Mask", "Scent": "Berry", "Country": "South Korea" }
    },
    {
        id: 5, name: "Maybelline SuperStay Matte Ink", price: 650, originalPrice: 800,
        image: "/images/products/product_05_maybelline_superstay.png",
        images: ["/images/products/product_05_maybelline_superstay.png"],
        category: "Lip Products", categorySlug: "lip-products", brand: "Maybelline",
        rating: 4.7, reviewCount: 890, stock: 120, isNew: false, discount: 19,
        description: "16-hour wear liquid lipstick with precision tip applicator. Transfer-proof, smudge-proof formula.",
        features: ["16-hour wear", "Transfer-proof", "Precision applicator", "Smudge-proof"],
        specifications: { "Size": "5ml", "Finish": "Matte", "Wear Time": "16 hours", "Country": "USA" }
    },

    // ===== CATEGORY 2: EYE PRODUCTS =====
    {
        id: 6, name: "Maybelline Hyper Easy Liquid Liner", price: 350, originalPrice: 450,
        image: "/images/products/product_06_maybelline_liner.png",
        images: ["/images/products/product_06_maybelline_liner.png"],
        category: "Eye Products", categorySlug: "eye-products", brand: "Maybelline",
        rating: 4.7, reviewCount: 678, stock: 150, isNew: true, discount: 22,
        description: "Easy-glide felt tip liner for precise, bold lines. 24-hour wear, waterproof formula.",
        features: ["Felt tip precision", "24-hour wear", "Waterproof", "Easy application"],
        specifications: { "Size": "0.6ml", "Color": "Pitch Black", "Type": "Liquid Liner", "Country": "USA" }
    },
    {
        id: 7, name: "Urban Decay Naked Eyeshadow Palette", price: 2200, originalPrice: 2800,
        image: "/images/products/product_07_urban_decay_palette.png",
        images: ["/images/products/product_07_urban_decay_palette.png"],
        category: "Eye Products", categorySlug: "eye-products", brand: "Urban Decay",
        rating: 4.9, reviewCount: 1567, stock: 25, isNew: false, discount: 21,
        description: "Iconic 12-shade neutral eyeshadow palette. Velvety mattes and shimmering metallics for endless looks.",
        features: ["12 neutral shades", "Mix of mattes & shimmers", "Highly pigmented", "Blendable formula"],
        specifications: { "Shades": "12", "Type": "Eyeshadow Palette", "Finish": "Mixed", "Country": "USA" }
    },
    {
        id: 8, name: "Maybelline Lash Sensational Mascara", price: 550, originalPrice: 700,
        image: "/images/products/product_08_maybelline_mascara.png",
        images: ["/images/products/product_08_maybelline_mascara.png"],
        category: "Eye Products", categorySlug: "eye-products", brand: "Maybelline",
        rating: 4.8, reviewCount: 2341, stock: 200, isNew: false, discount: 21,
        description: "Fan-out brush captures lashes from root to tip. Builds volume and length for a full lash look.",
        features: ["Fanning brush", "Volume & length", "Clump-free", "Washable formula"],
        specifications: { "Size": "9.5ml", "Type": "Mascara", "Effect": "Volume + Length", "Country": "USA" }
    },
    {
        id: 9, name: "Benefit Precisely My Brow Pencil", price: 450, originalPrice: 600,
        image: "/images/products/product_09_benefit_brow.png",
        images: ["/images/products/product_09_benefit_brow.png"],
        category: "Eye Products", categorySlug: "eye-products", brand: "Benefit",
        rating: 4.7, reviewCount: 567, stock: 80, isNew: false, discount: 25,
        description: "Ultra-fine tip eyebrow pencil for hair-like strokes. 12-hour wear, smudge-proof formula.",
        features: ["Ultra-fine tip", "Hair-like strokes", "12-hour wear", "Built-in spoolie"],
        specifications: { "Size": "0.08g", "Type": "Brow Pencil", "Wear": "12 hours", "Country": "USA" }
    },
    {
        id: 10, name: "Ardell Natural Lashes", price: 250, originalPrice: 350,
        image: "/images/products/product_10_ardell_lashes.png",
        images: ["/images/products/product_10_ardell_lashes.png"],
        category: "Eye Products", categorySlug: "eye-products", brand: "Ardell",
        rating: 4.5, reviewCount: 890, stock: 300, isNew: false, discount: 29,
        description: "Natural-looking false eyelashes. Lightweight, comfortable fit. Reusable up to 3 times.",
        features: ["Natural look", "Lightweight", "Reusable", "Easy to apply"],
        specifications: { "Style": "Natural", "Type": "Strip Lashes", "Reusable": "Up to 3x", "Country": "USA" }
    },

    // ===== CATEGORY 3: FACE PRODUCTS =====
    {
        id: 11, name: "Maybelline Fit Me Foundation", price: 850, originalPrice: 1000,
        image: "/images/products/product_11_maybelline_fit_me.png",
        images: ["/images/products/product_11_maybelline_fit_me.png"],
        category: "Face Products", categorySlug: "face-products", brand: "Maybelline",
        rating: 4.6, reviewCount: 2100, stock: 150, isNew: false, discount: 21,
        description: "Matte + Poreless foundation for normal to oily skin. Natural, seamless coverage that blurs pores.",
        features: ["Matte finish", "Poreless look", "Natural coverage", "40+ shades"],
        specifications: { "Size": "30ml", "Finish": "Matte", "Coverage": "Medium", "Country": "USA" }
    },
    {
        id: 12, name: "Missha M Perfect Cover BB Cream", price: 650, originalPrice: 850,
        image: "/images/products/product_12_missha_bb_cream.png",
        images: ["/images/products/product_12_missha_bb_cream.png"],
        category: "Face Products", categorySlug: "face-products", brand: "Missha",
        rating: 4.7, reviewCount: 1890, stock: 90, isNew: false, discount: 24,
        description: "Korean BB cream with SPF42 PA+++. Covers imperfections while providing skincare benefits.",
        features: ["SPF42 PA+++", "Natural coverage", "Skincare benefits", "Lightweight"],
        specifications: { "Size": "50ml", "SPF": "42", "Type": "BB Cream", "Country": "South Korea" }
    },
    {
        id: 13, name: "Maybelline Instant Age Rewind Concealer", price: 650, originalPrice: 800,
        image: "/images/products/product_13_maybelline_concealer.png",
        images: ["/images/products/product_13_maybelline_concealer.png"],
        category: "Face Products", categorySlug: "face-products", brand: "Maybelline",
        rating: 4.8, reviewCount: 3456, stock: 180, isNew: false, discount: 23,
        description: "Instant Age Rewind Eraser concealer with sponge applicator. Covers dark circles and fine lines.",
        features: ["Sponge applicator", "Covers dark circles", "Anti-aging formula", "Brightening effect"],
        specifications: { "Size": "6ml", "Type": "Concealer", "Coverage": "Full", "Country": "USA" }
    },
    {
        id: 14, name: "Rare Beauty Soft Pinch Blush", price: 1100, originalPrice: 1400,
        image: "/images/products/product_14_rare_beauty_blush.png",
        images: ["/images/products/product_14_rare_beauty_blush.png"],
        category: "Face Products", categorySlug: "face-products", brand: "Rare Beauty",
        rating: 4.9, reviewCount: 2345, stock: 40, isNew: true, discount: 21,
        description: "Weightless liquid blush that blends effortlessly. A little goes a long way for natural flush.",
        features: ["Liquid formula", "Buildable color", "Long-lasting", "Natural finish"],
        specifications: { "Size": "7.5ml", "Type": "Liquid Blush", "Finish": "Natural", "Country": "USA" }
    },
    {
        id: 15, name: "MAC Studio Fix Powder", price: 950, originalPrice: 1200,
        image: "/images/products/product_15_mac_powder.png",
        images: ["/images/products/product_15_mac_powder.png"],
        category: "Face Products", categorySlug: "face-products", brand: "MAC",
        rating: 4.7, reviewCount: 1234, stock: 60, isNew: false, discount: 21,
        description: "One-step powder and foundation. Medium to full coverage with matte finish. Controls shine all day.",
        features: ["2-in-1 formula", "Medium-full coverage", "Matte finish", "Oil control"],
        specifications: { "Size": "15g", "Type": "Powder Foundation", "Finish": "Matte", "Country": "USA" }
    },

    // ===== CATEGORY 4: KOREAN SKINCARE =====
    {
        id: 16, name: "COSRX Advanced Snail 96 Mucin Essence", price: 1650, originalPrice: 1800,
        image: "/images/products/product_16_cosrx_snail_essence.png",
        images: ["/images/products/product_16_cosrx_snail_essence.png"],
        category: "Skincare", categorySlug: "skincare", brand: "COSRX",
        rating: 4.9, reviewCount: 4567, stock: 100, isNew: false, discount: 8,
        description: "96% Snail Secretion Filtrate for intense hydration and skin repair. K-Beauty bestseller.",
        features: ["96% Snail Mucin", "Intense hydration", "Skin repair", "Lightweight"],
        specifications: { "Size": "100ml", "Key Ingredient": "Snail Mucin", "Skin Type": "All", "Country": "South Korea" }
    },
    {
        id: 17, name: "Beauty of Joseon Sunscreen SPF50+", price: 1450, originalPrice: 1600,
        image: "/images/products/boj_sunscreen_1770312422001.png",
        images: ["/images/products/boj_sunscreen_1770312422001.png"],
        category: "Skincare", categorySlug: "skincare", brand: "Beauty of Joseon",
        rating: 4.8, reviewCount: 3456, stock: 120, isNew: true, discount: 9,
        description: "Rice + Probiotics sunscreen with no white cast. SPF50+ PA++++ protection.",
        features: ["SPF50+ PA++++", "No white cast", "Rice extract", "Lightweight"],
        specifications: { "Size": "50ml", "SPF": "50+", "Type": "Sunscreen", "Country": "South Korea" }
    },
    {
        id: 18, name: "COSRX Acne Pimple Master Patch", price: 450, originalPrice: 550,
        image: "/images/products/product_18_cosrx_pimple_patch.png",
        images: ["/images/products/product_18_cosrx_pimple_patch.png"],
        category: "Skincare", categorySlug: "skincare", brand: "COSRX",
        rating: 4.8, reviewCount: 5678, stock: 300, isNew: false, discount: 18,
        description: "Hydrocolloid patches that absorb pus and protect blemishes. 24 patches in 3 sizes.",
        features: ["Hydrocolloid", "24 patches", "3 sizes", "Invisible wear"],
        specifications: { "Contents": "24 patches", "Type": "Pimple Patch", "Wear": "Day/Night", "Country": "South Korea" }
    },
    {
        id: 19, name: "Beauty of Joseon Glow Serum", price: 1400, originalPrice: 1600,
        image: "/images/products/product_19_boj_glow_serum.png",
        images: ["/images/products/product_19_boj_glow_serum.png"],
        category: "Skincare", categorySlug: "skincare", brand: "Beauty of Joseon",
        rating: 4.9, reviewCount: 2345, stock: 80, isNew: true, discount: 13,
        description: "Propolis + Niacinamide serum for glowing skin. 60% Propolis extract for nourishment.",
        features: ["60% Propolis", "2% Niacinamide", "Brightening", "Soothing"],
        specifications: { "Size": "30ml", "Key Ingredients": "Propolis, Niacinamide", "Type": "Serum", "Country": "South Korea" }
    },
    {
        id: 20, name: "COSRX Low pH Good Morning Cleanser", price: 950, originalPrice: 1100,
        image: "/images/products/product_20_cosrx_cleanser.png",
        images: ["/images/products/product_20_cosrx_cleanser.png"],
        category: "Skincare", categorySlug: "skincare", brand: "COSRX",
        rating: 4.7, reviewCount: 3890, stock: 150, isNew: false, discount: 14,
        description: "Low pH gel cleanser with tea tree oil. Gentle, non-stripping daily cleanser.",
        features: ["Low pH formula", "Tea tree oil", "Gentle cleansing", "Non-stripping"],
        specifications: { "Size": "150ml", "pH": "5.0-6.0", "Type": "Gel Cleanser", "Country": "South Korea" }
    },
    {
        id: 21, name: "Sheet Mask Bundle (10 Pack)", price: 1100, originalPrice: 1400,
        image: "/images/products/product_21_sheet_mask_bundle.png",
        images: ["/images/products/product_21_sheet_mask_bundle.png"],
        category: "Skincare", categorySlug: "skincare", brand: "Innisfree/Mediheal",
        rating: 4.6, reviewCount: 1234, stock: 200, isNew: false, discount: 21,
        description: "Assorted Korean sheet masks. Mix of hydrating, brightening, and soothing masks.",
        features: ["10 masks", "Variety pack", "Premium brands", "Multiple benefits"],
        specifications: { "Contents": "10 masks", "Brands": "Innisfree, Mediheal", "Type": "Sheet Mask", "Country": "South Korea" }
    },
    {
        id: 22, name: "The Ordinary Niacinamide 10% + Zinc", price: 850, originalPrice: 1000,
        image: "/images/products/product_22_ordinary_niacinamide.png",
        images: ["/images/products/product_22_ordinary_niacinamide.png"],
        category: "Skincare", categorySlug: "skincare", brand: "The Ordinary",
        rating: 4.8, reviewCount: 5678, stock: 90, isNew: false, discount: 15,
        description: "High-strength niacinamide serum for blemishes and pores. Affordable skincare solution.",
        features: ["10% Niacinamide", "1% Zinc", "Reduces blemishes", "Minimizes pores"],
        specifications: { "Size": "30ml", "Key Ingredients": "Niacinamide, Zinc", "Type": "Serum", "Country": "Canada" }
    },
    {
        id: 23, name: "CeraVe Moisturizing Cream", price: 1200, originalPrice: 1500,
        image: "/images/products/product_23_cerave_cream.png",
        images: ["/images/products/product_23_cerave_cream.png"],
        category: "Skincare", categorySlug: "skincare", brand: "CeraVe",
        rating: 4.8, reviewCount: 4567, stock: 70, isNew: false, discount: 20,
        description: "24-hour hydration cream with 3 essential ceramides. Dermatologist recommended.",
        features: ["3 Ceramides", "Hyaluronic acid", "24-hour hydration", "Fragrance-free"],
        specifications: { "Size": "340g", "Type": "Moisturizer", "Skin Type": "Dry to Normal", "Country": "USA" }
    },

    // ===== CATEGORY 5: MEN'S GROOMING =====
    {
        id: 24, name: "Gatsby Hair Wax - Spiky Edge", price: 350, originalPrice: 450,
        image: "/images/products/product_24_gatsby_wax.png",
        images: ["/images/products/product_24_gatsby_wax.png"],
        category: "Men's Grooming", categorySlug: "mens-grooming", brand: "Gatsby",
        rating: 4.5, reviewCount: 890, stock: 200, isNew: false, discount: 22,
        description: "Strong hold hair wax for spiky styles. Long-lasting hold without stiffness.",
        features: ["Strong hold", "Matte finish", "Non-sticky", "Easy wash"],
        specifications: { "Size": "75g", "Hold": "Strong", "Finish": "Matte", "Country": "Japan" }
    },
    {
        id: 25, name: "Lattafa Raghba Perfume", price: 1800, originalPrice: 2500,
        image: "/images/products/product_25_lattafa_perfume.png",
        images: ["/images/products/product_25_lattafa_perfume.png"],
        category: "Men's Grooming", categorySlug: "mens-grooming", brand: "Lattafa",
        rating: 4.7, reviewCount: 1234, stock: 50, isNew: true, discount: 28,
        description: "Arabian luxury perfume with oud and vanilla notes. Long-lasting 8+ hour fragrance.",
        features: ["Oud notes", "Long-lasting", "Luxury scent", "Great projection"],
        specifications: { "Size": "100ml", "Type": "EDP", "Longevity": "8+ hours", "Country": "UAE" }
    },
    {
        id: 26, name: "Premium Leather Wallet", price: 1200, originalPrice: 1600,
        image: "/images/products/product_26_leather_wallet.png",
        images: ["/images/products/product_26_leather_wallet.png"],
        category: "Men's Grooming", categorySlug: "mens-grooming", brand: "Premium",
        rating: 4.6, reviewCount: 567, stock: 80, isNew: false, discount: 25,
        description: "Genuine leather bifold wallet with RFID protection. Multiple card slots.",
        features: ["Genuine leather", "RFID blocking", "8 card slots", "Slim design"],
        specifications: { "Material": "Leather", "Style": "Bifold", "RFID": "Yes", "Country": "India" }
    },
    {
        id: 27, name: "Minimalist RFID Card Holder", price: 550, originalPrice: 700,
        image: "/images/products/product_27_card_holder.png",
        images: ["/images/products/product_27_card_holder.png"],
        category: "Men's Grooming", categorySlug: "mens-grooming", brand: "Premium",
        rating: 4.5, reviewCount: 345, stock: 120, isNew: true, discount: 21,
        description: "Slim RFID-blocking card holder. Holds up to 8 cards with quick-access slot.",
        features: ["RFID blocking", "8 cards capacity", "Slim profile", "Quick access"],
        specifications: { "Material": "Aluminum + Leather", "Cards": "8", "RFID": "Yes", "Country": "China" }
    },
    {
        id: 28, name: "Nivea Men Deep Face Wash", price: 350, originalPrice: 450,
        image: "/images/products/product_28_nivea_facewash.png",
        images: ["/images/products/product_28_nivea_facewash.png"],
        category: "Men's Grooming", categorySlug: "mens-grooming", brand: "Nivea",
        rating: 4.4, reviewCount: 678, stock: 150, isNew: false, discount: 22,
        description: "Deep cleansing face wash with active charcoal. Removes oil and impurities.",
        features: ["Active charcoal", "Deep cleansing", "Oil control", "Fresh feeling"],
        specifications: { "Size": "100ml", "Skin Type": "Oily", "Type": "Face Wash", "Country": "Germany" }
    },

    // ===== CATEGORY 6: TECH ACCESSORIES =====
    {
        id: 29, name: "Redmi Buds 5C Hybrid ANC", price: 3200, originalPrice: 3800,
        image: "/images/products/product_29_redmi_buds.png",
        images: ["/images/products/product_29_redmi_buds.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Redmi",
        rating: 4.7, reviewCount: 1234, stock: 60, isNew: true, discount: 16,
        description: "40dB Hybrid ANC earbuds with 36-hour battery life. 12.4mm drivers for rich sound.",
        features: ["40dB Hybrid ANC", "36h battery", "12.4mm drivers", "IP54 rated"],
        specifications: { "Driver": "12.4mm", "ANC": "40dB", "Battery": "36h total", "Country": "China" }
    },
    {
        id: 30, name: "Haylou GT7 Neo TWS", price: 1600, originalPrice: 2000,
        image: "/images/products/product_30_haylou_gt7.png",
        images: ["/images/products/product_30_haylou_gt7.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Haylou",
        rating: 4.4, reviewCount: 567, stock: 100, isNew: false, discount: 20,
        description: "Budget-friendly TWS with clear audio. 24-hour playtime with compact case.",
        features: ["24h playtime", "Touch controls", "Clear audio", "Compact case"],
        specifications: { "Driver": "Custom", "Battery": "24h total", "Bluetooth": "5.2", "Country": "China" }
    },
    {
        id: 31, name: "Baseus Adaman 20000mAh Power Bank", price: 2800, originalPrice: 3500,
        image: "/images/products/product_31_baseus_powerbank.png",
        images: ["/images/products/product_31_baseus_powerbank.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Baseus",
        rating: 4.8, reviewCount: 890, stock: 45, isNew: true, discount: 20,
        description: "22.5W fast charging power bank with LED display. Triple output for multiple devices.",
        features: ["20000mAh", "22.5W fast charging", "LED display", "Triple output"],
        specifications: { "Capacity": "20000mAh", "Output": "22.5W", "Ports": "3", "Country": "China" }
    },
    {
        id: 32, name: "Type-C Fast Charger 20W", price: 550, originalPrice: 750,
        image: "/images/products/product_32_usbc_charger.png",
        images: ["/images/products/product_32_usbc_charger.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Oraimo",
        rating: 4.6, reviewCount: 1234, stock: 200, isNew: false, discount: 27,
        description: "20W PD fast charger for iPhone 12-15 & Samsung. Compact travel-friendly design.",
        features: ["20W PD", "Fast charging", "Compact design", "Universal compatible"],
        specifications: { "Output": "20W", "Type": "USB-C", "Input": "100-240V", "Country": "China" }
    },
    {
        id: 33, name: "Premium Phone Cases Bundle", price: 500, originalPrice: 700,
        image: "/images/products/product_33_phone_cases.png",
        images: ["/images/products/product_33_phone_cases.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Premium",
        rating: 4.5, reviewCount: 678, stock: 300, isNew: false, discount: 29,
        description: "Premium protective cases for iPhone & Samsung. Clear, matte, and leather options.",
        features: ["Multiple styles", "Drop protection", "Slim fit", "Wireless charging"],
        specifications: { "Compatibility": "iPhone/Samsung", "Protection": "Military grade", "Style": "Various", "Country": "China" }
    },
    {
        id: 34, name: "Tempered Glass Screen Protector", price: 180, originalPrice: 280,
        image: "/images/products/product_34_screen_protector.png",
        images: ["/images/products/product_34_screen_protector.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Premium",
        rating: 4.4, reviewCount: 2345, stock: 500, isNew: false, discount: 36,
        description: "9H hardness tempered glass protector. Bubble-free installation with guide frame.",
        features: ["9H hardness", "Bubble-free", "Guide frame", "2-pack"],
        specifications: { "Hardness": "9H", "Contents": "2 pieces", "Compatibility": "Various", "Country": "China" }
    },
    {
        id: 35, name: "Baseus 10000mAh Power Bank", price: 1500, originalPrice: 1900,
        image: "/images/products/product_35_baseus_slim_powerbank.png",
        images: ["/images/products/product_35_baseus_slim_powerbank.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Baseus",
        rating: 4.6, reviewCount: 1567, stock: 80, isNew: false, discount: 21,
        description: "Slim 10000mAh power bank with 20W fast charge. Compact enough for pocket.",
        features: ["10000mAh", "20W output", "Slim design", "Dual output"],
        specifications: { "Capacity": "10000mAh", "Output": "20W", "Ports": "2", "Country": "China" }
    },
    {
        id: 36, name: "65W GaN Charger (3 Port)", price: 2200, originalPrice: 2800,
        image: "/images/products/product_36_gan_charger.png",
        images: ["/images/products/product_36_gan_charger.png"],
        category: "Tech Accessories", categorySlug: "tech-accessories", brand: "Baseus",
        rating: 4.8, reviewCount: 456, stock: 40, isNew: true, discount: 21,
        description: "65W GaN charger with 2x USB-C + 1x USB-A. Charge laptop, phone, and tablet simultaneously.",
        features: ["65W total", "GaN technology", "3 ports", "Compact"],
        specifications: { "Output": "65W", "Ports": "2C+1A", "Type": "GaN", "Country": "China" }
    },

    // ===== CATEGORY 7: GAMING ACCESSORIES =====
    {
        id: 37, name: "Redragon M602 Gaming Mouse", price: 1200, originalPrice: 1600,
        image: "/images/products/product_37_gaming_mouse.png",
        images: ["/images/products/product_37_gaming_mouse.png"],
        category: "Gaming", categorySlug: "gaming", brand: "Redragon",
        rating: 4.6, reviewCount: 789, stock: 60, isNew: false, discount: 25,
        description: "RGB gaming mouse with 7200 DPI optical sensor. 7 programmable buttons.",
        features: ["7200 DPI", "RGB lighting", "7 buttons", "Ergonomic"],
        specifications: { "DPI": "7200", "Buttons": "7", "Connection": "Wired", "Country": "China" }
    },
    {
        id: 38, name: "XL Gaming Mouse Pad (800x300mm)", price: 550, originalPrice: 750,
        image: "/images/products/product_38_mouse_pad.png",
        images: ["/images/products/product_38_mouse_pad.png"],
        category: "Gaming", categorySlug: "gaming", brand: "Gaming",
        rating: 4.5, reviewCount: 567, stock: 100, isNew: false, discount: 27,
        description: "Extended mouse pad with stitched edges. Smooth surface for precise control.",
        features: ["800x300mm", "Stitched edges", "Non-slip base", "Smooth surface"],
        specifications: { "Size": "800x300x3mm", "Material": "Cloth + Rubber", "Base": "Non-slip", "Country": "China" }
    },
    {
        id: 39, name: "RGB LED Strip (5m USB)", price: 450, originalPrice: 600,
        image: "/images/products/product_39_rgb_led_strip.png",
        images: ["/images/products/product_39_rgb_led_strip.png"],
        category: "Gaming", categorySlug: "gaming", brand: "Gaming",
        rating: 4.4, reviewCount: 890, stock: 150, isNew: true, discount: 25,
        description: "5-meter USB RGB LED strip with remote. 16 colors and multiple modes.",
        features: ["5 meters", "USB powered", "Remote control", "16 colors"],
        specifications: { "Length": "5m", "Power": "USB 5V", "Colors": "16", "Country": "China" }
    },

    // ===== CATEGORY 8: HOME APPLIANCES =====
    {
        id: 40, name: "Air Fryer 4.5L Digital", price: 6500, originalPrice: 8500,
        image: "/images/products/product_40_air_fryer.png",
        images: ["/images/products/product_40_air_fryer.png"],
        category: "Home Appliances", categorySlug: "home-appliances", brand: "Philips",
        rating: 4.7, reviewCount: 567, stock: 25, isNew: true, discount: 24,
        description: "4.5L digital air fryer with 8 presets. 90% less oil for healthy cooking.",
        features: ["4.5L capacity", "Digital display", "8 presets", "90% less oil"],
        specifications: { "Capacity": "4.5L", "Power": "1400W", "Type": "Digital", "Country": "China" }
    },
    {
        id: 41, name: "Electric Pressure Cooker 6L", price: 3500, originalPrice: 4500,
        image: "/images/products/product_41_pressure_cooker.png",
        images: ["/images/products/product_41_pressure_cooker.png"],
        category: "Home Appliances", categorySlug: "home-appliances", brand: "Instant",
        rating: 4.8, reviewCount: 890, stock: 35, isNew: false, discount: 22,
        description: "Multi-function electric pressure cooker. 12 smart programs for easy cooking.",
        features: ["6L capacity", "12 programs", "Pressure + slow cook", "Keep warm"],
        specifications: { "Capacity": "6L", "Power": "1000W", "Programs": "12", "Country": "China" }
    },
    {
        id: 42, name: "Electric Kettle 1.8L", price: 1100, originalPrice: 1400,
        image: "/images/products/product_42_electric_kettle.png",
        images: ["/images/products/product_42_electric_kettle.png"],
        category: "Home Appliances", categorySlug: "home-appliances", brand: "Philips",
        rating: 4.5, reviewCount: 1234, stock: 80, isNew: false, discount: 21,
        description: "1.8L stainless steel electric kettle. Fast boiling with auto shut-off.",
        features: ["1.8L capacity", "Fast boil", "Auto shut-off", "360° base"],
        specifications: { "Capacity": "1.8L", "Power": "1500W", "Material": "Steel", "Country": "China" }
    },
    {
        id: 43, name: "LED Desk Lamp (Adjustable)", price: 950, originalPrice: 1300,
        image: "/images/products/product_43_desk_lamp.png",
        images: ["/images/products/product_43_desk_lamp.png"],
        category: "Home Appliances", categorySlug: "home-appliances", brand: "Xiaomi",
        rating: 4.6, reviewCount: 456, stock: 60, isNew: true, discount: 27,
        description: "Foldable LED desk lamp with adjustable brightness. Eye-caring, no flicker.",
        features: ["Adjustable brightness", "Foldable", "Eye-caring", "USB charging port"],
        specifications: { "Power": "6W", "Color Temp": "Adjustable", "Type": "LED", "Country": "China" }
    },

    // ===== CATEGORY 9: HOME DECOR =====
    {
        id: 44, name: "LED Fairy String Lights (10m)", price: 350, originalPrice: 500,
        image: "/images/products/product_44_fairy_lights.png",
        images: ["/images/products/product_44_fairy_lights.png"],
        category: "Home Decor", categorySlug: "home-decor", brand: "Decor",
        rating: 4.5, reviewCount: 890, stock: 200, isNew: false, discount: 30,
        description: "10-meter USB fairy lights. Perfect for room decoration and photography.",
        features: ["10 meters", "100 LEDs", "USB powered", "8 modes"],
        specifications: { "Length": "10m", "LEDs": "100", "Power": "USB", "Country": "China" }
    },
    {
        id: 45, name: "Decorative Show Piece Set", price: 850, originalPrice: 1200,
        image: "/images/products/product_45_decorative_showpiece.png",
        images: ["/images/products/product_45_decorative_showpiece.png"],
        category: "Home Decor", categorySlug: "home-decor", brand: "Decor",
        rating: 4.4, reviewCount: 345, stock: 50, isNew: true, discount: 29,
        description: "Modern decorative show piece set. Perfect for shelf or table display.",
        features: ["3-piece set", "Modern design", "Premium finish", "Gift ready"],
        specifications: { "Material": "Ceramic/Resin", "Set": "3 pieces", "Style": "Modern", "Country": "China" }
    },
    {
        id: 46, name: "Scented Candle Gift Set", price: 650, originalPrice: 900,
        image: "/images/products/product_46_scented_candles.png",
        images: ["/images/products/product_46_scented_candles.png"],
        category: "Home Decor", categorySlug: "home-decor", brand: "Decor",
        rating: 4.6, reviewCount: 567, stock: 80, isNew: false, discount: 28,
        description: "Set of 4 scented candles in elegant jars. Lavender, vanilla, rose, and jasmine.",
        features: ["4 scents", "15h burn each", "Glass jars", "Cotton wicks"],
        specifications: { "Set": "4 candles", "Burn Time": "15h each", "Scents": "Lavender, Vanilla, Rose, Jasmine", "Country": "China" }
    },
    {
        id: 47, name: "Artificial Plant with Pot", price: 450, originalPrice: 600,
        image: "/images/products/product_47_artificial_plant.png",
        images: ["/images/products/product_47_artificial_plant.png"],
        category: "Home Decor", categorySlug: "home-decor", brand: "Decor",
        rating: 4.3, reviewCount: 234, stock: 100, isNew: false, discount: 25,
        description: "Realistic artificial plant in decorative pot. Low maintenance, perfect for desks.",
        features: ["Realistic look", "Decorative pot", "No maintenance", "UV resistant"],
        specifications: { "Height": "20-30cm", "Type": "Artificial", "Pot": "Included", "Country": "China" }
    },

    // ===== CATEGORY 10: BEAUTY TOOLS =====
    {
        id: 48, name: "Beauty Blender Sponge Set", price: 300, originalPrice: 450,
        image: "/images/products/product_48_beauty_blenders.png",
        images: ["/images/products/product_48_beauty_blenders.png"],
        category: "Beauty Tools", categorySlug: "beauty-tools", brand: "Beauty",
        rating: 4.6, reviewCount: 1234, stock: 250, isNew: false, discount: 33,
        description: "Set of 5 makeup sponges in different shapes. Expands when wet for flawless application.",
        features: ["5 sponges", "Various shapes", "Latex-free", "Expands when wet"],
        specifications: { "Set": "5 pieces", "Material": "Silicone-free", "Type": "Makeup Sponge", "Country": "China" }
    },
    {
        id: 49, name: "Premium Makeup Brush Set", price: 1200, originalPrice: 1600,
        image: "/images/products/product_49_makeup_brushes.png",
        images: ["/images/products/product_49_makeup_brushes.png"],
        category: "Beauty Tools", categorySlug: "beauty-tools", brand: "Beauty",
        rating: 4.7, reviewCount: 678, stock: 70, isNew: true, discount: 25,
        description: "12-piece professional makeup brush set with vegan bristles. Includes travel case.",
        features: ["12 brushes", "Vegan bristles", "Travel case", "Professional quality"],
        specifications: { "Set": "12 brushes", "Material": "Synthetic", "Case": "Included", "Country": "China" }
    },
    {
        id: 50, name: "Jade Face Roller + Gua Sha Set", price: 550, originalPrice: 800,
        image: "/images/products/product_50_jade_roller_set.png",
        images: ["/images/products/product_50_jade_roller_set.png"],
        category: "Beauty Tools", categorySlug: "beauty-tools", brand: "Beauty",
        rating: 4.5, reviewCount: 456, stock: 90, isNew: false, discount: 31,
        description: "Natural jade roller and gua sha set for facial massage. Reduces puffiness and improves circulation.",
        features: ["Real jade", "Dual roller + gua sha", "Reduces puffiness", "Gift box"],
        specifications: { "Material": "Natural Jade", "Set": "Roller + Gua Sha", "Box": "Gift ready", "Country": "China" }
    }
]

export default allProducts
