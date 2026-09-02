'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Sparkles, 
  X, 
  Send, 
  Trash2, 
  Bot, 
  User, 
  Loader2, 
  Maximize2, 
  Minimize2, 
  Database,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  toolCalled?: string
  toolArgs?: any
  timestamp: string
}

const QUICK_PROMPTS = [
  'What is our total order pieces and factory health?',
  'How many ready pieces are in Godown right now?',
  'Show today\'s sewing production logs and totals',
  'What are the recent QC inspection pass & rejection numbers?',
  'Show me active delivery challans & cutting orders'
]

export function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputPrompt, setInputPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hello! I am **Zigza Operations Copilot**. I can fetch real-time data from your factory database — including cutting orders, lineman allotments, daily sewing output, Godown stock, and QC defect counts. What would you like to check?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputPrompt).trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputPrompt('')
    setIsLoading(true)

    try {
      // Build history for context
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response')
      }

      const botMessage: Message = {
        id: 'bot_' + Date.now(),
        role: 'model',
        content: data.response,
        toolCalled: data.toolCalled,
        toolArgs: data.toolArgs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMessage])
    } catch (err: any) {
      const isQuotaError = err.message?.includes('credits') || err.message?.includes('429')
      
      const errorMessage: Message = {
        id: 'err_' + Date.now(),
        role: 'model',
        content: isQuotaError
          ? '⚠️ **Gemini API Key Quota Notice**: Google AI Studio reported that your current API key has exceeded its quota or requires prepayment.\n\n👉 Please click **"Create API key in new project"** in [Google AI Studio](https://aistudio.google.com/app/apikey) and paste the new key into `.env.local`.'
          : `⚠️ **Error**: ${err.message || 'Unable to fetch data from factory database.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  function handleClearChat() {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'model',
        content: 'Chat history cleared. What factory data would you like me to look up?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  // Format markdown helper (bold, lists, backticks)
  function renderFormattedContent(content: string) {
    const lines = content.split('\n')
    return (
      <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />

          // Headers
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-slate-900 mt-2 text-xs uppercase tracking-wider">{line.replace('### ', '')}</h4>
          }
          if (line.startsWith('## ') || line.startsWith('# ')) {
            return <h3 key={idx} className="font-extrabold text-slate-900 mt-2 text-sm">{line.replace(/^#+ /, '')}</h3>
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const clean = line.trim().replace(/^[-*] /, '')
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#3A3564] font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(clean) }} />
              </div>
            )
          }

          return (
            <p 
              key={idx} 
              dangerouslySetInnerHTML={{ __html: formatInline(line) }} 
            />
          )
        })}
      </div>
    )
  }

  function formatInline(text: string) {
    // Bold: **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    // Inline code: `text`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-[#FAF7F0] text-[#3A3564] font-mono px-1.5 py-0.5 rounded text-[11px] font-bold border border-black/10">$1</code>')
    return formatted
  }

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON                              */}
      {/* ======================================================== */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-white/20 group hover:scale-105 select-none"
            aria-label="Open AI Copilot"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-[#FAF7F0] group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-wide font-[family-name:var(--font-heading)]">
              Ask Zigza AI
            </span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CHATBOT DRAWER PANEL                                  */}
      {/* ======================================================== */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-black/15 flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${
            isExpanded 
              ? 'w-[95vw] sm:w-[600px] h-[85vh] max-h-[750px]' 
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#3A3564] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-[family-name:var(--font-heading)] tracking-wide">
                    Zigza Factory Copilot
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564]">
                    AI Live
                  </span>
                </div>
                <p className="text-[11px] text-[#FAF7F0]/80">
                  Direct database queries & live insights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear chat"
                className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="hidden sm:flex w-7 h-7 rounded-lg hover:bg-white/15 items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFAF8] text-slate-800">
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Tool Call Pill Badge */}
                  {msg.toolCalled && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 text-[10px] font-mono font-bold shadow-2xs">
                      <Database className="w-3 h-3 text-[#3A3564]" />
                      <span>Queried {msg.toolCalled.replace(/_/g, ' ')}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`p-3 sm:p-3.5 rounded-2xl shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-[#3A3564] text-white rounded-tr-none'
                        : 'bg-white border border-black/10 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {renderFormattedContent(msg.content)}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 block px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-black/10 shadow-2xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#3A3564] animate-spin" />
                  <span className="text-xs font-semibold text-slate-600">
                    Querying factory database...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (Only show if <= 2 messages) */}
          {messages.length <= 2 && (
            <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-[#FAF7F0] hover:border-[#3A3564]/30 border border-slate-200 text-[11px] font-medium text-slate-700 shrink-0 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything about orders, stock, linemen, QC..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all text-slate-900 placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

        </div>
      )}
    </>
  )
}
