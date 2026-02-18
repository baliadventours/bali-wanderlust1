
# 1. Scalable Frontend Folder Structure (Feature-Based)

To support a large-scale SPA with both Customer and Admin views, we adopt a **Feature-First** approach.

```text
src/
├── api/                    # Shared Supabase clients and base API definitions
├── assets/                 # Global images, icons, fonts
├── components/             # Atomic UI components (shadcn/ui style)
│   ├── ui/                 # Smallest atoms (Button, Input, Badge)
│   ├── shared/             # Molecules used across multiple features
│   └── layout/             # Navbar, Sidebar, Footer, PageWrapper
├── config/                 # Environment variables, constants, routes map
├── features/               # Domain-driven modules (The Core)
│   ├── auth/               # Login, Signup, RBAC logic
│   ├── tours/              # Tour listing, Search, Detail, Filtering
│   ├── booking/            # Booking flow, Checkout, Slot selection
│   ├── admin-dashboard/    # Management views, Analytics
│   ├── inquiries/          # Support tickets, Contact forms
│   └── payments/           # Stripe elements, Invoice history
│       ├── components/     # Feature-specific UI
│       ├── hooks/          # Custom hooks (e.g., useTourSearch)
│       ├── services/       # Feature-specific API calls
│       ├── store/          # Feature-specific Zustand slices
│       └── types/          # Feature-specific TypeScript interfaces
├── hooks/                  # Global reusable hooks (useMediaQuery, useDebounce)
├── lib/                    # Third-party wrapper configs (Stripe, i18n, Dayjs)
├── providers/              # Context providers (QueryClient, Auth, Theme)
├── routes/                 # Centralized Route definitions (Public vs Private)
├── store/                  # Global Zustand store (App state, Currency, Lang)
├── types/                  # Global TS types & Supabase generated types
└── utils/                  # Pure helper functions (formatting, validation)
```
