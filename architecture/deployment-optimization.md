
# Deployment & Performance Optimization

## 1. Edge Rendering & SEO Strategy (Vercel)
Since TourSphere is a React SPA, SEO bots need metadata rendered on the server. We utilize Vercel Edge Middleware or a Supabase Edge Function to rewrite requests from crawlers.

### Vercel Edge Middleware (`middleware.ts`)
```typescript
import { next } from '@vercel/edge';

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  const isBot = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i.test(userAgent);

  if (isBot && url.pathname.startsWith('/tours/')) {
    const slug = url.pathname.split('/').pop();
    // Fetch tour metadata from Supabase and return a minimal HTML with meta tags
    // or proxy to a pre-rendering service.
    return fetch(`${url.origin}/api/render-meta?slug=${slug}`);
  }

  return next();
}
```

## 2. Caching Strategy
- **Static Assets**: Vercel automatically sets long-lived cache headers for assets in `/assets` and hashed JS/CSS files.
- **TanStack Query**:
  - `staleTime: 5m`: Data is considered fresh for 5 minutes.
  - `gcTime: 30m`: Unused data is kept in memory for 30 minutes.
- **Service Worker**: (Optional) For offline support and instant subsequent loads.

## 3. Image Optimization
- All tour images are served via a CDN (Supabase Storage + Smart CDN).
- Frontend uses `loading="lazy"` for below-the-fold content.
- Hero images use `fetchpriority="high"` and `loading="eager"`.

## 4. Sitemap Generation
A Supabase Edge Function or GitHub Action runs nightly to fetch all tour slugs and generate `sitemap.xml`.

```typescript
// Edge Function pseudo-code
const tours = await supabase.from('tours').select('slug, updated_at').eq('is_published', true);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${tours.map(t => `<url><loc>https://toursphere.com/tours/${t.slug}</loc><lastmod>${t.updated_at}</lastmod></url>`).join('')}
</urlset>`;
```
