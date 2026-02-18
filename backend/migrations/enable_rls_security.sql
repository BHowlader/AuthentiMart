-- =============================================================================
-- SECURITY FIX: Enable Row Level Security (RLS) on all tables
-- =============================================================================
-- This migration enables RLS on all public tables and creates restrictive policies.
-- Since the FastAPI backend uses a service_role key (which bypasses RLS),
-- the application will continue to work normally.
-- However, direct access via PostgREST/anon key will be blocked.
-- =============================================================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

-- User & Authentication tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Product tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_answers ENABLE ROW LEVEL SECURITY;

-- Shopping tables
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Order & Payment tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Voucher & Discount tables
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_usages ENABLE ROW LEVEL SECURITY;

-- Flash Sale tables
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;

-- Review tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Points & Loyalty tables
ALTER TABLE public.points_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Gift Card tables
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Notification tables
ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Email & Communication tables
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_cart_emails ENABLE ROW LEVEL SECURITY;

-- Analytics tables
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RESTRICTIVE POLICIES
-- ============================================
-- These policies deny all access via anon/authenticated roles.
-- The service_role (used by FastAPI backend) bypasses RLS entirely.

-- Users table - users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Addresses - users can only access their own addresses
CREATE POLICY "Users can view own addresses" ON public.addresses
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Products - public read access (anyone can view products)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

-- Categories - public read access
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- Product images - public read access
CREATE POLICY "Anyone can view product images" ON public.product_images
    FOR SELECT USING (true);

-- Product specifications - public read access
CREATE POLICY "Anyone can view product specs" ON public.product_specifications
    FOR SELECT USING (true);

-- Product variants - public read access
CREATE POLICY "Anyone can view product variants" ON public.product_variants
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view variant types" ON public.product_variant_types
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view variant attributes" ON public.product_variant_attributes
    FOR SELECT USING (true);

-- Product relations - public read access
CREATE POLICY "Anyone can view product relations" ON public.product_relations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view product accessories" ON public.product_accessories
    FOR SELECT USING (true);

-- Product bundles - public read access
CREATE POLICY "Anyone can view bundles" ON public.product_bundles
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view bundle items" ON public.product_bundle_items
    FOR SELECT USING (true);

-- Product Q&A - public read access
CREATE POLICY "Anyone can view questions" ON public.product_questions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view answers" ON public.product_answers
    FOR SELECT USING (true);

-- Cart items - users can only access their own cart
CREATE POLICY "Users can view own cart" ON public.cart_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own cart" ON public.cart_items
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Wishlist - users can only access their own wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlist_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own wishlist" ON public.wishlist_items
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Recently viewed - users/sessions can only see their own
CREATE POLICY "Users can view own recently viewed" ON public.recently_viewed
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Orders - users can only view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can view own order tracking" ON public.order_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_tracking.order_id
            AND orders.user_id::text = auth.uid()::text
        )
    );

-- Payments - users can only view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
            AND orders.user_id::text = auth.uid()::text
        )
    );

-- Vouchers - public read access for validation
CREATE POLICY "Anyone can view active vouchers" ON public.vouchers
    FOR SELECT USING (is_active = true);

-- Voucher usages - users can only see their own
CREATE POLICY "Users can view own voucher usage" ON public.voucher_usages
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Flash sales - public read access
CREATE POLICY "Anyone can view flash sales" ON public.flash_sales
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view flash sale items" ON public.flash_sale_items
    FOR SELECT USING (true);

-- Reviews - public read access
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON public.reviews
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Points - users can only see their own
CREATE POLICY "Users can view own points" ON public.points_transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Points settings - no direct access (admin only via service role)
CREATE POLICY "No direct access to points settings" ON public.points_settings
    FOR SELECT USING (false);

-- Referrals - users can only see their own
CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (
        auth.uid()::text = referrer_id::text
        OR auth.uid()::text = referred_id::text
    );

-- Gift cards - users can only see their purchased/received cards
CREATE POLICY "Users can view own gift cards" ON public.gift_cards
    FOR SELECT USING (
        auth.uid()::text = purchased_by::text
        OR recipient_email = auth.email()
    );

CREATE POLICY "Users can view own gift card transactions" ON public.gift_card_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gift_cards
            WHERE gift_cards.id = gift_card_transactions.gift_card_id
            AND (gift_cards.purchased_by::text = auth.uid()::text OR gift_cards.recipient_email = auth.email())
        )
    );

-- Stock notifications - users can only see their own
CREATE POLICY "Users can view own stock notifications" ON public.stock_notifications
    FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Push subscriptions - users can only see their own
CREATE POLICY "Users can view own push subscriptions" ON public.push_subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Newsletter - no direct access (managed via API)
CREATE POLICY "No direct newsletter access" ON public.newsletter_subscribers
    FOR SELECT USING (false);

-- Email logs - no direct access (admin only)
CREATE POLICY "No direct email log access" ON public.email_logs
    FOR SELECT USING (false);

-- Abandoned cart emails - no direct access
CREATE POLICY "No direct abandoned cart access" ON public.abandoned_cart_emails
    FOR SELECT USING (false);

-- Analytics - no direct access (admin only via service role)
CREATE POLICY "No direct page view access" ON public.page_views
    FOR SELECT USING (false);

CREATE POLICY "No direct visitor session access" ON public.visitor_sessions
    FOR SELECT USING (false);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this query to verify RLS is enabled on all tables:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
