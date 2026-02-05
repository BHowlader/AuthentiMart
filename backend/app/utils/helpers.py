import re
from typing import Optional

def generate_slug(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    # Convert to lowercase
    slug = text.lower()
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Remove special characters
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug

def generate_order_number() -> str:
    """Generate a unique order number."""
    import random
    import string
    from datetime import datetime
    
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{date_part}-{random_part}"

def calculate_shipping(subtotal: float, city: str = None) -> float:
    """Calculate shipping cost based on subtotal and city."""
    if subtotal >= 5000:
        return 0  # Free shipping over 5000 BDT
    
    # Default shipping rates
    if city and city.lower() == "dhaka":
        return 60
    else:
        return 120

def validate_phone_bd(phone: str) -> bool:
    """Validate Bangladesh phone number."""
    pattern = r'^01[3-9]\d{8}$'
    return bool(re.match(pattern, phone))

def format_price(price: float) -> str:
    """Format price with thousand separators."""
    return f"৳{price:,.0f}"
