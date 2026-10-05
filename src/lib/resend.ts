import { Resend } from 'resend'

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// CDN URL for the combined logo with icon + wordmark in Supabase Storage
const ZIGZA_COMBINED_LOGO_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_combined_logo.png'

// Reusable Brand Header with curved corner badge for Android & Dark Mode immunity
function getBrandHeaderHtml(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 22px;">
      <tr>
        <td class="logo-badge-container" style="background-color: #FFFFFF !important; border: 1px solid #E2E8F0; border-radius: 12px; padding: 7px 14px; display: inline-block; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">
          <img 
            src="${ZIGZA_COMBINED_LOGO_URL}" 
            alt="Zigza" 
            height="26" 
            style="height: 26px; width: auto; max-width: 140px; display: block; border: 0;"
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
            .email-text { color: #94A3B8 !important; }
            .email-table { background-color: #1E293B !important; }
            .email-table-row { border-color: #334155 !important; }
            .email-table-label { color: #94A3B8 !important; }
            .email-table-val { color: #F8FAFC !important; }
            .logo-badge-container { background-color: #FFFFFF !important; border-color: #E2E8F0 !important; }
          }
        </style>
      </head>
      <body class="email-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #1E293B; -webkit-font-smoothing: antialiased;">
        <table class="email-card" role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 36px 32px;">
              ${getBrandHeaderHtml()}

              <!-- Greeting -->
              <div class="email-heading" style="font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">
                Dear ${recipient},
              </div>

              <!-- Headline -->
              <div class="email-heading" style="font-size: 13.5px; font-weight: 700; color: #1E293B; margin-bottom: 14px;">
                ${isTrial ? 'Your 7-day demo trial is ready.' : 'Your workspace is ready.'}
              </div>

              <!-- Message -->
              <p class="email-text" style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 18px;">
                Your cloud manufacturing workspace for <strong>${companyName}</strong> is initialized on <strong>zigza.in</strong> under the ${isTrial ? '7-day demo trial' : 'active production plan'}.
              </p>

              <!-- Credentials Table -->
              <table class="email-table" role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8F9FA; border-radius: 10px; margin-bottom: 22px; font-size: 13px; overflow: hidden; border: 1px solid #E9ECEF;">
                <tr>
                  <td class="email-table-label" style="padding: 12px 18px 8px; color: #6C757D; font-weight: 500; width: 40%;">Portal URL:</td>
                  <td class="email-table-val" style="padding: 12px 18px 8px; color: #1D4ED8; font-weight: 700; text-align: right;">https://zigza.in</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E9ECEF;">
                  <td class="email-table-label" style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Login Email:</td>
                  <td class="email-table-val" style="padding: 8px 18px; color: #212529; font-weight: 600; text-align: right; font-family: monospace; font-size: 12.5px; border-top: 1px solid #E9ECEF;">${loginEmail}</td>
                </tr>
                ${customUsername ? `
                <tr class="email-table-row" style="border-top: 1px solid #E9ECEF;">
                  <td class="email-table-label" style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Username:</td>
                  <td class="email-table-val" style="padding: 8px 18px; color: #212529; font-weight: 600; text-align: right; font-family: monospace; font-size: 12.5px; border-top: 1px solid #E9ECEF;">${customUsername}</td>
                </tr>
                ` : ''}
                <tr class="email-table-row" style="border-top: 1px solid #E9ECEF;">
                  <td class="email-table-label" style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Temporary Password:</td>
                  <td class="email-table-val" style="padding: 8px 18px; color: #1D4ED8; font-weight: 700; text-align: right; font-family: monospace; font-size: 13px; border-top: 1px solid #E9ECEF;">${initialPassword}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E9ECEF;">
                  <td class="email-table-label" style="padding: 8px 18px 12px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Plan:</td>
                  <td class="email-table-val" style="padding: 8px 18px 12px; color: #212529; font-weight: 600; text-align: right; border-top: 1px solid #E9ECEF;">${isTrial ? '7-Day Demo Trial' : 'Active Plan'} (${planName})</td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px 0 16px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1D4ED8;">
                    <a 
                      href="https://zigza.in/login" 
                      style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 13px 28px; border-radius: 8px; font-size: 13.5px; font-weight: 700; text-decoration: none;"
                      target="_blank"
                    >
                      Sign In to Workspace
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <div class="email-text" style="font-size: 12px; color: #6C757D; line-height: 1.5; border-top: 1px solid #E9ECEF; padding-top: 16px; margin-top: 20px;">
                Please change your password upon initial sign in. Need assistance? Reach out to <a href="mailto:support@zigza.in" style="color: #1D4ED8; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 22px; text-align: center; font-size: 11px; color: #94A3B8; line-height: 1.5;">
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #1E293B;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); padding: 36px 32px;">
          <tr>
            <td>
              ${getBrandHeaderHtml()}
              <div style="font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 14px;">
                New Enterprise Inquiry: ${params.companyName}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8F9FA; border-radius: 10px; font-size: 13px; margin: 16px 0; border: 1px solid #E9ECEF;">
                <tr>
                  <td style="padding: 12px 18px 8px; color: #6C757D; font-weight: 500;">Contact:</td>
                  <td style="padding: 12px 18px 8px; color: #212529; font-weight: 700; text-align: right;">${params.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Phone:</td>
                  <td style="padding: 8px 18px; color: #212529; font-weight: 700; text-align: right; font-family: monospace;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Email:</td>
                  <td style="padding: 8px 18px; color: #212529; font-weight: 700; text-align: right; font-family: monospace;">${params.email}</td>
                </tr>
                ${params.estimatedMachines ? `
                <tr>
                  <td style="padding: 8px 18px 12px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Machines:</td>
                  <td style="padding: 8px 18px 12px; color: #212529; font-weight: 700; text-align: right;">${params.estimatedMachines}</td>
                </tr>
                ` : ''}
              </table>
              <div style="margin-top: 20px;">
                <a 
                  href="https://zigza.in/platform-admin" 
                  style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 12px 24px; border-radius: 8px; font-size: 13.5px; font-weight: 700; text-decoration: none;"
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #1E293B;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); padding: 36px 32px;">
          <tr>
            <td>
              ${getBrandHeaderHtml()}
              <div style="font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 8px;">
                New Website Lead Received
              </div>
              <p style="font-size: 13px; color: #6C757D; margin-top: 0; margin-bottom: 16px;">
                A prospective customer submitted a query on the Zigza website:
              </p>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8F9FA; border-radius: 10px; font-size: 13px; margin: 14px 0; border: 1px solid #E9ECEF;">
                <tr>
                  <td style="padding: 12px 18px 8px; color: #6C757D; font-weight: 500;">Customer Name:</td>
                  <td style="padding: 12px 18px 8px; color: #212529; font-weight: 700; text-align: right;">${params.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Phone Number:</td>
                  <td style="padding: 8px 18px; color: #212529; font-weight: 700; text-align: right; font-family: monospace;">
                    <a href="tel:${params.phone.replace(/\s+/g, '')}" style="color: #1D4ED8; text-decoration: none;">${params.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">WhatsApp Direct:</td>
                  <td style="padding: 8px 18px; color: #047857; font-weight: 700; text-align: right;">
                    <a href="https://wa.me/91${params.phone.replace(/\D/g, '').slice(-10)}" style="color: #047857; text-decoration: none; font-weight: bold;">Open WhatsApp &rarr;</a>
                  </td>
                </tr>
                ${params.companyName ? `
                <tr>
                  <td style="padding: 8px 18px 12px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Factory / Unit:</td>
                  <td style="padding: 8px 18px 12px; color: #212529; font-weight: 600; text-align: right;">${params.companyName}</td>
                </tr>
                ` : ''}
              </table>

              <div style="margin: 16px 0;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6C757D; margin-bottom: 6px; letter-spacing: 0.05em;">
                  Requirement Details:
                </div>
                <div style="background: #F8F9FA; border: 1px solid #E9ECEF; border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.5; color: #212529; white-space: pre-wrap;">
                  ${params.query}
                </div>
              </div>

              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E9ECEF;">
                <a 
                  href="tel:${params.phone.replace(/\s+/g, '')}" 
                  style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none;"
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
            .email-text { color: #94A3B8 !important; }
            .email-table { background-color: #1E293B !important; }
            .email-table-row { border-color: #334155 !important; }
            .email-table-label { color: #94A3B8 !important; }
            .email-table-val { color: #F8FAFC !important; }
            .email-table-bottom { background-color: #2D3748 !important; }
            .logo-badge-container { background-color: #FFFFFF !important; border-color: #E2E8F0 !important; }
          }
        </style>
      </head>
      <body class="email-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #1E293B; -webkit-font-smoothing: antialiased;">
        <table class="email-card" role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 36px 32px;">
              ${getBrandHeaderHtml()}

              <!-- Greeting -->
              <div class="email-heading" style="font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">
                Dear ${recipient},
              </div>

              <!-- Urgency Headline -->
              <div class="email-heading" style="font-size: 13.5px; font-weight: 700; color: #1E293B; margin-bottom: 14px;">
                ${urgencyText}
              </div>

              <!-- Message Text -->
              <p class="email-text" style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 18px;">
                Your 7-day demo trial for <strong>${companyName}</strong> is active until <strong>${expiryFormatted}</strong>. Review your plan details below and activate your subscription to maintain uninterrupted plant operations.
              </p>

              <!-- Table Container matching original layout -->
              <table class="email-table" role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8F9FA; border-radius: 10px; margin-bottom: 22px; font-size: 13px; overflow: hidden; border: 1px solid #E9ECEF;">
                <tr>
                  <td class="email-table-label" style="padding: 12px 18px 8px; color: #6C757D; font-weight: 500; width: 38%;">Factory:</td>
                  <td class="email-table-val" style="padding: 12px 18px 8px; color: #212529; font-weight: 700; text-align: right;">${companyName}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E9ECEF;">
                  <td class="email-table-label" style="padding: 8px 18px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Status:</td>
                  <td class="email-table-val" style="padding: 8px 18px; color: #212529; font-weight: 600; text-align: right; border-top: 1px solid #E9ECEF;">${isTrial ? '7-Day Demo Trial' : 'Active Plan'}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E9ECEF;">
                  <td class="email-table-label" style="padding: 8px 18px 10px; color: #6C757D; font-weight: 500; border-top: 1px solid #E9ECEF;">Plan:</td>
                  <td class="email-table-val" style="padding: 8px 18px 10px; color: #212529; font-weight: 600; text-align: right; border-top: 1px solid #E9ECEF;">${planName}</td>
                </tr>
                ${expiresAt ? `
                <tr class="email-table-bottom" style="background-color: #ECEEEF; border-top: 1px solid #DFE3E6;">
                  <td style="padding: 11px 18px; color: #212529; font-weight: 700; border-top: 1px solid #DFE3E6;">Valid Until:</td>
                  <td style="padding: 11px 18px; color: #212529; font-weight: 700; text-align: right; border-top: 1px solid #DFE3E6;">${expiryFormatted}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Action Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px 0 16px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #1D4ED8;">
                    <a 
                      href="https://zigza.in/profile?highlight=subscription#subscription" 
                      style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 13px 28px; border-radius: 8px; font-size: 13.5px; font-weight: 700; text-decoration: none;"
                      target="_blank"
                    >
                      ${buttonLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Consequence sentence -->
              <div class="email-text" style="font-size: 12px; color: #6C757D; line-height: 1.5; margin-bottom: 22px;">
                Production modules and active factory tracking will pause if access lapses past the expiry date.
              </div>

              <!-- Assistance Note -->
              <div class="email-text" style="font-size: 12px; color: #6C757D; line-height: 1.5; border-top: 1px solid #E9ECEF; padding-top: 16px;">
                Need assistance or a custom invoice? Reach out to <a href="mailto:support@zigza.in" style="color: #1D4ED8; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 22px; text-align: center; font-size: 11px; color: #94A3B8; line-height: 1.5;">
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
