# ZIGZA MES — Meta WhatsApp Cloud API & 6-Day Demo Trial Implementation Manual

**Document Version:** 1.0.0  
**Project:** Nubira Creation / Zigza MES  
**Date Created:** September 12, 2026  
**Status:** Credentials Verified & Ready for Execution (Pending: Payment Method Activation)  
**Target Path:** `web_admin/docs/WHATSAPP_INTEGRATION_GUIDE.md`

---

## 1. Executive Summary & Current Milestone Status

Humne **Meta WhatsApp Cloud API (Official)** ka production setup successfully establish kar liya hai. Meta ke servers ke saath API handshake, Permanent System User Access Token generation, phone number verification aur template testing perform ho chuki hai.

### Setup Status Summary

| Item | Status | Details |
| :--- | :---: | :--- |
| **Meta Developer App** | COMPLETED | App Name: `Zigza`, App ID: `2447314359078864` |
| **System User & Permissions** | COMPLETED | System User: `Employee` (`122093831871483776`), Scopes: `whatsapp_business_messaging`, `whatsapp_business_management`, `business_management` |
| **Access Token Type** | COMPLETED | **Permanent Token** (`expires_at: 0` — Kabhi expire nahi hoga) |
| **Registered Business Number** | COMPLETED | `+91 82748 16958` (Verified Name: `Zigza`, Status: `VERIFIED`) |
| **Phone Number ID** | COMPLETED | `1387331371125869` |
| **WABA (WhatsApp Business Account) ID** | COMPLETED | `2166253640635726` |
| **Target Admin Recipient Number** | CONFIGURED | `+91 79998 76210` (Instant Demo Alert Destination) |
| **Graph API Handshake Test** | COMPLETED | HTTP 200 OK (`message_status: accepted`, `wamid` returned) |
| **Payment Method on WABA** | **PENDING (KAL KARENGE)** | Meta WABA Billing Hub me debit/credit card attach karna bacha hai |

---

## 2. Credentials Reference (Ready to Use)

Ye saare production credentials verify ho chuke hain aur direct environment variables mein use honge:

```env
# Meta WhatsApp Cloud API Configuration
META_WA_APP_ID=2447314359078864
META_WA_BUSINESS_ACCOUNT_ID=2166253640635726
META_WA_PHONE_NUMBER_ID=1387331371125869
META_WA_SENDER_NUMBER=+918274816958
META_WA_ADMIN_RECIPIENT_NUMBER=917999876210
META_WA_GRAPH_API_VERSION=v22.0

# Permanent System User Token (Never Expires)
META_WA_ACCESS_TOKEN=EAAix0ccGz9ABSZAAovkUcbLrl5wHAiHVAR8OZCQr6Mvm5KAwcZCExasaLbyRSXfB7vuM63SDyZAkOm3GlUXxNOExASZBvEqru4Fzf1osDFBwpKR3roTGzmacUFesdQZA3DsvKDrt6603zzmq5YfNf9XaT1YDkuyRnj4aPZCCFztU8wjg4eDgUhuipFHXsfvCgZDZD
```

---

## 3. Kal Ka Pending Step: Payment Method Kaise Add Karna Hai

Meta ka security rule hai ki registered number se outward messages tabhi deliver hote hain jab WABA account par ek active payment card linked ho.

### Step-by-Step Guide for Tomorrow:
1. Meta App Dashboard par `WhatsApp > Configuration` ya Meta Business Manager ke **Billing Hub** me jayein:
   - URL: `https://business.facebook.com/billing_hub`
   - Business ID: `657631114663825`
   - WABA Account: `Zigza (2166253640635726)`
2. **Add Payment Method** button par click karein.
3. Form values select karein:
   - **Country:** `India`
   - **Currency:** `INR - Indian Rupee` (Mandatory: taaki invoices INR me generate hon)
   - **Timezone:** `Asia/Kolkata (GMT+5:30)`
4. Debit ya Credit Card enter karein (Online/International usage active hona chahiye).
5. Meta ₹2 ya ₹5 ka temporary verification charge karega jo immediately auto-refund ho jayega.
6. Optional: **Monthly Spending Limit** set kar sakte hain (e.g., ₹300/month limit taaki extra kabhi na kate).

---

## 4. Official Meta Pricing & Cost Structure (India Rates)

| Category | Description | India Rate |
| :--- | :--- | :--- |
| **Utility Messages** | Demo Lead alerts, order updates, system notices | **~₹0.115 to ₹0.12 (12 paise)** |
| **Service Messages** | Customer replies within 24h window | **1,000 conversations/month FREE**, fir ~₹0.29 |
| **Authentication** | Password reset OTPs, verification codes | **~₹0.115 (11.5 paise)** |
| **Platform Fee** | Monthly maintenance or subscription | **₹0.00 (Zero fixed cost)** |

*Estimates:* 100 demo leads = ₹12 total. 500 demo leads = ₹60 total.

---

## 5. Complete 6-Day Demo & Subscription Architecture

User ke required flow ke mutabiq complete logic:

```
[Visitor on Landing / Pricing Page]
                 │
                 ▼
[Clicks "Request 6-Day Free Demo" Button]
                 │
                 ▼
[Submits Form: Company, Name, Mobile, Email, Production Units]
                 │
                 ├──────────────────────────────────────────────────┐
                 ▼                                                  ▼
[1. Supabase Database]                            [2. Meta WhatsApp Cloud API]
Saves to `demo_requests` table                    Sends Instant Alert to Admin (+91 79998 76210):
- company_name, contact_person, phone,            "New Demo Request:
  email, units, status: 'PENDING'                  Company: XYZ Apparels
                                                   Contact: Rahul Sharma (9876543210)
                                                   Email: rahul@xyz.com"
                 │
                 ▼
[3. Admin Provisioning / Automated Account Creation]
Admin credentials provide karta hai (ya button click se 1-click provisioning):
- System-generated password create hota hai (e.g., `Zigza#Demo8392`)
- User record `profiles` table me create hota hai:
  - `role`: 'DEMO_USER'
  - `trial_start_at`: NOW()
  - `trial_expires_at`: NOW() + INTERVAL '6 DAYS'
  - `is_trial_active`: true
  - `must_change_password`: true
                 │
                 ▼
