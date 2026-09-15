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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Access - ${companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 40px 16px; color: #0f172a; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.02); overflow: hidden;">
          <tr>
            <td style="padding: 32px 30px;">
              <!-- Brand Logo with rounded corners -->
              <div style="margin-bottom: 24px;">
                <img 
                  src="https://app.zigza.in/z%20i%20g%20z%20a%20(2).png" 
                  alt="zigza" 
                  style="height: 36px; width: auto; border-radius: 8px; display: block;"
                />
              </div>

              <!-- Greeting -->
              <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
                Dear ${recipient},
              </div>

              <!-- Intro Message -->
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
                Your workspace for <strong>${companyName}</strong> is active on <strong>zigza.in</strong> under the ${isTrial ? '7-day demo trial' : 'active'} plan.
              </p>

              <!-- Credentials Table with proper spacing and colons -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.12); border-radius: 12px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 12px 16px 8px; color: #64748b; font-weight: 500; width: 38%;">Workspace:</td>
                  <td style="padding: 12px 16px 8px; color: #3A3564; font-weight: 700; text-align: right;">https://zigza.in</td>
                </tr>
                <tr>
                  <td style="padding: 8px 16px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Login Email:</td>
                  <td style="padding: 8px 16px; color: #0f172a; font-weight: 700; text-align: right; font-family: monospace; border-top: 1px solid rgba(58, 53, 100, 0.08);">${loginEmail}</td>
                </tr>
                ${customUsername ? `
                <tr>
                  <td style="padding: 8px 16px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Username:</td>
                  <td style="padding: 8px 16px; color: #0f172a; font-weight: 700; text-align: right; font-family: monospace; border-top: 1px solid rgba(58, 53, 100, 0.08);">${customUsername}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 16px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Password:</td>
                  <td style="padding: 8px 16px; color: #3A3564; font-weight: 700; text-align: right; font-family: monospace; border-top: 1px solid rgba(58, 53, 100, 0.08);">${initialPassword}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 16px 12px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Plan Status:</td>
                  <td style="padding: 8px 16px 12px; color: #3A3564; font-weight: 700; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.08);">${isTrial ? '7-Day Demo Trial' : 'Active Plan'} (${planName})</td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <div style="margin: 24px 0 20px;">
                <a 
                  href="https://zigza.in" 
                  style="display: inline-block; background-color: #3A3564; color: #ffffff !important; padding: 12px 26px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 8px rgba(58,53,100,0.25);"
                  target="_blank"
                >
                  Sign in to Workspace
                </a>
              </div>

              <!-- Note -->
              <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                Please update your password upon your first sign in. Need help? Contact <a href="mailto:support@zigza.in" style="color: #3A3564; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
          <a href="https://zigza.in" style="color: #64748b; text-decoration: none; font-weight: 600;">zigza.in</a> • Automated notification
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Inquiry - ${params.companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAF8; margin: 0; padding: 40px 16px; color: #0f172a;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); padding: 32px 30px;">
          <tr>
            <td>
              <div style="margin-bottom: 20px;">
                <img 
                  src="https://app.zigza.in/z%20i%20g%20z%20a%20(2).png" 
                  alt="zigza" 
                  style="height: 36px; width: auto; border-radius: 8px; display: block;"
                />
              </div>
              <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
                New Inquiry: ${params.companyName}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.12); border-radius: 12px; font-size: 13px; margin: 16px 0;">
                <tr>
                  <td style="padding: 10px 14px; color: #64748b;">Contact:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-weight: 700; text-align: right;">${params.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; border-top: 1px solid rgba(58, 53, 100, 0.08);">Phone:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: monospace;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; border-top: 1px solid rgba(58, 53, 100, 0.08);">Email:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: monospace;">${params.email}</td>
                </tr>
                ${params.estimatedMachines ? `
                <tr>
                  <td style="padding: 10px 14px; color: #64748b; border-top: 1px solid rgba(58, 53, 100, 0.08);">Machines:</td>
                  <td style="padding: 10px 14px; color: #0f172a; font-weight: 700; text-align: right;">${params.estimatedMachines}</td>
                </tr>
                ` : ''}
              </table>
              <div style="margin-top: 16px;">
                <a 
                  href="https://zigza.in/platform-admin" 
                  style="display: inline-block; background-color: #3A3564; color: #ffffff !important; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none;"
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

    const planName = planTier === 'FULL_PLANT_AI' ? 'Full Plant' : (planTier === 'MODULAR' ? 'Modular' : 'Custom')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Notice - ${companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 40px 16px; color: #0f172a; -webkit-font-smoothing: antialiased;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.02); overflow: hidden;">
          <tr>
            <td style="padding: 32px 30px;">
              <!-- Brand Logo with rounded corners -->
              <div style="margin-bottom: 24px;">
                <img 
                  src="https://app.zigza.in/z%20i%20g%20z%20a%20(2).png" 
                  alt="zigza" 
                  style="height: 36px; width: auto; border-radius: 8px; display: block;"
                />
              </div>

              <!-- Greeting -->
              <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
                Dear ${recipient},
              </div>

              <!-- Content Message -->
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
                ${isTrial
                  ? `Your 7-day demo trial for <strong>${companyName}</strong> is active until <strong>${expiryFormatted}</strong>. You can review your plan and activate your subscription under Company Profile.`
                  : `Your subscription for <strong>${companyName}</strong> is due for renewal. You can manage and extend your plan directly under Company Profile.`
                }
              </p>

              <!-- Properly aligned Key-Value Table with colons and clear spacing -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.12); border-radius: 12px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 12px 16px 8px; color: #64748b; font-weight: 500; width: 38%;">Factory:</td>
                  <td style="padding: 12px 16px 8px; color: #0f172a; font-weight: 700; text-align: right;">${companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 16px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Status:</td>
                  <td style="padding: 8px 16px; color: #3A3564; font-weight: 700; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.08);">${isTrial ? '7-Day Demo Trial' : 'Active Plan'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 16px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Plan:</td>
                  <td style="padding: 8px 16px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.08);">${planName} (₹${monthlyBillingInr.toLocaleString('en-IN')}/mo)</td>
                </tr>
                ${expiresAt ? `
                <tr>
                  <td style="padding: 8px 16px 12px; color: #64748b; font-weight: 500; border-top: 1px solid rgba(58, 53, 100, 0.08);">Valid Until:</td>
                  <td style="padding: 8px 16px 12px; color: #3A3564; font-weight: 700; text-align: right; border-top: 1px solid rgba(58, 53, 100, 0.08);">${expiryFormatted}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Call To Action Button with brand color -->
              <div style="margin: 24px 0 20px;">
                <a 
                  href="https://zigza.in" 
                  style="display: inline-block; background-color: #3A3564; color: #ffffff !important; padding: 12px 26px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 8px rgba(58,53,100,0.25);"
                  target="_blank"
                >
                  Manage in Company Profile
                </a>
              </div>

              <!-- Note -->
              <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                Need assistance? Reach out to <a href="mailto:support@zigza.in" style="color: #3A3564; text-decoration: none; font-weight: 600;">support@zigza.in</a>.
              </div>
            </td>
          </tr>
        </table>

        <!-- Subtle Footer -->
        <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
          <a href="https://zigza.in" style="color: #64748b; text-decoration: none; font-weight: 600;">zigza.in</a> • Automated notification
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
