import { Resend } from 'resend'

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'zigza <noreply@zigza.in>'

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
    const planName = subscriptionTier === 'FULL_PLANT_AI' ? 'Full Plant' : (subscriptionTier === 'MODULAR' ? 'Modular' : 'Custom')
    const LOGO_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_logo.png'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Access - ${companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 48px 16px; color: #1e293b; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 24px rgba(0,0,0,0.03); overflow: hidden;">
          <tr>
            <td style="padding: 40px 36px;">
              <!-- Brand Logo -->
              <div style="margin-bottom: 28px;">
                <img 
                  src="${LOGO_URL}" 
                  alt="zigza" 
                  style="height: 38px; width: auto; border-radius: 8px; display: block;"
                />
              </div>

              <!-- Greeting -->
              <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.01em;">
                Dear ${recipient},
              </div>

              <!-- Intro Message -->
              <p style="font-size: 15px; line-height: 1.7; color: #475569; font-weight: 400; margin: 0 0 24px;">
                Your workspace for <span style="font-weight: 500; color: #0f172a;">${companyName}</span> is active on <span style="font-weight: 500; color: #3A3564;">zigza.in</span> under the ${isTrial ? '7-day demo trial' : 'active'} plan.
              </p>

              <!-- Credentials Table with spacey padding and refined unbolded typography -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.10); border-radius: 12px; margin-bottom: 28px; font-size: 14px;">
                <tr>
                  <td style="padding: 14px 20px 10px; color: #64748b; font-weight: 400; width: 36%;">Workspace:</td>
                  <td style="padding: 14px 20px 10px; color: #3A3564; font-weight: 600; text-align: right;">https://zigza.in</td>
                </tr>
                <tr>
                  <td style="padding: 10px 20px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Login Email:</td>
                  <td style="padding: 10px 20px; color: #1e293b; font-weight: 500; text-align: right; font-family: monospace; font-size: 13.5px; border-top: 1px solid rgba(58, 53, 100, 0.08);">${loginEmail}</td>
                </tr>
                ${customUsername ? `
                <tr>
                  <td style="padding: 10px 20px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Username:</td>
                  <td style="padding: 10px 20px; color: #1e293b; font-weight: 500; text-align: right; font-family: monospace; font-size: 13.5px; border-top: 1px solid rgba(58, 53, 100, 0.08);">${customUsername}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 20px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Password:</td>
                  <td style="padding: 10px 20px; color: #3A3564; font-weight: 600; text-align: right; font-family: monospace; font-size: 13.5px; border-top: 1px solid rgba(58, 53, 100, 0.08);">${initialPassword}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 20px 14px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Plan Status:</td>
                  <td style="padding: 10px 20px 14px; color: #3A3564; font-weight: 600; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.08);">${isTrial ? '7-Day Demo Trial' : 'Active Plan'} (${planName})</td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <div style="margin: 28px 0 24px;">
                <a 
                  href="https://zigza.in" 
                  style="display: inline-block; background-color: #3A3564; color: #ffffff !important; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 500; text-decoration: none; letter-spacing: 0.01em; box-shadow: 0 2px 8px rgba(58,53,100,0.20);"
                  target="_blank"
                >
                  Sign in to Workspace
                </a>
              </div>

              <!-- Note -->
              <div style="font-size: 13px; color: #64748b; line-height: 1.6; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                Please update your password upon first sign in. Need help? Contact <a href="mailto:support@zigza.in" style="color: #3A3564; text-decoration: none; font-weight: 500;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          <a href="https://zigza.in" style="color: #64748b; text-decoration: none; font-weight: 500;">zigza.in</a> • Automated notification
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
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'zigza <noreply@zigza.in>'

  if (!client) {
    console.warn('[Resend] Simulating custom inquiry notification email for:', params.companyName)
    return { success: true, simulated: true }
  }

  try {
    const adminNotificationEmail = process.env.PLATFORM_ADMIN_ALERT_EMAIL || 'shawsumit6286@gmail.com'
    const LOGO_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_logo.png'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Inquiry - ${params.companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAF8; margin: 0; padding: 48px 16px; color: #1e293b;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 24px rgba(0,0,0,0.03); padding: 40px 36px;">
          <tr>
            <td>
              <div style="margin-bottom: 24px;">
                <img 
                  src="${LOGO_URL}" 
                  alt="zigza" 
                  style="height: 38px; width: auto; border-radius: 8px; display: block;"
                />
              </div>
              <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 14px; letter-spacing: -0.01em;">
                New Inquiry: ${params.companyName}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.10); border-radius: 12px; font-size: 14px; margin: 20px 0;">
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 400;">Contact:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 500; text-align: right;">${params.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Phone:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 500; text-align: right; font-family: monospace;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Email:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 500; text-align: right; font-family: monospace;">${params.email}</td>
                </tr>
                ${params.estimatedMachines ? `
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Machines:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 500; text-align: right;">${params.estimatedMachines}</td>
                </tr>
                ` : ''}
              </table>
              <div style="margin-top: 24px;">
                <a 
                  href="https://zigza.in/platform-admin" 
                  style="display: inline-block; background-color: #3A3564; color: #ffffff !important; padding: 12px 26px; border-radius: 10px; font-size: 14px; font-weight: 500; text-decoration: none;"
                >
                  View in Admin Portal
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
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'zigza <noreply@zigza.in>'
  const targetEmail = 'team.anga9@gmail.com'

  if (!client) {
    console.warn('[Resend] Simulating customer query notification dispatch to team.anga9@gmail.com:', params)
    return { success: true, simulated: true }
  }

  try {
    const LOGO_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_logo.png'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Website Query from ${params.name}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAF8; margin: 0; padding: 40px 16px; color: #1e293b;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 24px rgba(0,0,0,0.04); padding: 36px 32px;">
          <tr>
            <td>
              <div style="margin-bottom: 20px;">
                <img 
                  src="${LOGO_URL}" 
                  alt="zigza" 
                  style="height: 36px; width: auto; border-radius: 8px; display: block;"
                />
              </div>
              <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.01em;">
                New Website Query Received
              </div>
              <p style="font-size: 14px; color: #64748b; margin-top: 0; margin-bottom: 20px;">
                A prospective customer submitted a query on the Zigza website contact window:
              </p>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.12); border-radius: 12px; font-size: 14px; margin: 16px 0;">
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 500;">Customer Name:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 700; text-align: right;">${params.name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Phone Number:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 700; text-align: right; font-family: monospace; font-size: 15px;">
                    <a href="tel:${params.phone.replace(/\s+/g, '')}" style="color: #3A3564; text-decoration: none;">${params.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">WhatsApp Quick Chat:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 700; text-align: right;">
                    <a href="https://wa.me/91${params.phone.replace(/\D/g, '').slice(-10)}" style="color: #1F9D63; text-decoration: none; font-weight: bold;">Open WhatsApp Chat &rarr;</a>
                  </td>
                </tr>
                ${params.companyName ? `
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Factory / Unit:</td>
                  <td style="padding: 12px 18px; color: #1e293b; font-weight: 600; text-align: right;">${params.companyName}</td>
                </tr>
                ` : ''}
              </table>

              <div style="margin: 20px 0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.05em;">
                  Customer Query / Requirement:
                </div>
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
                  ${params.query}
                </div>
              </div>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                <a 
                  href="tel:${params.phone.replace(/\s+/g, '')}" 
                  style="display: inline-block; background-color: #3A3564; color: #ffffff !important; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;"
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
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'zigza <noreply@zigza.in>'

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

    const planName = planTier === 'FULL_PLANT_AI' ? 'Full Plant' : (planTier === 'MODULAR' ? 'Modular' : 'Custom')
    const buttonLabel = isTrial ? 'Activate Subscription' : 'Renew Subscription'
    const LOGO_URL = 'https://nnhzqvdmkarpwtkzjnra.supabase.co/storage/v1/object/public/public-assets/zigza_logo.png'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Notice - ${companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 48px 16px; color: #1e293b; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 540px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 24px rgba(0,0,0,0.03); overflow: hidden;">
          <tr>
            <td style="padding: 40px 36px;">
              <!-- Brand Logo with rounded corners -->
              <div style="margin-bottom: 28px;">
                <img 
                  src="${LOGO_URL}" 
                  alt="zigza" 
                  style="height: 38px; width: auto; border-radius: 8px; display: block;"
                />
              </div>

              <!-- Greeting -->
              <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.01em;">
                Dear ${recipient},
              </div>

              <!-- Urgency Signal Line -->
              <div style="font-size: 15px; font-weight: 600; color: #3A3564; margin-bottom: 14px;">
                ${urgencyText}
              </div>

              <!-- Content Message -->
              <p style="font-size: 15px; line-height: 1.7; color: #475569; font-weight: 400; margin: 0 0 24px;">
                ${isTrial
                  ? `Your 7-day demo trial for <span style="font-weight: 500; color: #0f172a;">${companyName}</span> is active until <span style="font-weight: 500; color: #0f172a;">${expiryFormatted}</span>. Review your plan details below and activate your subscription to maintain uninterrupted plant operations.`
                  : `Your subscription for <span style="font-weight: 500; color: #0f172a;">${companyName}</span> is due for renewal on <span style="font-weight: 500; color: #0f172a;">${expiryFormatted}</span>. Please renew your plan to continue accessing production tracking and reporting modules.`
                }
              </p>

              <!-- Properly aligned Key-Value Table with highlighted Valid Until row -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.10); border-radius: 12px; margin-bottom: 24px; font-size: 14px; overflow: hidden;">
                <tr>
                  <td style="padding: 13px 20px 9px; color: #64748b; font-weight: 400; width: 36%;">Factory:</td>
                  <td style="padding: 13px 20px 9px; color: #0f172a; font-weight: 500; text-align: right;">${companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 20px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Status:</td>
                  <td style="padding: 9px 20px; color: #3A3564; font-weight: 600; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.08);">${isTrial ? '7-Day Demo Trial' : 'Active Plan'}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 20px; color: #64748b; font-weight: 400; border-top: 1px solid rgba(58, 53, 100, 0.08);">Plan:</td>
                  <td style="padding: 9px 20px; color: #1e293b; font-weight: 500; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.08);">${planName} (₹${monthlyBillingInr.toLocaleString('en-IN')}/mo)</td>
                </tr>
                ${expiresAt ? `
                <tr style="background-color: rgba(58, 53, 100, 0.06);">
                  <td style="padding: 12px 20px 13px; color: #3A3564; font-weight: 600; border-top: 1px solid rgba(58, 53, 100, 0.14);">Valid Until:</td>
                  <td style="padding: 12px 20px 13px; color: #3A3564; font-weight: 700; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.14);">${expiryFormatted}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Call To Action Button with brand color -->
              <div style="margin: 24px 0 14px;">
                <a 
                  href="https://zigza.in/modules/profile" 
                  style="display: inline-block; background-color: #3A3564; color: #ffffff !important; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 500; text-decoration: none; letter-spacing: 0.01em; box-shadow: 0 2px 8px rgba(58,53,100,0.20);"
                  target="_blank"
                >
                  ${buttonLabel}
                </a>
              </div>

              <!-- Sentence of Consequence -->
              <div style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
                Production modules and active factory tracking will pause if access lapses past the expiry date.
              </div>

              <!-- Note -->
              <div style="font-size: 13px; color: #64748b; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                Need assistance or a custom invoice? Reach out to <a href="mailto:support@zigza.in" style="color: #3A3564; text-decoration: none; font-weight: 500;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          <a href="https://zigza.in" style="color: #64748b; text-decoration: none; font-weight: 500;">zigza.in</a> • Automated notification
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