[4. Demo User First Login]
- User apne system-generated password se login karta hai.
- Login hote hi system **Mandatory Password Change Modal** display karta hai.
- User apna naya secret password save karta hai (`must_change_password = false`).
                 │
                 ▼
[5. Days 1 to 6 (Active Trial Period)]
- User dashboard, stitching, cutting, inventory sabhi features explore kar sakta hai.
- Har page ke top par sleek banner dikhta hai:
  "Free Demo Trial: 4 Days Remaining | Upgrade to Standard/Enterprise"
                 │
                 ▼
[6. Day 7 Onward (Automatic Lockout Engine)]
- `trial_expires_at < NOW()` trigger ho jata hai.
- **Lockout Mechanism:**
  1. Main Dashboard visible rahega (Read-only summary metrics).
  2. Saare operational modules (Cutting, Stitching, QC, Store, Inventory, Employees) lock ho jayenge.
  3. Kisi bhi action par sleek modal aayega:
     "Your 6-Day Free Demo has expired. Contact Sales or Upgrade your plan to continue uninterrupted factory operations."
  4. Database RLS / Server actions me trial expiration check lagaya jayega taaki unauthorized inserts block ho sakein.
```

---

## 6. Ready-to-Implement Code Specifications

Jab aap ye MD file wapas denge, tab ye code directly project me apply hoga:

### 6.1 Database Schema (SQL Migration)

```sql
-- 1. Table for Demo Requests
CREATE TABLE IF NOT EXISTS public.demo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    estimated_machines INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    provisioned_at TIMESTAMPTZ,
    admin_notes TEXT
);

-- 2. Add Trial Columns to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_demo_account BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
```

### 6.2 WhatsApp Notification Service (`web_admin/src/lib/whatsapp.ts`)

```typescript
export async function sendWhatsAppDemoAlert(lead: {
  company_name: string
  contact_person: string
  phone: string
  email: string
  estimated_machines?: number
}) {
  const token = process.env.META_WA_ACCESS_TOKEN
  const phoneId = process.env.META_WA_PHONE_NUMBER_ID || '1387331371125869'
  const adminNumber = process.env.META_WA_ADMIN_RECIPIENT_NUMBER || '917999876210'

  const messageText = 
`🔔 *NEW DEMO REQUEST - ZIGZA MES*
━━━━━━━━━━━━━━━━━━━━
🏢 *Company:* ${lead.company_name}
👤 *Contact:* ${lead.contact_person}
📱 *Phone:* ${lead.phone}
✉️ *Email:* ${lead.email}
🏭 *Machines:* ${lead.estimated_machines || 'N/A'}
📅 *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━
Action: Log in to Web Admin to approve 6-Day trial credentials.`

  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: adminNumber,
      type: 'text',
      text: { body: messageText }
    })
  })

  return await response.json()
}
```

### 6.3 Demo Request API Route (`web_admin/src/app/api/demo-request/route.ts`)

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppDemoAlert } from '@/lib/whatsapp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { company_name, contact_person, phone, email, estimated_machines } = body

    if (!company_name || !contact_person || !phone || !email) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // 1. Save Lead to Supabase
    const { data: lead, error: dbError } = await supabase
      .from('demo_requests')
      .insert({
        company_name,
        contact_person,
        phone,
        email,
        estimated_machines: Number(estimated_machines) || 0,
        status: 'PENDING'
      })
      .select()
      .single()

    if (dbError) throw dbError

    // 2. Dispatch WhatsApp Alert to Admin
    try {
      await sendWhatsAppDemoAlert({ company_name, contact_person, phone, email, estimated_machines })
    } catch (waErr) {
      console.error('WhatsApp notification error:', waErr)
      // Non-blocking so lead is preserved even if WhatsApp fails
    }

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### 6.4 6-Day Trial Expiration Interceptor (`web_admin/src/lib/trialGuard.ts`)

```typescript
export function checkTrialStatus(profile: {
  is_demo_account?: boolean
  trial_expires_at?: string | null
}) {
  if (!profile.is_demo_account) return { isLocked: false, daysRemaining: null }
  if (!profile.trial_expires_at) return { isLocked: true, daysRemaining: 0 }

  const now = new Date().getTime()
  const expiry = new Date(profile.trial_expires_at).getTime()
  const diffMs = expiry - now

  if (diffMs <= 0) {
    return { isLocked: true, daysRemaining: 0 }
  }

  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return { isLocked: false, daysRemaining }
}
```

---

## 7. Next Steps (Kal Execute Karne Ka Flow)

Jab aap kal is file ko implement karne ko kahenge:

1. **Meta Billing Complete Karenge**: Meta Business Manager me Debit/Credit card add karenge.
2. **Live WhatsApp Test Verification**: Server se ek test alert bhejkar phone par direct tick aur notification verify karenge.
3. **Landing Page Subscription Component Update**: Teeno subscription plans ke neeche sleek **"Request 6-Day Free Demo"** button aur modal link karenge.
4. **Supabase Migration**: `demo_requests` table create karenge aur trial duration tracking add karenge.
5. **Auto-Lock Engine**: 6 din baad dashboard-only read-only lock screen enable kar denge.

---
*Manual compiled and verified for direct execution.*
