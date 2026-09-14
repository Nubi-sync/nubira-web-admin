import { Resend } from 'resend'

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface TenantActivationEmailParams {
  to: string
  companyName: string
  adminName: string
  loginEmail: string
  customUsername?: string
  initialPassword: string
  subscriptionTier: string
  divisionsCount: number
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
    divisionsCount
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
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 32px 16px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
          .header { background: #3A3564; padding: 32px 28px; text-align: left; }
          .brand-title { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
          .brand-subtitle { color: rgba(255,255,255,0.75); font-size: 13px; margin-top: 6px; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .credentials-box { background: #FAF7F0; border: 1px solid rgba(58, 53, 100, 0.15); border-radius: 12px; padding: 20px; margin-bottom: 24px; font-family: 'Courier New', Courier, monospace; }
          .cred-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
          .cred-row:last-child { margin-bottom: 0; }
          .cred-label { color: #64748b; font-weight: 600; }
          .cred-val { color: #0f172a; font-weight: 700; }
          .cred-highlight { color: #3A3564; font-weight: 800; }
          .button-wrap { text-align: center; margin: 28px 0; }
          .btn-login { display: inline-block; background: #3A3564; color: #ffffff !important; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 8px rgba(58,53,100,0.25); }
          .security-note { font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-title">Zigza Enterprise MES</h1>
            <div class="brand-subtitle">Apparel Manufacturing Execution Platform</div>
          </div>
          <div class="content">
            <div class="greeting">Welcome, ${adminName}</div>
            <p class="message">
              Your factory client workspace for <strong>${companyName}</strong> has been provisioned on Zigza MES with <strong>${divisionsCount} operational manufacturing divisions</strong> under the <strong>${subscriptionTier.replace(/_/g, ' ')}</strong> tier.
            </p>
            
            <div class="credentials-box">
              <div class="cred-row">
                <span class="cred-label">Login URL:</span>
                <span class="cred-highlight">https://app.zigza.in/login</span>
              </div>
              ${customUsername ? `
              <div class="cred-row">
                <span class="cred-label">Custom Username:</span>
                <span class="cred-highlight">${customUsername}</span>
              </div>` : ''}
              <div class="cred-row">
                <span class="cred-label">Login Email:</span>
                <span class="cred-val">${loginEmail}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Initial Password:</span>
                <span class="cred-highlight">${initialPassword}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Plan Tier:</span>
                <span class="cred-val">${subscriptionTier.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div class="button-wrap">
              <a href="https://app.zigza.in/login" class="btn-login" target="_blank">Access Factory Workspace</a>
            </div>

            <div class="security-note">
              <strong>Security Protocol:</strong> Please change your password upon your first administrative login. This is an automated notification from Zigza Infrastructure Services. Please do not reply directly to this email.
            </div>
          </div>
          <div class="footer">
            Zigza MES Enterprise • Support: support@zigza.in • Confidential Factory Provisioning
          </div>
        </div>
      </body>
      </html>
    `

    const result = await client.emails.send({
      from: fromEmail,
      to,
      subject: `Zigza MES Activation Credentials - ${companyName}`,
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
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zigza Activation <noreply@zigza.in>'

  if (!client) {
    console.warn('[Resend] Simulating custom inquiry notification email for:', params.companyName)
    return { success: true, simulated: true }
  }

  try {
    const adminNotificationEmail = process.env.PLATFORM_ADMIN_ALERT_EMAIL || 'shawsumit6286@gmail.com'

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b;">
        <h2 style="color: #3A3564; margin-bottom: 16px;">New Custom Enterprise Build Request</h2>
        <p>A new prospective client has requested a custom engineering plan on Zigza MES:</p>
        <ul style="line-height: 1.8;">
          <li><strong>Company:</strong> ${params.companyName}</li>
          <li><strong>Contact Person:</strong> ${params.applicantName}</li>
          <li><strong>Phone:</strong> ${params.phone}</li>
          <li><strong>Email:</strong> ${params.email}</li>
          <li><strong>Estimated Machines:</strong> ${params.estimatedMachines || 'Not specified'}</li>
        </ul>
        <h3 style="margin-top: 20px;">Client Requirements / Scope:</h3>
        <div style="background: #FAF7F0; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; font-family: monospace;">
          ${params.requirements.replace(/\n/g, '<br/>')}
        </div>
        <p style="margin-top: 20px;">
          <a href="https://app.zigza.in/platform-admin/custom-requests" style="background: #3A3564; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Review in Platform Admin Portal
          </a>
        </p>
      </div>
    `

    const result = await client.emails.send({
      from: fromEmail,
      to: adminNotificationEmail,
      subject: `New Custom Build Request: ${params.companyName} (${params.applicantName})`,
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
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zigza Subscriptions <noreply@zigza.in>'

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
    const expiryFormatted = expiresAt ? new Date(expiresAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'Pending Plan Setup'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 32px 16px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.08); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
          .header { background: #3A3564; padding: 32px 28px; text-align: left; }
          .brand-title { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
          .brand-subtitle { color: rgba(255,255,255,0.75); font-size: 13px; margin-top: 6px; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .notice-box { background: ${isTrial ? '#FFFBEB' : '#FAF7F0'}; border: 1px solid ${isTrial ? '#FDE68A' : 'rgba(58, 53, 100, 0.15)'}; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .notice-title { font-size: 13px; font-weight: 800; color: ${isTrial ? '#92400E' : '#3A3564'}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
          .detail-row:last-child { margin-bottom: 0; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-val { color: #0f172a; font-weight: 700; }
          .detail-highlight { color: #3A3564; font-weight: 800; }
          .button-wrap { text-align: center; margin: 28px 0; }
          .btn-action { display: inline-block; background: #3A3564; color: #ffffff !important; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 8px rgba(58,53,100,0.25); }
          .note { font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-title">Zigza Enterprise MES</h1>
            <div class="brand-subtitle">Subscription & Invoice Billing Management</div>
          </div>
          <div class="content">
            <div class="greeting">Dear ${adminName},</div>
            <p class="message">
              This is a friendly reminder regarding your <strong>${companyName}</strong> workspace subscription on the Zigza MES platform.
              ${isTrial ? 'Your temporary 7-day trial period is nearing completion or requires subscription confirmation to retain continuous production manufacturing access.' : 'Your monthly subscription billing cycle is due for payment to ensure uninterrupted plant operational execution.'}
            </p>
            
            <div class="notice-box">
              <div class="notice-title">Subscription Account Summary</div>
              <div class="detail-row">
                <span class="detail-label">Factory / Company:</span>
                <span class="detail-val">${companyName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Access Model:</span>
                <span class="detail-highlight">${isTrial ? '7-Day Demo Trial' : 'Full Enterprise Access'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Active Plan Tier:</span>
                <span class="detail-val">${planTier.replace(/_/g, ' ')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Monthly Rate:</span>
                <span class="detail-highlight">₹${monthlyBillingInr.toLocaleString('en-IN')}/month</span>
              </div>
              ${isTrial && expiresAt ? `
              <div class="detail-row">
                <span class="detail-label">Trial Expiration:</span>
                <span class="detail-val" style="color: #DC2626;">${expiryFormatted}</span>
              </div>` : ''}
            </div>

            <div class="button-wrap">
              <a href="https://app.zigza.in/login" class="btn-action" target="_blank">Review & Settle Subscription</a>
            </div>

            <div class="note">
              <strong>Need assistance?</strong> For banking wire transfer instructions, GST invoices, or subscription upgrades, please contact our enterprise relations team at <a href="mailto:billing@zigza.in" style="color: #3A3564; font-weight: 600;">billing@zigza.in</a>.
            </div>
          </div>
          <div class="footer">
            Zigza MES Enterprise • Billing Desk: billing@zigza.in • Automated Subscription Notification
          </div>
        </div>
      </body>
      </html>
    `

    const result = await client.emails.send({
      from: fromEmail,
      to,
      subject: `Subscription & Payment Notice - ${companyName} (${isTrial ? 'Demo Trial Conversion' : 'Monthly Retainer'})`,
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
