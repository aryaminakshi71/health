import { createFileRoute } from '@tanstack/react-router'
import { generateSitemap, getHealthRoutes } from '@/lib/sitemap'

export const Route = createFileRoute('/sitemap/xml')({
  server: {
    handlers: {
      GET: () => {
        const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://health.your-domain.com'
        const routes = getHealthRoutes()
        const sitemap = generateSitemap(routes, baseUrl)

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        })
      },
    },
  },
})
