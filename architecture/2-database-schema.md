
# 2. Supabase Database Schema

### Core Tables

1.  **profiles** (Extends Auth.Users)
    *   `id`: uuid (PK, FK auth.users)
    *   `email`: text
    *   `full_name`: text
    *   `avatar_url`: text
    *   `role`: user_role (enum: 'admin', 'editor', 'customer')
    *   `metadata`: jsonb (preferences, phone)

2.  **tours**
    *   `id`: uuid (PK)
    *   `title`: jsonb (Multi-lang support: { "en": "...", "es": "..." })
    *   `slug`: text (Unique)
    *   `description`: jsonb
    *   `base_price`: decimal
    *   `duration_minutes`: int
    *   `max_participants`: int
    *   `difficulty`: enum ('easy', 'moderate', 'hard')
    *   `is_published`: boolean
    *   `category_id`: uuid (FK)

3.  **tour_slots** (Inventory Management)
    *   `id`: uuid (PK)
    *   `tour_id`: uuid (FK)
    *   `start_time`: timestamptz
    *   `available_spots`: int
    *   `status`: enum ('active', 'cancelled', 'sold_out')

4.  **pricing_rules** (Seasonal/Dynamic Logic)
    *   `id`: uuid
    *   `tour_id`: uuid (optional, if null = global)
    *   `start_date`: date
    *   `end_date`: date
    *   `multiplier`: decimal (e.g., 1.2 for 20% increase)
    *   `fixed_override`: decimal
    *   `priority`: int

5.  **bookings**
    *   `id`: uuid
    *   `customer_id`: uuid (FK profiles)
    *   `slot_id`: uuid (FK tour_slots)
    *   `status`: booking_status (enum: 'pending', 'confirmed', 'cancelled', 'completed')
    *   `total_amount`: decimal
    *   `currency`: text (ISO)
    *   `participant_count`: int
    *   `stripe_payment_intent_id`: text

6.  **inquiries**
    *   `id`: uuid
    *   `customer_id`: uuid (nullable for guests)
    *   `tour_id`: uuid (optional context)
    *   `subject`: text
    *   `message`: text
    *   `status`: enum ('open', 'in_progress', 'resolved')
