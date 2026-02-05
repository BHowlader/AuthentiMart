from fastapi import APIRouter
from app.api.v1 import auth, products, categories, orders, payments, wishlist, reviews, admin

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(wishlist.router)
api_router.include_router(reviews.router)
api_router.include_router(admin.router)
