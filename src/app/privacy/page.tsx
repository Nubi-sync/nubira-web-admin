import type { Metadata } from 'next'
import { PrivacyClient } from './components/PrivacyClient'

export const metadata: Metadata = {
  title: 'Enterprise Privacy Policy & Data Governance Charter | Zigza MES',
  description: 'Enterprise privacy policy, statutory compliance (DPDPA 2023), multi-tenant Row-Level Security (RLS), AI zero-training guarantees, and production telemetry governance for Zigza MES.',
  alternates: {
    canonical: 'https://zigza.in/privacy',
  },
  openGraph: {
    title: 'Enterprise Privacy Policy & Data Governance Charter | Zigza MES',
    description: 'Learn how Zigza MES secures proprietary factory BOMs, CAD markers, SAM timings, operator piece-rates, and multi-brand data with Indian data residency and cryptographic tenant isolation.',
    url: 'https://zigza.in/privacy',
    siteName: 'Zigza MES',
    type: 'website',
  },
}

export default function PrivacyPolicyPage() {
  return <PrivacyClient />
}

