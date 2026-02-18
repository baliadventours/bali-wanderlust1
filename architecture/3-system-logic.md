
# 3. System Logic & Lifecycles (Enhanced)

### 3.1 Role-Based Access Control (RBAC)
The system uses a combination of **Supabase Auth Metadata** and a **`profiles`** table.
*   **Customer**: Default role. Can read published tours and manage their own bookings.
*   **Editor**: Can manage content (Tours, Destinations, Itineraries).
*   **Admin**: Full system control including financial data and user role elevation.

### 3.2 Booking Lifecycle & Inventory
To prevent overbooking in high-traffic scenarios:
1.  **Draft Booking**: `bookings` record created with `status = 'pending'`.
2.  **Row Locking**: The booking flow should trigger a Postgres function that checks `tour_availability.available_spots`.
3.  **Atomic Decrement**: Upon successful payment webhook, `available_spots` is decremented.
4.  **Auto-Release**: A cron job (via Supabase Edge Functions or pg_cron) checks for `pending` bookings older than 20 minutes and deletes them, ensuring spots are released if the customer abandons the cart.

### 3.3 Multi-Language Strategy (Hybrid)
*   **UI Elements**: Handled by `i18next` on the frontend.
*   **Content (Tours/Categories)**: Handled via `JSONB` columns in the `tours` and `tour_categories` tables.
    *   *Schema Example*: `title: { "en": "Grand Canyon Tour", "fr": "Tour du Grand Canyon" }`.
*   **Long-form Content**: The `translations` table serves as a fallback for massive text blocks that shouldn't bloat the main tour record.

### 3.4 Multi-Currency Strategy
1.  **Source of Truth**: All prices in the database are stored in `USD` (`base_price_usd`).
2.  **Conversion**: The `currencies` table stores exchange rates.
3.  **Customer Experience**:
    *   User selects preferred currency (stored in `profiles.preferred_currency`).
    *   Frontend multiplies `base_price_usd` by `currencies.exchange_rate_to_usd`.
4.  **Transaction**: Stripe is initiated with the calculated currency amount. The `bookings` table stores both the `total_amount_usd` (for accounting) and the `currency_amount` (what the user actually paid).

### 3.5 Security Best Practices
*   **RLS**: All tables have Row Level Security enabled.
*   **Service Role**: Sensitive operations (like cleaning up expired bookings) are performed by Edge Functions using the `SERVICE_ROLE` key.
*   **Soft Deletes**: Key tables include a `deleted_at` column. `SELECT` policies exclude records where `deleted_at` is NOT NULL.
