import sys
import os
from datetime import datetime, timedelta
import random

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine
from app.models.models import Base, Category, Product, ProductImage, User, UserRole, Order, OrderItem, OrderStatus, PaymentStatus, Address
from passlib.context import CryptContext

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_categories():
    print("Seeding Categories...")
    categories = [
        {
            "name": "Skincare",
            "slug": "skincare",
            "description": "Scientific formulations for all skin types.",
            "image": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600"
        },
        {
            "name": "Cosmetics",
            "slug": "cosmetics",
            "description": "High-performance makeup and enhancers.",
            "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"
        },
        {
            "name": "Hair Care",
            "slug": "hair-care",
            "description": "Treatments for healthy, fortified hair.",
            "image": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600"
        },
        {
            "name": "Fragrance",
            "slug": "fragrance",
            "description": "Subtle and bold scents for everyone.",
            "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600"
        },
        {
            "name": "Men's Grooming",
            "slug": "mens-grooming",
            "description": "Essentials designed specifically for men.",
            "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600"
        }
    ]

    created_cats = []
    for cat_data in categories:
        cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not cat:
            cat = Category(**cat_data)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            print(f"Created category: {cat.name}")
        else:
            print(f"Category exists: {cat.name}")
        created_cats.append(cat)
    return created_cats

def seed_products(categories):
    print("Seeding Products...")
    
    # Helper to find category by slug
    def get_cat_id(slug):
        for c in categories:
            if c.slug == slug:
                return c.id
        return categories[0].id

    products = [
        # Skincare
        {
            "name": "Hyaluronic Acid 2% + B5",
            "slug": "hyaluronic-acid-2-b5",
            "description": "A hydrating formula with ultra-pure, vegan hyaluronic acid. This formulation combines low-, medium- and high-molecular weight HA.",
            "price": 1250.0,
            "original_price": 1500.0,
            "category_id": get_cat_id("skincare"),
            "stock": 50,
            "sku": "SKIN-001",
            "brand": "The Ordinary",
            "is_featured": True,
            "is_new": False,
            "rating": 4.8,
            "review_count": 124,
            "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
            "additional_images": [
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
            ]
        },
        {
            "name": "Niacinamide 10% + Zinc 1%",
            "slug": "niacinamide-10-zinc-1",
            "description": "High-strength vitamin and mineral blemish formula. Niacinamide (Vitamin B3) is indicated to reduce the appearance of skin blemishes and congestion.",
            "price": 1050.0,
            "original_price": 1200.0,
            "category_id": get_cat_id("skincare"),
            "stock": 45,
            "sku": "SKIN-002",
            "brand": "The Ordinary",
            "is_featured": True,
            "is_new": False,
            "rating": 4.7,
            "review_count": 312,
            "image": "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600",
            "additional_images": []
        },
        {
            "name": "Retinol 1% in Squalane",
            "slug": "retinol-1-in-squalane",
            "description": "Water-free solution contains 1% pure Retinol, an ingredient that can reduce the appearances of fine lines, of photo damage and of general skin aging.",
            "price": 1350.0,
            "original_price": 1600.0,
            "category_id": get_cat_id("skincare"),
            "stock": 30,
            "sku": "SKIN-003",
            "brand": "The Ordinary",
            "is_featured": False,
            "is_new": True,
            "rating": 4.6,
            "review_count": 89,
            "image": "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=600",
            "additional_images": []
        },
        
        # Cosmetics
        {
            "name": "Matte Revolution Lipstick",
            "slug": "matte-revolution-lipstick",
            "description": "A matte lipstick that features a long-lasting, buildable, and hydrating formula.",
            "price": 3200.0,
            "original_price": 3500.0,
            "category_id": get_cat_id("cosmetics"),
            "stock": 100,
            "sku": "COS-001",
            "brand": "Charlotte Tilbury",
            "is_featured": True,
            "is_new": True,
            "rating": 4.9,
            "review_count": 56,
            "image": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600",
            "additional_images": []
        },
        
        # Fragrance
        {
            "name": "Sauvage Eau de Parfum",
            "slug": "sauvage-eau-de-parfum",
            "description": "A radically fresh composition, dictated by a name that has the ring of a manifesto.",
            "price": 12500.0,
            "original_price": 14000.0,
            "category_id": get_cat_id("fragrance"),
            "stock": 20,
            "sku": "FRAG-001",
            "brand": "Dior",
            "is_featured": True,
            "is_new": False,
            "rating": 4.8,
            "review_count": 201,
            "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600",
            "additional_images": []
        },
        {
            "name": "Black Orchid",
            "slug": "black-orchid",
            "description": "A luxurious and sensual fragrance of rich, dark accords and an alluring potion of black orchids and spice.",
            "price": 15000.0,
            "original_price": 16500.0,
            "category_id": get_cat_id("fragrance"),
            "stock": 15,
            "sku": "FRAG-002",
            "brand": "Tom Ford",
            "is_featured": False,
            "is_new": False,
            "rating": 4.7,
            "review_count": 145,
            "image": "https://images.unsplash.com/photo-1594038683611-adea29eda553?w=600",
            "additional_images": []
        },

        # Men's Grooming
        {
            "name": "Charcoal Face Wash for Men",
            "slug": "charcoal-face-wash",
            "description": "Deep cleans pores and removes impurities. Designed for tough skin.",
            "price": 850.0,
            "original_price": 1000.0,
            "category_id": get_cat_id("mens-grooming"),
            "stock": 60,
            "sku": "MEN-001",
            "brand": "L'Oreal Men Expert",
            "is_featured": False,
            "is_new": True,
            "rating": 4.5,
            "review_count": 42,
            "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600",
            "additional_images": []
        },
        {
            "name": "Beard Oil - Sandalwood",
            "slug": "beard-oil-sandalwood",
            "description": "Softens and conditions beard hair while soothing the skin underneath.",
            "price": 1200.0,
            "original_price": 1500.0,
            "category_id": get_cat_id("mens-grooming"),
            "stock": 40,
            "sku": "MEN-002",
            "brand": "Viking Revolution",
            "is_featured": False,
            "is_new": False,
            "rating": 4.6,
            "review_count": 78,
            "image": "https://images.unsplash.com/photo-1620917669809-192f689cbfa1?w=600",
            "additional_images": []
        }
    ]

    for prod_data in products:
        p = db.query(Product).filter(Product.slug == prod_data["slug"]).first()
        image_url = prod_data.pop("image")
        add_images = prod_data.pop("additional_images")
        
        if not p:
            p = Product(**prod_data)
            db.add(p)
            db.commit()
            db.refresh(p)
            print(f"Created product: {p.name}")
            
            # Add images
            main_img = ProductImage(product_id=p.id, url=image_url, is_primary=True, sort_order=0)
            db.add(main_img)
            
            for i, img_url in enumerate(add_images):
                img = ProductImage(product_id=p.id, url=img_url, is_primary=False, sort_order=i+1)
                db.add(img)
            db.commit()
        else:
            print(f"Product exists: {p.name}")

