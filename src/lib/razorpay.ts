import crypto from 'crypto'

export interface CreatePaymentLinkParams {
  amountInr: number
  companyName: string
  adminName: string
  adminEmail: string
  phone?: string
  tenantId?: string
  planTier?: string
  description?: string
}

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_LIVE_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_LIVE_KEY_SECRET
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_LIVE_WEBHOOK_SECRET
  return { keyId, keySecret, webhookSecret }
}

export async function createRazorpayPaymentLink(params: CreatePaymentLinkParams): Promise<{
  success: boolean
  linkId?: string
  shortUrl?: string
  simulated?: boolean
  error?: string
}> {
  const { keyId, keySecret } = getRazorpayCredentials()

  if (!keyId || !keySecret) {
    console.error('[Razorpay] Keys not loaded in environment (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). Restart your Next.js dev server.')
    return {
      success: false,
      error: 'Razorpay keys not loaded in server environment. Please restart Next.js server.'
    }
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
    const amountInPaise = Math.round((params.amountInr || 4999) * 100)

    const cleanPhone = params.phone ? params.phone.replace(/[^\d+]/g, '') : undefined

    const bodyPayload = {
      amount: amountInPaise,
      currency: 'INR',
      accept_partial: false,
      description: params.description || `Zigza Enterprise MES - ${params.companyName} (${(params.planTier || 'FULL_PLANT_AI').replace(/_/g, ' ')})`,
      customer: {
        name: params.adminName,
        email: params.adminEmail,
        contact: cleanPhone && cleanPhone.length >= 10 ? cleanPhone : undefined
      },
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: true,
      notes: {
        tenant_id: params.tenantId || '',
        company_name: params.companyName,
        subscription_tier: params.planTier || 'FULL_PLANT_AI'
      }
    }

    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      console.error('[createRazorpayPaymentLink] Razorpay error response:', data)
      return {
        success: false,
        error: data.error?.description || data.error?.message || 'Razorpay rejected payment link creation'
      }
    }

    return {
      success: true,
      linkId: data.id,
      shortUrl: data.short_url
    }
  } catch (err: any) {
    console.error('[createRazorpayPaymentLink] Network/Execution error:', err)
    return {
      success: false,
      error: err?.message || 'Failed to communicate with Razorpay API'
    }
  }
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getRazorpayCredentials()
  if (!webhookSecret) {
    console.warn('[verifyRazorpayWebhookSignature] RAZORPAY_WEBHOOK_SECRET is not set.')
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    return expectedSignature === signature
  } catch (e) {
    console.error('[verifyRazorpayWebhookSignature] Signature verification error:', e)
    return false
  }
}
