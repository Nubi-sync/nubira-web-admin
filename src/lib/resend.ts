import { Resend } from 'resend'

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// CDN URLs for hosted public assets in Supabase
const ZIGZA_ICON_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_icon.png'
const ZIGZA_LOGO_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_new_logo.png'

// Reusable Brand Header with Android & Email Dark Mode Immunity
function getBrandHeaderHtml(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td class="logo-badge-container" style="background-color: #FFFFFF !important; border: 1px solid #E2E8F0; border-radius: 12px; padding: 8px 14px; display: inline-block; box-shadow: 0 2px 8px rgba(11,18,32,0.04);">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <img 
                  src="${ZIGZA_ICON_URL}" 
                  alt="Zigza" 
                  width="28" 
                  height="28" 
                  style="width: 28px; height: 28px; display: block; border: 0;"
                />
              </td>
              <td style="vertical-align: middle;">
                <img 
                  src="${ZIGZA_LOGO_URL}" 
                  alt="Zigza" 
                  height="22" 
                  style="height: 22px; width: auto; display: block; border: 0;"
                />
              </td>
            </tr>
          </table>
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
            .email-highlight-text { color: #FFFFFF !important; }
            .email-table { background-color: #1E293B !important; border-color: #334155 !important; }
            .email-table-row { border-color: #334155 !important; }
            .email-table-label { color: #94A3B8 !important; }
            .email-table-val { color: #F8FAFC !important; }
            .logo-badge-container { background-color: #FFFFFF !important; border-color: #E2E8F0 !important; }
          }
        </style>
      </head>
      <body class="email-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #0B1220; -webkit-font-smoothing: antialiased;">
        <table class="email-card" role="presentation" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 18px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(11,18,32,0.06); overflow: hidden;">
          <tr>
            <td style="padding: 36px 32px;">
              ${getBrandHeaderHtml()}

              <!-- Status Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: #F0FDFA; border: 1px solid rgba(20,200,180,0.35); border-radius: 20px; padding: 4px 12px;">
                    <span style="font-size: 11.5px; font-weight: 700; font-family: monospace; color: #0B1220; text-transform: uppercase; letter-spacing: 0.5px;">
                      ● ${isTrial ? '7-Day Free Trial Activated' : 'Enterprise Workspace Active'}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <div class="email-heading" style="font-size: 20px; font-weight: 800; color: #0B1220; margin-bottom: 10px; letter-spacing: -0.02em;">
                Dear ${recipient},
              </div>

              <!-- Intro Message -->
              <p class="email-text" style="font-size: 14.5px; line-height: 1.65; color: #475569; font-weight: 400; margin: 0 0 22px;">
                Your cloud manufacturing workspace for <strong class="email-highlight-text" style="color: #0B1220;">${companyName}</strong> is initialized on <strong style="color: #1D4ED8;">zigza.in</strong> under the ${isTrial ? '7-day evaluation trial' : 'active production plan'}.
              </p>

              <!-- Credentials Table -->
              <table class="email-table" role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px; font-size: 13.5px; overflow: hidden;">
                <tr>
                  <td class="email-table-label" style="padding: 13px 18px 9px; color: #64748B; font-weight: 500; width: 36%;">Portal URL:</td>
                  <td class="email-table-val" style="padding: 13px 18px 9px; color: #1D4ED8; font-weight: 700; text-align: right;">https://zigza.in</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E2E8F0;">
                  <td class="email-table-label" style="padding: 9px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Login Email:</td>
                  <td class="email-table-val" style="padding: 9px 18px; color: #0B1220; font-weight: 600; text-align: right; font-family: monospace; font-size: 13px; border-top: 1px solid #E2E8F0;">${loginEmail}</td>
                </tr>
                ${customUsername ? `
                <tr class="email-table-row" style="border-top: 1px solid #E2E8F0;">
                  <td class="email-table-label" style="padding: 9px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Username:</td>
                  <td class="email-table-val" style="padding: 9px 18px; color: #0B1220; font-weight: 600; text-align: right; font-family: monospace; font-size: 13px; border-top: 1px solid #E2E8F0;">${customUsername}</td>
                </tr>
                ` : ''}
                <tr class="email-table-row" style="border-top: 1px solid #E2E8F0;">
                  <td class="email-table-label" style="padding: 9px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Temporary Password:</td>
                  <td class="email-table-val" style="padding: 9px 18px; color: #1D4ED8; font-weight: 800; text-align: right; font-family: monospace; font-size: 14px; border-top: 1px solid #E2E8F0;">${initialPassword}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E2E8F0;">
                  <td class="email-table-label" style="padding: 9px 18px 13px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Plan Status:</td>
                  <td class="email-table-val" style="padding: 9px 18px 13px; color: #047857; font-weight: 700; text-align: right; border-top: 1px solid #E2E8F0;">${isTrial ? '7-Day Free Trial' : 'Active Plan'} (${planName})</td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0 16px;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #0B1220;">
                    <a 
                      href="https://zigza.in/login" 
                      style="display: inline-block; background-color: #0B1220; color: #FFFFFF !important; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.01em; box-shadow: 0 4px 14px rgba(11,18,32,0.25);"
                      target="_blank"
                    >
                      Sign In to Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <div class="email-text" style="font-size: 12.5px; color: #64748B; line-height: 1.6; margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 18px;">
                Please change your password upon initial sign in. Need assistance? Contact our engineering desk at <a href="mailto:support@zigza.in" style="color: #1D4ED8; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 11.5px; color: #94A3B8; line-height: 1.5;">
          <a href="https://zigza.in" style="color: #64748B; text-decoration: none; font-weight: 600;">zigza.in</a> • Apparel Manufacturing Execution System<br>
          Automated security dispatch.
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #0B1220;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 18px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(11,18,32,0.06); padding: 36px 32px;">
          <tr>
            <td>
              ${getBrandHeaderHtml()}
              <div style="font-size: 18px; font-weight: 800; color: #0B1220; margin-bottom: 14px; letter-spacing: -0.01em;">
                New Enterprise Inquiry: ${params.companyName}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; font-size: 13.5px; margin: 18px 0;">
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500;">Contact:</td>
                  <td style="padding: 12px 18px; color: #0B1220; font-weight: 700; text-align: right;">${params.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Phone:</td>
                  <td style="padding: 12px 18px; color: #0B1220; font-weight: 700; text-align: right; font-family: monospace;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Email:</td>
                  <td style="padding: 12px 18px; color: #0B1220; font-weight: 700; text-align: right; font-family: monospace;">${params.email}</td>
                </tr>
                ${params.estimatedMachines ? `
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Machines:</td>
                  <td style="padding: 12px 18px; color: #0B1220; font-weight: 700; text-align: right;">${params.estimatedMachines}</td>
                </tr>
                ` : ''}
              </table>
              <div style="margin-top: 24px;">
                <a 
                  href="https://zigza.in/platform-admin" 
                  style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 12px 26px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none;"
                >
                  Open Platform Admin &rarr;
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #0B1220;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 18px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(11,18,32,0.06); padding: 36px 32px;">
          <tr>
            <td>
              ${getBrandHeaderHtml()}
              <div style="font-size: 20px; font-weight: 800; color: #0B1220; margin-bottom: 8px; letter-spacing: -0.01em;">
                New Website Lead Received
              </div>
              <p style="font-size: 14px; color: #64748B; margin-top: 0; margin-bottom: 20px;">
                A prospective customer submitted a query on the Zigza website:
              </p>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; font-size: 14px; margin: 16px 0;">
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500;">Customer Name:</td>
                  <td style="padding: 12px 18px; color: #0B1220; font-weight: 700; text-align: right;">${params.name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Phone Number:</td>
                  <td style="padding: 12px 18px; color: #0B1220; font-weight: 700; text-align: right; font-family: monospace; font-size: 14px;">
                    <a href="tel:${params.phone.replace(/\s+/g, '')}" style="color: #1D4ED8; text-decoration: none;">${params.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">WhatsApp Direct:</td>
                  <td style="padding: 12px 18px; color: #047857; font-weight: 700; text-align: right;">
                    <a href="https://wa.me/91${params.phone.replace(/\D/g, '').slice(-10)}" style="color: #047857; text-decoration: none; font-weight: bold;">Open WhatsApp Chat &rarr;</a>
                  </td>
                </tr>
                ${params.companyName ? `
                <tr>
                  <td style="padding: 12px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Factory / Unit:</td>
                  <td style="padding: 12px 18px; color: #0B1220; font-weight: 600; text-align: right;">${params.companyName}</td>
                </tr>
                ` : ''}
              </table>

              <div style="margin: 20px 0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 6px; letter-spacing: 0.05em;">
                  Requirement Details:
                </div>
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; font-size: 14px; line-height: 1.6; color: #0B1220; white-space: pre-wrap;">
                  ${params.query}
                </div>
              </div>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
                <a 
                  href="tel:${params.phone.replace(/\s+/g, '')}" 
                  style="display: inline-block; background-color: #0B1220; color: #FFFFFF !important; padding: 10px 22px; border-radius: 10px; font-size: 13.5px; font-weight: 700; text-decoration: none;"
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

    const planName = planTier === 'FULL_PLANT_AI' ? 'Full Plant (12 Div)' : (planTier === 'MODULAR' ? 'Modular Plan' : 'Custom Enterprise')
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
            .email-highlight-text { color: #FFFFFF !important; }
            .email-table { background-color: #1E293B !important; border-color: #334155 !important; }
            .email-table-row { border-color: #334155 !important; }
            .email-table-label { color: #94A3B8 !important; }
            .email-table-val { color: #F8FAFC !important; }
            .email-table-highlight { background-color: #0F2936 !important; border-color: #14C8B4 !important; }
            .email-table-highlight-val { color: #14C8B4 !important; }
            .logo-badge-container { background-color: #FFFFFF !important; border-color: #E2E8F0 !important; }
          }
        </style>
      </head>
      <body class="email-bg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 16px; color: #0B1220; -webkit-font-smoothing: antialiased;">
        <table class="email-card" role="presentation" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; margin: 0 auto; background: #FFFFFF; border-radius: 18px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(11,18,32,0.06); overflow: hidden;">
          <tr>
            <td style="padding: 36px 32px;">
              ${getBrandHeaderHtml()}

              <!-- Status Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: #F0FDFA; border: 1px solid rgba(20,200,180,0.35); border-radius: 20px; padding: 4px 12px;">
                    <span style="font-size: 11.5px; font-weight: 700; font-family: monospace; color: #0B1220; text-transform: uppercase; letter-spacing: 0.5px;">
                      ● ${isTrial ? '7-Day Free Trial Notice' : 'Subscription Renewal Notice'}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <div class="email-heading" style="font-size: 20px; font-weight: 800; color: #0B1220; margin-bottom: 6px; letter-spacing: -0.02em;">
                Dear ${recipient},
              </div>

              <!-- Urgency Signal Line -->
              <div style="font-size: 15px; font-weight: 700; color: #1D4ED8; margin-bottom: 16px;">
                ${urgencyText}
              </div>

              <!-- Content Message -->
              <p class="email-text" style="font-size: 14.5px; line-height: 1.65; color: #475569; font-weight: 400; margin: 0 0 22px;">
                ${isTrial
                  ? `Your 7-day evaluation trial for <strong class="email-highlight-text" style="color: #0B1220;">${companyName}</strong> is active until <strong class="email-highlight-text" style="color: #0B1220;">${expiryFormatted}</strong>. Review your plan details below and activate your subscription to maintain uninterrupted plant operations.`
                  : `Your subscription for <strong class="email-highlight-text" style="color: #0B1220;">${companyName}</strong> is due for renewal on <strong class="email-highlight-text" style="color: #0B1220;">${expiryFormatted}</strong>. Please renew your plan to continue accessing production tracking and reporting modules.`
                }
              </p>

              <!-- Properly aligned Key-Value Table with highlighted Valid Until row -->
              <table class="email-table" role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px; font-size: 13.5px; overflow: hidden;">
                <tr>
                  <td class="email-table-label" style="padding: 14px 18px 10px; color: #64748B; font-weight: 500; width: 38%;">Factory:</td>
                  <td class="email-table-val" style="padding: 14px 18px 10px; color: #0B1220; font-weight: 700; text-align: right;">${companyName}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E2E8F0;">
                  <td class="email-table-label" style="padding: 10px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Account Status:</td>
                  <td class="email-table-val" style="padding: 10px 18px; color: #047857; font-weight: 700; text-align: right; border-top: 1px solid #E2E8F0;">${isTrial ? '7-Day Demo Trial' : 'Active Plan'}</td>
                </tr>
                <tr class="email-table-row" style="border-top: 1px solid #E2E8F0;">
                  <td class="email-table-label" style="padding: 10px 18px; color: #64748B; font-weight: 500; border-top: 1px solid #E2E8F0;">Plan:</td>
                  <td class="email-table-val" style="padding: 10px 18px; color: #0B1220; font-weight: 700; text-align: right; border-top: 1px solid #E2E8F0;">${planName} (₹${monthlyBillingInr.toLocaleString('en-IN')}/mo)</td>
                </tr>
                ${expiresAt ? `
                <tr class="email-table-highlight" style="background-color: #F0FDFA; border-top: 1.5px solid rgba(20,200,180,0.35);">
                  <td style="padding: 13px 18px; color: #0B1220; font-weight: 700; border-top: 1.5px solid rgba(20,200,180,0.35);">Valid Until:</td>
                  <td class="email-table-highlight-val" style="padding: 13px 18px; color: #0B1220; font-weight: 800; text-align: right; font-family: monospace; font-size: 14px; border-top: 1.5px solid rgba(20,200,180,0.35);">${expiryFormatted}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Call To Action Button with brand color -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0 16px;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #1D4ED8;">
                    <a 
                      href="https://zigza.in/profile?highlight=subscription#subscription" 
                      style="display: inline-block; background-color: #1D4ED8; color: #FFFFFF !important; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.01em; box-shadow: 0 4px 14px rgba(29, 78, 216, 0.35);"
                      target="_blank"
                    >
                      ${buttonLabel} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sentence of Consequence -->
              <div class="email-text" style="font-size: 12.5px; color: #64748B; line-height: 1.55; margin-bottom: 24px;">
                Production modules and active factory tracking will pause if access lapses past the expiry date.
              </div>

              <!-- Note -->
              <div class="email-text" style="font-size: 12.5px; color: #64748B; line-height: 1.6; border-top: 1px solid #E2E8F0; padding-top: 18px;">
                Need assistance or a custom invoice? Reach out to <a href="mailto:support@zigza.in" style="color: #1D4ED8; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 11.5px; color: #94A3B8; line-height: 1.5;">
          <a href="https://zigza.in" style="color: #64748B; text-decoration: none; font-weight: 600;">zigza.in</a> • Automated notification
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