def seed_orders():
    print("Seeding Orders...")
    # Get the admin user or first user to assign orders to
    user = db.query(User).filter(User.email == "bibekhowlader8@gmail.com").first()
    if not user:
        print("User not found, skipping orders.")
        return

    # Randomly generate specific orders from last 30 days
    statuses = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED]
    products = db.query(Product).all()
    
    if not products:
        print("No products, skipping orders.")
        return

    for i in range(15):
        order_num = f"ORD-{random.randint(10000, 99999)}"
        exists = db.query(Order).filter(Order.order_number == order_num).first()
        if exists:
            continue
            
        days_ago = random.randint(0, 30)
        created_at = datetime.now() - timedelta(days=days_ago)
        
        status = random.choice(statuses)
        
        # Create items
        items = []
        num_items = random.randint(1, 4)
        order_total = 0
        
        selected_prods = random.sample(products, num_items)
        
        # Create Order first
        order = Order(
            order_number=order_num,
            user_id=user.id,
            status=status,
            payment_status=PaymentStatus.COMPLETED if status in [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] else PaymentStatus.PENDING,
            payment_method="bkash",
            subtotal=0,
            shipping_cost=60 if order_total < 5000 else 0,
            total=0,
            shipping_name=user.name,
            shipping_phone=user.phone or "01700000000",
            shipping_address="123 Test St",
            shipping_city="Dhaka",
            created_at=created_at,
            updated_at=created_at
        )
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Add items
        subtotal = 0
        for prod in selected_prods:
            qty = random.randint(1, 3)
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
        print(f"Created order {order.order_number} - {status}")

if __name__ == "__main__":
    cats = seed_categories()
    seed_products(cats)
    seed_orders()
    print("Seeding completed!")
