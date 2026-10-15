import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function StitchingSewingRedirectPage() {
  redirect('/stitching-sewing/dashboard')
}
