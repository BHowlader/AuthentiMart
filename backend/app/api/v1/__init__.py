from fastapi import APIRouter
from app.api.v1 import (
    auth,
    products,
    categories,
    orders,
    payments,
    wishlist,
    reviews,
    admin,
    delivery,
    addresses,
    cart,
    flash_sales,
    vouchers,
    # New feature modules
    newsletter,
    recently_viewed,
    stock_notifications,
    points,
    referrals,
    bundles,
    gift_cards,
    exports,
    questions,
    push_notifications,
    variants,
)

api_router = APIRouter()

# Existing routers
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(wishlist.router)
api_router.include_router(reviews.router)
api_router.include_router(admin.router)
api_router.include_router(delivery.router)
api_router.include_router(addresses.router)
api_router.include_router(cart.router)
api_router.include_router(flash_sales.router)
api_router.include_router(vouchers.router)

# New feature routers
api_router.include_router(newsletter.router)
api_router.include_router(recently_viewed.router)
api_router.include_router(stock_notifications.router)
api_router.include_router(points.router)
api_router.include_router(referrals.router)
api_router.include_router(bundles.router)
api_router.include_router(gift_cards.router)
api_router.include_router(exports.router)
api_router.include_router(questions.router)
api_router.include_router(push_notifications.router)
api_router.include_router(variants.router)
