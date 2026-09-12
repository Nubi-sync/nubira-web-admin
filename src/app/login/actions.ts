'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '../../utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

export async function login(formData: FormData) {
  // Extract client IP for rate limiting
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (headersList.get('x-real-ip') || '127.0.0.1')

  const rateCheck = checkRateLimit(`login_${clientIp}`, 5, 60 * 1000)
  if (!rateCheck.success) {
    return {
      error: `Too many login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
      rateLimited: true,
      retryAfter: rateCheck.resetInSeconds,
    }
  }

  const supabase = await createClient()

  const rawInput = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!rawInput || !password) {
    return { error: 'Username/email and password are required' }
  }

  // Format email: If user enters "Store" or "lineman" (without @), convert to "store@nubira.local" (matching mobile app)
  const cleanEmailKey = rawInput.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '')
  const email = rawInput.includes('@') ? rawInput : `${cleanEmailKey}@nubira.local`

  // Dedicated Platform Root SuperAdmin credentials check (admin@zigza.in / @Burhanpur123)
  const isPlatformRootCredential =
    (email.toLowerCase() === 'admin@zigza.in' || cleanEmailKey === 'admin') &&
    password === '@Burhanpur123'

  if (isPlatformRootCredential) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (serviceRoleKey && supabaseUrl) {
      try {
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey)
        const { data: usersData } = await adminClient.auth.admin.listUsers()
        const existingAdmin = usersData?.users?.find(
          u => u.email?.toLowerCase() === 'admin@zigza.in'
        )

        if (!existingAdmin) {
          const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
            email: 'admin@zigza.in',
            password: '@Burhanpur123',
            email_confirm: true,
            user_metadata: { role: 'PLATFORM_SUPERADMIN', username: 'Platform SuperAdmin' }
          })
          if (!createErr && created?.user) {
            await adminClient.from('profiles').upsert({
              id: created.user.id,
              username: 'Platform SuperAdmin',
              role: 'PLATFORM_SUPERADMIN'
            })
          }
        } else {
          // Ensure password and role are active
          await adminClient.auth.admin.updateUserById(existingAdmin.id, {
            password: '@Burhanpur123',
            email_confirm: true,
            user_metadata: { role: 'PLATFORM_SUPERADMIN', username: 'Platform SuperAdmin' }
          })
          await adminClient.from('profiles').upsert({
            id: existingAdmin.id,
            username: 'Platform SuperAdmin',
            role: 'PLATFORM_SUPERADMIN'
          })
        }
      } catch (adminErr) {
        console.warn('SuperAdmin auto-provision notice:', adminErr)
      }
    }
  }

  const loginEmail = isPlatformRootCredential ? 'admin@zigza.in' : email
  let { data: authData, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  })

  // Fallback retry without spaces in case of legacy usernames
  if (error && !rawInput.includes('@') && rawInput.includes(' ')) {
    const noSpaceEmail = `${rawInput.toLowerCase().replace(/\s+/g, '')}@nubira.local`
    const retry = await supabase.auth.signInWithPassword({
      email: noSpaceEmail,
      password,
    })
    if (!retry.error) {
      authData = retry.data
      error = null
    }
  }

  if (error) {
    return { error: error.message }
  }

  // Clear rate limit record upon successful authentication (both action and middleware buckets)
  resetRateLimit(`login_${clientIp}`)
  resetRateLimit(`mw_login_${clientIp}`)

  // Dynamic destination routing: Root SuperAdmin routes to /platform-admin
  let targetRoute = '/modules'
  const isRootAdmin =
    loginEmail.toLowerCase() === 'admin@zigza.in' ||
    authData?.user?.email?.toLowerCase() === 'admin@zigza.in'

  if (isRootAdmin) {
    targetRoute = '/platform-admin'
  } else {
    try {
      const userId = authData?.user?.id
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        const role = (profile?.role || '').toUpperCase()
        if (role === 'PLATFORM_SUPERADMIN' || role === 'SUPERADMIN') {
          targetRoute = '/platform-admin'
        } else if (role === 'STORE' || role === 'STORE_SUPERVISOR' || role === 'GODOWN' || loginEmail?.startsWith('store@')) {
          targetRoute = '/stitching-sewing/store'
        }
      }
    } catch (err) {
      console.error('Error fetching user profile role upon login:', err)
    }
  }

  revalidatePath('/', 'layout')
  redirect(targetRoute)
}

function renderOtpEmailHtml(otp: string, email: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Zigza Security Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1A1A1A;">
  <div style="width:100%;background-color:#F8F9FA;padding:40px 16px;box-sizing:border-box;">
    <table align="center" style="max-width:520px;width:100%;margin:0 auto;background-color:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
      <tr>
        <td style="padding:28px 32px 18px;border-bottom:1px solid #F1F3F5;">
          <div style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#3A3564;">ZIGZA<span style="color:#6366F1;">.</span></div>
          <div style="font-size:11px;font-weight:700;color:#868E96;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Floor Execution Platform</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 12px;">Password Reset Verification</h1>
          <p style="font-size:14px;line-height:22px;color:#4B5563;margin:0 0 20px;">
            We received a request to verify your identity and reset your password for <strong>${email}</strong>. Enter this 6-digit security code on the portal:
          </p>
          <div style="background-color:#FAF7F0;border:1.5px dashed #D1D5DB;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
            <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Security Verification Code</div>
            <div style="font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#3A3564;margin:0;padding-left:8px;">${otp}</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:8px;">Valid for 10 minutes • Single use only</div>
          </div>
          <p style="font-size:12px;line-height:18px;color:#6B7280;margin:20px 0 0;border-left:3px solid #E5E7EB;padding-left:12px;">
            If you did not request this code, you can safely ignore this email. Your Zigza account remains fully secure.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color:#FAFAFA;padding:20px 32px;border-top:1px solid #F1F3F5;font-size:11px;line-height:18px;color:#9CA3AF;text-align:center;">
          <div style="display:inline-block;background-color:#F3F4F6;color:#4B5563;padding:3px 8px;border-radius:6px;font-family:monospace;font-size:10px;font-weight:600;margin-bottom:8px;">AUTOMATED NOTICE • DO NOT REPLY</div>
          <div style="margin:0 0 4px;">Sent automatically from <strong>noreply@zigza.in</strong>. Responses to this address are not monitored.</div>
          <div>&copy; 2026 Zigza MES. All rights reserved.</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
}

// Step 1: Send OTP
export async function sendPasswordResetOtp(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()

  if (!email) {
    return { error: 'Please enter your registered email address.' }
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Direct Resend delivery via Supabase Admin OTP generation
  if (resendApiKey && serviceRoleKey && supabaseUrl) {
    try {
      const admin = createAdminClient(supabaseUrl, serviceRoleKey)
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email,
      })

      if (linkErr) {
        if (linkErr.message?.toLowerCase().includes('not found') || linkErr.message?.toLowerCase().includes('user')) {
          return { error: 'No registered user found with this email address.' }
        }
        return { error: linkErr.message }
      }

      const otp = linkData?.properties?.email_otp
      if (!otp) {
        return { error: 'Failed to generate verification code. Please try again.' }
      }

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Zigza Security <noreply@zigza.in>',
          to: [email],
          subject: `Your Zigza Security Verification Code: ${otp}`,
          html: renderOtpEmailHtml(otp, email),
        }),
      })

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json().catch(() => ({}))
        console.error('Resend API Error:', errorData)
        return { error: errorData?.message || 'Email delivery failed via Resend.' }
      }

      return { success: true, message: '6-digit OTP has been sent to your email.' }
    } catch (err: any) {
      console.error('Direct Resend OTP Error:', err)
      // Fall through to standard Supabase auth
    }
  }

  // Fallback: Standard Supabase Auth reset
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: '6-digit OTP has been sent to your email.' }
}

// Step 2: Verify OTP
export async function verifyRecoveryOtp(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim()
  const token = (formData.get('token') as string)?.trim()

  if (!email || !token) {
    return { error: 'Please enter the 6-digit OTP code.' }
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  })

  if (error) {
    return { error: 'Invalid or expired OTP. Please check the code or request a new one.' }
  }

  return { success: true }
}

// Step 3: Set New Password
export async function setNewPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string
  const email = (formData.get('email') as string)?.trim()

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()

  // 1. Try standard user session update
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (!error) {
    revalidatePath('/', 'layout')
    return { success: true }
  }

  // 2. Fallback: If session missing between multi-step OTP, update via Supabase Admin
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (email && serviceRoleKey && supabaseUrl) {
    try {
      const admin = createAdminClient(supabaseUrl, serviceRoleKey)
      const { data: usersData, error: listErr } = await admin.auth.admin.listUsers()
      if (!listErr && usersData?.users) {
        const targetUser = usersData.users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        )
        if (targetUser) {
          const { error: updateErr } = await admin.auth.admin.updateUserById(targetUser.id, {
            password,
          })
          if (updateErr) {
            return { error: updateErr.message }
          }

          // Sign the user in with new credentials to establish active browser session
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

          revalidatePath('/', 'layout')
          return { success: true }
        }
      }
    } catch (adminErr: any) {
      console.error('Admin password reset fallback error:', adminErr)
    }
  }

  return { error: error.message || 'Failed to update password. Please request a new OTP.' }
}

export async function updatePassword(formData: FormData) {
  return setNewPassword(formData)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

