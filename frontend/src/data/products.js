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
    },

    // ===== CATEGORY 7: LADIES FASHION — BAGS, JEWELRY & WATCHES =====
    {
        id: 51, name: "Crossbody/Sling Bag (PU Leather)", price: 950, originalPrice: 1500,
        image: "/images/products/cat7_crossbody_bag.png",
        images: ["/images/products/cat7_crossbody_bag.png"],
        category: "Ladies Fashion", categorySlug: "ladies-fashion", brand: "Fashion",
        rating: 4.8, reviewCount: 156, stock: 150, isNew: true, discount: 36,
        description: "Trendy PU leather crossbody bag. Perfect for students and working women.",
        features: ["Premium PU Leather", "Adjustable strap", "Multiple compartments"],
        specifications: { "Material": "PU Leather", "Style": "Crossbody", "Country": "China" }
    },
    {
        id: 52, name: "Tote Bag (Canvas/Premium)", price: 850, originalPrice: 1200,
        image: "/images/products/cat7_tote_bag.png",
        images: ["/images/products/cat7_tote_bag.png"],
        category: "Ladies Fashion", categorySlug: "ladies-fashion", brand: "Fashion",
        rating: 4.7, reviewCount: 204, stock: 100, isNew: false, discount: 29,
        description: "Spacious canvas tote bag for daily use or office. Stylish and durable.",
        features: ["High-quality Canvas", "Large capacity", "Eco-friendly"],
        specifications: { "Material": "Canvas", "Usage": "Daily/Office", "Country": "China" }
    },
    {
        id: 53, name: "Makeup Pouch / Organizer", price: 450, originalPrice: 700,
        image: "/images/products/cat7_makeup_pouch.png",
        images: ["/images/products/cat7_makeup_pouch.png"],
        category: "Ladies Fashion", categorySlug: "ladies-fashion", brand: "Generic",
        rating: 4.9, reviewCount: 320, stock: 200, isNew: true, discount: 35,
        description: "Portable makeup pouch organizer. Keeps your cosmetics sorted and accessible.",
        features: ["Water-resistant", "Multi-pocket", "Compact design"],
        specifications: { "Material": "Nylon/Polyester", "Size": "Medium", "Country": "China" }
    },
    {
        id: 54, name: "Korean Style Earrings Set", price: 350, originalPrice: 500,
        image: "/images/products/cat7_earrings_set.png",
        images: ["/images/products/cat7_earrings_set.png"],
        category: "Ladies Fashion", categorySlug: "ladies-fashion", brand: "K-Style",
        rating: 4.6, reviewCount: 180, stock: 300, isNew: true, discount: 30,
        description: "Set of 5-6 pairs of trendy Korean style earrings. Mix and match for any occasion.",
        features: ["Hypoallergenic", "Trendy designs", "Set of 5-6"],
        specifications: { "Material": "Alloy/Plated", "Style": "Korean", "Country": "South Korea" }
    },
    {
        id: 55, name: "Minimalist Watch (Mesh Band)", price: 1200, originalPrice: 2000,
        image: "/images/products/cat7_watch_mesh.png",
        images: ["/images/products/cat7_watch_mesh.png"],
        category: "Ladies Fashion", categorySlug: "ladies-fashion", brand: "Curren",
        rating: 4.7, reviewCount: 120, stock: 80, isNew: false, discount: 40,
        description: "Elegant minimalist watch with a rose gold mesh band. Perfect for gifting.",
        features: ["Quartz Movement", "Mesh Band", "Water Resistant (3ATM)"],
        specifications: { "Movement": "Quartz", "Band": "Stainless Steel Mesh", "Country": "China" }
    },

    // ===== CATEGORY 8: BABY & KIDS PRODUCTS =====
    {
        id: 56, name: "Baby Bottle (Anti-Colic, BPA Free)", price: 650, originalPrice: 1000,
        image: "/images/products/cat8_baby_bottle.png",
        images: ["/images/products/cat8_baby_bottle.png"],
        category: "Baby & Kids", categorySlug: "baby-kids", brand: "BabyCare",
        rating: 4.9, reviewCount: 410, stock: 200, isNew: false, discount: 35,
        description: "Anti-colic baby bottle designed to reduce gas and fussiness. BPA free.",
        features: ["Anti-colic vent", "BPA Free", "Heat resistant"],
        specifications: { "Capacity": "240ml", "Material": "PP/Glass", "Age": "0m+", "Country": "Thailand" }
    },
    {
        id: 57, name: "Premium Baby Wipes (Fragrance-Free)", price: 250, originalPrice: 400,
        image: "/images/products/cat8_baby_wipes.png",
        images: ["/images/products/cat8_baby_wipes.png"],
        category: "Baby & Kids", categorySlug: "baby-kids", brand: "Huggies/Pampers",
        rating: 4.8, reviewCount: 890, stock: 500, isNew: false, discount: 37,
        description: "Soft and gentle baby wipes for sensitive skin. Alcohol and paraben free.",
        features: ["99% Pure Water", "Fragrance-Free", "Hypoallergenic"],
        specifications: { "Count": "80 pcs", "Type": "Wet Wipes", "Country": "China" }
    },
    {
        id: 58, name: "Diaper Bag / Backpack", price: 1500, originalPrice: 2500,
        image: "/images/products/cat8_diaper_bag.png",
        images: ["/images/products/cat8_diaper_bag.png"],
        category: "Baby & Kids", categorySlug: "baby-kids", brand: "Generic",
        rating: 4.7, reviewCount: 230, stock: 60, isNew: true, discount: 40,
        description: "Multifunctional diaper backpack with insulated bottle pockets and changing mat.",
        features: ["Large Capacity", "Waterproof", "Insulated Pockets"],
        specifications: { "Material": "Oxford Cloth", "Style": "Backpack", "Country": "China" }
    },
    {
        id: 59, name: "Teething Toy (Silicone)", price: 400, originalPrice: 600,
        image: "/images/products/cat8_teething_toy.png",
        images: ["/images/products/cat8_teething_toy.png"],
        category: "Baby & Kids", categorySlug: "baby-kids", brand: "Generic",
        rating: 4.8, reviewCount: 150, stock: 120, isNew: true, discount: 33,
        description: "Soft silicone teething toy to soothe baby's gums. Easy to hold design.",
        features: ["Food Grade Silicone", "BPA Free", "Easy Grip"],
        specifications: { "Material": "Silicone", "Age": "3m+", "Country": "China" }
    },
    {
        id: 60, name: "Kids Character T-Shirt", price: 450, originalPrice: 600,
        image: "/images/products/cat8_kids_tshirt.png",
        images: ["/images/products/cat8_kids_tshirt.png"],
        category: "Baby & Kids", categorySlug: "baby-kids", brand: "Fashion",
        rating: 4.6, reviewCount: 300, stock: 150, isNew: false, discount: 25,
        description: "Cotton t-shirt featuring popular cartoon characters. Comfortable for daily wear.",
        features: ["100% Cotton", "Vibrant Print", "Comfort Fit"],
        specifications: { "Size": "Various", "Age": "3-12y", "Country": "Bangladesh" }
    },

    // ===== CATEGORY 9: TRAVEL ACCESSORIES & LUGGAGE =====
    {
        id: 61, name: "Cabin Luggage (20\" Hard Shell)", price: 5500, originalPrice: 8000,
        image: "/images/products/cat9_cabin_luggage.png",
        images: ["/images/products/cat9_cabin_luggage.png"],
        category: "Travel & Luggage", categorySlug: "travel-luggage", brand: "TravelGear",
        rating: 4.7, reviewCount: 120, stock: 40, isNew: true, discount: 31,
        description: "Durable hard shell cabin luggage with spinner wheels. Lightweight and sturdy.",
        features: ["Hard Shell", "TSA Lock", "360 Spinner Wheels"],
        specifications: { "Size": "20 inch", "Material": "ABS/PC", "Weight": "2.5kg", "Country": "China" }
    },
    {
        id: 62, name: "Travel Backpack (Anti-Theft)", price: 2200, originalPrice: 3500,
        image: "/images/products/cat9_travel_backpack.png",
        images: ["/images/products/cat9_travel_backpack.png"],
        category: "Travel & Luggage", categorySlug: "travel-luggage", brand: "Arctic Hunter",
        rating: 4.8, reviewCount: 250, stock: 80, isNew: false, discount: 37,
        description: "Premium anti-theft travel backpack with USB charging port.",
        features: ["Anti-Theft Design", "USB Charging", "Laptop Compartment"],
        specifications: { "Size": "Large", "Laptop Fit": "15.6 inch", "Water Res": "Yes", "Country": "China" }
    },
    {
        id: 63, name: "Neck Pillow (Memory Foam)", price: 650, originalPrice: 1000,
        image: "/images/products/cat9_neck_pillow.png",
        images: ["/images/products/cat9_neck_pillow.png"],
        category: "Travel & Luggage", categorySlug: "travel-luggage", brand: "TravelComfort",
        rating: 4.6, reviewCount: 340, stock: 150, isNew: false, discount: 35,
        description: "Ergonomic memory foam neck pillow for comfortable flight or bus travel.",
        features: ["Memory Foam", "Washable Cover", "Snap Button"],
        specifications: { "Material": "Plush/Memory Foam", "Type": "U-Shape", "Country": "China" }
    },
    {
        id: 64, name: "Universal Travel Adapter", price: 800, originalPrice: 1200,
        image: "/images/products/cat9_travel_adapter.png",
        images: ["/images/products/cat9_travel_adapter.png"],
        category: "Travel & Luggage", categorySlug: "travel-luggage", brand: "Generic",
        rating: 4.9, reviewCount: 500, stock: 100, isNew: true, discount: 33,
        description: "All-in-one universal travel adapter with USB ports. Works in 150+ countries.",
        features: ["Universal Plug", "Dual USB", "Surge Protection"],
        specifications: { "Input": "100-240V", "Output": "USB 2.4A", "Country": "China" }
    },
    {
        id: 65, name: "Waterproof Phone Pouch", price: 250, originalPrice: 400,
        image: "/images/products/cat9_phone_pouch.png",
        images: ["/images/products/cat9_phone_pouch.png"],
        category: "Travel & Luggage", categorySlug: "travel-luggage", brand: "Generic",
        rating: 4.5, reviewCount: 600, stock: 300, isNew: false, discount: 37,
        description: "IPX8 waterproof phone pouch for beach and swimming. Touch friendly.",
        features: ["IPX8 Waterproof", "Touch Compatible", "Neck Strap"],
        specifications: { "Compatibility": "Up to 7 inch", "Depth": "10m", "Country": "China" }
    },

    // ===== CATEGORY 10: TOYS, COLLECTIBLES & GIFT ITEMS =====
    {
        id: 66, name: "Building Blocks / LEGO Compatible", price: 1500, originalPrice: 2500,
        image: "/images/products/cat10_building_blocks.png",
        images: ["/images/products/cat10_building_blocks.png"],
        category: "Toys & Collectibles", categorySlug: "toys-collectibles", brand: "Generic",
        rating: 4.8, reviewCount: 180, stock: 60, isNew: true, discount: 40,
        description: "Creative building block set, compatible with major brands. 500+ pieces.",
        features: ["Educational", "Compatible fit", "Safe ABS plastic"],
        specifications: { "Pieces": "500+", "Age": "6+", "Material": "ABS", "Country": "China" }
    },
    {
        id: 67, name: "Magnetic Tiles Set", price: 1200, originalPrice: 2000,
        image: "/images/products/cat10_magnetic_tiles.png",
        images: ["/images/products/cat10_magnetic_tiles.png"],
        category: "Toys & Collectibles", categorySlug: "toys-collectibles", brand: "MagPlay",
        rating: 4.9, reviewCount: 220, stock: 80, isNew: true, discount: 40,
        description: "3D magnetic building tiles. Promotes STEM learning and creativity.",
        features: ["Strong Magnets", "STEM Learning", "Durable"],
        specifications: { "Pieces": "40-60", "Age": "3+", "Country": "China" }
    },
    {
        id: 68, name: "Anime Figure (One Piece/Naruto)", price: 1200, originalPrice: 3000,
        image: "/images/products/cat10_anime_figure.png",
        images: ["/images/products/cat10_anime_figure.png"],
        category: "Toys & Collectibles", categorySlug: "toys-collectibles", brand: "Banpresto",
        rating: 4.7, reviewCount: 350, stock: 40, isNew: false, discount: 60,
        description: "High quality PVC anime action figure. Highly detailed and collectible.",
        features: ["High Detail", "PVC Material", "Collector's Item"],
        specifications: { "Height": "15-20cm", "Series": "Anime", "Country": "China" }
    },
    {
        id: 69, name: "Pop Mart / Blind Box Figure", price: 800, originalPrice: 1200,
        image: "/images/products/cat10_blind_box.png",
        images: ["/images/products/cat10_blind_box.png"],
        category: "Toys & Collectibles", categorySlug: "toys-collectibles", brand: "Pop Mart",
        rating: 4.8, reviewCount: 150, stock: 100, isNew: true, discount: 33,
        description: "Trendy blind box figure. Surprise character in every box!",
        features: ["Surprise", "Collectible", "Cute Design"],
        specifications: { "Series": "Random", "Material": "PVC", "Country": "China" }
    },
    {
        id: 70, name: "Art Supply Set (Premium)", price: 750, originalPrice: 1200,
        image: "/images/products/cat10_art_set.png",
        images: ["/images/products/cat10_art_set.png"],
        category: "Toys & Collectibles", categorySlug: "toys-collectibles", brand: "Deli/Generic",
        rating: 4.6, reviewCount: 200, stock: 120, isNew: false, discount: 37,
        description: "Complete art set with crayons, markers, and colored pencils.",
        features: ["Non-toxic", "Washable", "Organized Case"],
        specifications: { "Pieces": "48-150", "Case": "Plastic/Wood", "Country": "China" }
    },

    // ===== CATEGORY 11: SMART HOME — CAMERAS, LOCKS & SENSORS =====
    {
        id: 71, name: "WiFi Security Camera (Indoor)", price: 2800, originalPrice: 4000,
        image: "/images/products/cat11_wifi_camera.png",
        images: ["/images/products/cat11_wifi_camera.png"],
        category: "Smart Home", categorySlug: "smart-home", brand: "Xiaomi/Ezviz",
        rating: 4.8, reviewCount: 450, stock: 60, isNew: true, discount: 30,
        description: "1080p Indoor Security Camera with Night Vision and Two-Way Audio.",
        features: ["1080p HD", "Night Vision", "Two-Way Audio", "Motion Detection"],
        specifications: { "Resolution": "1080p", "Connectivity": "WiFi", "Storage": "MicroSD", "Country": "China" }
    },
    {
        id: 72, name: "WiFi Video Doorbell", price: 3500, originalPrice: 5000,
        image: "/images/products/cat11_video_doorbell.png",
        images: ["/images/products/cat11_video_doorbell.png"],
        category: "Smart Home", categorySlug: "smart-home", brand: "Generic",
        rating: 4.6, reviewCount: 120, stock: 40, isNew: true, discount: 30,
        description: "Smart video doorbell with real-time phone alerts and 2-way talk.",
        features: ["Real-time alerts", "2-Way Talk", "HD Video"],
        specifications: { "Power": "Rechargeable Battery", "Connectivity": "WiFi", "Country": "China" }
    },
    {
        id: 73, name: "Smart Door Lock (Fingerprint)", price: 8000, originalPrice: 12000,
        image: "/images/products/cat11_smart_lock.png",
        images: ["/images/products/cat11_smart_lock.png"],
        category: "Smart Home", categorySlug: "smart-home", brand: "Generic",
        rating: 4.9, reviewCount: 60, stock: 20, isNew: true, discount: 33,
        description: "Keyless entry smart lock with fingerprint, PIN, and card access.",
        features: ["Fingerprint Unlock", "PIN Code", "Key Card", "App Control"],
        specifications: { "Material": "Zinc Alloy", "Battery": "AA", "Country": "China" }
    },
    {
        id: 74, name: "Smart WiFi Plug", price: 800, originalPrice: 1200,
        image: "/images/products/cat11_smart_plug.png",
        images: ["/images/products/cat11_smart_plug.png"],
        category: "Smart Home", categorySlug: "smart-home", brand: "Tuya",
        rating: 4.7, reviewCount: 300, stock: 150, isNew: false, discount: 33,
        description: "Control your appliances remotely with this WiFi smart plug. Voice control compatible.",
        features: ["App Control", "Timer/Schedule", "Voice Control", "Energy Monitor"],
        specifications: { "Max Load": "16A", "Voltage": "100-240V", "Country": "China" }
    },
    {
        id: 75, name: "Smart LED Bulb (RGB)", price: 650, originalPrice: 1000,
        image: "/images/products/cat11_smart_bulb.png",
        images: ["/images/products/cat11_smart_bulb.png"],
        category: "Smart Home", categorySlug: "smart-home", brand: "Tuya/Yeelight",
        rating: 4.5, reviewCount: 250, stock: 100, isNew: false, discount: 35,
        description: "Color changing smart LED bulb. Create ambiance with millions of colors.",
        features: ["RGB Colors", "Dimmable", "App Control", "Music Sync"],
        specifications: { "Power": "9W", "Base": "E27/B22", "Connectivity": "WiFi/BT", "Country": "China" }
    },
    {
        id: 75, name: "Smart LED Bulb (RGB)", price: 650, originalPrice: 1000,
        image: "/images/products/cat11_smart_bulb.png",
        images: ["/images/products/cat11_smart_bulb.png"],
        category: "Smart Home", categorySlug: "smart-home", brand: "Tuya/Yeelight",
        rating: 4.5, reviewCount: 250, stock: 100, isNew: false, discount: 35,
        description: "Color changing smart LED bulb. Create ambiance with millions of colors.",
        features: ["RGB Colors", "Dimmable", "App Control", "Music Sync"],
        specifications: { "Power": "9W", "Base": "E27/B22", "Connectivity": "WiFi/BT", "Country": "China" }
    },

    // ===== CATEGORY 12: UPDATED BUNDLE IDEAS =====
    {
        id: 76, name: "New Mom Survival Kit", price: 3500, originalPrice: 4500,
        image: "/images/products/bundle_new_mom.png",
        images: ["/images/products/bundle_new_mom.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 5.0, reviewCount: 45, stock: 20, isNew: true, discount: 22,
        description: "The ultimate survival kit for new moms. Includes Diaper Bag, Baby Wipes, Teether, and Swaddle.",
        features: ["Diaper Bag + Wipes", "Teether + Swaddle", "Baby Shower Gift", "Value Pack"],
        specifications: { "Items": "4", "Occasion": "Baby Shower", "Savings": "22%" }
    },
    {
        id: 77, name: "Travel Ready Pack", price: 1800, originalPrice: 2500,
        image: "/images/products/bundle_travel_ready.png",
        images: ["/images/products/bundle_travel_ready.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.8, reviewCount: 60, stock: 30, isNew: true, discount: 28,
        description: "Everything you need for a hassle-free trip. Neck Pillow, Passport Cover, Adapter, and Lock.",
        features: ["Neck Pillow + Cover", "Travel Adapter", "TSA Lock", "Trip Essential"],
        specifications: { "Items": "4", "Occasion": "Trip Planning", "Savings": "28%" }
    },
    {
        id: 78, name: "Smart Home Starter", price: 2500, originalPrice: 3500,
        image: "/images/products/bundle_smart_home.png",
        images: ["/images/products/bundle_smart_home.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.7, reviewCount: 30, stock: 25, isNew: true, discount: 28,
        description: "Start your smart home journey today. Smart Plug, LED Bulb, and IR Remote.",
        features: ["Smart Plug", "RGB Bulb", "Universal Remote", "App Control"],
        specifications: { "Items": "3", "Hub Required": "No", "Savings": "28%" }
    },
    {
        id: 79, name: "Home Security Bundle", price: 6500, originalPrice: 8500,
        image: "/images/products/bundle_security.png",
        images: ["/images/products/bundle_security.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.9, reviewCount: 25, stock: 15, isNew: true, discount: 23,
        description: "Complete peace of mind. WiFi Camera, MicroSD Card, and Smart Door Lock.",
        features: ["1080p Camera", "Smart Lock", "Local Storage", "Full Security"],
        specifications: { "Items": "3", "Install": "DIY", "Savings": "23%" }
    },
    {
        id: 80, name: "Her Birthday Box", price: 2800, originalPrice: 4000,
        image: "/images/products/bundle_birthday_her.png",
        images: ["/images/products/bundle_birthday_her.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 5.0, reviewCount: 80, stock: 40, isNew: true, discount: 30,
        description: "The perfect birthday gift for her. Jewelry Set, Crossbody Bag, and Scented Candle.",
        features: ["Premium Bag", "Jewelry Set", "Aromatic Candle", "Gift Ready"],
        specifications: { "Items": "3", "Occasion": "Birthday", "Savings": "30%" }
    },
    {
        id: 81, name: "Kids Party Pack", price: 1800, originalPrice: 2500,
        image: "/images/products/bundle_kids_party.png",
        images: ["/images/products/bundle_kids_party.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.8, reviewCount: 55, stock: 50, isNew: false, discount: 28,
        description: "Fun for hours! Building Blocks, Art Set, and Board Game.",
        features: ["Creative Play", "Board Game", "Educational", "Group Fun"],
        specifications: { "Items": "3", "Age": "6+", "Savings": "28%" }
    },
    {
        id: 82, name: "Collector's Box", price: 2500, originalPrice: 3500,
        image: "/images/products/bundle_collector.png",
        images: ["/images/products/bundle_collector.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.9, reviewCount: 40, stock: 10, isNew: true, discount: 28,
        description: "For the true fan. Anime Figure, Blind Box, and Premium Display Stand.",
        features: ["Action Figure", "Mystery Box", "Display Stand", "Limited"],
        specifications: { "Items": "3", "Theme": "Anime", "Savings": "28%" }
    },
    {
        id: 83, name: "Cox's Bazar Kit", price: 1500, originalPrice: 2200,
        image: "/images/products/bundle_beach.png",
        images: ["/images/products/bundle_beach.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.7, reviewCount: 65, stock: 60, isNew: true, discount: 32,
        description: "Hit the beach with confidence. Waterproof Pouch, Sunscreen, and Travel Bag.",
        features: ["Waterproof", "Sun Protection", "Beach Bag", "Travel Essential"],
        specifications: { "Items": "3", "Occasion": "Beach Trip", "Savings": "32%" }
    },
    {
        id: 84, name: "First Day of School", price: 1600, originalPrice: 2400,
        image: "/images/products/bundle_school.png",
        images: ["/images/products/bundle_school.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.9, reviewCount: 90, stock: 100, isNew: true, discount: 33,
        description: "Get ready for school! Backpack, Water Bottle, and Flash Cards.",
        features: ["Durable Bag", "BPA Free Bottle", "Learning Tool", "School Ready"],
        specifications: { "Items": "3", "Occasion": "Back to School", "Savings": "33%" }
    },
    {
        id: 85, name: "Couple's Getaway", price: 4500, originalPrice: 6500,
        image: "/images/products/bundle_couple.png",
        images: ["/images/products/bundle_couple.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 5.0, reviewCount: 30, stock: 15, isNew: true, discount: 30,
        description: "Travel in style together. Travel Adapter, 2 Neck Pillows, and a Couple's Watch Set.",
        features: ["For Two", "Matching Set", "Travel Comfort", "Romantic Gift"],
        specifications: { "Items": "4", "Occasion": "Anniversary", "Savings": "30%" }
    },
    {
        id: 86, name: "Baby's First Year", price: 6000, originalPrice: 9000,
        image: "/images/products/bundle_baby_first.png",
        images: ["/images/products/bundle_baby_first.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 5.0, reviewCount: 20, stock: 10, isNew: true, discount: 33,
        description: "Premium gift set for the first year. Feeding Set, Rompers, Teether, and Baby Monitor.",
        features: ["Complete Set", "Premium Quality", "Tech Included", "Ultimate Gift"],
        specifications: { "Items": "4", "Age": "0-12m", "Savings": "33%" }
    },
    {
        id: 87, name: "Ultimate Eid Gift (Her)", price: 4500, originalPrice: 6500,
        image: "/images/products/bundle_eid_her.png",
        images: ["/images/products/bundle_eid_her.png"],
        category: "Bundles", categorySlug: "bundles", brand: "AuthentiMart",
        rating: 4.9, reviewCount: 50, stock: 35, isNew: true, discount: 30,
        description: "The ultimate celebration gift. Jewelry, Bag, Perfume, and Candle.",
        features: ["Luxury Set", "Full Look", "Festive Gift", "Premium Box"],
        specifications: { "Items": "4", "Occasion": "Eid", "Savings": "30%" }
    }
]

export default allProducts
