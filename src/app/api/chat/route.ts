import { NextRequest, NextResponse } from 'next/server'
import { GEMINI_TOOLS_DECLARATIONS, executeAiTool } from '@/lib/ai/tools'

export const dynamic = 'force-dynamic'

function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_KEY ||
    ''
  ).trim()
}

const SYSTEM_INSTRUCTION = `You are Zigza AI, the dedicated digital production assistant for the garment factory owner and management team.

TARGET AUDIENCE:
You are speaking directly to garment factory owners, business merchants, senior directors, and workshop managers. Many are experienced businessmen who prefer simple, practical, everyday spoken English. They do NOT know software jargon, database terms, or code variables.

COMMUNICATION RULES:
1. Pure Plain English: Speak naturally, politely, and directly.
   - NEVER use developer or database jargon (e.g. NEVER say "KPI", "API", "JSON", "schema", "table", "public.qc_inspections", "activeArticlesCount", "totalOrderTargetPieces", or any camelCase text).
   - Translate all data into everyday garment factory terms:
     • "Garment Styles / Designs" (not articles or SKUs)
     • "Running Orders / Cutting Orders" (not production orders or challans)
     • "Target Pieces to Make" (not order target qty)
     • "Tailors / Stitching Workers" (not linemen or floor profiles)
     • "Daily Stitched Pieces" (not daily_product logs)
     • "Finished Goods in Godown" (not store inventory)
     • "Dispatches & Gate Passes" (not delivery challans)
     • "Quality Checking & Alterations" (not qc inspections)

2. Clear & Executive Formatting:
   - Always put quantities and numbers in bold with their units (e.g. **97,674 pieces**, **34 styles**, **21 active orders**, **₹5.50 per piece**).
   - Use clean, simple bullet points.
   - Keep answers clear and to the point—no fluff or unnecessary paragraphs.

3. Zero Code or Error Dumps:
   - If there are no records in the database or if an action has 0 entries, explain it warmly in plain English (e.g. "There are no quality rejection records logged today—all production lines are running smoothly.").
   - Never show technical error messages or raw database responses.

4. Branding:
   - Your name is strictly "Zigza AI". Never mention underlying LLM models, Google, or other AI brands.

5. Direct Helpful Responses:
   - When asked "what can you do?", explain simply:
     "I can help you quickly check:
     • Running orders and total pieces to make
     • Active garment styles and stitching rates
     • Daily pieces stitched by tailors
     • Ready stock available in the godown
     • Dispatched deliveries and buyer gate passes
     • Quality checking and alteration reports"
`

export async function POST(req: NextRequest) {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured in server environment. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build Gemini contents array from history + new message
    const contents: any[] = []

    // Add recent history (last 4 messages, trimmed to avoid token explosion)
    const recentHistory = history.slice(-4)
    for (const h of recentHistory) {
      if (h.role === 'user' || h.role === 'model') {
        const text = typeof h.content === 'string' ? h.content.slice(0, 400) : ''
        if (text) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text }]
          })
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // 1. Initial Call to Gemini with Function Declarations
    const initialPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents,
      tools: [
        {
          functionDeclarations: GEMINI_TOOLS_DECLARATIONS
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800
      }
    }

    const firstRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPayload)
    })

    if (!firstRes.ok) {
      const errText = await firstRes.text()
      return NextResponse.json(
        { error: `Gemini API error: ${errText.slice(0, 200)}` },
        { status: firstRes.status }
      )
    }

    const firstData = await firstRes.json()
    const firstCandidate = firstData.candidates?.[0]?.content?.parts?.[0]

    // Check if model called a tool
    if (firstCandidate?.functionCall) {
      const { name, args, id: callId } = firstCandidate.functionCall
      
      // Execute the database tool
      const toolResult = await executeAiTool(name, args || {})

      const modelContent = firstData.candidates?.[0]?.content

      const functionResponseObj: any = {
        name,
        response: {
          content: toolResult
        }
      }
      if (callId) {
        functionResponseObj.id = callId
      }

      // 2. Feed tool result back to Gemini for natural language synthesis
      const secondContents = [
        ...contents,
        modelContent,
        {
          role: 'user',
          parts: [
            {
              functionResponse: functionResponseObj
            }
          ]
        }
      ]

      const secondPayload = {
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: secondContents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800
        }
      }

      const secondRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secondPayload)
      })

      if (!secondRes.ok) {
        // Fallback: format into simple plain English sentences
        return NextResponse.json({
          response: formatFriendlyFallback(name, toolResult)
        })
      }

      const secondData = await secondRes.json()
      
      let answerText = ''
      const parts = secondData.candidates?.[0]?.content?.parts
      if (Array.isArray(parts)) {
        answerText = parts
          .filter((p: any) => p && typeof p.text === 'string')
          .map((p: any) => p.text)
          .join('\n')
          .trim()
      }

      if (!answerText) {
        answerText = formatFriendlyFallback(name, toolResult)
      }

      return NextResponse.json({
        response: answerText
      })
    }

    // Direct response without function call
    let directText = ''
    const parts = firstData.candidates?.[0]?.content?.parts
    if (Array.isArray(parts)) {
      directText = parts
        .filter((p: any) => p && typeof p.text === 'string')
        .map((p: any) => p.text)
        .join('\n')
        .trim()
    }

    if (!directText) {
      directText = "I am Zigza AI, your factory floor assistant. How can I help you with your orders, styles, or stock today?"
    }

    return NextResponse.json({
      response: directText
    })

  } catch (err: any) {
    console.error('Chatbot API error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error processing chatbot query' },
      { status: 500 }
    )
  }
}

function formatFriendlyFallback(toolName: string, data: any): string {
  if (!data || typeof data !== 'object') {
    return 'Here is the current information from your factory records.'
  }

  if (toolName === 'get_factory_kpis') {
    return `Here is the current status of your factory floor:
• **Active Garment Styles**: **${data.activeGarmentStyles || 0} designs**
• **Running Production Orders**: **${data.runningOrdersCount || 0} active orders**
• **Total Pieces to Make**: **${(data.totalTargetPieces || 0).toLocaleString()} pieces**
• **Ready Stock in Godown**: **${(data.readyStockInGodown || 0).toLocaleString()} pieces**
• **Dispatched to Buyers**: **${(data.totalDispatchedPieces || 0).toLocaleString()} pieces**`
  }

  if (data.note) {
    return data.note
  }

  return 'Here is the current summary from your factory records.'
}
