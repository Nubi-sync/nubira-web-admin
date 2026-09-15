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
  divisionsCount: number
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAFAF8;
            margin: 0;
            padding: 36px 16px;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
          }
          .card {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            padding: 32px 28px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          }
          .brand {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.6px;
            color: #0f172a;
            margin-bottom: 24px;
          }
          .brand span {
            color: #94a3b8;
          }
          .greeting {
            font-size: 15px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 10px;
          }
          .text {
            font-size: 14px;
            line-height: 1.55;
            color: #475569;
            margin-bottom: 20px;
          }
          .box {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 16px 18px;
            margin-bottom: 24px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            font-size: 13px;
          }
          .row:not(:last-child) {
            border-bottom: 1px solid #F1F5F9;
          }
          .label {
            color: #64748b;
            font-weight: 500;
          }
          .val {
            color: #0f172a;
            font-weight: 600;
            font-family: monospace;
          }
          .btn-wrap {
            margin: 24px 0 20px;
          }
          .btn {
            display: inline-block;
            background: #0f172a;
            color: #ffffff !important;
            padding: 11px 24px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
          }
          .note {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
            margin-top: 20px;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
          }
          .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">zigza<span>.</span></div>

          <div class="greeting">Dear ${recipient},</div>
          <p class="text">
            Your workspace for <strong>${companyName}</strong> is ready on <strong>zigza.in</strong> with ${isTrial ? '7-day demo trial access' : 'full access'}.
          </p>

          <div class="box">
            <div class="row">
              <span class="label">Workspace URL</span>
              <span class="val" style="font-family: inherit; color: #0f172a;">https://zigza.in</span>
            </div>
            <div class="row">
              <span class="label">Login Email</span>
              <span class="val">${loginEmail}</span>
            </div>
            ${customUsername ? `
            <div class="row">
              <span class="label">Username</span>
              <span class="val">${customUsername}</span>
            </div>` : ''}
            <div class="row">
              <span class="label">Initial Password</span>
              <span class="val">${initialPassword}</span>
            </div>
            <div class="row">
              <span class="label">Account Status</span>
              <span class="val" style="font-family: inherit;">${isTrial ? '7-Day Demo Trial' : 'Active Plan'}</span>
            </div>
          </div>

          <div class="btn-wrap">
            <a href="https://zigza.in" class="btn" target="_blank">Sign in to Workspace</a>
          </div>

          <div class="note">
            Please change your password after your first login under your Company Profile.
          </div>
        </div>

        <div class="footer">
          zigza.in • Automated notification
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
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAF8; margin: 0; padding: 36px 16px; color: #0f172a; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 32px 28px; }
          .brand { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
          .brand span { color: #94a3b8; }
          .title { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
          .box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin: 16px 0; font-size: 13px; line-height: 1.8; color: #334155; }
          .btn { display: inline-block; background: #0f172a; color: #ffffff !important; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">zigza<span>.</span></div>
          <div class="title">New Inquiry: ${params.companyName}</div>
          <div class="box">
            <div><strong>Contact:</strong> ${params.applicantName}</div>
            <div><strong>Phone:</strong> ${params.phone}</div>
            <div><strong>Email:</strong> ${params.email}</div>
            ${params.estimatedMachines ? `<div><strong>Machines:</strong> ${params.estimatedMachines}</div>` : ''}
            <div style="margin-top: 10px;"><strong>Requirements:</strong><br/>${params.requirements}</div>
          </div>
          <a href="https://zigza.in/platform-admin" class="btn">View in Portal</a>
        </div>
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAFAF8;
            margin: 0;
            padding: 36px 16px;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
          }
          .card {
            max-width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            padding: 32px 28px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          }
          .brand {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.6px;
            color: #0f172a;
            margin-bottom: 24px;
          }
          .brand span {
            color: #94a3b8;
          }
          .greeting {
            font-size: 15px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 10px;
          }
          .text {
            font-size: 14px;
            line-height: 1.55;
            color: #475569;
            margin-bottom: 20px;
          }
          .box {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 16px 18px;
            margin-bottom: 24px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            font-size: 13px;
          }
          .row:not(:last-child) {
            border-bottom: 1px solid #F1F5F9;
          }
          .label {
            color: #64748b;
            font-weight: 500;
          }
          .val {
            color: #0f172a;
            font-weight: 600;
          }
          .btn-wrap {
            margin: 24px 0 20px;
          }
          .btn {
            display: inline-block;
            background: #0f172a;
            color: #ffffff !important;
            padding: 11px 24px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
          }
          .note {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
            margin-top: 20px;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
          }
          .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">zigza<span>.</span></div>

          <div class="greeting">Dear ${recipient},</div>
          <p class="text">
            ${isTrial
              ? `Your 7-day demo trial for <strong>${companyName}</strong> is active until <strong>${expiryFormatted}</strong>. You can review your plan and activate your subscription under Company Profile.`
              : `Your subscription for <strong>${companyName}</strong> is due for renewal. You can manage your plan directly under Company Profile.`
            }
          </p>

          <div class="box">
            <div class="row">
              <span class="label">Factory</span>
              <span class="val">${companyName}</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="val">${isTrial ? '7-Day Demo Trial' : 'Active Plan'}</span>
            </div>
            <div class="row">
              <span class="label">Plan</span>
              <span class="val">${planTier === 'FULL_PLANT_AI' ? 'Full Plant' : (planTier === 'MODULAR' ? 'Modular' : 'Custom')} (₹${monthlyBillingInr.toLocaleString('en-IN')}/mo)</span>
            </div>
            ${expiresAt ? `
            <div class="row">
              <span class="label">Valid Until</span>
              <span class="val">${expiryFormatted}</span>
            </div>` : ''}
          </div>

          <div class="btn-wrap">
            <a href="https://zigza.in" class="btn" target="_blank">Manage in Company Profile</a>
          </div>

          <div class="note">
            Need assistance? Reach out to support@zigza.in.
          </div>
        </div>

        <div class="footer">
          zigza.in • Automated notification
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
