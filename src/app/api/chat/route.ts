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

const SYSTEM_INSTRUCTION = `You are Zigza AI, the intelligent operations assistant for Zigza ERP & MES garment manufacturing system.
Your primary role is to accurately answer operational questions by fetching real-time data from the factory database using the provided tools.

CRITICAL OPERATIONAL RULES:
1. Branding: Your name is strictly "Zigza AI". NEVER use "copilot", "co-pilot", "Gemini", or mention underlying LLM models.
2. Typos & Spelling Mistakes: Be very forgiving with typos, shorthand, and spelling mistakes (e.g. "stck in godon" -> check godown inventory; "lnemn" -> lineman allotments; "challn" -> delivery challans; "arti" -> articles catalog). Infer the user's intent and invoke the proper tool.
3. Capabilities & Scope:
   - When asked what you can do or how you can help, clearly list what you can check:
     • Production Orders: Order status, lot matrices, total pieces, and buyer details.
     • Floor & Linemen: Bundle allotments, lineman throughput, and piece-rate earnings.
     • Daily Sewing Logs: Pieces stitched today and production throughput.
     • Warehouse & Godown: Finished goods inventory ready in warehouse stock.
     • QC Inspections: Passed vs rejected pieces and defect breakdown.
     • Articles Catalog: Garment styles, descriptions, and piece rates.
   - If asked about topics outside factory manufacturing (e.g. cooking, jokes, weather), politely clarify that you are focused on Zigza factory floor execution and offer to check factory data.
4. Grounded Numbers: When reporting database results, present piece counts and rates in bold (e.g. **1,450 pcs**, **₹4.50/pc**). Use clean bullet points or markdown tables.
5. Always Respond: When tool data is provided, ALWAYS synthesize a helpful, friendly natural language response. NEVER leave the response blank.
`

export async function POST(req: NextRequest) {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured in server environment. Please add GEMINI_API_KEY to your Vercel/Render Environment Variables and redeploy.' },
        { status: 500 }
      )
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build Gemini contents array from history + new message
    const contents: any[] = []

    // Add recent history (last 4 messages, trimmed to 400 chars to avoid token inflation)
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
      const { name, args } = firstCandidate.functionCall
      
      // Execute the database tool
      const toolResult = await executeAiTool(name, args || {})

      const modelContent = firstData.candidates?.[0]?.content

      // 2. Feed tool result back to Gemini for natural language synthesis
      // NOTE: Do NOT re-declare tools here - saves ~3,000 tokens per response
      const secondContents = [
        ...contents,
        modelContent,
        {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name,
                response: {
                  content: toolResult
                }
              }
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
        // Fallback: return raw tool result formatted
        return NextResponse.json({
          response: `Retrieved data for **${name.replace(/_/g, ' ')}**:\n\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``,
          toolCalled: name,
          toolArgs: args
        })
      }

      const secondData = await secondRes.json()
      
      // Collect all text parts from Gemini candidate
      let answerText = ''
      const parts = secondData.candidates?.[0]?.content?.parts
      if (Array.isArray(parts)) {
        answerText = parts
          .filter((p: any) => p && typeof p.text === 'string')
          .map((p: any) => p.text)
          .join('\n')
          .trim()
      }

      // Robust fallback if Gemini generated an empty text string
      if (!answerText) {
        const rawObj = toolResult as any
        if (rawObj && typeof rawObj === 'object') {
          if (rawObj.message) {
            answerText = rawObj.message
          } else if (Array.isArray(rawObj) && rawObj.length === 0) {
            answerText = `No matching records were found in the database for **${name.replace(/_/g, ' ')}**.`
          } else {
            answerText = `Here is the current operational data from **${name.replace(/_/g, ' ')}**:\n\n` +
              Object.entries(rawObj)
                .map(([k, v]) => `• **${k.replace(/_/g, ' ')}**: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                .join('\n')
          }
        } else {
          answerText = `I retrieved the data for **${name.replace(/_/g, ' ')}**, but no specific records were found.`
        }
      }

      return NextResponse.json({
        response: answerText,
        toolCalled: name,
        toolArgs: args,
        rawToolData: toolResult
      })
    }

    // If no function call, return direct response
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
      directText = "I am Zigza AI, your factory floor operations assistant. You can ask me to check production orders, lineman allotments, daily sewing logs, godown inventory, QC rejections, or the articles catalog. What would you like to look up?"
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
