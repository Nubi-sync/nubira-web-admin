import { Resend } from 'resend'

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// CDN URL for the curved corner combined logo in Supabase Storage
const ZIGZA_CURVED_LOGO_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_curved_logo.png'

// Reusable Brand Header with direct curved logo image (no outer box border, larger comfortable size)
function getBrandHeaderHtml(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
      <tr>
        <td style="padding: 0;">
          <img 
            src="${ZIGZA_CURVED_LOGO_URL}" 
            alt="Zigza" 
            width="170" 
            height="50" 
            style="width: 170px; height: 50px; display: block; border: 0; border-radius: 10px;"
          />
        </td>
      </tr>
    </table>
  `
}

// Clean recipient name formatter
function getRecipientName(adminName?: string, companyName?: string): string {
  const cleanAdmin = (adminName || '').trim()
  if (
    cleanAdmin &&
    !cleanAdmin.toLowerCase().includes('admin') &&
    !cleanAdmin.toLowerCase().includes('user') &&
    !cleanAdmin.toLowerCase().includes('staff')
  ) {
    return cleanAdmin
  }
  return (companyName || '').trim() || 'Valued Client'
}

export interface TenantActivationEmailParams {
  to: string
  companyName: string
  adminName: string
  loginEmail: string
  customUsername?: string
  initialPassword: string
  subscriptionTier: string
  divisionsCount?: number
  accessType?: string
}

export async function sendTenantActivationEmail(params: TenantActivationEmailParams) {
  const {
    to,
    companyName,
    adminName,
    loginEmail,
    customUsername,
    initialPassword,
    subscriptionTier,
    accessType
  } = params

  const client = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zigza Activation <noreply@zigza.in>'

  if (!client) {
    console.warn('[Resend] RESEND_API_KEY not set. Simulating activation email dispatch to:', to)
    return {
      success: true,
      simulated: true,
      message: 'RESEND_API_KEY is not configured in .env.local. Email dispatch was simulated.'
    }
  }

  try {
    const isTrial = accessType === 'DEMO_TRIAL'
    const recipient = getRecipientName(adminName, companyName)
    const planName = subscriptionTier === 'FULL_PLANT_AI' ? 'Full Plant (12 Div)' : (subscriptionTier === 'MODULAR' ? 'Modular Plan' : 'Custom Enterprise')

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Workspace Access - ${companyName}</title>
        <style>
          :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
          }
          @media (prefers-color-scheme: dark) {
            .email-bg { background-color: #0B1220 !important; }
            .email-card { background-color: #111827 !important; border-color: #1F2937 !important; }
            .email-heading { color: #FFFFFF !important; }
            .email-urgency { color: #60A5FA !important; }
            .email-text { color: #94A3B8 !important; }
            .email-subtext { color: #94A3B8 !important; }
            .email-table { background-color: #1E293B !important; border-color: #334155 !important; }
            .email-table-row { border-color: #334155 !important; }
            .email-table-label { color: #94A3B8 !important; }
            .email-table-val { color: #F8FAFC !important; }
          }
        </style>
      </head>
      <body class="email-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 44px 16px; color: #111827; -webkit-font-smoothing: antialiased;">
        <table class="email-card" role="presentation" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 44px 38px;">
              ${getBrandHeaderHtml()}

              <!-- Greeting -->
              <div class="email-heading" style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 6px; letter-spacing: -0.01em;">
                Dear ${recipient},
              </div>

              <!-- Sub-headline in Brand Color -->
              <div class="email-urgency" style="font-size: 16px; font-weight: 600; color: #1D4ED8; margin-bottom: 18px;">
                ${isTrial ? 'Your 7-day demo trial is ready.' : 'Your workspace is ready.'}
              </div>

              <!-- Message -->
              <p class="email-text" style="font-size: 15px; line-height: 1.65; color: #4B5563; font-weight: 400; margin: 0 0 24px;">
                Your cloud manufacturing workspace for <strong style="color: #111827; font-weight: 600;">${companyName}</strong> is initialized on <strong>zigza.in</strong> under the ${isTrial ? '7-day demo trial' : 'active production plan'}.
              </p>

              <!-- Credentials Table -->
              <table class="email-table" role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; border: 1px solid #ECE7DE; border-radius: 14px; margin-bottom: 26px; font-size: 15px; overflow: hidden;">
                <tr>
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; width: 40%;">Portal URL:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #1D4ED8; font-weight: 600; text-align: right;">https://zigza.in</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #ECE7DE;">
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Login Email:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; font-family: monospace; font-size: 14px; border-top: 1px solid #ECE7DE;">${loginEmail}</td>
                </tr>
                ${customUsername ? `
                <tr class="email-table-row" style="border-top: 1px solid #ECE7DE;">
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Username:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; font-family: monospace; font-size: 14px; border-top: 1px solid #ECE7DE;">${customUsername}</td>
                </tr>
                ` : ''}
                <tr class="email-table-row" style="border-top: 1px solid #ECE7DE;">
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Temporary Password:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #1D4ED8; font-weight: 700; text-align: right; font-family: monospace; font-size: 15px; border-top: 1px solid #ECE7DE;">${initialPassword}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #ECE7DE;">
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Plan:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #ECE7DE;">${isTrial ? '7-Day Demo Trial' : 'Active Plan'} (${planName})</td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 26px 0 20px;">
                <tr>
                  <td align="left" style="border-radius: 10px; background-color: #1D4ED8;">
                    <a 
                      href="https://zigza.in/login" 
                      style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 14px 30px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;"
                      target="_blank"
                    >
                      Sign In to Workspace
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <div class="email-subtext" style="font-size: 13.5px; color: #6B7280; line-height: 1.6; border-top: 1px solid #E5E7EB; padding-top: 22px; font-weight: 400;">
                Please change your password upon initial sign in. Need assistance? Reach out to <a href="mailto:support@zigza.in" style="color: #1D4ED8; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.5;">
          <a href="https://zigza.in" style="color: #64748B; text-decoration: none;">zigza.in</a> • Automated notification
        </div>
      </body>
      </html>
    `

    const result = await client.emails.send({
      from: fromEmail,
      to,
      subject: `Workspace Access - ${companyName}`,
      html: htmlContent,
    })

    if (result.error) {
      console.error('[sendTenantActivationEmail] Resend API error:', result.error)
      return { success: false, error: result.error.message || 'Resend rejected email dispatch' }
    }

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('[sendTenantActivationEmail] Error:', error)
    return { success: false, error: error?.message || 'Failed to send activation email via Resend' }
  }
}

