import type { Metadata } from 'next'
import { TermsClient } from './components/TermsClient'

export const metadata: Metadata = {
  title: 'Terms of Service & Commercial SaaS Agreement | Zigza MES',
  description: 'Terms of Service, factory data ownership, subscription agreements, and service level commitments for apparel manufacturing units subscribing to Zigza.',
  alternates: {
    canonical: 'https://zigza.in/terms',
  },
  openGraph: {
    title: 'Terms of Service & Commercial SaaS Agreement | Zigza MES',
    description: 'Review the commercial terms, 100% factory IP ownership guarantees, zero lock-in policies, and SLA commitments for Zigza MES.',
    url: 'https://zigza.in/terms',
    siteName: 'Zigza MES',
    type: 'website',
  },
}

export default function TermsPage() {
  return <TermsClient />
}
