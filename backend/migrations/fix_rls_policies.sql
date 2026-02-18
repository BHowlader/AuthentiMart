-- Fix the 3 failed policies with correct column names

-- Referrals - fix column name (use referrer_id only, or check actual schema)
CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (auth.uid()::text = referrer_id::text);

-- Gift cards - fix column name (purchaser_id instead of purchased_by)
CREATE POLICY "Users can view own gift cards" ON public.gift_cards
    FOR SELECT USING (
        auth.uid()::text = purchaser_id::text
        OR recipient_email = auth.email()
    );

CREATE POLICY "Users can view own gift card transactions" ON public.gift_card_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gift_cards
            WHERE gift_cards.id = gift_card_transactions.gift_card_id
            AND (gift_cards.purchaser_id::text = auth.uid()::text OR gift_cards.recipient_email = auth.email())
        )
    );
