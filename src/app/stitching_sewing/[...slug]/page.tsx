import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StitchingSewingCatchAllRedirect({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const resolved = await params
  const slug = resolved?.slug || []
  const subpath = slug.join('/')

  if (subpath) {
    redirect(`/stitching-sewing/${subpath}`)
  } else {
    redirect('/stitching-sewing/dashboard')
  }
}
