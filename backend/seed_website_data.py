"""
Seed script that uses the exact products from the website frontend.
All images reference the frontend public/images/products/ folder.
"""
import sys
import os
from datetime import datetime, timedelta
import random

sys.path.append(os.getcwd())

from app.database import SessionLocal, engine
from app.models.models import Base, Category, Product, ProductImage, User, UserRole, Order, OrderItem, OrderStatus, PaymentStatus, OrderTracking, Payment
from passlib.context import CryptContext

Base.metadata.create_all(bind=engine)
db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Categories matching the frontend
CATEGORIES = [
    {"name": "Lip Products", "slug": "lip-products", "description": "Lipsticks, lip tints, and lip care", "image": "/images/category-lip-products.jpg"},
    {"name": "Eye Products", "slug": "eye-products", "description": "Eyeshadows, mascaras, and eye makeup", "image": "/images/category-eye-products.jpg"},
    {"name": "Face Products", "slug": "face-products", "description": "Foundations, concealers, and face makeup", "image": "/images/category-face-products.jpg"},
    {"name": "Skincare", "slug": "skincare", "description": "Korean skincare and essentials", "image": "/images/category-skincare.jpg"},
    {"name": "Men's Grooming", "slug": "mens-grooming", "description": "Grooming products for men", "image": "/images/category-mens-grooming.jpg"},
    {"name": "Tech Accessories", "slug": "tech-accessories", "description": "Gadgets and tech accessories", "image": "/images/category-tech-accessories.jpg"},
    {"name": "Gaming", "slug": "gaming", "description": "Gaming peripherals and accessories", "image": "/images/category-gaming.jpg"},
    {"name": "Home Appliances", "slug": "home-appliances", "description": "Kitchen and home appliances", "image": "/images/category-home-appliances.jpg"},
    {"name": "Home Decor", "slug": "home-decor", "description": "Decorative items for home", "image": "/images/category-home-decor.jpg"},
    {"name": "Beauty Tools", "slug": "beauty-tools", "description": "Makeup brushes and beauty tools", "image": "/images/category-beauty-tools.jpg"},
    {"name": "Ladies Fashion", "slug": "ladies-fashion", "description": "Bags, jewelry and accessories", "image": "/images/category-ladies-fashion.jpg"},
    {"name": "Baby & Kids", "slug": "baby-kids", "description": "Baby care and kids products", "image": "/images/category-baby-kids.jpg"},
    {"name": "Travel & Luggage", "slug": "travel-luggage", "description": "Travel accessories and bags", "image": "/images/category-travel-luggage.jpg"},
    {"name": "Toys & Collectibles", "slug": "toys-collectibles", "description": "Toys and collectible items", "image": "/images/category-toys-collectibles.jpg"},
    {"name": "Smart Home", "slug": "smart-home", "description": "Smart home devices", "image": "/images/category-smart-home.jpg"},
    {"name": "Bundles", "slug": "bundles", "description": "Value bundle packs", "image": "/images/category-bundles.jpg"},
]

