import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/terms', '/security', '/not-found'],
        disallow: [
          '/api/',
          '/allotments',
          '/articles',
          '/dispatch',
          '/employees',
          '/inventory',
          '/production-orders',
          '/reports',
          '/reset-password',
        ],
      },
    ],
    sitemap: 'https://zigza.in/sitemap.xml',
  }
}
