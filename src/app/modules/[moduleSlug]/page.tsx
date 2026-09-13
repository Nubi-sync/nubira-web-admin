import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const SLUG_TO_OPERATIONAL_ROUTE: Record<string, string> = {
  'design': '/design',
  'merchandising': '/merchandising',
  'cutting': '/cutting',
  'printing': '/printing',
  'embroidery': '/embroidery',
  'stitching-sewing': '/stitching-sewing/dashboard',
  'stitching': '/stitching-sewing/dashboard',
  'sewing': '/stitching-sewing/dashboard',
  'washing': '/washing',
  'iron': '/iron',
  'ironing': '/iron',
  'ready-goods': '/ready-goods',
  'packing': '/ready-goods',
  'alter': '/alter',
  'alteration': '/alter',
  'store': '/store',
  'dispatch': '/dispatch',
}

export default async function ModuleForwardingPage({
  params
}: {
  params: Promise<{ moduleSlug: string }>
}) {
  const { moduleSlug } = await params
  const targetRoute = SLUG_TO_OPERATIONAL_ROUTE[moduleSlug.toLowerCase()]

  if (targetRoute) {
    redirect(targetRoute)
  }

  redirect('/modules')
}
