import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ not_found?: string[] }>
}) {
  const resolvedParams = await params
  const segments = resolvedParams?.not_found || []
  const fullPath = segments.join('/')

  if (fullPath.includes('stitching_sewing') || fullPath.includes('stitching sewing')) {
    const fixed = fullPath.replace(/stitching[_\s]+sewing/gi, 'stitching-sewing')
    redirect(`/${fixed}`)
  }

  if (fullPath.includes('ready_goods') || fullPath.includes('ready goods')) {
    const fixed = fullPath.replace(/ready[_\s]+goods/gi, 'ready-goods')
    redirect(`/${fixed}`)
  }

  if (fullPath.includes('buyers_vendors')) {
    const fixed = fullPath.replace(/buyers_vendors/gi, 'buyers-vendors')
    redirect(`/${fixed}`)
  }

  if (fullPath.includes('fabric_store')) {
    const fixed = fullPath.replace(/fabric_store/gi, 'fabric-store')
    redirect(`/${fixed}`)
  }

  if (fullPath.includes('all_designs')) {
    const fixed = fullPath.replace(/all_designs/gi, 'all-designs')
    redirect(`/${fixed}`)
  }

  notFound()
}
