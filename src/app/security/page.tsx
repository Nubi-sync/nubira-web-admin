import type { Metadata } from 'next'
import { SecurityClient } from './components/SecurityClient'

export const metadata: Metadata = {
  title: 'Security Standards & Architecture | Zigza MES',
  description: 'Enterprise security standards, TLS 1.3/AES-256 encryption, PostgreSQL Row-Level Security, Indian data residency, and zero AI training guarantees for Zigza MES.',
  alternates: {
    canonical: 'https://zigza.in/security',
  },
  openGraph: {
    title: 'Security Standards & Architecture | Zigza MES',
    description: 'Learn how Zigza safeguards pre-season buyer designs, cutting matrices, worker piece-rate records, and fabric inventories with bank-grade security.',
    url: 'https://zigza.in/security',
    siteName: 'Zigza MES',
    type: 'website',
  },
}

export default function SecurityPage() {
  return <SecurityClient />
}
