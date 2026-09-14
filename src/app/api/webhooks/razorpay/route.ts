import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey)

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      console.warn('[Razorpay Webhook] Missing x-razorpay-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.error('[Razorpay Webhook] Invalid webhook signature detected')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event

    console.log(`[Razorpay Webhook] Received validated event: ${eventType}`)

    if (eventType === 'payment_link.paid') {
      const plink = event.payload?.payment_link?.entity
      const payment = event.payload?.payment?.entity

      if (!plink) {
        return NextResponse.json({ received: true, note: 'No payment link payload' })
      }

      const razorpayLinkId = plink.id
      const paymentId = payment?.id || null
      const paymentMethod = payment?.method || 'online'
      const amountInr = (plink.amount || 0) / 100
      const tenantId = plink.notes?.tenant_id || null
      const companyName = plink.notes?.company_name || plink.customer?.name || 'Client Factory'
      const customerEmail = plink.customer?.email || null

      const nowIso = new Date().toISOString()

      // 1. Update public.platform_payment_links
      const { data: updatedLink, error: linkErr } = await supabaseAdmin
        .from('platform_payment_links')
        .update({
          status: 'PAID',
          payment_id: paymentId,
          payment_method: paymentMethod,
          paid_at: nowIso
        })
        .eq('razorpay_link_id', razorpayLinkId)
        .select('tenant_id, company_name, admin_email')
        .maybeSingle()

      if (linkErr) {
        console.warn('[Razorpay Webhook] Error updating payment link table:', linkErr.message)
      }

      const resolvedTenantId = tenantId || updatedLink?.tenant_id

      // 2. Automatically promote tenant to FULL_ACCESS and remove expiration
      if (resolvedTenantId) {
        const { error: tenantErr } = await supabaseAdmin
          .from('platform_tenant_factories')
          .update({
            access_type: 'FULL_ACCESS',
            status: 'ACTIVE',
            expires_at: null,
            revoked_at: null,
            last_active_at: nowIso
          })
          .eq('id', resolvedTenantId)

        if (tenantErr) {
          console.error('[Razorpay Webhook] Error upgrading tenant:', tenantErr.message)
        }
      }

      // 3. Insert into Platform Super Admin Audit Logs
      try {
        await supabaseAdmin.from('platform_audit_logs').insert([{
          log_code: `PAY-${Date.now().toString().slice(-4)}`,
          actor: 'razorpay-webhook@zigza.in',
          action: 'Payment Link Settled & Tenant Upgraded',
          category: 'CONFIG_CHANGE',
          details: `Razorpay Link ${razorpayLinkId} paid (₹${amountInr.toLocaleString('en-IN')}) via ${paymentMethod.toUpperCase()} for ${companyName}. Account upgraded to Full Access.`,
          ip_address: req.headers.get('x-forwarded-for') || 'Razorpay Gateway',
          location: 'India',
          status: 'SUCCESS'
        }])
      } catch (logErr) {
        console.warn('[Razorpay Webhook] Audit log warning:', logErr)
      }
    }

    return NextResponse.json({ success: true, event: eventType })
  } catch (err: any) {
    console.error('[Razorpay Webhook] Fatal processing exception:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
