from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import engine, Base
from app.api.v1 import api_router
from app.models import *  # Import all models for table creation

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed initial data if needed
    await seed_initial_data()
    
    yield
    
    # Shutdown: Cleanup if needed
    pass

async def seed_initial_data():
    """Seed initial categories and sample products."""
    from app.database import SessionLocal
    from app.models import Category, Product, ProductImage
    
    db = SessionLocal()
    
    try:
        # Check if already seeded
        existing = db.query(Category).first()
        if existing:
            return
        
        # Create categories
        categories = [
            {
                "name": "Men's Cosmetics",
                "slug": "mens-cosmetics",
                "description": "Premium skincare and grooming products for men",
                "image": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400"
            },
            {
                "name": "Women's Cosmetics",
                "slug": "womens-cosmetics",
                "description": "Luxurious beauty and skincare products for women",
                "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400"
            },
            {
                "name": "Home Appliances",
                "slug": "home-appliances",
                "description": "Modern appliances for your home",
                "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400"
            },
            {
                "name": "Electronic Essentials",
                "slug": "electronics",
                "description": "Latest gadgets and electronic accessories",
                "image": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400"
            }
        ]
        
        category_ids = {}
        for cat_data in categories:
            category = Category(**cat_data)
            db.add(category)
            db.commit()
            db.refresh(category)
            category_ids[cat_data["slug"]] = category.id
        
        # Create sample products
        products = [
            # Women's Cosmetics
            {
                "name": "L'Oreal Paris Revitalift Anti-Wrinkle Cream",
                "slug": "loreal-revitalift-cream",
                "description": "Advanced anti-aging moisturizer with Pro-Retinol A",
                "price": 1850,
                "original_price": 2200,
                "discount": 16,
                "stock": 50,
                "category_id": category_ids["womens-cosmetics"],
                "brand": "L'Oreal Paris",
                "is_new": True,
                "images": ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"]
            },
            {
                "name": "MAC Matte Lipstick - Ruby Woo",
                "slug": "mac-ruby-woo-lipstick",
                "description": "Iconic red matte lipstick with long-lasting formula",
                "price": 2500,
                "original_price": 2800,
                "discount": 11,
                "stock": 30,
                "category_id": category_ids["womens-cosmetics"],
                "brand": "MAC",
                "is_featured": True,
                "images": ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600"]
            },
            {
                "name": "Maybelline Fit Me Foundation",
                "slug": "maybelline-fit-me-foundation",
                "description": "Natural matte finish foundation for all skin types",
                "price": 750,
                "original_price": 950,
                "discount": 21,
                "stock": 100,
                "category_id": category_ids["womens-cosmetics"],
                "brand": "Maybelline",
                "images": ["https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600"]
            },
            {
                "name": "The Ordinary Niacinamide 10% + Zinc 1%",
                "slug": "ordinary-niacinamide",
                "description": "High-strength vitamin and mineral blemish formula",
                "price": 1200,
                "original_price": 1400,
                "discount": 14,
                "stock": 75,
                "category_id": category_ids["womens-cosmetics"],
                "brand": "The Ordinary",
                "is_featured": True,
                "images": ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"]
            },
            # Men's Cosmetics
            {
                "name": "Nivea Men Deep Clean Face Wash",
                "slug": "nivea-men-face-wash",
                "description": "Deep cleansing face wash for men with active charcoal",
                "price": 450,
                "original_price": 550,
                "discount": 18,
                "stock": 80,
                "category_id": category_ids["mens-cosmetics"],
                "brand": "Nivea",
                "images": ["https://images.unsplash.com/photo-1621607512214-68297480165e?w=600"]
            },
            {
                "name": "Gillette Fusion ProGlide Razor",
                "slug": "gillette-fusion-proglide",
                "description": "Advanced 5-blade razor with precision trimmer",
                "price": 1500,
                "original_price": 1800,
                "discount": 17,
                "stock": 45,
                "category_id": category_ids["mens-cosmetics"],
                "brand": "Gillette",
                "is_featured": True,
                "images": ["https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600"]
            },
            # Home Appliances
            {
                "name": "Philips Air Fryer HD9252",
                "slug": "philips-air-fryer-hd9252",
                "description": "Rapid Air technology for healthier cooking",
                "price": 8500,
                "original_price": 9999,
                "discount": 15,
                "stock": 25,
                "category_id": category_ids["home-appliances"],
                "brand": "Philips",
                "is_featured": True,
                "images": ["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600"]
            },
            {
                "name": "Panasonic Electric Kettle 1.7L",
                "slug": "panasonic-electric-kettle",
                "description": "Fast boiling stainless steel kettle with auto shut-off",
                "price": 2200,
                "original_price": 2599,
                "discount": 15,
                "stock": 60,
                "category_id": category_ids["home-appliances"],
                "brand": "Panasonic",
                "images": ["https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600"]
            },
            # Electronics
            {
                "name": "Samsung Galaxy Buds Pro",
                "slug": "samsung-galaxy-buds-pro",
                "description": "Premium wireless earbuds with ANC",
                "price": 12999,
                "original_price": 15999,
                "discount": 19,
                "stock": 40,
                "category_id": category_ids["electronics"],
                "brand": "Samsung",
                "is_featured": True,
                "is_new": True,
                "images": ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"]
            },
            {
                "name": "Anker PowerCore 20000mAh Power Bank",
                "slug": "anker-powercore-20000",
                "description": "High-capacity portable charger with dual USB ports",
                "price": 3500,
                "original_price": 4200,
                "discount": 17,
                "stock": 35,
                "category_id": category_ids["electronics"],
                "brand": "Anker",
                "images": ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600"]
            },
            {
                "name": "Logitech MX Master 3 Mouse",
                "slug": "logitech-mx-master-3",
                "description": "Advanced wireless mouse for power users",
                "price": 8999,
                "original_price": 10999,
                "discount": 18,
                "stock": 20,
                "category_id": category_ids["electronics"],
                "brand": "Logitech",
                "is_new": True,
                "images": ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"]
            },
            {
                "name": "JBL Flip 6 Bluetooth Speaker",
                "slug": "jbl-flip-6-speaker",
                "description": "Portable waterproof speaker with powerful bass",
                "price": 7999,
                "original_price": 9499,
                "discount": 16,
                "stock": 30,
                "category_id": category_ids["electronics"],
                "brand": "JBL",
                "is_featured": True,
                "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"]
            }
        ]
        
        for prod_data in products:
            images = prod_data.pop("images", [])
            product = Product(**prod_data)
            db.add(product)
            db.commit()
            db.refresh(product)
            
            # Add images
            for i, img_url in enumerate(images):
                img = ProductImage(
                    product_id=product.id,
                    url=img_url,
                    is_primary=(i == 0),
                    sort_order=i
                )
                db.add(img)
            
            db.commit()
        
        print("✅ Database seeded with initial data")
    
    except Exception as e:
        print(f"⚠️ Error seeding database: {e}")
        db.rollback()
    
    finally:
        db.close()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="E-commerce API for AuthentiMart",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
os.makedirs("uploads/products", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
