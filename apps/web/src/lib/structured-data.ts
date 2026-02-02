/**
 * Structured Data (JSON-LD) Utilities
 * Generates JSON-LD structured data for SEO
 */

export interface OrganizationSchema {
  name: string
  url: string
  logo?: string
  description?: string
  contactPoint?: {
    telephone?: string
    contactType?: string
    email?: string
  }
  sameAs?: string[]
}

export interface WebSiteSchema {
  name: string
  url: string
  description?: string
  potentialAction?: {
    '@type': string
    target: {
      '@type': string
      urlTemplate: string
    }
    'query-input': string
  }
}

/**
 * Generate Organization JSON-LD
 */
export function generateOrganizationSchema(data: OrganizationSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
    ...(data.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...data.contactPoint,
      },
    }),
    ...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
  }
}

/**
 * Generate WebSite JSON-LD
 */
export function generateWebSiteSchema(data: WebSiteSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    ...(data.description && { description: data.description }),
    ...(data.potentialAction && { potentialAction: data.potentialAction }),
  }
}

/**
 * Get default organization schema for Health app
 */
export function getHealthOrganizationSchema(): OrganizationSchema {
  return {
    name: 'Healthcare Management System',
    url: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://health.your-domain.com',
    description: 'Comprehensive healthcare management system for hospitals and clinics with multi-region compliance.',
  }
}
