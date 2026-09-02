import { NextRequest, NextResponse } from 'next/server'
import { GEMINI_TOOLS_DECLARATIONS, executeAiTool } from '@/lib/ai/tools'

export const dynamic = 'force-dynamic'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_INSTRUCTION = `You are Zigza AI, the dedicated manufacturing intelligence system for Zigza ERP & MES garment plant.
Your primary role is to accurately answer operational questions by fetching real-time data from the factory database using the provided tools.

CRITICAL BRANDING RULES:
1. Your name is strictly "Zigza AI". NEVER use the words "copilot", "co-pilot", "Gemini", or mention underlying AI models.
2. Grounded & Exact: Always use tools to fetch exact article rates, order pieces, lineman assignments, inventory counts, and QC passes/rejections. NEVER guess or invent numbers.
3. Clean Formatting: Present piece counts, rates, and numbers in bold (e.g. **1,450 pcs**). Use clear bullet points or clean markdown tables for structured data.
4. Factory Terminology: Respect apparel manufacturing terms (Challan, Lineman, WIP / Goods in Line, Mending, Cutting, Godown, Delivery Challan).
5. No Data Cases: If a query yields 0 records, clearly state that no matching logs or records were found in the database.
`

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured in server environment.' },
        { status: 500 }
      )
    }

    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build Gemini contents array from history + new message
    const contents: any[] = []

    // Add recent history (up to last 6 messages)
    const recentHistory = history.slice(-6)
    for (const h of recentHistory) {
      if (h.role === 'user' || h.role === 'model') {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })
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
        maxOutputTokens: 1024
      }
    }

    const firstRes = await fetch(GEMINI_ENDPOINT, {
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
        tools: [
          {
            functionDeclarations: GEMINI_TOOLS_DECLARATIONS
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      }

      const secondRes = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secondPayload)
      })

      if (!secondRes.ok) {
        // Fallback: return raw tool result formatted
        return NextResponse.json({
          response: `Retrieved data from **${name}**:\n\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``,
          toolCalled: name,
          toolArgs: args
        })
      }

      const secondData = await secondRes.json()
      const answerText = secondData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'

      return NextResponse.json({
        response: answerText,
        toolCalled: name,
        toolArgs: args,
        rawToolData: toolResult
      })
    }

    // If no function call, return direct response
    const directText = firstCandidate?.text || 'I can look up live orders, inventory, lineman allotments, QC inspections, and articles for you. What would you like to check?'

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