export interface CustomInquiryNotificationParams {
  applicantName: string
  companyName: string
  phone: string
  email: string
  estimatedMachines?: number
  requirements: string
}

export async function sendCustomInquiryNotificationEmail(params: CustomInquiryNotificationParams) {
  const client = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zigza Alert <noreply@zigza.in>'

  if (!client) {
    console.warn('[Resend] Simulating custom inquiry notification email for:', params.companyName)
    return { success: true, simulated: true }
  }

  try {
    const adminNotificationEmail = process.env.PLATFORM_ADMIN_ALERT_EMAIL || 'shawsumit6286@gmail.com'

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Inquiry - ${params.companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 44px 16px; color: #111827;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); padding: 44px 38px;">
          <tr>
            <td>
              ${getBrandHeaderHtml()}
              <div style="font-size: 19px; font-weight: 700; color: #111827; margin-bottom: 16px; letter-spacing: -0.01em;">
                New Enterprise Inquiry: ${params.companyName}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; border: 1px solid #ECE7DE; border-radius: 14px; font-size: 15px; margin: 20px 0;">
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400;">Contact:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right;">${params.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Phone:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; font-family: monospace;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Email:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; font-family: monospace;">${params.email}</td>
                </tr>
                ${params.estimatedMachines ? `
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Machines:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right;">${params.estimatedMachines}</td>
                </tr>
                ` : ''}
              </table>
              <div style="margin-top: 24px;">
                <a 
                  href="https://zigza.in/platform-admin" 
                  style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;"
                >
                  Open Platform Admin
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const result = await client.emails.send({
      from: fromEmail,
      to: adminNotificationEmail,
      subject: `New Request: ${params.companyName} (${params.applicantName})`,
      html: htmlContent,
    })

    if (result.error) {
      console.error('[sendCustomInquiryNotificationEmail] Resend API error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('[sendCustomInquiryNotificationEmail] Error:', error)
    return { success: false, error: error?.message }
  }
}

export interface CustomerQueryNotificationParams {
  name: string
  phone: string
  query: string
  companyName?: string
}

export async function sendCustomerQueryNotificationEmail(params: CustomerQueryNotificationParams) {
  const client = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zigza Website <noreply@zigza.in>'
  const targetEmail = 'team.anga9@gmail.com'

  if (!client) {
    console.warn('[Resend] Simulating customer query notification dispatch to team.anga9@gmail.com:', params)
    return { success: true, simulated: true }
  }

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Website Query from ${params.name}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 44px 16px; color: #111827;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); padding: 44px 38px;">
          <tr>
            <td>
              ${getBrandHeaderHtml()}
              <div style="font-size: 19px; font-weight: 700; color: #111827; margin-bottom: 8px; letter-spacing: -0.01em;">
                New Website Lead Received
              </div>
              <p style="font-size: 14.5px; color: #6B7280; margin-top: 0; margin-bottom: 20px; font-weight: 400;">
                A prospective customer submitted a query on the Zigza website:
              </p>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; border: 1px solid #ECE7DE; border-radius: 14px; font-size: 15px; margin: 18px 0;">
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400;">Customer Name:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right;">${params.name}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Phone Number:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; font-family: monospace;">
                    <a href="tel:${params.phone.replace(/\s+/g, '')}" style="color: #1D4ED8; text-decoration: none;">${params.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">WhatsApp Direct:</td>
                  <td style="padding: 14px 20px; color: #047857; font-weight: 600; text-align: right;">
                    <a href="https://wa.me/91${params.phone.replace(/\D/g, '').slice(-10)}" style="color: #047857; text-decoration: none; font-weight: 600;">Open WhatsApp &rarr;</a>
                  </td>
                </tr>
                ${params.companyName ? `
                <tr>
                  <td style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Factory / Unit:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right;">${params.companyName}</td>
                </tr>
                ` : ''}
              </table>

              <div style="margin: 20px 0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6B7280; margin-bottom: 6px; letter-spacing: 0.05em;">
                  Requirement Details:
                </div>
                <div style="background: #FAF8F5; border: 1px solid #ECE7DE; border-radius: 10px; padding: 14px; font-size: 14.5px; line-height: 1.6; color: #111827; white-space: pre-wrap;">
                  ${params.query}
                </div>
              </div>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <a 
                  href="tel:${params.phone.replace(/\s+/g, '')}" 
                  style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none;"
                >
                  Call ${params.name} Now
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const result = await client.emails.send({
      from: fromEmail,
      to: targetEmail,
      subject: `New Customer Query: ${params.name} (${params.phone})`,
      html: htmlContent,
    })

    if (result.error) {
      console.error('[sendCustomerQueryNotificationEmail] Resend API error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('[sendCustomerQueryNotificationEmail] Error:', error)
    return { success: false, error: error?.message || 'Failed to dispatch email' }
  }
}

export interface PaymentReminderEmailParams {
  to: string
  companyName: string
  adminName: string
  accessType: string
  planTier: string
  monthlyBillingInr: number
  expiresAt?: string
}

export async function sendPaymentReminderEmail(params: PaymentReminderEmailParams) {
  const {
    to,
    companyName,
    adminName,
    accessType,
    planTier,
    monthlyBillingInr,
    expiresAt
  } = params

  const client = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zigza Activation <noreply@zigza.in>'

  if (!client) {
    console.warn('[Resend] RESEND_API_KEY not set. Simulating payment reminder email dispatch to:', to)
    return {
      success: true,
      simulated: true,
      message: 'RESEND_API_KEY is not configured in .env.local. Payment reminder email was simulated.'
    }
  }

  try {
    const isTrial = accessType === 'DEMO_TRIAL'
    const recipient = getRecipientName(adminName, companyName)
    const expiryFormatted = expiresAt ? new Date(expiresAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'Pending'

    let urgencyText = ''
    if (expiresAt) {
      const diffTime = new Date(expiresAt).getTime() - Date.now()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 1) {
        urgencyText = `Your ${isTrial ? 'trial' : 'subscription'} ends in ${diffDays} days.`
      } else if (diffDays === 1) {
        urgencyText = `Your ${isTrial ? 'trial' : 'subscription'} ends tomorrow.`
      } else if (diffDays === 0) {
        urgencyText = `Your ${isTrial ? 'trial' : 'subscription'} ends today.`
      } else {
        urgencyText = `Your ${isTrial ? 'trial' : 'subscription'} has expired.`
      }
    } else {
      urgencyText = isTrial ? 'Your 7-day demo trial is currently active.' : 'Your subscription is due for renewal.'
    }

    const planName = planTier === 'FULL_PLANT_AI' ? 'Full Plant (₹4,999/mo)' : (planTier === 'MODULAR' ? 'Modular Plan' : `Custom Enterprise (₹${monthlyBillingInr.toLocaleString('en-IN')}/mo)`)
    const buttonLabel = isTrial ? 'Activate Subscription' : 'Renew Subscription'

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Subscription Notice - ${companyName}</title>
        <style>
          :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
          }
          @media (prefers-color-scheme: dark) {
            .email-bg { background-color: #0B1220 !important; }
            .email-card { background-color: #111827 !important; border-color: #1F2937 !important; }
            .email-heading { color: #FFFFFF !important; }
            .email-urgency { color: #60A5FA !important; }
            .email-text { color: #94A3B8 !important; }
            .email-subtext { color: #94A3B8 !important; }
            .email-table { background-color: #1E293B !important; border-color: #334155 !important; }
            .email-table-row { border-color: #334155 !important; }
            .email-table-label { color: #94A3B8 !important; }
            .email-table-val { color: #F8FAFC !important; }
            .email-table-bottom { background-color: #2D3748 !important; border-color: #4A5568 !important; color: #FFFFFF !important; }
          }
        </style>
      </head>
      <body class="email-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 44px 16px; color: #111827; -webkit-font-smoothing: antialiased;">
        <table class="email-card" role="presentation" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 44px 38px;">
              ${getBrandHeaderHtml()}

              <!-- Greeting -->
              <div class="email-heading" style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 6px; letter-spacing: -0.01em;">
                Dear ${recipient},
              </div>

              <!-- Urgency Headline in Brand Color -->
              <div class="email-urgency" style="font-size: 16px; font-weight: 600; color: #1D4ED8; margin-bottom: 18px;">
                ${urgencyText}
              </div>

              <!-- Message Text -->
              <p class="email-text" style="font-size: 15px; line-height: 1.65; color: #4B5563; font-weight: 400; margin: 0 0 24px;">
                Your 7-day demo trial for <strong style="color: #111827; font-weight: 600;">${companyName}</strong> is active until <strong style="color: #111827; font-weight: 600;">${expiryFormatted}</strong>. Review your plan details below and activate your subscription to maintain uninterrupted plant operations.
              </p>

              <!-- Table Container matching Screenshot 2 layout and styling -->
              <table class="email-table" role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF8F5; border: 1px solid #ECE7DE; border-radius: 14px; margin-bottom: 26px; font-size: 15px; overflow: hidden;">
                <tr>
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; width: 38%;">Factory:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right;">${companyName}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #ECE7DE;">
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Status:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #ECE7DE;">${isTrial ? '7-Day Demo Trial' : 'Active Plan'}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #ECE7DE;">
                  <td class="email-table-label" style="padding: 14px 20px; color: #6B7280; font-weight: 400; border-top: 1px solid #ECE7DE;">Plan:</td>
                  <td class="email-table-val" style="padding: 14px 20px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #ECE7DE;">${planName}</td>
                </tr>
                ${expiresAt ? `
                <tr class="email-table-bottom" style="background-color: #EFECE6; border-top: 1px solid #E5DFD5;">
                  <td style="padding: 14px 20px; color: #111827; font-weight: 600; border-top: 1px solid #E5DFD5;">Valid Until:</td>
                  <td style="padding: 14px 20px; color: #111827; font-weight: 700; text-align: right; border-top: 1px solid #E5DFD5;">${expiryFormatted}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Action Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 26px 0 20px;">
                <tr>
                  <td align="left" style="border-radius: 10px; background-color: #1D4ED8;">
                    <a 
                      href="https://zigza.in/profile?highlight=subscription#subscription" 
                      style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 14px 30px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;"
                      target="_blank"
                    >
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Consequence sentence -->
              <div class="email-subtext" style="font-size: 13.5px; color: #6B7280; line-height: 1.6; margin-bottom: 26px; font-weight: 400;">
                Production modules and active factory tracking will pause if access lapses past the expiry date.
              </div>

              <!-- Assistance Note -->
              <div class="email-subtext" style="font-size: 13.5px; color: #6B7280; line-height: 1.6; border-top: 1px solid #E5E7EB; padding-top: 22px; font-weight: 400;">
                Need assistance or a custom invoice? Reach out to <a href="mailto:support@zigza.in" style="color: #1D4ED8; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.5;">
          <a href="https://zigza.in" style="color: #64748B; text-decoration: none;">zigza.in</a> • Automated notification
        </div>
      </body>
      </html>
    `

    const result = await client.emails.send({
      from: fromEmail,
      to,
      subject: `Subscription Notice - ${companyName}`,
      html: htmlContent,
    })

    if (result.error) {
      console.error('[sendPaymentReminderEmail] Resend API error:', result.error)
      return { success: false, error: result.error.message || 'Resend rejected payment reminder email dispatch' }
    }

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('[sendPaymentReminderEmail] Error:', error)
    return { success: false, error: error?.message || 'Failed to send payment reminder email' }
  }
}