# Products matching the frontend (first 50 main products)
PRODUCTS = [
    # Lip Products
    {"name": "MAC Matte Lipstick - Ruby Woo", "slug": "mac-ruby-woo", "price": 1200, "original_price": 1500, "stock": 30, "category_slug": "lip-products", "brand": "MAC", "sku": "LIP-001", "is_featured": True, "is_new": False, "rating": 4.9, "review_count": 412, "image": "/images/products/mac_lipstick_1770316650108.png", "description": "MAC's iconic Ruby Woo - a vivid blue-red matte lipstick."},
    {"name": "NYX Soft Matte Lip Cream", "slug": "nyx-soft-matte", "price": 550, "original_price": 700, "stock": 100, "category_slug": "lip-products", "brand": "NYX", "sku": "LIP-002", "is_featured": False, "is_new": True, "rating": 4.6, "review_count": 567, "image": "/images/products/matte_liquid_lipstick_1770316667658.png", "description": "NYX Soft Matte Lip Cream delivers a matte finish."},
    {"name": "Rom&nd Juicy Lasting Tint", "slug": "romand-lip-tint", "price": 550, "original_price": 700, "stock": 75, "category_slug": "lip-products", "brand": "Rom&nd", "sku": "LIP-003", "is_featured": True, "is_new": True, "rating": 4.8, "review_count": 823, "image": "/images/products/korean_lip_tint_1770316710139.png", "description": "Korean cult-favorite lip tint with juicy, glossy finish."},
    {"name": "Laneige Lip Sleeping Mask", "slug": "laneige-lip-mask", "price": 950, "original_price": 1200, "stock": 45, "category_slug": "lip-products", "brand": "Laneige", "sku": "LIP-004", "is_featured": True, "is_new": False, "rating": 4.9, "review_count": 1234, "image": "/images/products/product_04_laneige_lip_mask.png", "description": "Overnight lip treatment with Berry Fruit Complex."},
    {"name": "Maybelline SuperStay Matte Ink", "slug": "maybelline-superstay", "price": 650, "original_price": 800, "stock": 120, "category_slug": "lip-products", "brand": "Maybelline", "sku": "LIP-005", "is_featured": False, "is_new": False, "rating": 4.7, "review_count": 890, "image": "/images/products/product_05_maybelline_superstay.png", "description": "16-hour wear liquid lipstick with precision tip."},

    # Eye Products
    {"name": "Maybelline Hyper Easy Liquid Liner", "slug": "maybelline-liner", "price": 350, "original_price": 450, "stock": 150, "category_slug": "eye-products", "brand": "Maybelline", "sku": "EYE-001", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 678, "image": "/images/products/product_06_maybelline_liner.png", "description": "Easy-glide felt tip liner for precise, bold lines."},
    {"name": "Urban Decay Naked Eyeshadow Palette", "slug": "urban-decay-naked", "price": 2200, "original_price": 2800, "stock": 25, "category_slug": "eye-products", "brand": "Urban Decay", "sku": "EYE-002", "is_featured": True, "is_new": False, "rating": 4.9, "review_count": 1567, "image": "/images/products/product_07_urban_decay_palette.png", "description": "Iconic 12-shade neutral eyeshadow palette."},
    {"name": "Maybelline Lash Sensational Mascara", "slug": "maybelline-mascara", "price": 550, "original_price": 700, "stock": 200, "category_slug": "eye-products", "brand": "Maybelline", "sku": "EYE-003", "is_featured": False, "is_new": False, "rating": 4.8, "review_count": 2341, "image": "/images/products/product_08_maybelline_mascara.png", "description": "Fan-out brush captures lashes from root to tip."},
    {"name": "Benefit Precisely My Brow Pencil", "slug": "benefit-brow", "price": 450, "original_price": 600, "stock": 80, "category_slug": "eye-products", "brand": "Benefit", "sku": "EYE-004", "is_featured": False, "is_new": False, "rating": 4.7, "review_count": 567, "image": "/images/products/product_09_benefit_brow.png", "description": "Ultra-fine tip eyebrow pencil for hair-like strokes."},
    {"name": "Ardell Natural Lashes", "slug": "ardell-lashes", "price": 250, "original_price": 350, "stock": 300, "category_slug": "eye-products", "brand": "Ardell", "sku": "EYE-005", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 890, "image": "/images/products/product_10_ardell_lashes.png", "description": "Natural-looking false eyelashes."},

    # Face Products
    {"name": "Maybelline Fit Me Foundation", "slug": "maybelline-fit-me", "price": 850, "original_price": 1000, "stock": 150, "category_slug": "face-products", "brand": "Maybelline", "sku": "FACE-001", "is_featured": True, "is_new": False, "rating": 4.6, "review_count": 2100, "image": "/images/products/product_11_maybelline_fit_me.png", "description": "Matte + Poreless foundation for normal to oily skin."},
    {"name": "Missha M Perfect Cover BB Cream", "slug": "missha-bb-cream", "price": 650, "original_price": 850, "stock": 90, "category_slug": "face-products", "brand": "Missha", "sku": "FACE-002", "is_featured": False, "is_new": False, "rating": 4.7, "review_count": 1890, "image": "/images/products/product_12_missha_bb_cream.png", "description": "Korean BB cream with SPF42 PA+++."},
    {"name": "Maybelline Instant Age Rewind Concealer", "slug": "maybelline-concealer", "price": 650, "original_price": 800, "stock": 180, "category_slug": "face-products", "brand": "Maybelline", "sku": "FACE-003", "is_featured": True, "is_new": False, "rating": 4.8, "review_count": 3456, "image": "/images/products/product_13_maybelline_concealer.png", "description": "Instant Age Rewind Eraser concealer."},
    {"name": "Rare Beauty Soft Pinch Blush", "slug": "rare-beauty-blush", "price": 1100, "original_price": 1400, "stock": 40, "category_slug": "face-products", "brand": "Rare Beauty", "sku": "FACE-004", "is_featured": True, "is_new": True, "rating": 4.9, "review_count": 2345, "image": "/images/products/product_14_rare_beauty_blush.png", "description": "Weightless liquid blush that blends effortlessly."},
    {"name": "MAC Studio Fix Powder", "slug": "mac-studio-fix", "price": 950, "original_price": 1200, "stock": 60, "category_slug": "face-products", "brand": "MAC", "sku": "FACE-005", "is_featured": False, "is_new": False, "rating": 4.7, "review_count": 1234, "image": "/images/products/product_15_mac_powder.png", "description": "One-step powder and foundation."},

    # Skincare
    {"name": "COSRX Advanced Snail 96 Mucin Essence", "slug": "cosrx-snail-essence", "price": 1650, "original_price": 1800, "stock": 100, "category_slug": "skincare", "brand": "COSRX", "sku": "SKIN-001", "is_featured": True, "is_new": False, "rating": 4.9, "review_count": 4567, "image": "/images/products/product_16_cosrx_snail_essence.png", "description": "96% Snail Secretion Filtrate for intense hydration."},
    {"name": "Beauty of Joseon Sunscreen SPF50+", "slug": "boj-sunscreen", "price": 1450, "original_price": 1600, "stock": 120, "category_slug": "skincare", "brand": "Beauty of Joseon", "sku": "SKIN-002", "is_featured": True, "is_new": True, "rating": 4.8, "review_count": 3456, "image": "/images/products/boj_sunscreen_1770312422001.png", "description": "Rice + Probiotics sunscreen with no white cast."},
    {"name": "COSRX Acne Pimple Master Patch", "slug": "cosrx-pimple-patch", "price": 450, "original_price": 550, "stock": 300, "category_slug": "skincare", "brand": "COSRX", "sku": "SKIN-003", "is_featured": False, "is_new": False, "rating": 4.8, "review_count": 5678, "image": "/images/products/product_18_cosrx_pimple_patch.png", "description": "Hydrocolloid patches that absorb pus."},
    {"name": "Beauty of Joseon Glow Serum", "slug": "boj-glow-serum", "price": 1400, "original_price": 1600, "stock": 80, "category_slug": "skincare", "brand": "Beauty of Joseon", "sku": "SKIN-004", "is_featured": True, "is_new": True, "rating": 4.9, "review_count": 2345, "image": "/images/products/product_19_boj_glow_serum.png", "description": "Propolis + Niacinamide serum for glowing skin."},
    {"name": "COSRX Low pH Good Morning Cleanser", "slug": "cosrx-cleanser", "price": 950, "original_price": 1100, "stock": 150, "category_slug": "skincare", "brand": "COSRX", "sku": "SKIN-005", "is_featured": False, "is_new": False, "rating": 4.7, "review_count": 3890, "image": "/images/products/product_20_cosrx_cleanser.png", "description": "Low pH gel cleanser with tea tree oil."},
    {"name": "Sheet Mask Bundle (10 Pack)", "slug": "sheet-mask-bundle", "price": 1100, "original_price": 1400, "stock": 200, "category_slug": "skincare", "brand": "Innisfree/Mediheal", "sku": "SKIN-006", "is_featured": False, "is_new": False, "rating": 4.6, "review_count": 1234, "image": "/images/products/product_21_sheet_mask_bundle.png", "description": "Assorted Korean sheet masks."},
    {"name": "The Ordinary Niacinamide 10% + Zinc", "slug": "ordinary-niacinamide", "price": 850, "original_price": 1000, "stock": 90, "category_slug": "skincare", "brand": "The Ordinary", "sku": "SKIN-007", "is_featured": True, "is_new": False, "rating": 4.8, "review_count": 5678, "image": "/images/products/product_22_ordinary_niacinamide.png", "description": "High-strength niacinamide serum."},
    {"name": "CeraVe Moisturizing Cream", "slug": "cerave-cream", "price": 1200, "original_price": 1500, "stock": 70, "category_slug": "skincare", "brand": "CeraVe", "sku": "SKIN-008", "is_featured": False, "is_new": False, "rating": 4.8, "review_count": 4567, "image": "/images/products/product_23_cerave_cream.png", "description": "24-hour hydration cream with 3 essential ceramides."},

    # Men's Grooming
    {"name": "Gatsby Hair Wax - Spiky Edge", "slug": "gatsby-wax", "price": 350, "original_price": 450, "stock": 200, "category_slug": "mens-grooming", "brand": "Gatsby", "sku": "MEN-001", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 890, "image": "/images/products/product_24_gatsby_wax.png", "description": "Strong hold hair wax for spiky styles."},
    {"name": "Lattafa Raghba Perfume", "slug": "lattafa-perfume", "price": 1800, "original_price": 2500, "stock": 50, "category_slug": "mens-grooming", "brand": "Lattafa", "sku": "MEN-002", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 1234, "image": "/images/products/product_25_lattafa_perfume.png", "description": "Arabian luxury perfume with oud and vanilla notes."},
    {"name": "Premium Leather Wallet", "slug": "leather-wallet", "price": 1200, "original_price": 1600, "stock": 80, "category_slug": "mens-grooming", "brand": "Premium", "sku": "MEN-003", "is_featured": False, "is_new": False, "rating": 4.6, "review_count": 567, "image": "/images/products/product_26_leather_wallet.png", "description": "Genuine leather bifold wallet with RFID protection."},
    {"name": "Minimalist RFID Card Holder", "slug": "rfid-card-holder", "price": 550, "original_price": 700, "stock": 120, "category_slug": "mens-grooming", "brand": "Premium", "sku": "MEN-004", "is_featured": False, "is_new": True, "rating": 4.5, "review_count": 345, "image": "/images/products/product_27_card_holder.png", "description": "Slim RFID-blocking card holder."},
    {"name": "Nivea Men Deep Face Wash", "slug": "nivea-facewash", "price": 350, "original_price": 450, "stock": 150, "category_slug": "mens-grooming", "brand": "Nivea", "sku": "MEN-005", "is_featured": False, "is_new": False, "rating": 4.4, "review_count": 678, "image": "/images/products/product_28_nivea_facewash.png", "description": "Deep cleansing face wash with active charcoal."},

    # Tech Accessories
    {"name": "Redmi Buds 5C Hybrid ANC", "slug": "redmi-buds-5c", "price": 3200, "original_price": 3800, "stock": 60, "category_slug": "tech-accessories", "brand": "Redmi", "sku": "TECH-001", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 1234, "image": "/images/products/product_29_redmi_buds.png", "description": "40dB Hybrid ANC earbuds with 36-hour battery life."},
    {"name": "Haylou GT7 Neo TWS", "slug": "haylou-gt7", "price": 1600, "original_price": 2000, "stock": 100, "category_slug": "tech-accessories", "brand": "Haylou", "sku": "TECH-002", "is_featured": False, "is_new": False, "rating": 4.4, "review_count": 567, "image": "/images/products/product_30_haylou_gt7.png", "description": "Budget-friendly TWS with clear audio."},
    {"name": "Baseus Adaman 20000mAh Power Bank", "slug": "baseus-powerbank-20k", "price": 2800, "original_price": 3500, "stock": 45, "category_slug": "tech-accessories", "brand": "Baseus", "sku": "TECH-003", "is_featured": True, "is_new": True, "rating": 4.8, "review_count": 890, "image": "/images/products/product_31_baseus_powerbank.png", "description": "22.5W fast charging power bank with LED display."},
    {"name": "Type-C Fast Charger 20W", "slug": "usbc-charger-20w", "price": 550, "original_price": 750, "stock": 200, "category_slug": "tech-accessories", "brand": "Oraimo", "sku": "TECH-004", "is_featured": False, "is_new": False, "rating": 4.6, "review_count": 1234, "image": "/images/products/product_32_usbc_charger.png", "description": "20W PD fast charger for iPhone & Samsung."},
    {"name": "Premium Phone Cases Bundle", "slug": "phone-cases", "price": 500, "original_price": 700, "stock": 300, "category_slug": "tech-accessories", "brand": "Premium", "sku": "TECH-005", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 678, "image": "/images/products/product_33_phone_cases.png", "description": "Premium protective cases for iPhone & Samsung."},

    # Gaming
    {"name": "Redragon M602 Gaming Mouse", "slug": "redragon-mouse", "price": 1200, "original_price": 1600, "stock": 60, "category_slug": "gaming", "brand": "Redragon", "sku": "GAME-001", "is_featured": True, "is_new": False, "rating": 4.6, "review_count": 789, "image": "/images/products/product_37_gaming_mouse.png", "description": "RGB gaming mouse with 7200 DPI optical sensor."},
    {"name": "XL Gaming Mouse Pad (800x300mm)", "slug": "gaming-mousepad", "price": 550, "original_price": 750, "stock": 100, "category_slug": "gaming", "brand": "Gaming", "sku": "GAME-002", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 567, "image": "/images/products/product_38_mouse_pad.png", "description": "Extended mouse pad with stitched edges."},
    {"name": "RGB LED Strip (5m USB)", "slug": "rgb-led-strip", "price": 450, "original_price": 600, "stock": 150, "category_slug": "gaming", "brand": "Gaming", "sku": "GAME-003", "is_featured": False, "is_new": True, "rating": 4.4, "review_count": 890, "image": "/images/products/product_39_rgb_led_strip.png", "description": "5-meter USB RGB LED strip with remote."},

    # Home Appliances
    {"name": "Air Fryer 4.5L Digital", "slug": "air-fryer", "price": 6500, "original_price": 8500, "stock": 25, "category_slug": "home-appliances", "brand": "Philips", "sku": "HOME-001", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 567, "image": "/images/products/product_40_air_fryer.png", "description": "4.5L digital air fryer with 8 presets."},
    {"name": "Electric Pressure Cooker 6L", "slug": "pressure-cooker", "price": 3500, "original_price": 4500, "stock": 35, "category_slug": "home-appliances", "brand": "Instant", "sku": "HOME-002", "is_featured": True, "is_new": False, "rating": 4.8, "review_count": 890, "image": "/images/products/product_41_pressure_cooker.png", "description": "Multi-function electric pressure cooker."},
    {"name": "Electric Kettle 1.8L", "slug": "electric-kettle", "price": 1100, "original_price": 1400, "stock": 80, "category_slug": "home-appliances", "brand": "Philips", "sku": "HOME-003", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 1234, "image": "/images/products/product_42_electric_kettle.png", "description": "1.8L stainless steel electric kettle."},
    {"name": "LED Desk Lamp (Adjustable)", "slug": "desk-lamp", "price": 950, "original_price": 1300, "stock": 60, "category_slug": "home-appliances", "brand": "Xiaomi", "sku": "HOME-004", "is_featured": False, "is_new": True, "rating": 4.6, "review_count": 456, "image": "/images/products/product_43_desk_lamp.png", "description": "Foldable LED desk lamp with adjustable brightness."},

    # Home Decor
    {"name": "LED Fairy String Lights (10m)", "slug": "fairy-lights", "price": 350, "original_price": 500, "stock": 200, "category_slug": "home-decor", "brand": "Decor", "sku": "DECOR-001", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 890, "image": "/images/products/product_44_fairy_lights.png", "description": "10-meter USB fairy lights."},
    {"name": "Decorative Show Piece Set", "slug": "showpiece-set", "price": 850, "original_price": 1200, "stock": 50, "category_slug": "home-decor", "brand": "Decor", "sku": "DECOR-002", "is_featured": False, "is_new": True, "rating": 4.4, "review_count": 345, "image": "/images/products/product_45_decorative_showpiece.png", "description": "Modern decorative show piece set."},
    {"name": "Scented Candle Gift Set", "slug": "scented-candles", "price": 650, "original_price": 900, "stock": 80, "category_slug": "home-decor", "brand": "Decor", "sku": "DECOR-003", "is_featured": False, "is_new": False, "rating": 4.6, "review_count": 567, "image": "/images/products/product_46_scented_candles.png", "description": "Set of 4 scented candles in elegant jars."},
    {"name": "Artificial Plant with Pot", "slug": "artificial-plant", "price": 450, "original_price": 600, "stock": 100, "category_slug": "home-decor", "brand": "Decor", "sku": "DECOR-004", "is_featured": False, "is_new": False, "rating": 4.3, "review_count": 234, "image": "/images/products/product_47_artificial_plant.png", "description": "Realistic artificial plant in decorative pot."},

    # Beauty Tools
    {"name": "Beauty Blender Sponge Set", "slug": "beauty-blenders", "price": 300, "original_price": 450, "stock": 250, "category_slug": "beauty-tools", "brand": "Beauty", "sku": "TOOL-001", "is_featured": False, "is_new": False, "rating": 4.6, "review_count": 1234, "image": "/images/products/product_48_beauty_blenders.png", "description": "Set of 5 makeup sponges."},
    {"name": "Premium Makeup Brush Set", "slug": "makeup-brushes", "price": 1200, "original_price": 1600, "stock": 70, "category_slug": "beauty-tools", "brand": "Beauty", "sku": "TOOL-002", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 678, "image": "/images/products/product_49_makeup_brushes.png", "description": "12-piece professional makeup brush set."},
    {"name": "Jade Face Roller + Gua Sha Set", "slug": "jade-roller-set", "price": 550, "original_price": 800, "stock": 90, "category_slug": "beauty-tools", "brand": "Beauty", "sku": "TOOL-003", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 456, "image": "/images/products/product_50_jade_roller_set.png", "description": "Natural jade roller and gua sha set."},

    # Ladies Fashion
    {"name": "Elegant Pearl Necklace Set", "slug": "pearl-necklace-set", "price": 1200, "original_price": 1600, "stock": 50, "category_slug": "ladies-fashion", "brand": "Elegance", "sku": "LADY-001", "is_featured": True, "is_new": True, "rating": 4.8, "review_count": 234, "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600", "description": "Classic pearl necklace with matching earrings."},
    {"name": "Designer Crossbody Bag", "slug": "crossbody-bag", "price": 2500, "original_price": 3200, "stock": 35, "category_slug": "ladies-fashion", "brand": "StyleCraft", "sku": "LADY-002", "is_featured": True, "is_new": False, "rating": 4.7, "review_count": 456, "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", "description": "Trendy crossbody bag with adjustable strap."},
    {"name": "Gold Plated Bracelet Set", "slug": "gold-bracelet-set", "price": 850, "original_price": 1100, "stock": 80, "category_slug": "ladies-fashion", "brand": "Jewel", "sku": "LADY-003", "is_featured": False, "is_new": True, "rating": 4.6, "review_count": 189, "image": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600", "description": "Set of 5 stackable gold plated bracelets."},
    {"name": "Silk Scarf Collection", "slug": "silk-scarf", "price": 950, "original_price": 1200, "stock": 60, "category_slug": "ladies-fashion", "brand": "SilkWear", "sku": "LADY-004", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 123, "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600", "description": "Premium silk scarf with elegant patterns."},

    # Baby & Kids
    {"name": "Baby Feeding Bottle Set (3 Pack)", "slug": "baby-bottle-set", "price": 850, "original_price": 1100, "stock": 100, "category_slug": "baby-kids", "brand": "BabyLove", "sku": "BABY-001", "is_featured": True, "is_new": False, "rating": 4.8, "review_count": 567, "image": "https://images.unsplash.com/photo-1584839404042-8bc21d240e61?w=600", "description": "BPA-free baby feeding bottles with anti-colic design."},
    {"name": "Kids Educational Tablet", "slug": "kids-tablet", "price": 2800, "original_price": 3500, "stock": 40, "category_slug": "baby-kids", "brand": "LearnPad", "sku": "BABY-002", "is_featured": True, "is_new": True, "rating": 4.6, "review_count": 234, "image": "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600", "description": "Kid-friendly tablet with educational apps and parental controls."},
    {"name": "Soft Baby Blanket Set", "slug": "baby-blanket-set", "price": 650, "original_price": 850, "stock": 80, "category_slug": "baby-kids", "brand": "Cozy Baby", "sku": "BABY-003", "is_featured": False, "is_new": False, "rating": 4.7, "review_count": 345, "image": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600", "description": "Ultra-soft muslin baby blankets (pack of 2)."},
    {"name": "Kids Backpack with Lunch Box", "slug": "kids-backpack", "price": 1200, "original_price": 1500, "stock": 60, "category_slug": "baby-kids", "brand": "KidPack", "sku": "BABY-004", "is_featured": False, "is_new": True, "rating": 4.5, "review_count": 189, "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", "description": "Colorful kids backpack with matching lunch box."},

    # Travel & Luggage
    {"name": "Cabin Trolley Bag 20 inch", "slug": "cabin-trolley-bag", "price": 4500, "original_price": 5500, "stock": 30, "category_slug": "travel-luggage", "brand": "TravelPro", "sku": "TRAV-001", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 345, "image": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600", "description": "Lightweight cabin-size trolley with TSA lock."},
    {"name": "Travel Organizer Bag Set", "slug": "travel-organizer-set", "price": 950, "original_price": 1200, "stock": 80, "category_slug": "travel-luggage", "brand": "PackSmart", "sku": "TRAV-002", "is_featured": False, "is_new": False, "rating": 4.6, "review_count": 234, "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", "description": "6-piece packing cube set for organized travel."},
    {"name": "Neck Pillow & Eye Mask Combo", "slug": "travel-pillow-combo", "price": 550, "original_price": 750, "stock": 120, "category_slug": "travel-luggage", "brand": "ComfortTravel", "sku": "TRAV-003", "is_featured": False, "is_new": False, "rating": 4.5, "review_count": 456, "image": "https://images.unsplash.com/photo-1544161513-0179fe746fd5?w=600", "description": "Memory foam neck pillow with silk eye mask."},
    {"name": "Waterproof Duffel Bag", "slug": "waterproof-duffel", "price": 2200, "original_price": 2800, "stock": 45, "category_slug": "travel-luggage", "brand": "AdventureGear", "sku": "TRAV-004", "is_featured": True, "is_new": True, "rating": 4.8, "review_count": 167, "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", "description": "50L waterproof duffel bag for outdoor adventures."},

    # Toys & Collectibles
    {"name": "LEGO Architecture Set - Burj Khalifa", "slug": "lego-burj-khalifa", "price": 3500, "original_price": 4200, "stock": 25, "category_slug": "toys-collectibles", "brand": "LEGO", "sku": "TOY-001", "is_featured": True, "is_new": False, "rating": 4.9, "review_count": 567, "image": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600", "description": "LEGO Architecture Burj Khalifa building set."},
    {"name": "RC Car 4WD Off-Road", "slug": "rc-car-4wd", "price": 2800, "original_price": 3500, "stock": 40, "category_slug": "toys-collectibles", "brand": "SpeedRacer", "sku": "TOY-002", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 234, "image": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600", "description": "High-speed 4WD RC car with 2.4GHz remote."},
    {"name": "Anime Figure Collection - Naruto", "slug": "naruto-figure", "price": 1800, "original_price": 2200, "stock": 35, "category_slug": "toys-collectibles", "brand": "AnimeFigs", "sku": "TOY-003", "is_featured": False, "is_new": True, "rating": 4.8, "review_count": 189, "image": "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600", "description": "Premium Naruto Uzumaki collectible figure."},
    {"name": "Board Game - Settlers of Catan", "slug": "settlers-catan", "price": 2500, "original_price": 3000, "stock": 30, "category_slug": "toys-collectibles", "brand": "Catan", "sku": "TOY-004", "is_featured": False, "is_new": False, "rating": 4.9, "review_count": 890, "image": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600", "description": "Classic strategy board game for 3-4 players."},

    # Smart Home
    {"name": "Smart LED Bulb (RGB, WiFi)", "slug": "smart-led-bulb", "price": 650, "original_price": 850, "stock": 150, "category_slug": "smart-home", "brand": "SmartLife", "sku": "SMART-001", "is_featured": True, "is_new": False, "rating": 4.6, "review_count": 567, "image": "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600", "description": "WiFi-enabled RGB smart bulb with voice control."},
    {"name": "Smart Plug (4 Pack)", "slug": "smart-plug-4pack", "price": 1800, "original_price": 2200, "stock": 80, "category_slug": "smart-home", "brand": "SmartLife", "sku": "SMART-002", "is_featured": True, "is_new": True, "rating": 4.7, "review_count": 345, "image": "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600", "description": "WiFi smart plugs with energy monitoring."},
    {"name": "Smart Door Lock (Fingerprint)", "slug": "smart-door-lock", "price": 8500, "original_price": 10000, "stock": 20, "category_slug": "smart-home", "brand": "SecureTech", "sku": "SMART-003", "is_featured": False, "is_new": True, "rating": 4.8, "review_count": 123, "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600", "description": "Biometric smart lock with fingerprint & PIN access."},
    {"name": "Smart Security Camera (1080p)", "slug": "smart-security-cam", "price": 3200, "original_price": 4000, "stock": 45, "category_slug": "smart-home", "brand": "WatchHome", "sku": "SMART-004", "is_featured": False, "is_new": False, "rating": 4.6, "review_count": 456, "image": "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=600", "description": "1080p WiFi security camera with night vision."},

    # Bundles
    {"name": "K-Beauty Skincare Starter Kit", "slug": "kbeauty-starter-kit", "price": 3500, "original_price": 4500, "stock": 40, "category_slug": "bundles", "brand": "K-Beauty", "sku": "BUND-001", "is_featured": True, "is_new": True, "rating": 4.9, "review_count": 234, "image": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600", "description": "Complete K-Beauty routine: cleanser, toner, serum, moisturizer."},
    {"name": "Gaming Setup Bundle", "slug": "gaming-setup-bundle", "price": 5500, "original_price": 7000, "stock": 25, "category_slug": "bundles", "brand": "GamePro", "sku": "BUND-002", "is_featured": True, "is_new": False, "rating": 4.7, "review_count": 167, "image": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600", "description": "Gaming mouse, mousepad, RGB keyboard combo."},
    {"name": "Work From Home Essentials", "slug": "wfh-essentials", "price": 4200, "original_price": 5200, "stock": 35, "category_slug": "bundles", "brand": "HomeOffice", "sku": "BUND-003", "is_featured": False, "is_new": True, "rating": 4.6, "review_count": 189, "image": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600", "description": "Desk lamp, USB hub, webcam, and headset bundle."},
    {"name": "Baby Shower Gift Set", "slug": "baby-shower-gift", "price": 2800, "original_price": 3500, "stock": 50, "category_slug": "bundles", "brand": "BabyLove", "sku": "BUND-004", "is_featured": False, "is_new": False, "rating": 4.8, "review_count": 345, "image": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600", "description": "Complete baby essentials gift set with premium packaging."},
]


def clear_existing_data():
    """Clear existing products and categories"""
    print("Clearing existing data...")
    db.query(ProductImage).delete()
    db.query(OrderTracking).delete()
    db.query(Payment).delete()
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.query(Product).delete()
    db.query(Category).delete()
    db.commit()
    print("Existing data cleared.")


def seed_categories():
    print("Seeding Categories...")
    category_map = {}
    for cat_data in CATEGORIES:
        cat = Category(**cat_data)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        category_map[cat_data["slug"]] = cat.id
        print(f"  Created: {cat.name}")
    return category_map


def seed_products(category_map):
    print("Seeding Products...")
    for prod_data in PRODUCTS:
        category_id = category_map.get(prod_data.pop("category_slug"))
        image_url = prod_data.pop("image")

        product = Product(
            **prod_data,
            category_id=category_id,
            is_active=True,
            discount=int(((prod_data["original_price"] - prod_data["price"]) / prod_data["original_price"]) * 100) if prod_data.get("original_price") else 0
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        # Add product image
        img = ProductImage(
            product_id=product.id,
            url=image_url,
            is_primary=True,
            sort_order=0
        )
        db.add(img)
        db.commit()
        print(f"  Created: {product.name}")


def seed_admin_user():
    print("Checking admin user...")
    admin_email = "bibekhowlader8@gmail.com"
    existing = db.query(User).filter(User.email == admin_email).first()

    if not existing:
        admin = User(
            name="Admin",
            email=admin_email,
            phone="+8801234567890",
            password_hash=pwd_context.hash("Admin123!"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"  Admin user created: {admin_email}")
    else:
        print(f"  Admin user exists: {admin_email}")
    return existing or admin


def seed_orders(user):
    print("Seeding Orders...")
    products = db.query(Product).all()
    if not products:
        print("  No products found, skipping orders.")
        return

    # Select some "hot" products that will have high sales (first 15 products)
    hot_products = products[:15]

    # Set stock levels on hot products to create urgency variety
    # These products will have high daily sales (~3-5 units/day)
    print("  Setting stock levels to trigger varied urgency...")
    for i, product in enumerate(hot_products):
        if i < 4:
            product.stock = random.randint(3, 8)  # Critical: ~1-2 days until stockout
        elif i < 8:
            product.stock = random.randint(12, 20)  # High: ~3-6 days until stockout
        elif i < 12:
            product.stock = random.randint(25, 40)  # Medium: ~7-12 days until stockout
        else:
            product.stock = random.randint(50, 80)  # Low: healthy stock
    db.commit()

    # Create 50 orders over the last 30 days for better predictions
    for i in range(50):
        order_num = f"ORD-{random.randint(10000, 99999)}"
        days_ago = random.randint(0, 30)
        created_at = datetime.now() - timedelta(days=days_ago)

        # 70% of orders are completed (delivered/shipped/processing)
        if random.random() < 0.7:
            status = random.choice([OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED])
            payment_status = PaymentStatus.COMPLETED
        else:
            status = random.choice([OrderStatus.PENDING, OrderStatus.CANCELLED])
            payment_status = PaymentStatus.PENDING

        # Create order
        order = Order(
            order_number=order_num,
            user_id=user.id,
            status=status,
            payment_status=payment_status,
            payment_method=random.choice(["bkash", "nagad", "cod"]),
            subtotal=0,
            shipping_cost=0,
            total=0,
            shipping_name=user.name,
            shipping_phone=user.phone or "01700000000",
            shipping_address="123 Test Street, Dhaka",
            shipping_city="Dhaka",
            created_at=created_at,
            updated_at=created_at
        )
        db.add(order)
        db.commit()
        db.refresh(order)

        # Add items - prefer hot products for realistic demand
        num_items = random.randint(1, 5)
        if random.random() < 0.6:  # 60% chance to include hot products
            selected_products = random.sample(hot_products, min(num_items, len(hot_products)))
        else:
            selected_products = random.sample(products, min(num_items, len(products)))

        subtotal = 0
        for prod in selected_products:
            qty = random.randint(1, 5)  # Higher quantities for better demand data
            price = prod.price
            total = price * qty
            subtotal += total

            item = OrderItem(
                order_id=order.id,
                product_id=prod.id,
                quantity=qty,
                price=price,
                total=total
            )
            db.add(item)

        # Update order totals
        order.subtotal = subtotal
        order.shipping_cost = 60 if subtotal < 5000 else 0
        order.total = subtotal + order.shipping_cost
        db.commit()

        if i < 10 or i % 10 == 0:
            print(f"  Created: {order.order_number} - {status.value} ({payment_status.value})")

    print(f"  ... created {50} orders total")


if __name__ == "__main__":
    print("\n" + "="*50)
    print("  SEEDING WEBSITE DATA")
    print("="*50 + "\n")

    clear_existing_data()
    category_map = seed_categories()
    seed_products(category_map)
    admin = seed_admin_user()
    seed_orders(admin)

    print("\n" + "="*50)
    print("  SEEDING COMPLETED!")
    print("="*50 + "\n")

    db.close()
