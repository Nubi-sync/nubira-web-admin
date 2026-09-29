import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegacyAccessControlRedirect() {
  redirect('/access-control')
}

