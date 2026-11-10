import { NextResponse } from 'next/server'
import { checkEmailAvailabilityAction, checkPhoneAvailabilityAction } from '@/app/register/actions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')
  const email = searchParams.get('email')

  if (phone) {
    const res = await checkPhoneAvailabilityAction(phone)
    return NextResponse.json(res, { headers: corsHeaders })
  }

  if (email) {
    const res = await checkEmailAvailabilityAction(email)
    return NextResponse.json(res, { headers: corsHeaders })
  }

  return NextResponse.json({ available: false, error: 'Provide phone or email parameter.' }, { status: 400, headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, email } = body

    if (phone) {
      const res = await checkPhoneAvailabilityAction(phone)
      return NextResponse.json(res, { headers: corsHeaders })
    }

    if (email) {
      const res = await checkEmailAvailabilityAction(email)
      return NextResponse.json(res, { headers: corsHeaders })
    }

    return NextResponse.json({ available: false, error: 'Provide phone or email parameter.' }, { status: 400, headers: corsHeaders })
  } catch (err: any) {
    return NextResponse.json({ available: false, error: err?.message || 'Server error' }, { status: 500, headers: corsHeaders })
  }
}
