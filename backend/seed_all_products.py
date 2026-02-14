"""
Product Seeding Script - All Categories from PDF Files
This script adds all products from the 10 product sourcing PDFs.
Products are added WITHOUT images - upload photos later through admin panel.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.models import Category, Product, ProductSpecification, Base
import re

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

import random
import string
from datetime import datetime

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def generate_unique_sku():
    """Generate a unique SKU with timestamp and random string"""
    timestamp = datetime.now().strftime('%y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SKU-{timestamp}-{random_str}"

def get_midpoint_price(price_range):
    """Extract midpoint from price range like '800-1200'"""
    if isinstance(price_range, (int, float)):
        return float(price_range)
    match = re.search(r'(\d+)-(\d+)', str(price_range))
    if match:
        low, high = int(match.group(1)), int(match.group(2))
        return (low + high) / 2
    return 500  # Default price

def create_categories(db: Session):
    """Create all main categories and subcategories"""

    categories_data = [
        # 1. Cosmetics & Skincare
        {"name": "Cosmetics & Skincare", "slug": "cosmetics-skincare", "subcategories": [
            {"name": "Korean Skincare", "slug": "korean-skincare"},
            {"name": "Serums & Essences", "slug": "serums-essences"},
            {"name": "Cleansers & Toners", "slug": "cleansers-toners"},
            {"name": "Moisturizers & Masks", "slug": "moisturizers-masks"},
            {"name": "Sunscreen & SPF", "slug": "sunscreen-spf"},
            {"name": "Lip Care", "slug": "lip-care"},
            {"name": "Makeup", "slug": "makeup"},
            {"name": "Beauty Tools", "slug": "beauty-tools"},
        ]},

        # 2. Men's Grooming
        {"name": "Men's Grooming", "slug": "mens-grooming", "subcategories": [
            {"name": "Hair Styling", "slug": "hair-styling"},
            {"name": "Beard & Shaving", "slug": "beard-shaving"},
            {"name": "Men's Fragrances", "slug": "mens-fragrances"},
            {"name": "Wallets & Belts", "slug": "wallets-belts"},
            {"name": "Men's Accessories", "slug": "mens-accessories"},
            {"name": "Men's Skincare", "slug": "mens-skincare"},
        ]},

        # 3. Tech Accessories
        {"name": "Tech Accessories", "slug": "tech-accessories", "subcategories": [
            {"name": "Earbuds & Headphones", "slug": "earbuds-headphones"},
            {"name": "Speakers & Audio", "slug": "speakers-audio"},
            {"name": "Phone Cases & Protectors", "slug": "phone-cases-protectors"},
            {"name": "Phone Accessories", "slug": "phone-accessories"},
            {"name": "Power Banks", "slug": "power-banks"},
            {"name": "Chargers & Cables", "slug": "chargers-cables"},
            {"name": "Gaming Peripherals", "slug": "gaming-peripherals"},
            {"name": "Smartwatches & Bands", "slug": "smartwatches-bands"},
            {"name": "Storage & Memory", "slug": "storage-memory"},
        ]},

        # 4. Kitchen & Appliances
        {"name": "Kitchen & Appliances", "slug": "kitchen-appliances", "subcategories": [
            {"name": "Cooking Appliances", "slug": "cooking-appliances"},
            {"name": "Kitchenware", "slug": "kitchenware"},
            {"name": "Kitchen Storage", "slug": "kitchen-storage"},
            {"name": "Drinkware", "slug": "drinkware"},
        ]},

        # 5. Home Decor
        {"name": "Home Decor", "slug": "home-decor", "subcategories": [
            {"name": "Lighting & Lamps", "slug": "lighting-lamps"},
            {"name": "Wall Art & Decor", "slug": "wall-art-decor"},
            {"name": "Home Essentials", "slug": "home-essentials"},
            {"name": "Candles & Aromatherapy", "slug": "candles-aromatherapy"},
        ]},

        # 6. Ladies Fashion
        {"name": "Ladies Fashion", "slug": "ladies-fashion", "subcategories": [
            {"name": "Bags & Purses", "slug": "bags-purses"},
            {"name": "Jewelry", "slug": "jewelry"},
            {"name": "Women's Watches", "slug": "womens-watches"},
            {"name": "Hair Accessories", "slug": "hair-accessories"},
        ]},

        # 7. Baby & Kids
        {"name": "Baby & Kids", "slug": "baby-kids", "subcategories": [
            {"name": "Baby Care", "slug": "baby-care"},
            {"name": "Baby Feeding", "slug": "baby-feeding"},
            {"name": "Kids Fashion", "slug": "kids-fashion"},
            {"name": "Kids Accessories", "slug": "kids-accessories"},
        ]},

        # 8. Travel
        {"name": "Travel", "slug": "travel", "subcategories": [
            {"name": "Luggage & Bags", "slug": "luggage-bags"},
            {"name": "Travel Accessories", "slug": "travel-accessories"},
            {"name": "Travel Organizers", "slug": "travel-organizers"},
        ]},

        # 9. Toys & Collectibles
        {"name": "Toys & Collectibles", "slug": "toys-collectibles", "subcategories": [
            {"name": "Kids Toys", "slug": "kids-toys"},
            {"name": "Anime Figures", "slug": "anime-figures"},
            {"name": "Collectibles", "slug": "collectibles"},
            {"name": "Educational Toys", "slug": "educational-toys"},
        ]},

        # 10. Smart Home
        {"name": "Smart Home", "slug": "smart-home", "subcategories": [
            {"name": "Security Cameras", "slug": "security-cameras"},
            {"name": "Smart Locks", "slug": "smart-locks"},
            {"name": "Smart Lighting", "slug": "smart-lighting"},
            {"name": "Smart Devices", "slug": "smart-devices"},
        ]},
    ]

    created_categories = {}

    for cat_data in categories_data:
        # Check if parent category exists
        parent = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not parent:
            parent = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                description=f"Browse {cat_data['name']} products",
                is_active=True
            )
            db.add(parent)
            db.flush()
            print(f"Created category: {cat_data['name']}")

        created_categories[cat_data["slug"]] = parent

        # Create subcategories
        for sub_data in cat_data.get("subcategories", []):
            sub = db.query(Category).filter(Category.slug == sub_data["slug"]).first()
            if not sub:
                sub = Category(
                    name=sub_data["name"],
                    slug=sub_data["slug"],
                    description=f"Browse {sub_data['name']} products",
                    parent_id=parent.id,
                    is_active=True
                )
                db.add(sub)
                db.flush()
                print(f"  - Created subcategory: {sub_data['name']}")

            created_categories[sub_data["slug"]] = sub

    db.commit()
    return created_categories


def add_product(db: Session, categories: dict, name: str, category_slug: str,
                brand: str, specs: str, price_range: str, stock: int, notes: str = "", is_new: bool = True):
    """Add a single product to the database"""

    # Get category
    category = categories.get(category_slug)
    if not category:
        print(f"Warning: Category '{category_slug}' not found for product '{name}'")
        return None

    # Generate slug
    base_slug = slugify(f"{brand}-{name}" if brand else name)
    slug = base_slug
    counter = 1

    # Ensure unique slug
    while db.query(Product).filter(Product.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Calculate price
    price = get_midpoint_price(price_range)
    original_price = price * 1.2  # 20% markup for original price
    discount = 17  # ~17% discount

    # Check if product already exists by name and brand
    existing = db.query(Product).filter(
        Product.name == name,
        Product.brand == brand
    ).first()

    if existing:
        return existing

    # Create product
    product = Product(
        name=name,
        slug=slug,
        description=f"{specs}. {notes}".strip(". "),
        price=price,
        original_price=original_price,
        discount=discount,
        stock=stock,
        category_id=category.id,
        brand=brand,
        sku=generate_unique_sku(),
        is_featured=False,
        is_new=is_new,
        is_active=True,
        rating=0.0,
        review_count=0
    )

    db.add(product)
    return product


def seed_cosmetics(db: Session, categories: dict):
    """Seed Cosmetics & Skincare products"""
    print("\n--- Seeding Cosmetics & Skincare ---")

    products = [
        # Korean / Imported Products
        ("COSRX Advanced Snail 96 Mucin Essence", "korean-skincare", "COSRX", "96ml/100ml, Snail mucin power essence", "800-1200", 20, "Top seller BD. Must have batch code"),
        ("COSRX Low pH Good Morning Cleanser", "cleansers-toners", "COSRX", "150ml, Gel cleanser", "500-800", 15, "Very popular"),
        ("COSRX AHA/BHA Clarifying Toner", "cleansers-toners", "COSRX", "150ml, Exfoliating toner", "600-900", 10, ""),
        ("COSRX Acne Pimple Master Patch", "korean-skincare", "COSRX", "24 patches/pack", "200-350", 30, "Highest demand item"),
        ("Beauty of Joseon Relief Sun SPF50+", "sunscreen-spf", "Beauty of Joseon", "50ml, Rice + Probiotics sunscreen", "700-1100", 20, ""),
        ("Beauty of Joseon Glow Serum", "serums-essences", "Beauty of Joseon", "30ml, Propolis+Niacinamide, Brightening serum", "600-900", 15, ""),
        ("Beauty of Joseon Dynasty Cream", "moisturizers-masks", "Beauty of Joseon", "50ml, Premium moisturizer", "800-1200", 10, ""),
        ("Beauty of Joseon Ginseng Cleansing Oil", "cleansers-toners", "Beauty of Joseon", "210ml, Oil cleanser", "700-1000", 10, ""),
        ("Torriden DIVE-IN Serum", "serums-essences", "Torriden", "50ml, Hyaluronic Acid, Hydration serum", "700-1100", 15, "Trending"),
        ("Torriden DIVE-IN Toner Pad", "cleansers-toners", "Torriden", "60 pads, Toner pads", "600-900", 10, ""),
        ("SKIN1004 Madagascar Centella Ampoule", "serums-essences", "SKIN1004", "55ml/100ml, Centella soothing ampoule", "600-1000", 15, ""),
        ("SKIN1004 Centella Tone Brightening Capsule", "moisturizers-masks", "SKIN1004", "50ml, Tone-up cream", "700-1100", 10, ""),
        ("Innisfree Green Tea Seed Serum", "serums-essences", "Innisfree", "80ml, Premium hydrating serum", "800-1300", 10, ""),
        ("Innisfree Volcanic Pore Clay Mask", "moisturizers-masks", "Innisfree", "100ml, Pore-cleansing mask", "600-900", 10, ""),
        ("Laneige Water Sleeping Mask", "moisturizers-masks", "Laneige", "70ml, Premium overnight mask", "1000-1500", 10, ""),
        ("Laneige Lip Sleeping Mask", "lip-care", "Laneige", "20g, Berry lip mask", "500-800", 15, "Viral"),
        ("Etude House SoonJung pH 5.5 Relief Toner", "cleansers-toners", "Etude House", "180ml, Sensitive skin toner", "500-800", 10, ""),
        ("Missha M Perfect Cover BB Cream SPF42", "makeup", "Missha", "50ml, Korean BB cream", "600-1000", 10, ""),
        ("Some By Mi AHA BHA PHA 30 Days Miracle Toner", "cleansers-toners", "Some By Mi", "150ml, Acne miracle toner", "600-1000", 10, ""),
        ("Some By Mi Truecica Mineral Sunscreen SPF50", "sunscreen-spf", "Some By Mi", "50ml, Mineral sunscreen", "500-800", 10, ""),
        ("Peripera Ink Airy Velvet Lip Tint", "lip-care", "Peripera", "3.6g, Korean lip tint, multiple shades", "300-500", 20, ""),
        ("Rom&nd Juicy Lasting Tint", "lip-care", "Rom&nd", "5.5g, Viral K-beauty lip tint", "350-550", 20, ""),
        ("Dear Klairs Supple Preparation Toner", "cleansers-toners", "Dear Klairs", "180ml, Gentle hydrating toner", "700-1000", 10, ""),
        ("Dear Klairs Freshly Juiced Vitamin C Serum", "serums-essences", "Dear Klairs", "35ml, Vitamin C drop serum", "800-1200", 10, ""),
        ("Medicube Zero Pore Pad 2.0", "korean-skincare", "Medicube", "70 pads, Pore tightening pads", "600-1000", 10, "TikTok viral"),
        ("Anua Heartleaf 77% Soothing Toner", "cleansers-toners", "Anua", "250ml, Trending soothing toner", "700-1100", 15, ""),
        ("Anua Heartleaf Quercetinol Pore Cleansing Oil", "cleansers-toners", "Anua", "200ml, Double cleansing oil", "700-1000", 10, ""),
        ("Goodal Green Tangerine Vita C Dark Spot Serum", "serums-essences", "Goodal", "30ml, Vitamin C serum", "600-900", 10, ""),
        ("Korean Sheet Masks Mixed Pack", "moisturizers-masks", "Various", "10 sheets, Mediheal, Innisfree, Etude mix", "150-300", 30, ""),
        ("Korean Sunscreen Sampler Set", "sunscreen-spf", "Various", "3x50ml, BOJ + Skin1004 + SBM combo", "1500-2500", 10, ""),

        # Local / International Brands
        ("The Ordinary Niacinamide 10% + Zinc 1%", "serums-essences", "The Ordinary", "30ml, Best selling serum globally", "500-800", 15, ""),
        ("The Ordinary AHA 30% + BHA 2% Peeling Solution", "serums-essences", "The Ordinary", "30ml, Red peeling mask", "500-800", 10, ""),
        ("The Ordinary Hyaluronic Acid 2% + B5", "serums-essences", "The Ordinary", "30ml, Hydrating serum", "500-800", 10, ""),
        ("CeraVe Moisturizing Cream", "moisturizers-masks", "CeraVe", "340g/453g, Dermatologist recommended", "1000-1800", 10, ""),
        ("CeraVe Foaming Facial Cleanser", "cleansers-toners", "CeraVe", "236ml, Gentle cleanser", "800-1200", 10, ""),
        ("CeraVe AM Facial Moisturizing Lotion SPF30", "sunscreen-spf", "CeraVe", "52ml, Moisturizer + SPF", "800-1200", 10, ""),
        ("La Roche-Posay Effaclar Duo(+)", "korean-skincare", "La Roche-Posay", "40ml, Premium acne treatment", "1200-1800", 8, ""),
        ("Garnier Micellar Cleansing Water", "cleansers-toners", "Garnier", "400ml, Makeup remover", "400-600", 15, ""),
        ("Neutrogena Hydro Boost Water Gel", "moisturizers-masks", "Neutrogena", "50g, Gel moisturizer", "700-1100", 10, ""),
        ("Maybelline Fit Me Foundation", "makeup", "Maybelline", "30ml, Multiple shades for BD skin", "400-700", 15, ""),
        ("Maybelline Lash Sensational Mascara", "makeup", "Maybelline", "9.5ml, Volumizing mascara", "350-550", 15, ""),
        ("Maybelline Superstay Matte Ink Liquid Lipstick", "makeup", "Maybelline", "5ml, 16hr matte lipstick", "350-600", 20, ""),
        ("L'Oreal Paris Revitalift Hyaluronic Acid Serum", "serums-essences", "L'Oreal", "30ml, Anti-aging serum", "600-1000", 10, ""),
        ("NYX Professional Makeup Setting Spray", "makeup", "NYX", "60ml, Matte/Dewy finish", "400-700", 10, ""),
        ("Bioderma Sensibio H2O Micellar Water", "cleansers-toners", "Bioderma", "250ml, Sensitive skin cleanser", "700-1100", 10, ""),
        ("Vaseline Body Lotion", "moisturizers-masks", "Vaseline", "200-400ml, Cocoa/Aloe variants", "200-400", 15, "Imported"),
        ("Nivea Body Lotion", "moisturizers-masks", "Nivea", "200-400ml, Multiple variants", "200-400", 15, "Imported"),
        ("Professional Makeup Brush Set 15-piece", "beauty-tools", "Generic", "15 pcs/set, Professional brush set with case", "500-1200", 15, ""),
        ("Beauty Blender Sponge Set", "beauty-tools", "Generic", "3-5 pcs, Silicone or latex free", "100-300", 20, ""),
        ("Magnetic/Glue-on Eyelash Kit", "beauty-tools", "Generic", "5 pairs, Natural + dramatic styles mix", "150-400", 20, ""),
        ("Makeup Organizer Acrylic Storage", "beauty-tools", "Generic", "Multi-tier, Clear acrylic, rotating option", "400-1200", 10, ""),
        ("Jade/Rose Quartz Facial Roller", "beauty-tools", "Generic", "1 pc, Natural stone, gift box", "300-800", 15, ""),
        ("Derma Roller 0.25mm-0.5mm", "beauty-tools", "Generic", "1 pc, Titanium needles for skincare", "200-500", 15, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Cosmetics products")
    return count


def seed_mens_grooming(db: Session, categories: dict):
    """Seed Men's Grooming products"""
    print("\n--- Seeding Men's Grooming ---")

    products = [
        # Hair Styling & Care
        ("Premium Hair Wax/Clay/Pomade", "hair-styling", "Generic", "80-100g, Gatsby/Suavecito style, Matte/Glossy", "300-700", 20, ""),
        ("Strong Hold Hair Spray", "hair-styling", "Generic", "200-400ml, Schwarzkopf/Got2b style", "300-600", 15, ""),
        ("Argan/Keratin Hair Serum", "hair-styling", "Generic", "50-100ml, Anti-frizz, shine serum", "250-600", 15, ""),
        ("Biotin/Caffeine Hair Growth Serum", "hair-styling", "Generic", "50-100ml, Hair growth tonic", "400-900", 10, ""),
        ("Premium Imported Shampoo", "hair-styling", "Generic", "250-500ml, Anti-dandruff, volume, repair", "400-800", 10, ""),
        ("Temporary/Semi Hair Color Dye Kit", "hair-styling", "Generic", "Per kit, Grey cover, fashion colors", "200-500", 15, ""),

        # Beard & Shaving
        ("Premium Beard Oil", "beard-shaving", "Generic", "30-50ml, Natural oils, dropper bottle", "300-700", 15, ""),
        ("Beard Balm/Wax", "beard-shaving", "Generic", "50-60g, Shaping + conditioning", "300-600", 10, ""),
        ("Beard Growth Kit", "beard-shaving", "Generic", "Oil + Roller + Comb, Complete growth kit, gift box", "600-1200", 10, ""),
        ("Premium Metal Safety Razor", "beard-shaving", "Generic", "1 pc + 5 blades, Eco-friendly, premium shave", "500-1500", 10, ""),
        ("Premium Shaving Cream/Gel", "beard-shaving", "Generic", "150-200ml, Nivea/Gillette imported", "300-600", 10, ""),
        ("Aftershave Balm/Lotion", "beard-shaving", "Generic", "100ml, Soothing, alcohol-free option", "300-600", 10, ""),
        ("Rechargeable Beard Trimmer", "beard-shaving", "Generic", "1 pc, Multiple guard lengths", "800-2500", 10, ""),

        # Fragrances & Perfume
        ("EDP Perfume Long Lasting", "mens-fragrances", "Lattafa/Armaf", "50-100ml, Lattafa, Armaf, Al Haramain", "1000-3500", 10, ""),
        ("Premium Pocket Perfume/Attar", "mens-fragrances", "Generic", "6-12ml, Arabian attar, roll-on", "200-500", 25, ""),
        ("Imported Body Spray", "mens-fragrances", "Park Avenue/Fogg", "150-200ml, Park Avenue, Fogg imported", "300-600", 15, ""),
        ("Perfume Gift Set EDP + Deo", "mens-fragrances", "Generic", "Set, Premium gift box packaging", "1500-4000", 8, ""),
        ("Cologne Sampler Set", "mens-fragrances", "Generic", "5-6 x 5ml, Discovery set, popular scents", "800-1500", 10, ""),
        ("Premium Oud Arabian Perfume", "mens-fragrances", "Generic", "30-50ml, Genuine Oud, premium segment", "1500-5000", 8, ""),

        # Wallets, Belts & Accessories
        ("Genuine/Premium PU Leather Wallet", "wallets-belts", "Generic", "Bifold/Trifold, RFID blocking, gift box", "500-1500", 15, ""),
        ("Slim Cardholder Wallet", "wallets-belts", "Generic", "Slim, Minimalist, 6-10 card slots", "300-800", 15, ""),
        ("Premium Reversible Leather Belt", "wallets-belts", "Generic", "Free size/cut-to-fit, Auto-buckle or pin buckle", "400-1200", 15, ""),
        ("UV400 Polarized Sunglasses", "mens-accessories", "Generic", "1 pc + case, Aviator, Wayfarer, Sport", "400-1200", 15, ""),
        ("Men's Leather/Bead/Chain Bracelet", "mens-accessories", "Generic", "Adjustable, Leather wrap, bead, stainless", "150-500", 20, ""),
        ("Tie + Cufflink + Pocket Square Set", "mens-accessories", "Generic", "Set, Gift box, multiple colors", "500-1500", 10, ""),
        ("Premium Metal/Leather Keychain", "mens-accessories", "Generic", "1 pc, Car key, carabiner, leather", "100-400", 20, ""),
        ("Men's Laptop/Messenger Bag", "mens-accessories", "Generic", "Fits 14-15 inch, Premium PU leather or canvas", "1000-3000", 10, ""),

        # Face & Body Care
        ("Men's Face Wash Charcoal/Salicylic", "mens-skincare", "Generic", "100-150ml, Oil control, acne-fighting", "200-500", 15, ""),
        ("Men's Moisturizer SPF", "mens-skincare", "Generic", "50-100ml, Non-greasy, SPF30+", "300-700", 10, ""),
        ("Premium Imported Body Wash", "mens-skincare", "Generic", "250-400ml, Bath & Body Works style", "300-600", 10, ""),
        ("Imported Roll-on/Stick Deodorant", "mens-skincare", "Nivea/Dove", "50-75ml, Nivea, Dove imported", "250-500", 15, ""),
        ("Men's SPF Lip Balm", "mens-skincare", "Generic", "4-5g, Non-tinted, moisturizing", "100-250", 20, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Men's Grooming products")
    return count


def seed_tech_accessories(db: Session, categories: dict):
    """Seed Tech Accessories products"""
    print("\n--- Seeding Tech Accessories ---")

    products = [
        # Audio - Earbuds & Headphones
        ("Samsung Galaxy Buds FE", "earbuds-headphones", "Samsung", "ANC, IPX2, 6hr+21hr case, BT5.2", "3500-5000", 10, "Official BD warranty preferred"),
        ("Samsung Galaxy Buds3/Buds3 Pro", "earbuds-headphones", "Samsung", "ANC, 360 Audio, Hi-Fi, IP57", "5000-10000", 5, "Latest model"),
        ("Xiaomi Redmi Buds 5 Pro", "earbuds-headphones", "Xiaomi", "ANC 46dB, LDAC, 10hr battery", "2000-3500", 15, "Best budget ANC"),
        ("Xiaomi Redmi Buds 4 Active", "earbuds-headphones", "Xiaomi", "BT5.3, 12mm driver, 28hr total", "600-1000", 20, "Budget bestseller"),
        ("QCY T13 ANC 2", "earbuds-headphones", "QCY", "ANC 30dB, 6.5hr, BT5.3, app", "800-1300", 15, "Best under 1500"),
        ("QCY MeloBuds Pro ANC", "earbuds-headphones", "QCY", "ANC 43dB, LDAC, 8hr, multipoint", "1500-2500", 10, "Premium budget"),
        ("Edifier NeoBuds Pro 2", "earbuds-headphones", "Edifier", "ANC 50dB, Hi-Res, LDAC, IP54", "4000-6000", 8, "Audiophile quality"),
        ("Edifier W820NB Plus", "earbuds-headphones", "Edifier", "Over-ear ANC, 49hr, Hi-Res", "3500-5500", 8, "Best value over-ear"),
        ("Baseus Bowie MA10 ANC", "earbuds-headphones", "Baseus", "ANC 48dB, 8hr, BT5.3, low latency", "1500-2500", 10, "Gaming + music"),
        ("Haylou W1 ANC Over-Ear", "earbuds-headphones", "Haylou", "ANC 43dB, 60hr battery, foldable", "2000-3500", 8, "Budget over-ear ANC"),
        ("JBL Tune 230NC TWS", "earbuds-headphones", "JBL", "ANC, 10hr+30hr, JBL Pure Bass", "3000-5000", 8, "JBL brand power"),
        ("JBL Tune 520BT On-Ear", "earbuds-headphones", "JBL", "57hr battery, multipoint, foldable", "2500-4000", 8, "Popular on-ear"),
        ("Sony WF-C700N", "earbuds-headphones", "Sony", "ANC, DSEE, 15hr total, IPX4", "5000-8000", 5, "Sony premium"),
        ("Sony WH-CH520 On-Ear", "earbuds-headphones", "Sony", "50hr battery, multipoint, 30mm", "3000-5000", 5, "Best Sony budget"),
        ("Anker Soundcore Space A40", "earbuds-headphones", "Anker", "ANC 50dB, LDAC, 10hr, multipoint", "3000-5000", 8, "Premium TWS"),
        ("Anker Soundcore Life Q30", "earbuds-headphones", "Anker", "Over-ear ANC, Hi-Res, 40hr", "4000-6000", 5, "Bestselling ANC HP"),

        # Speakers & Audio
        ("Tronsmart Bang SE Speaker", "speakers-audio", "Tronsmart", "24W, IPX6, 24hr, RGB, party mode", "1500-2500", 8, "Portable party speaker"),
        ("JBL Clip 4 Speaker", "speakers-audio", "JBL", "5W, IP67, 10hr, carabiner clip", "2500-4000", 8, "Iconic portable speaker"),
        ("JBL Flip 6 Speaker", "speakers-audio", "JBL", "30W, IP67, 12hr, PartyBoost", "5000-8000", 5, "Premium portable"),
        ("Tribit StormBox Micro 2", "speakers-audio", "Tribit", "10W, IP67, 12hr, bike strap", "1500-2500", 8, "Ultra portable"),
        ("BOYA BY-V20 USB-C Wireless Mic", "speakers-audio", "BOYA", "2.4GHz, 50m range, noise cancel", "1500-3000", 10, "Content creator mic"),
        ("BOYA BY-WM3T2-U Type-C Lav Mic", "speakers-audio", "BOYA", "Clip-on, 2.4GHz, dual mic set", "2500-4500", 8, "Dual mic, interview"),
        ("Maono WM620 Wireless Mic", "speakers-audio", "Maono", "2.4GHz, 200m, 15hr, OLED screen", "2000-4000", 5, "Pro wireless mic"),
        ("Xiaomi Mi Computer Monitor Light Bar", "speakers-audio", "Xiaomi", "USB, adjustable color temp, no glare", "1500-2500", 8, "Desk setup essential"),

        # Phone Cases & Protectors
        ("Spigen Tough Armor/Ultra Hybrid iPhone 16", "phone-cases-protectors", "Spigen", "MagSafe, military drop test", "500-1200", 15, "Multiple models"),
        ("Nillkin CamShield Pro iPhone/Samsung", "phone-cases-protectors", "Nillkin", "Slide camera cover, PC+TPU", "400-800", 15, "iPhone 15/16, S24/S25"),
        ("Ringke Fusion X/Onyx Various", "phone-cases-protectors", "Ringke", "Clear/matte, military grade", "400-900", 15, "iPhone, Samsung, Pixel"),
        ("UAG Civilian/Pathfinder Case", "phone-cases-protectors", "UAG", "MIL-STD 810H, lightweight armor", "800-1500", 8, "Premium rugged"),
        ("ESR MagSafe Cases iPhone 16", "phone-cases-protectors", "ESR", "HaloLock, slim, clear/frosted", "300-700", 15, "Budget MagSafe"),
        ("Baseus Magnetic Phone Case iPhone", "phone-cases-protectors", "Baseus", "MagSafe compatible, 1.5mm thin", "300-600", 15, "Ultra slim option"),
        ("Whitestone Dome Glass iPhone/Samsung", "phone-cases-protectors", "Whitestone", "UV cured, full adhesive, 9H", "800-1500", 10, "Premium screen protector"),
        ("Nillkin H+ Pro Tempered Glass", "phone-cases-protectors", "Nillkin", "9H, 0.2mm, 2.5D, oleophobic", "200-400", 30, "Best value protector"),
        ("ESR Paper Feel Screen Protector iPad", "phone-cases-protectors", "ESR", "Matte, anti-glare, for drawing", "300-600", 10, "iPad Air/Pro"),

        # Phone Accessories
        ("Ugreen Adjustable Aluminum Phone Stand", "phone-accessories", "Ugreen", "Foldable, 4-7.9 inch, 270 deg", "300-600", 15, "Premium desk stand"),
        ("Baseus Car Phone Mount MagSafe/Clip", "phone-accessories", "Baseus", "Dashboard/vent, 360 rotation", "300-800", 15, "Multiple mount types"),
        ("Yongnuo YN-300 Air Ring Light 12 inch", "phone-accessories", "Yongnuo", "3200-5500K, USB, with tripod+remote", "1000-2500", 10, "Content creation"),
        ("Ulanzi ST-02S Phone Tripod Mount", "phone-accessories", "Ulanzi", "Cold shoe, landscape+portrait", "200-500", 10, "Vlogger essential"),
        ("DJI Osmo Mobile SE/6", "phone-accessories", "DJI", "3-axis gimbal, ActiveTrack, magnetic", "5000-10000", 3, "Best phone gimbal"),
        ("Zhiyun Smooth 5S Gimbal", "phone-accessories", "Zhiyun", "3-axis, AI tracking, fill light", "4000-7000", 3, "Alternative to DJI"),
        ("Apexel Phone Lens Kit 6-in-1", "phone-accessories", "Apexel", "Macro, wide, fisheye, 2x tele, CPL, star", "500-1200", 10, "Universal clip-on"),

        # Power Banks
        ("Xiaomi Redmi Power Bank 10000mAh 22.5W", "power-banks", "Xiaomi", "22.5W, dual USB, Type-C, slim", "800-1200", 20, "Budget bestseller"),
        ("Xiaomi Mi Power Bank 3 20000mAh 50W", "power-banks", "Xiaomi", "50W PD, USB-C, laptop charge", "1800-2800", 10, "Laptop compatible"),
        ("Anker PowerCore Slim 10000 PD", "power-banks", "Anker", "20W PD, USB-C, ultra slim", "1500-2500", 10, "Premium slim PB"),
        ("Anker PowerCore III Elite 25600 87W", "power-banks", "Anker", "87W PD, laptop charging, 25600mAh", "4000-7000", 5, "Laptop power bank"),
        ("Baseus Adaman Metal 20000mAh 65W", "power-banks", "Baseus", "65W PD, digital display, QC3.0", "2000-3500", 10, "Best mid-range PB"),
        ("Baseus Magnetic Mini 10000mAh", "power-banks", "Baseus", "MagSafe, 20W PD, wireless charge", "1500-2500", 10, "iPhone magnetic PB"),

        # Chargers & Cables
        ("Samsung Wireless Charger Pad 15W", "chargers-cables", "Samsung", "Qi, 15W fast, LED indicator", "800-1500", 10, "Official Samsung"),
        ("Anker MagGo Qi2 Wireless Charger Stand", "chargers-cables", "Anker", "Qi2, 15W, MagSafe, adjustable angle", "1200-2000", 8, "Premium wireless stand"),
        ("Baseus GaN5 Pro 100W Charger", "chargers-cables", "Baseus", "100W, 3-port (2C+1A), GaN, compact", "1500-2500", 10, "Laptop + phone charger"),
        ("Anker Nano II 65W GaN Charger", "chargers-cables", "Anker", "65W PD, single USB-C, ultra compact", "1200-2000", 10, "Most compact charger"),
        ("Ugreen Nexode 65W GaN 3-Port", "chargers-cables", "Ugreen", "65W, 2C+1A, foldable plug", "1200-2200", 10, "Best value GaN"),
        ("Anker PowerLine III Flow Type-C", "chargers-cables", "Anker", "100W, 6ft, silicone, tangle-free", "300-600", 20, "Premium cable"),
        ("Baseus Tungsten Gold Cable Type-C", "chargers-cables", "Baseus", "100W, 2m, zinc alloy, braided nylon", "200-400", 20, "Budget premium cable"),
        ("Ugreen USB-C to Lightning Cable MFi", "chargers-cables", "Ugreen", "MFi certified, 20W PD, braided", "300-600", 15, "iPhone fast charge"),
        ("Anker MagGo 3-in-1 Charging Station", "chargers-cables", "Anker", "MagSafe + Watch + Earbuds, foldable", "2000-4000", 8, "Apple ecosystem"),
        ("Baseus 3-in-1 Wireless Charger Stand", "chargers-cables", "Baseus", "15W phone + watch + earbuds, foldable", "1200-2500", 10, "Universal 3-in-1"),
        ("Baseus Car Charger 160W Dual USB-C", "chargers-cables", "Baseus", "160W total, PPS, PD3.0, dual C", "500-1000", 15, "Fastest car charger"),
        ("Ugreen Car Charger 69W USB-C+A", "chargers-cables", "Ugreen", "45W+24W, PD+QC, compact", "400-700", 15, "Value car charger"),

        # Gaming Peripherals
        ("Logitech G102/G203 Lightsync Mouse", "gaming-peripherals", "Logitech", "8000 DPI, RGB, 6 buttons, wired", "800-1500", 10, "Best entry gaming mouse"),
        ("Logitech G304/G305 Wireless Mouse", "gaming-peripherals", "Logitech", "12000 DPI, 250hr battery, wireless", "2000-3500", 8, "Budget wireless gaming"),
        ("Razer DeathAdder V3 HyperSpeed", "gaming-peripherals", "Razer", "30K sensor, 90hr, wireless, 55g", "4000-7000", 5, "Pro-grade wireless"),
        ("Razer Viper Mini Wired", "gaming-peripherals", "Razer", "8500 DPI, 6 buttons, 61g ultralight", "1500-2500", 8, "Popular lightweight"),
        ("Fantech Aria XD7 Wireless Mouse", "gaming-peripherals", "Fantech", "PAW3395, 26K DPI, 55g, 3-mode", "2000-3500", 8, "Premium budget wireless"),
        ("Fantech MAXFIT67 Mechanical Keyboard", "gaming-peripherals", "Fantech", "65%, hot-swap, RGB, Kailh switch", "2500-4000", 8, "Best value mech KB"),
        ("Royal Kludge RK84 Mechanical Keyboard", "gaming-peripherals", "Royal Kludge", "75%, hot-swap, tri-mode, RGB", "2000-3500", 8, "Popular tri-mode"),
        ("Keychron K2 V2/K6 Pro Mechanical", "gaming-peripherals", "Keychron", "65-75%, hot-swap, Mac+Win, BT", "4000-7000", 5, "Premium mech KB"),
        ("Razer BlackWidow V4 75%", "gaming-peripherals", "Razer", "Hot-swap, Razer switches, RGB, knob", "6000-10000", 3, "Top tier keyboard"),
        ("Fantech MP905 FIREFLY XXL Mouse Pad", "gaming-peripherals", "Fantech", "900x400mm, RGB edge, anti-slip", "500-1000", 15, "XXL RGB desk mat"),
        ("SteelSeries QcK Heavy XXL", "gaming-peripherals", "SteelSeries", "900x400mm, 6mm thick, cloth", "1000-2000", 8, "Pro gaming pad"),
        ("GameSir T4 Pro Controller", "gaming-peripherals", "GameSir", "Switch/PC/Android, 6-axis, vibration", "1200-2000", 10, "Best multi-platform"),
        ("8BitDo Ultimate C Controller", "gaming-peripherals", "8BitDo", "BT+2.4G, Hall effect, Android/PC/Switch", "1500-3000", 8, "Premium controller"),
        ("Xbox Wireless Controller", "gaming-peripherals", "Xbox", "BT, PC+Xbox+Android, textured grip", "3500-6000", 5, "Official Xbox"),
        ("Cooler Master Notepal X3 Cooling Pad", "gaming-peripherals", "Cooler Master", "200mm fan, adjustable, USB hub", "800-1500", 8, "17 inch laptop support"),
        ("Baseus USB-C Hub 8-in-1", "gaming-peripherals", "Baseus", "HDMI 4K, 3xUSB3, SD/TF, PD 100W", "1200-2500", 10, "Best value hub"),
        ("Ugreen USB-C Hub 10-in-1 Dock", "gaming-peripherals", "Ugreen", "HDMI 4K, RJ45, VGA, 3xUSB, PD 100W", "2000-4000", 5, "Premium dock"),
        ("Anker PowerConf C200 Webcam 2K", "gaming-peripherals", "Anker", "2K, auto-focus, noise cancel mic", "2000-3500", 5, "Best 2K webcam"),
        ("Logitech C920x/C922 Pro Webcam", "gaming-peripherals", "Logitech", "1080p 30fps, stereo mic, auto light", "3000-5000", 5, "Industry standard"),

        # Smartwatches & Bands
        ("Samsung Galaxy Watch FE 40mm", "smartwatches-bands", "Samsung", "AMOLED, GPS, BIA, IP68, WearOS", "6000-10000", 5, "Best WearOS"),
        ("Samsung Galaxy Fit3 Band", "smartwatches-bands", "Samsung", "1.6 inch AMOLED, 13 days, 5ATM, 100+ faces", "2000-3500", 8, "Best Samsung band"),
        ("Xiaomi Smart Band 9/Band 9 Pro", "smartwatches-bands", "Xiaomi", "1.62 inch AMOLED, 150+ faces, SpO2, 16 days", "1500-3000", 15, "Budget bestseller"),
        ("Xiaomi Redmi Watch 5 Active", "smartwatches-bands", "Xiaomi", "1.96 inch LCD, BT call, 18 days, 5ATM", "1200-2000", 15, "Value smartwatch"),
        ("Xiaomi Watch S4/S3", "smartwatches-bands", "Xiaomi", "1.43 inch AMOLED, GPS, eSIM, 150+ sports", "5000-9000", 5, "Premium Xiaomi watch"),
        ("Amazfit Bip 5/Bip 5 Unity", "smartwatches-bands", "Amazfit", "1.91 inch HD, GPS, Alexa, 10 days, 120+ sports", "2500-4000", 10, "Best value GPS watch"),
        ("Amazfit GTR 4/GTS 4", "smartwatches-bands", "Amazfit", "1.43 inch AMOLED, GPS, 14 days, BT call", "5000-9000", 5, "Premium Amazfit"),
        ("Amazfit T-Rex Ultra/T-Rex 3", "smartwatches-bands", "Amazfit", "1.39 inch AMOLED, MIL-STD, dual GPS, 20 days", "8000-15000", 3, "Rugged premium"),
        ("Haylou Watch S8/Solar Pro", "smartwatches-bands", "Haylou", "1.96 inch AMOLED, BT call, SpO2, 15 days", "1500-2500", 10, "Budget AMOLED"),
        ("Haylou RS5 Smart Watch", "smartwatches-bands", "Haylou", "1.43 inch AMOLED, GPS, 100+ sports, 12 days", "2500-4000", 8, "Mid-range GPS"),
        ("Noise ColorFit Pro 5 Max", "smartwatches-bands", "Noise", "1.96 inch AMOLED, BT call, AI coach, 7 days", "2000-3500", 8, "Indian premium brand"),
        ("Apple Watch SE Compatible Straps", "smartwatches-bands", "Generic", "Silicone/Metal/Leather, 41-45mm", "200-600", 20, "Apple Watch straps"),
        ("Samsung Watch Compatible Straps", "smartwatches-bands", "Generic", "20mm/22mm, silicone/metal/leather", "200-500", 20, "Galaxy Watch straps"),
        ("Xiaomi/Amazfit Compatible Straps", "smartwatches-bands", "Generic", "Universal 20-22mm bands", "150-400", 20, "Universal watch bands"),

        # Storage & Memory
        ("Samsung EVO Plus MicroSD 64GB", "storage-memory", "Samsung", "U3, V30, A2, 160MB/s read", "400-700", 20, "Camera/phone storage"),
        ("Samsung EVO Plus MicroSD 128GB", "storage-memory", "Samsung", "U3, V30, A2, 160MB/s read", "600-1000", 20, "Most popular capacity"),
        ("Samsung EVO Plus MicroSD 256GB", "storage-memory", "Samsung", "U3, V30, A2, 160MB/s read", "1000-1500", 10, "High capacity"),
        ("Samsung PRO Endurance MicroSD 128GB", "storage-memory", "Samsung", "100K hrs, for dashcam/CCTV", "800-1300", 10, "Surveillance rated"),
        ("SanDisk Ultra MicroSD 64GB", "storage-memory", "SanDisk", "A1, 140MB/s, UHS-I", "350-600", 20, "Budget reliable"),
        ("SanDisk Ultra MicroSD 128GB", "storage-memory", "SanDisk", "A1, 140MB/s, UHS-I", "500-900", 15, "Budget reliable"),
        ("Samsung T7 Shield Portable SSD 1TB", "storage-memory", "Samsung", "1050MB/s, IP65, USB-C, rugged", "5000-8000", 5, "Premium portable SSD"),
        ("Samsung FIT Plus USB Flash Drive 128GB", "storage-memory", "Samsung", "400MB/s, USB 3.1, ultra small", "600-1000", 10, "Tiny fast flash drive"),
        ("Ugreen USB-C to 3.5mm Audio Adapter", "storage-memory", "Ugreen", "Hi-Res DAC, 32bit/384kHz", "200-400", 15, "For phones w/o jack"),
        ("Baseus Eli Sport 1 Open-Ear Bone", "storage-memory", "Baseus", "Open-ear, BT5.3, 30hr, IPX4", "1500-2500", 8, "Bone conduction style"),
        ("Ugreen Desk Cable Organizer Silicone", "storage-memory", "Ugreen", "5 slots, adhesive, silicone", "100-250", 15, "Desk cable management"),
        ("Xiaomi Electric Air Pump Portable", "storage-memory", "Xiaomi", "150 PSI, USB-C, LED, tire/ball/bike", "1000-2000", 8, "Portable inflator"),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Tech Accessories products")
    return count


def seed_kitchen_appliances(db: Session, categories: dict):
    """Seed Kitchen & Appliances products"""
    print("\n--- Seeding Kitchen & Appliances ---")

    products = [
        # Cooking Appliances
        ("Digital Air Fryer 4-6L", "cooking-appliances", "Generic", "4-6L, Digital display, non-stick basket", "4000-8000", 8, ""),
        ("Compact Air Fryer 2-3L", "cooking-appliances", "Generic", "2-3L, For small families/students", "2500-4500", 10, ""),
        ("Premium Multi-Cook Rice Cooker", "cooking-appliances", "Generic", "1.5-3L, Multi-cook, non-stick pot", "1500-4000", 8, ""),
        ("Temperature Control Electric Kettle", "cooking-appliances", "Generic", "1-1.7L, Variable temp, keep warm", "800-2000", 10, ""),
        ("Basic Stainless Electric Kettle", "cooking-appliances", "Generic", "1.5-2L, Auto shut-off, fast boil", "500-1000", 15, ""),
        ("2-in-1 Sandwich/Waffle Maker", "cooking-appliances", "Generic", "1 pc, Changeable plates", "800-2000", 10, ""),
        ("Portable Induction Cooktop", "cooking-appliances", "Generic", "1 pc, 2000W, multiple modes", "2000-5000", 8, ""),
        ("Smokeless Electric Grill/BBQ", "cooking-appliances", "Generic", "1 pc, Non-stick, removable tray", "2000-5000", 5, ""),
        ("Hand Blender/Immersion Blender", "cooking-appliances", "Generic", "1 pc + attachments, Multi-speed, whisk/chopper", "800-2500", 10, ""),
        ("Portable Juice Blender/Smoothie Maker", "cooking-appliances", "Generic", "350-500ml, USB rechargeable, portable", "500-1500", 15, ""),
        ("Multi-Function Food Processor", "cooking-appliances", "Generic", "1 pc, Chop, slice, shred, knead", "2500-6000", 5, ""),
        ("Coffee Maker/French Press", "cooking-appliances", "Generic", "350-600ml, French press or pour-over set", "400-1500", 10, ""),
        ("Electric Egg Boiler 7-14 eggs", "cooking-appliances", "Generic", "1 pc, Auto shut-off, multi-capacity", "400-800", 10, ""),

        # Kitchenware & Utensils
        ("Non-Stick Cookware Set 3-5 pcs", "kitchenware", "Generic", "Set, Premium coating, induction ok", "2000-5000", 5, ""),
        ("Cast Iron Skillet/Pan 10-12 inch", "kitchenware", "Generic", "10-12 inch, Pre-seasoned, heavy duty", "800-2500", 8, ""),
        ("Stainless Steel Knife Set 6-8 pcs", "kitchenware", "Generic", "Set + block, Professional grade, wooden block", "800-3000", 8, ""),
        ("Silicone Utensil Set 10-12 pcs", "kitchenware", "Generic", "Set, Heat resistant, non-scratch", "500-1200", 10, ""),
        ("Bamboo/Premium Plastic Cutting Board Set", "kitchenware", "Generic", "Set of 2-3, Anti-slip, juice groove", "300-800", 10, ""),
        ("Spice Rack/Container Set 12-20 pcs", "kitchenware", "Generic", "Set, Glass/airtight, labeled lids", "500-1500", 8, ""),
        ("Multi-Layer Insulated Lunch Box", "kitchenware", "Generic", "2-3 layer, Stainless steel, carry bag", "400-1000", 15, ""),
        ("Premium Insulated Water Bottle", "drinkware", "Generic", "500-1000ml, 24hr cold, 12hr hot, Steel", "400-1200", 15, ""),
        ("Thermal Flask/Travel Coffee Mug", "drinkware", "Generic", "350-500ml, Leak-proof lid, premium design", "400-1000", 15, ""),
        ("Premium Baking Set 10-15 pcs", "kitchenware", "Generic", "Set, Silicone molds + tools + trays", "1000-3000", 5, ""),

        # Kitchen Storage & Organization
        ("Airtight Food Container Set 10-15 pcs", "kitchen-storage", "Generic", "Set, BPA-free, stackable, labeled", "500-1500", 10, ""),
        ("Fridge Organizer Bins Set 6-8", "kitchen-storage", "Generic", "Set, Clear, stackable, with lids", "400-1000", 10, ""),
        ("Premium 2-Tier Dish Drying Rack", "kitchen-storage", "Generic", "1 pc, Stainless steel, drip tray", "500-1500", 8, ""),
        ("Paper Towel Holder/Kitchen Roll Stand", "kitchen-storage", "Generic", "1 pc, Stainless/wood, countertop", "200-500", 10, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Kitchen & Appliances products")
    return count


def seed_home_decor(db: Session, categories: dict):
    """Seed Home Decor products"""
    print("\n--- Seeding Home Decor ---")

    products = [
        # Lighting & Ambiance
        ("Galaxy/Star Projector Light", "lighting-lamps", "Generic", "1 pc, Remote, multiple modes, USB", "500-2000", 10, ""),
        ("Sunset Lamp Projector", "lighting-lamps", "Generic", "1 pc, Aesthetic room light, IG viral", "300-800", 15, ""),
        ("LED Neon Sign Custom/Pre-made", "lighting-lamps", "Generic", "Various text, 'Hello', 'Love', custom words", "800-3000", 8, ""),
        ("Himalayan Salt Lamp Premium", "lighting-lamps", "Generic", "2-5kg, Natural, USB or cord, dimmer", "500-1500", 8, ""),
        ("Fairy Lights/String Lights USB/Solar", "lighting-lamps", "Generic", "3-10m, Warm white, copper wire", "150-500", 20, ""),
        ("Rechargeable Touch Dimmable Table Lamp", "lighting-lamps", "Generic", "1 pc, 3 color temps, portable", "400-1200", 10, ""),
        ("Metal/Glass Candle Holder Set", "candles-aromatherapy", "Generic", "Set of 3-5, Pillar, tealight, decorative", "400-1200", 10, ""),
        ("Ultrasonic Aromatherapy Diffuser", "candles-aromatherapy", "Generic", "200-400ml, LED mood light, timer", "800-2500", 10, ""),
        ("Premium Scented Candle Gift Set", "candles-aromatherapy", "Generic", "3-6 candles, Soy wax, 30hr+ burn each", "500-1500", 10, ""),
        ("3D Printed Moon/Planet Lamp", "lighting-lamps", "Generic", "12-18cm, Touch control, rechargeable", "400-1200", 10, ""),

        # Wall Decor & Art
        ("Wall Art Canvas Print Set 3-5", "wall-art-decor", "Generic", "Various sizes, Abstract, Islamic, Nature", "600-2500", 8, ""),
        ("Photo Frame Set Gallery Wall 8-12 pcs", "wall-art-decor", "Generic", "Various sizes, Black/white/wood finish", "600-2000", 8, ""),
        ("Decorative Wall-Mount Mirror", "wall-art-decor", "Generic", "Round/Irregular, Gold frame, aesthetic shape", "800-3000", 5, ""),
        ("Macramé Wall Hanging", "wall-art-decor", "Generic", "1 pc, Boho, cotton, handcrafted look", "400-1200", 10, ""),
        ("Floating Shelves Set of 3", "wall-art-decor", "Generic", "Set, Wall-mounted, wood/metal", "500-1500", 8, ""),
        ("Premium Silent Wall Clock", "wall-art-decor", "Generic", "10-14 inch, Silent tick, modern design", "500-1500", 8, ""),
        ("Islamic Wall Art/Calligraphy Frame", "wall-art-decor", "Generic", "Various, Ayatul Kursi, Allah, premium", "400-2000", 10, ""),

        # Home Essentials & Decor
        ("Throw Pillow Covers Set of 4", "home-essentials", "Generic", "18x18 inch, Velvet/linen, embroidered", "400-1000", 10, ""),
        ("Premium Artificial Plant/Flower", "home-essentials", "Generic", "Small-Medium, Realistic, with pot/vase", "200-800", 15, ""),
        ("Minimalist Ceramic Vase", "home-essentials", "Generic", "6-12 inch, Matt finish, Nordic style", "300-1200", 8, ""),
        ("Premium Rug/Door Mat", "home-essentials", "Generic", "Various sizes, Abstract, geometric, washable", "400-1500", 8, ""),
        ("Premium Tissue Box Cover", "home-essentials", "Generic", "1 pc, Leather/wooden/ceramic", "200-600", 10, ""),
        ("Premium Desk Organizer", "home-essentials", "Generic", "1 pc, Wooden/acrylic, multi-slot", "300-1000", 10, ""),
        ("Premium Coaster Set 6 pcs", "home-essentials", "Generic", "6 pcs + holder, Cork, marble, ceramic", "200-600", 10, ""),
        ("Premium Bookend Set", "home-essentials", "Generic", "1 pair, Metal, marble, artistic", "300-1000", 8, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Home Decor products")
    return count


def seed_ladies_fashion(db: Session, categories: dict):
    """Seed Ladies Fashion products"""
    print("\n--- Seeding Ladies Fashion ---")

    products = [
        # Bags & Purses
        ("PU Leather Crossbody Sling Bag", "bags-purses", "Generic", "Various colors, Gold hardware, adjustable strap", "500-1500", 15, ""),
        ("Premium Canvas Tote Bag", "bags-purses", "Generic", "Large, Sturdy canvas, zip top option", "400-1200", 15, ""),
        ("Korean Style Mini Backpack", "bags-purses", "Generic", "Small, Trendy, multiple pockets", "600-1800", 10, ""),
        ("Clutch/Evening Bag", "bags-purses", "Generic", "Various, Chain strap, party/occasion", "400-2000", 10, ""),
        ("Women's Laptop Bag 13-15 inch", "bags-purses", "Generic", "Fits 15 inch, Padded, professional look", "800-2500", 10, ""),
        ("Branded Style Shoulder Bag", "bags-purses", "Generic", "Medium, Premium PU, branded look", "1000-3500", 8, ""),
        ("Eco-Friendly Jute Craft Bag", "bags-purses", "Generic", "Various, Handcrafted, sustainable", "200-600", 15, ""),
        ("Makeup Pouch/Organizer", "bags-purses", "Generic", "Various sizes, Waterproof lining, compartments", "200-700", 20, ""),
        ("Mini Quilted Chain Bag", "bags-purses", "Generic", "Small, Quilted PU, gold/silver chain", "500-1800", 10, ""),
        ("Drawstring Bucket Bag", "bags-purses", "Generic", "Medium, Trendy drawstring closure", "600-1500", 8, ""),
        ("Woven/Straw Summer Bag", "bags-purses", "Generic", "Various, Beach, summer, boho style", "300-800", 10, ""),
        ("Women's Belt Bag/Fanny Pack", "bags-purses", "Generic", "Adjustable, Hands-free, travel-friendly", "300-800", 10, ""),

        # Jewelry
        ("Korean Style Earrings Set 5-6 pairs", "jewelry", "Generic", "Mixed styles, Studs, hoops, drops mix", "150-500", 25, ""),
        ("Gold Plated Statement Necklace", "jewelry", "Generic", "1 pc, Eye-catching, party wear", "300-1500", 10, ""),
        ("Minimal Layered Chain Necklace", "jewelry", "Generic", "2-3 layers, Dainty, everyday wear", "200-800", 15, ""),
        ("Charm/Beaded Bracelet Set 3-5 pcs", "jewelry", "Generic", "3-5 pcs/set, Stackable, mixed styles", "150-600", 15, ""),
        ("Bohemian/Minimal Anklet", "jewelry", "Generic", "Adjustable, Delicate chain styles", "100-400", 10, ""),
        ("Hair Accessories Set Clips/Claws", "hair-accessories", "Generic", "5-10 pcs, Claw clips trending", "100-500", 20, ""),
        ("Pearl Jewelry Set Earring + Necklace", "jewelry", "Generic", "Set, Wedding/gift quality", "500-2000", 10, ""),
        ("Adjustable Ring Set 5-7 pcs", "jewelry", "Generic", "Mixed sizes, Minimalist + statement mix", "150-500", 15, ""),
        ("Hijab Pin/Brooch/Scarf Pin Set", "jewelry", "Generic", "Set of 6-8, Pearl, crystal, gold designs", "100-500", 15, ""),
        ("Customizable Initial Pendant Necklace", "jewelry", "Generic", "1 pc, A-Z initials, gold/silver", "200-600", 10, ""),
        ("Gold Plated Hoop Earrings 3 sizes", "jewelry", "Generic", "Set of 3, Small, medium, large hoops", "200-500", 15, ""),
        ("Premium Brooch/Saree Pin", "jewelry", "Generic", "1 pc, Crystal, traditional designs", "150-600", 10, ""),
        ("Waist Chain/Belly Chain", "jewelry", "Generic", "Adjustable, Trendy, for saree/occasion", "200-500", 10, ""),
        ("Premium Jewelry Box/Organizer", "jewelry", "Generic", "1 pc, Velvet lined, multi-tier", "500-2000", 8, ""),

        # Women's Watches
        ("Minimalist Watch Mesh Band", "womens-watches", "Generic", "1 pc, Clean dial, rose gold/silver", "600-2000", 10, ""),
        ("Women's Smart Watch/Fitness Band", "womens-watches", "Generic", "1 pc, Heart rate, notifications", "1500-5000", 10, ""),
        ("Vintage/Retro Watch", "womens-watches", "Generic", "1 pc, Leather strap, classic dial", "500-1500", 8, ""),
        ("Couple Watch Set His + Hers", "womens-watches", "Generic", "Set of 2, Gift box included", "1200-4000", 8, ""),
        ("Digital Watch Casio Style", "womens-watches", "Generic", "1 pc, Retro digital, alarm", "400-1200", 10, ""),
        ("Ceramic/Rose Gold Watch", "womens-watches", "Generic", "1 pc, Premium finish, durable", "1000-3500", 5, ""),
        ("Fashion Chain Link Watch", "womens-watches", "Generic", "1 pc, Gold/silver chain bracelet style", "500-1500", 8, ""),
        ("Watch + Bracelet Gift Set", "womens-watches", "Generic", "Set, Watch + matching bracelet, box", "800-2500", 8, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Ladies Fashion products")
    return count


def seed_baby_kids(db: Session, categories: dict):
    """Seed Baby & Kids products"""
    print("\n--- Seeding Baby & Kids ---")

    products = [
        # Baby Care & Essentials
        ("BPA Free Anti-Colic Baby Bottle", "baby-care", "Generic", "150ml + 240ml, Natural nipple, wide neck", "300-1000", 20, ""),
        ("Manual Breast Pump", "baby-care", "Generic", "1 pc, BPA-free, portable", "500-1500", 10, ""),
        ("Electric Wearable Breast Pump", "baby-care", "Generic", "1 pc, Hands-free, USB rechargeable", "2000-5000", 8, ""),
        ("Premium Baby Wipes 80-pack", "baby-care", "Generic", "80 wipes/pack, Fragrance-free, alcohol-free", "150-400", 30, ""),
        ("Diaper Bag Backpack", "baby-care", "Generic", "1 pc, USB port, insulated pockets", "800-2500", 10, ""),
        ("Baby Grooming Kit 8-10 pcs", "baby-care", "Generic", "Kit, Nail clipper, comb, thermometer", "200-600", 10, ""),
        ("BPA Free Silicone Teething Toy", "baby-care", "Generic", "1-2 pcs, Food-grade silicone, textured", "200-600", 20, ""),
        ("WiFi Video Baby Monitor", "baby-care", "Generic", "1 pc, Night vision, 2-way audio", "2000-8000", 5, ""),
        ("Muslin Swaddle Blanket Set 3 pcs", "baby-care", "Generic", "Set of 3, Breathable, soft cotton", "300-1000", 15, ""),
        ("Ergonomic Baby Carrier/Hip Seat", "baby-care", "Generic", "1 pc, Ergonomic, 3-36 months", "1000-3000", 8, ""),
        ("Lightweight Foldable Baby Stroller", "baby-care", "Generic", "1 pc, One-hand fold, sun canopy", "5000-15000", 3, ""),
        ("Foldable Baby Bath Tub", "baby-care", "Generic", "1 pc, Foldable, temperature gauge", "800-2000", 5, ""),
        ("Baby Mattress/Sleeping Pad", "baby-care", "Generic", "1 pc, Breathable, waterproof cover", "500-1500", 8, ""),
        ("Diaper Cream/Rash Cream", "baby-care", "Generic", "50-100g, Zinc oxide, gentle formula", "200-500", 15, ""),

        # Kids Fashion & Accessories
        ("Kids Character T-Shirts Marvel/Disney", "kids-fashion", "Generic", "Ages 3-12, Licensed print, cotton", "250-600", 20, ""),
        ("Baby Romper/Bodysuit Set 3 pcs", "kids-fashion", "Generic", "0-24 months, Snap button, cotton", "300-800", 15, ""),
        ("Kids LED Light-Up Sneakers", "kids-fashion", "Generic", "Various sizes, USB rechargeable, 7 colors", "500-1500", 10, ""),
        ("Kids Cartoon/School Backpack", "kids-accessories", "Generic", "Various designs, Padded, water-resistant", "400-1200", 10, ""),
        ("Baby Hat/Cap/Headband Set 3-5", "kids-accessories", "Generic", "Set of 3-5, Cotton, sun protection", "100-400", 15, ""),
        ("Kids UV400 Sunglasses", "kids-accessories", "Generic", "1 pc + case, Flexible frame, UV protection", "150-500", 15, ""),
        ("Kids Raincoat/Poncho", "kids-fashion", "Generic", "Ages 3-12, Waterproof, fun designs", "200-600", 10, ""),
        ("Baby Socks/Booties Set 5-7 pairs", "kids-accessories", "Generic", "Set, Anti-slip sole, cotton", "150-400", 15, ""),
        ("Kids Formal Wear Shirt + Pant Set", "kids-fashion", "Generic", "Ages 2-10, Eid/wedding, bow tie set", "500-1500", 8, ""),
        ("Kids Character Pajama Set", "kids-fashion", "Generic", "Ages 2-12, Cotton, comfortable", "300-700", 10, ""),

        # Feeding & Mealtime
        ("Silicone Suction Plate/Bowl Set", "baby-feeding", "Generic", "Set, BPA-free, divided sections", "300-800", 15, ""),
        ("Spill-Proof Sippy Cup/Straw Cup", "baby-feeding", "Generic", "1 pc, Weighted straw, handles", "200-600", 15, ""),
        ("Baby Food Maker/Blender", "baby-feeding", "Generic", "1 pc, Steam + blend, all-in-one", "1500-4000", 5, ""),
        ("Waterproof Silicone Bib Set 3-4 pcs", "baby-feeding", "Generic", "Set, Food catcher pocket", "150-400", 15, ""),
        ("Snack Container/Formula Dispenser", "baby-feeding", "Generic", "1 pc, Multi-compartment, portable", "200-500", 10, ""),
        ("Kids Character Water Bottle", "baby-feeding", "Generic", "350-500ml, Leak-proof, BPA-free", "200-600", 15, ""),
        ("Silicone Baby Spoon + Fork Set", "baby-feeding", "Generic", "Set of 4-6, Soft tip, easy grip", "150-400", 15, ""),
        ("Portable High Chair/Booster Seat", "baby-feeding", "Generic", "1 pc, Foldable, portable", "1500-4000", 5, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Baby & Kids products")
    return count


def seed_travel(db: Session, categories: dict):
    """Seed Travel products"""
    print("\n--- Seeding Travel ---")

    products = [
        # Luggage & Bags
        ("20 inch Cabin Luggage Hard Shell Spinner", "luggage-bags", "Generic", "20 inch, TSA lock, 360° wheels", "3000-8000", 5, ""),
        ("24 inch Medium Luggage Hard Shell", "luggage-bags", "Generic", "24 inch, Expandable, TSA lock", "5000-12000", 3, ""),
        ("Weekend/Gym Duffle Bag", "luggage-bags", "Generic", "30-50L, Shoe compartment, strap", "800-2500", 10, ""),
        ("Anti-Theft Travel Backpack USB", "luggage-bags", "Generic", "20-30L, Hidden zippers, laptop fit", "1200-3500", 10, ""),
        ("Packing Cubes Set 6-8 pcs", "travel-organizers", "Generic", "Set, Mesh top, different sizes", "400-1000", 15, ""),
        ("Foldable Garment Bag", "luggage-bags", "Generic", "1 pc, Suit/dress protection", "300-800", 8, ""),
        ("Shoe Bag Set 3-4 pcs", "travel-organizers", "Generic", "Set, Waterproof, ventilated", "150-400", 15, ""),
        ("Hanging Waterproof Toiletry Bag", "travel-organizers", "Generic", "1 pc, Hook, compartments", "300-800", 15, ""),
        ("Compression Bag Set Vacuum 5-8", "travel-organizers", "Generic", "Set of 5-8, No pump needed, roll to compress", "300-700", 10, ""),
        ("Elastic Protective Luggage Cover", "luggage-bags", "Generic", "Various sizes, Washable, scratch protect", "200-500", 10, ""),

        # Travel Gadgets & Essentials
        ("Memory Foam Neck Pillow Premium", "travel-accessories", "Generic", "1 pc, Washable cover, compact", "300-1000", 15, ""),
        ("Digital Luggage Scale", "travel-accessories", "Generic", "1 pc, Up to 50kg, LCD display", "300-700", 15, ""),
        ("Universal All-in-One Travel Adapter", "travel-accessories", "Generic", "1 pc, USB-C + USB-A, 150+ countries", "400-1200", 15, ""),
        ("TSA-Approved Lock", "travel-accessories", "Generic", "1 pc, Combination padlock", "200-500", 20, ""),
        ("Silk Eye Mask + Ear Plug Set", "travel-accessories", "Generic", "Set, Premium silk, memory foam plugs", "150-500", 15, ""),
        ("RFID Passport Cover/Travel Wallet", "travel-accessories", "Generic", "1 pc, RFID blocking, card slots", "200-800", 15, ""),
        ("IPX8 Waterproof Phone Pouch", "travel-accessories", "Generic", "1 pc, Touch screen works, universal", "150-400", 20, ""),
        ("Foldable Silicone Water Bottle", "travel-accessories", "Generic", "500ml, Collapsible, BPA-free", "200-600", 10, ""),
        ("Mini Travel Iron/Steamer", "travel-accessories", "Generic", "1 pc, Dual voltage, compact", "800-2000", 5, ""),
        ("Premium Luggage Tag Set 2-4 pcs", "travel-accessories", "Generic", "Set, Leather/silicone, name card", "100-300", 15, ""),
        ("Travel Pillow + Blanket Combo", "travel-accessories", "Generic", "Set, Compact, carrier bag", "400-1000", 10, ""),
        ("Portable Door Lock Safety", "travel-accessories", "Generic", "1 pc, Hotel room extra security", "200-500", 10, ""),
        ("Travel Mesh Laundry Bag Set", "travel-organizers", "Generic", "Set of 3, Separate dirty clothes", "100-300", 10, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Travel products")
    return count


def seed_toys_collectibles(db: Session, categories: dict):
    """Seed Toys & Collectibles products"""
    print("\n--- Seeding Toys & Collectibles ---")

    products = [
        # Kids Toys
        ("LEGO Compatible Building Blocks 200+ pcs", "kids-toys", "Generic", "200-500 pcs, City, Space, Castle themes", "400-2500", 10, ""),
        ("High Speed Remote Control Car", "kids-toys", "Generic", "1 pc, Rechargeable, 20km/h+", "800-3000", 8, ""),
        ("Mini Drone Camera Optional", "kids-toys", "Generic", "1 pc, Foldable, auto hover", "1500-4000", 5, ""),
        ("Magnetic Tiles Building Set 64+ pcs", "kids-toys", "Generic", "64-120 pcs, Translucent, STEM learning", "600-2000", 10, ""),
        ("DIY Slime/Sensory Play Kit", "kids-toys", "Generic", "Kit, Glitter, beads, non-toxic", "150-500", 15, ""),
        ("Board Games Monopoly/UNO/Chess", "kids-toys", "Generic", "1 game, Classic family games", "300-1500", 10, ""),
        ("Play-Doh/Modeling Clay Set 12+ colors", "kids-toys", "Generic", "Set, Non-toxic, molds included", "200-700", 10, ""),
        ("Jigsaw Puzzle 500-1000 pcs", "kids-toys", "Generic", "1 box, Beautiful artwork designs", "300-1000", 8, ""),
        ("Water Gun/Outdoor Toys Set", "kids-toys", "Generic", "1-2 pcs, Super soaker style", "200-800", 10, ""),
        ("Electric Train Set Track + Train", "kids-toys", "Generic", "1 set, Battery/rechargeable, loop track", "1000-4000", 5, ""),
        ("Nerf-Style Dart Gun/Blaster", "kids-toys", "Generic", "1 pc + darts, Safe foam darts, 20+ dart pack", "400-1500", 10, ""),
        ("Premium Speed Cube Rubik's Cube", "kids-toys", "Generic", "3x3 or set, Smooth turning, competition grade", "150-600", 15, ""),
        ("Electric Rechargeable Bubble Machine", "kids-toys", "Generic", "1 pc, Automatic, 1000+ bubbles/min", "300-800", 10, ""),

        # Collectibles & Figures
        ("One Piece Premium Anime Figure", "anime-figures", "Generic", "15-25cm, PVC, display stand, boxed", "500-3000", 8, ""),
        ("Naruto/Boruto Anime Figure", "anime-figures", "Generic", "15-25cm, Various characters", "500-3000", 8, ""),
        ("Dragon Ball Z/Super Anime Figure", "anime-figures", "Generic", "15-25cm, Goku, Vegeta, Broly etc", "500-3000", 8, ""),
        ("Attack on Titan/JJK Anime Figure", "anime-figures", "Generic", "15-25cm, Trending anime series", "500-2500", 5, ""),
        ("Demon Slayer Anime Figure", "anime-figures", "Generic", "15-25cm, Tanjiro, Nezuko, Zenitsu", "500-3000", 8, ""),
        ("Pop Mart/Blind Box Figures", "collectibles", "Generic", "1 box, Various series, mystery element", "400-1200", 15, ""),
        ("Marvel/DC Action Figures Premium", "collectibles", "Generic", "15-20cm, Spider-Man, Batman, Iron Man", "500-2500", 8, ""),
        ("Die-Cast Model Cars 1:24/1:32", "collectibles", "Generic", "1 pc, Opening doors, detailed", "300-2000", 8, ""),
        ("Mini Succulent Figurines/Desk Toys", "collectibles", "Generic", "1 pc, Kawaii, desk decor", "150-600", 15, ""),
        ("Crystal Ball/Snow Globe LED", "collectibles", "Generic", "1 pc, LED light option, gift quality", "300-1200", 8, ""),
        ("Gundam Model Kit Grade HG/RG", "collectibles", "Generic", "1 box, Snap-fit, no glue needed", "800-3000", 5, ""),
        ("Pokemon Cards/Trading Card Packs", "collectibles", "Generic", "Pack/Box, Booster packs, starter decks", "200-1500", 15, ""),

        # Educational & Creative
        ("STEM Robot Kit Coding/Building", "educational-toys", "Generic", "Kit, Learn coding through play", "1000-4000", 5, ""),
        ("Premium Art Supply Set 100+ pcs", "educational-toys", "Generic", "Full set, Crayons, markers, pencils, case", "300-1200", 10, ""),
        ("Science Experiment Kit 20+ experiments", "educational-toys", "Generic", "Kit, Chemistry, physics, biology", "500-2000", 8, ""),
        ("LED Interactive Globe", "educational-toys", "Generic", "20-25cm, Night light mode, educational", "500-2000", 5, ""),
        ("Kids Learning Tablet/Pad", "educational-toys", "Generic", "1 pc, Pre-loaded apps, parental control", "2000-6000", 3, ""),
        ("Flash Card Sets ABCs/Math/Bengali", "educational-toys", "Generic", "Set, Laminated, durable, colorful", "150-500", 20, ""),
        ("Kids Starter Telescope", "educational-toys", "Generic", "1 pc, 60x-90x magnification, tripod", "800-3000", 5, ""),
        ("Kids Educational Microscope", "educational-toys", "Generic", "1 pc, LED light, specimen slides", "800-2500", 5, ""),
        ("DIY Craft Kit Jewelry/Sewing/Origami", "educational-toys", "Generic", "Kit, Various craft types", "200-700", 10, ""),
        ("Magnetic Whiteboard + Markers Set", "educational-toys", "Generic", "1 set, Double-sided, easel option", "200-600", 10, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Toys & Collectibles products")
    return count


def seed_smart_home(db: Session, categories: dict):
    """Seed Smart Home products"""
    print("\n--- Seeding Smart Home ---")

    products = [
        # Security & Surveillance
        ("1080p Pan/Tilt WiFi Indoor Camera", "security-cameras", "Generic", "1 pc, Night vision, 2-way audio, app", "1500-4000", 15, ""),
        ("2K/4MP WiFi Indoor Camera", "security-cameras", "Generic", "1 pc, AI detection, premium quality", "2500-5000", 10, ""),
        ("IP66 Outdoor Security Camera 2K", "security-cameras", "Generic", "1 pc, Weatherproof, color night vision", "2500-7000", 8, ""),
        ("360° PTZ Outdoor Camera Auto Track", "security-cameras", "Generic", "1 pc, Auto tracking, zoom, siren", "3000-8000", 5, ""),
        ("WiFi Video Doorbell 2-Way Audio", "security-cameras", "Generic", "1 pc, Wide angle, motion alert", "2000-5000", 8, ""),
        ("Night Vision Baby Camera Monitor", "security-cameras", "Generic", "1 pc, Lullaby, temp sensor, pan", "2000-6000", 5, ""),
        ("1080p Front + Rear Dash Cam", "security-cameras", "Generic", "1 pc, Loop record, G-sensor, parking", "2000-6000", 8, ""),
        ("4K Premium Dash Cam", "security-cameras", "Generic", "1 pc, 4K front, GPS, WiFi app", "4000-10000", 5, ""),
        ("High Endurance MicroSD 64GB Camera", "security-cameras", "Generic", "1 pc, For cameras, surveillance rated", "400-800", 25, ""),
        ("High Endurance MicroSD 128GB Camera", "security-cameras", "Generic", "1 pc, For cameras, surveillance rated", "600-1200", 20, ""),
        ("High Endurance MicroSD 256GB Camera", "security-cameras", "Generic", "1 pc, For cameras, surveillance rated", "1000-1500", 10, ""),
        ("Solar Panel for Security Camera", "security-cameras", "Generic", "1 pc, USB, weatherproof, for battery cams", "800-2000", 5, ""),
        ("4/8 Channel NVR Recorder", "security-cameras", "Generic", "1 pc, For multi-camera setups", "3000-10000", 3, ""),

        # Smart Locks & Access
        ("Smart Door Lock Fingerprint+Pin+Card", "smart-locks", "Generic", "1 pc, App control, auto-lock", "4000-12000", 5, ""),
        ("Premium Smart Door Lock Face Recognition", "smart-locks", "Generic", "1 pc, Face + finger + pin + card", "8000-20000", 3, ""),
        ("Fingerprint Smart Padlock", "smart-locks", "Generic", "1 pc, USB rechargeable, 10+ prints", "1000-3000", 10, ""),
        ("RFID Digital Cabinet Lock", "smart-locks", "Generic", "1 pc, Hidden install, card access", "800-2500", 8, ""),
        ("Bluetooth Key Finder/Tracker", "smart-locks", "Generic", "1-2 pcs, Phone app, loud ring, GPS", "500-1500", 15, ""),
        ("Digital Smart Safe Box", "smart-locks", "Generic", "1 pc, Keypad + key, fireproof", "2000-6000", 3, ""),
        ("Electronic Deadbolt Lock", "smart-locks", "Generic", "1 pc, Pin + key, auto-lock timer", "2000-5000", 5, ""),

        # Smart Home Devices
        ("WiFi Smart Plug App+Voice Control", "smart-devices", "Generic", "1-2 pcs, Timer, Alexa/Google", "400-1200", 15, ""),
        ("WiFi RGB Smart LED Bulb", "smart-lighting", "Generic", "1-2 pcs, 16M colors, app control", "300-1000", 15, ""),
        ("WiFi LED Strip 5M Music Sync", "smart-lighting", "Generic", "5 meters, RGB, adhesive, app control", "500-1500", 15, ""),
        ("WiFi LED Strip 10M", "smart-lighting", "Generic", "10 meters, Extended length, cuttable", "800-2000", 8, ""),
        ("Smart IR Remote Universal AC/TV/Fan", "smart-devices", "Generic", "1 pc, Control AC/TV from phone", "500-1500", 10, ""),
        ("WiFi Temperature & Humidity Sensor", "smart-devices", "Generic", "1 pc, App alerts, history data", "300-800", 10, ""),
        ("Battery Motion Sensor Light Stick-On", "smart-lighting", "Generic", "1-3 pcs, Closet, hallway, stairs", "300-800", 15, ""),
        ("Smart Power Strip USB + Outlets", "smart-devices", "Generic", "1 pc, Surge protect, app control", "600-1500", 8, ""),
        ("WiFi Water Leak Sensor Alarm", "smart-devices", "Generic", "1 pc, Phone alert, loud alarm", "400-1000", 8, ""),
        ("WiFi Smart Curtain Motor", "smart-devices", "Generic", "1 pc, App + voice, auto open/close", "2000-6000", 3, ""),
        ("WiFi Audio-Only Smart Doorbell", "smart-devices", "Generic", "1 pc, Budget doorbell option", "500-1500", 8, ""),
        ("Wireless Door/Window Alarm System", "smart-devices", "Generic", "Set, Multiple sensors, siren", "800-2500", 5, ""),
        ("Plug-in Auto Smart Night Light", "smart-lighting", "Generic", "1-2 pcs, Light sensor, warm white", "150-400", 15, ""),
    ]

    count = 0
    for name, cat, brand, specs, price, stock, notes in products:
        product = add_product(db, categories, name, cat, brand, specs, price, stock, notes)
        if product:
            count += 1

    db.commit()
    print(f"Added {count} Smart Home products")
    return count


def main():
    """Main function to seed all products"""
    print("=" * 60)
    print("PRODUCT SEEDING SCRIPT - ALL CATEGORIES")
    print("=" * 60)

    db = SessionLocal()

    try:
        # Create categories first
        print("\n=== Creating Categories ===")
        categories = create_categories(db)

        # Seed all product categories
        total = 0
        total += seed_cosmetics(db, categories)
        total += seed_mens_grooming(db, categories)
        total += seed_tech_accessories(db, categories)
        total += seed_kitchen_appliances(db, categories)
        total += seed_home_decor(db, categories)
        total += seed_ladies_fashion(db, categories)
        total += seed_baby_kids(db, categories)
        total += seed_travel(db, categories)
        total += seed_toys_collectibles(db, categories)
        total += seed_smart_home(db, categories)

        print("\n" + "=" * 60)
        print(f"TOTAL PRODUCTS ADDED: {total}")
        print("=" * 60)
        print("\nProducts added WITHOUT images.")
        print("Upload product photos through your admin panel.")
        print("=" * 60)

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
