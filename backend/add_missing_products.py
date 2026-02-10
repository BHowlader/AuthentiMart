"""
Script to add products for empty categories without clearing existing data.
"""
import sys
import os

sys.path.append(os.getcwd())

from app.database import SessionLocal, engine
from app.models.models import Base, Category, Product, ProductImage

db = SessionLocal()

# Products for empty categories
NEW_PRODUCTS = [
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


def add_products():
    print("Adding products to empty categories...")

    # Get category map
    categories = db.query(Category).all()
    category_map = {cat.slug: cat.id for cat in categories}

    added = 0
    skipped = 0

    for prod_data in NEW_PRODUCTS:
        # Check if product already exists
        existing = db.query(Product).filter(Product.slug == prod_data["slug"]).first()
        if existing:
            print(f"  Skipped (exists): {prod_data['name']}")
            skipped += 1
            continue

        category_slug = prod_data.pop("category_slug")
        category_id = category_map.get(category_slug)

        if not category_id:
            print(f"  Skipped (no category): {prod_data['name']} - {category_slug}")
            skipped += 1
            continue

        image_url = prod_data.pop("image")

        # Calculate discount
        discount = 0
        if prod_data.get("original_price") and prod_data["original_price"] > prod_data["price"]:
            discount = int(((prod_data["original_price"] - prod_data["price"]) / prod_data["original_price"]) * 100)

        product = Product(
            **prod_data,
            category_id=category_id,
            is_active=True,
            discount=discount
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

        print(f"  Added: {product.name}")
        added += 1

    print(f"\nDone! Added: {added}, Skipped: {skipped}")


if __name__ == "__main__":
    add_products()
    db.close()
