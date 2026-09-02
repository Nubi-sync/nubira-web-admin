'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  BrainCircuit, 
  Send, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Database, 
  Copy, 
  Check, 
  PanelRight, 
  PanelRightClose, 
  BarChart3, 
  Warehouse, 
  Layers, 
  CheckCircle2, 
  Tag, 
  Truck, 
  ArrowRight,
  Loader2,
  X,
  Menu
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'

interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  toolCalled?: string
  toolArgs?: any
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  updatedAt: number
}

const PREWRITTEN_QUERIES = [
  {
    icon: BarChart3,
    title: 'Factory Health Check',
    description: 'Check active orders, total pieces, WIP in line, godown stock, and dispatches.',
    prompt: 'Give me an overall factory health check including total orders, WIP pieces in line, ready stock in Godown, and dispatched pieces.'
  },
  {
    icon: Warehouse,
    title: 'Godown Ready Stock',
    description: 'What finished garment pieces are currently ready in warehouse stock?',
    prompt: 'How many ready pieces are in Godown right now? Show me the breakdown across articles.'
  },
  {
    icon: Layers,
    title: 'Daily Sewing Output',
    description: 'Review today\'s sewing logs, pieces stitched, and lineman throughput.',
    prompt: 'Show today\'s sewing production logs, total pieces stitched, and lineman breakdown.'
  },
  {
    icon: CheckCircle2,
    title: 'QC Rejections & Defects',
    description: 'Inspect passed pieces vs rejections and common defect types.',
    prompt: 'What are our recent QC inspection results? Show passed vs rejected piece counts and defect types.'
  },
  {
    icon: Tag,
    title: 'Articles Catalog & Rates',
    description: 'Browse article styles, descriptions, and piece-rate stitching rates.',
    prompt: 'List all active article styles with their descriptions and stitching piece rates.'
  },
  {
    icon: Truck,
    title: 'Dispatch & Gate Passes',
    description: 'Review recent delivery challans dispatched out of the factory to buyers.',
    prompt: 'Show recent delivery challans dispatched to buyers with total pieces and vehicle details.'
  }
]

export function ZigzaAiClient({ userEmail = 'admin@nubira.local' }: { userEmail?: string }) {
  const [isMounted, setIsMounted] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  // Right-side history drawer
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [inputPrompt, setInputPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Client mount trigger to eliminate any hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsHistoryOpen(true)
    }
  }, [])

  // 2. Load & Sync Chat Sessions across account devices by Email
  useEffect(() => {
    // Step A: Load from localStorage for zero-delay instant render
    try {
      const local = localStorage.getItem('zigza_ai_chat_sessions')
      if (local) {
        const parsed: ChatSession[] = JSON.parse(local)
        if (parsed.length > 0) {
          setSessions(parsed)
          setCurrentSessionId(parsed[0].id)
        }
      }
    } catch (e) {
      console.error('Failed to parse local sessions', e)
    }

    // Step B: Cloud Sync: Fetch email-synced chat history from Supabase
    async function loadAccountSyncedHistory() {
      try {
        const emailQuery = userEmail ? `?email=${encodeURIComponent(userEmail)}` : ''
        const res = await fetch(`/api/chat/history${emailQuery}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.sessions) && data.sessions.length > 0) {
            setSessions(data.sessions)
            setCurrentSessionId(prev => {
              const stillExists = data.sessions.some((s: ChatSession) => s.id === prev)
              return stillExists ? prev : data.sessions[0].id
            })
            // Update local storage with cloud copy
            localStorage.setItem('zigza_ai_chat_sessions', JSON.stringify(data.sessions))
            return
          }
        }
      } catch (err) {
        console.error('Account history sync fetch error:', err)
      }

      // If no cloud history and no local sessions, create first session
      setSessions(prev => {
        if (prev.length === 0) {
          const fresh: ChatSession = {
            id: 'session_' + Date.now(),
            title: 'New Conversation',
            messages: [],
            updatedAt: Date.now()
          }
          setCurrentSessionId(fresh.id)
          return [fresh]
        }
        return prev
      })
    }

    loadAccountSyncedHistory()
  }, [userEmail])

  // Helper: Persist updated sessions to localStorage AND Supabase Cloud for this Email
  function persistSessions(newSessions: ChatSession[]) {
    setSessions(newSessions)
    try {
      localStorage.setItem('zigza_ai_chat_sessions', JSON.stringify(newSessions))
    } catch (e) {
      console.error('Error saving to localStorage', e)
    }

    // Debounce cloud sync to avoid spamming the backend
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/chat/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userEmail,
            sessions: newSessions 
          })
        })
      } catch (err) {
        console.error('Cloud chat sync error:', err)
      }
    }, 400)
  }

  // Auto-scroll to bottom of message stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSessionId, sessions, isLoading])

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0]

  function createNewSession() {
    const newSession: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    }
    const updated = [newSession, ...sessions]
    persistSessions(updated)
    setCurrentSessionId(newSession.id)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsHistoryOpen(false) // auto-close drawer on mobile
    }
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function deleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const remaining = sessions.filter(s => s.id !== id)
    if (remaining.length === 0) {
      const fresh: ChatSession = {
        id: 'session_' + Date.now(),
        title: 'New Conversation',
        messages: [],
        updatedAt: Date.now()
      }
      persistSessions([fresh])
      setCurrentSessionId(fresh.id)
    } else {
      persistSessions(remaining)
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id)
      }
    }
  }

  function clearAllSessions() {
    const fresh: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    }
    persistSessions([fresh])
    setCurrentSessionId(fresh.id)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsHistoryOpen(false)
    }
  }

  async function handleSendMessage(promptText?: string) {
    const query = (promptText || inputPrompt).trim()
    if (!query || isLoading) return

    const userMessage: Message = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const targetSessionId = currentSession?.id || currentSessionId
    const updatedWithUser = sessions.map(s => {
      if (s.id === targetSessionId) {
        const isFirst = s.messages.length === 0
        return {
          ...s,
          title: isFirst ? (query.length > 28 ? query.slice(0, 28) + '...' : query) : s.title,
          messages: [...s.messages, userMessage],
          updatedAt: Date.now()
        }
      }
      return s
    })

    persistSessions(updatedWithUser)
    setInputPrompt('')
    setIsLoading(true)

    try {
      const history = (currentSession?.messages || []).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response')
      }

      const cleanContent = (data.response || '')
        .replace(/Zigza AI Copilot/gi, 'Zigza AI')
        .replace(/copilot/gi, 'AI')

      const botMessage: Message = {
        id: 'bot_' + Date.now(),
        role: 'model',
        content: cleanContent,
        toolCalled: data.toolCalled,
        toolArgs: data.toolArgs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      const updatedWithBot = sessions.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMessage],
            updatedAt: Date.now()
          }
        }
        return s
      })

      persistSessions(updatedWithBot)
    } catch (err: any) {
      const errorMessage: Message = {
        id: 'err_' + Date.now(),
        role: 'model',
        content: `⚠️ **Unable to fetch factory data**: ${err.message || 'Error executing request'}. Please verify your connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      const updatedWithError = sessions.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMessage],
            updatedAt: Date.now()
          }
        }
        return s
      })

      persistSessions(updatedWithError)
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedMsgId(id)
    setTimeout(() => setCopiedMsgId(null), 2000)
  }

  // Format inline markdown (bold, italic, code, quotes)
  function formatInline(text: string) {
    let formatted = text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950">$1</strong>')
    formatted = formatted.replace(/\*"(.*?)"\*/g, '<span class="font-medium text-[#3A3564] italic">"$1"</span>')
    formatted = formatted.replace(/"\*(.*?)\*"/g, '<span class="font-medium text-[#3A3564] italic">"$1"</span>')
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-[#FAF7F0] text-[#3A3564] font-mono px-1.5 py-0.5 rounded text-xs font-bold border border-black/10">$1</code>')
    return formatted
  }

  // High-readability structured AI renderer
  function renderAiContent(content: string) {
    const rawLines = content.split('\n')
    const blocks: React.ReactNode[] = []
    let currentList: string[] = []

    function flushList() {
      if (currentList.length > 0) {
        blocks.push(
          <ul key={'ul_' + blocks.length} className="my-2.5 space-y-2 pl-0.5 sm:pl-1">
            {currentList.map((item, iIdx) => (
              <li key={iIdx} className="flex items-start gap-2.5 text-xs sm:text-sm md:text-[15px] leading-relaxed text-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3A3564] shrink-0 mt-2 shadow-2xs" />
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              </li>
            ))}
          </ul>
        )
        currentList = []
      }
    }

    for (let idx = 0; idx < rawLines.length; idx++) {
      const line = rawLines[idx]
      const trimmed = line.trim()

      if (!trimmed) {
        flushList()
        continue
      }

      // Detect Table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList()
        const tableLines: string[] = [trimmed]
        while (idx + 1 < rawLines.length && rawLines[idx + 1].trim().startsWith('|')) {
          idx++
          tableLines.push(rawLines[idx].trim())
        }

        const rows = tableLines
          .filter(tl => !tl.split('|').slice(1, -1).every(c => /^[-:\s]+$/.test(c)))
          .map(tl => tl.split('|').slice(1, -1).map(c => c.trim()))

        if (rows.length > 0) {
          const headers = rows[0]
          const bodyRows = rows.slice(1)
          blocks.push(
            <div key={'tbl_' + idx} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF7F0] text-[#3A3564] font-bold border-b border-slate-200">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 font-bold whitespace-nowrap" dangerouslySetInnerHTML={{ __html: formatInline(h) }} />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {bodyRows.map((r, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                      {r.map((c, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 font-medium text-slate-800 whitespace-nowrap" dangerouslySetInnerHTML={{ __html: formatInline(c) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        continue
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList()
        blocks.push(
          <h4 key={idx} className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#3A3564] font-mono mt-3 mb-1.5 pb-1 border-b border-slate-100">
            {trimmed.replace('### ', '')}
          </h4>
        )
        continue
      }
      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        flushList()
        blocks.push(
          <h3 key={idx} className="text-sm sm:text-base font-extrabold text-slate-950 mt-4 mb-2 pb-1 border-b border-slate-200">
            {trimmed.replace(/^#+ /, '')}
          </h3>
        )
        continue
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        const itemContent = trimmed.replace(/^(\*|-|\d+\.)\s+/, '')
        currentList.push(itemContent)
        continue
      }

      // Regular Paragraph
      flushList()
      blocks.push(
        <p 
          key={idx} 
          className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-slate-800 my-1.5"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} 
        />
      )
    }

    flushList()
    return <div className="space-y-1">{blocks}</div>
  }

  // Pre-mount loading placeholder to prevent any SSR hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#FAFAF8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shadow-md animate-pulse">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Loading Zigza AI...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#FAFAF8] relative">
      
      {/* ======================================================== */}
      {/* 1. MAIN CONVERSATION CANVAS (Left on Desktop & Mobile)   */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#FAFAF8]">
        
        {/* Top App Bar: Single clean bar on mobile with hamburger, Zigza AI, New Chat, and History */}
        <header className="px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between z-10 shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Menu Button to open AdminSidebar */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('toggle-mobile-menu'))
                }
              }}
              className="lg:hidden w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-[#FAF7F0] transition-colors cursor-pointer shadow-2xs shrink-0 mr-1"
              aria-label="Open staff navigation menu"
            >
              <Menu className="w-4 h-4 text-[#3A3564]" />
            </button>

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shadow-xs shrink-0">
              <BrainCircuit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)] whitespace-nowrap">
                  Zigza AI
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                  LIVE MES
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:block">
                Direct database queries connected to live plant operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* TV View button hidden on small screens */}
            <div className="hidden sm:block">
              <TvViewButton size="sm" />
            </div>

            {/* New Chat Button with visible label */}
            <button
              type="button"
              onClick={createNewSession}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-white border border-black/15 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#FAF7F0] shadow-2xs transition-colors cursor-pointer shrink-0"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5 text-[#3A3564]" />
              <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">New Chat</span>
            </button>

            {/* History Toggle Button — Positioned on RIGHT with visible label */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 ${
                isHistoryOpen
                  ? 'bg-[#3A3564] text-white border-[#3A3564]'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-[#FAF7F0]'
              }`}
              title="Toggle chat history"
            >
              <PanelRight className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">History</span>
            </button>
          </div>
        </header>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl w-full mx-auto">
          
          {/* EMPTY STATE: Welcome & Prewritten Query Cards */}
          {(!currentSession || currentSession.messages.length === 0) && (
            <div className="py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              
              {/* Hero Greeting */}
              <div className="space-y-1.5 sm:space-y-2 text-center max-w-xl mx-auto px-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 text-[10px] sm:text-xs font-mono font-bold shadow-2xs">
                  <BrainCircuit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>PLANT MANUFACTURING INTELLIGENCE</span>
                </div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  What factory data would you like to check?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ask in plain English. Zigza AI fetches verified numbers directly from cutting orders, sewing lines, godown stock, and dispatch challans.
                </p>
              </div>

              {/* Pre-written Prompt Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                {PREWRITTEN_QUERIES.map((card, idx) => {
                  const Icon = card.icon
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(card.prompt)}
                      className="text-left p-3.5 sm:p-4 rounded-2xl bg-white border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all group flex flex-col justify-between space-y-2 sm:space-y-3 cursor-pointer select-none bg-gradient-to-b from-white to-[#FAFAF8]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <div className="space-y-0.5 sm:space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {card.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

            </div>
          )}

          {/* ACTIVE CHAT: Message Stream */}
          {currentSession && currentSession.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <BrainCircuit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}

              <div className={`space-y-1 max-w-[92%] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Tool Called Pill */}
                {msg.toolCalled && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 text-[9px] sm:text-[10px] font-mono font-bold shadow-2xs mb-1">
                    <Database className="w-3 h-3 text-[#3A3564]" />
                    <span>Queried Database: {msg.toolCalled.replace(/_/g, ' ')}</span>
                  </div>
                )}

                {/* Bubble Container: User (High-Contrast White on Deep Indigo) vs Model (Spacious Card) */}
                {msg.role === 'user' ? (
                  <div className="px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl rounded-tr-xs bg-[#3A3564] text-white shadow-md select-text">
                    <p className="text-white text-xs sm:text-sm md:text-base font-semibold whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 md:p-6 rounded-2xl rounded-tl-xs bg-white border border-slate-200/90 text-slate-900 shadow-xs leading-relaxed">
                    {renderAiContent(msg.content)}
                  </div>
                )}

                {/* Footer action row */}
                <div className="flex items-center gap-3 px-1 text-[9px] sm:text-[10px] font-mono text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'model' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs font-extrabold text-[11px] sm:text-xs">
                  {userEmail.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2 sm:gap-3.5 justify-start items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shrink-0 shadow-2xs">
                <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-black/10 shadow-xs flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-[#3A3564] animate-spin shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  Querying live factory database...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ======================================================== */}
        {/* MOBILE FLUSH BOTTOM PROMPT BAR                           */}
        {/* ======================================================== */}
        <div className="p-2 sm:p-3 border-t border-slate-200/90 bg-white shadow-xs shrink-0">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="relative flex items-center rounded-2xl border border-black/15 bg-white shadow-2xs focus-within:border-[#3A3564] focus-within:ring-2 focus-within:ring-[#3A3564]/10 transition-all px-3 py-1.5 sm:px-4 sm:py-2.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onFocus={() => {
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }, 120)
                }}
                placeholder="Ask about orders, godown stock, linemen, QC..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-medium min-w-0 py-1"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white disabled:opacity-35 transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0 ml-1.5"
                aria-label="Send query"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </form>
          </div>
        </div>

      </main>

      {/* ======================================================== */}
      {/* 2. RIGHT-SIDE HISTORY SIDEBAR — Desktop Fixed / Mobile Slide Drawer */}
      {/* ======================================================== */}
      
      {/* Mobile Backdrop overlay (when opened on mobile) */}
      {isHistoryOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      <aside 
        className={`bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 transition-all duration-300 z-50 fixed lg:relative inset-y-0 right-0 ${
          isHistoryOpen 
            ? 'w-[280px] max-w-[85vw] translate-x-0 shadow-2xl lg:shadow-none' 
            : 'translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        {/* Top: New Chat & Header */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#3A3564]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                Chat History
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close history"
            >
              <X className="w-4 h-4 lg:hidden" />
              <PanelRightClose className="w-4 h-4 hidden lg:block" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF7F0] hover:bg-[#3A3564] text-[#3A3564] hover:text-white rounded-xl border border-black/15 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Recent Chats ({userEmail})
          </div>

          {sessions.map(s => {
            const isActive = s.id === currentSessionId
            return (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentSessionId(s.id)
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setIsHistoryOpen(false) // Auto-close drawer on mobile
                  }
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#3A3564] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#FAF7F0]' : 'text-slate-400'}`} />
                  <span className="truncate">{s.title || 'New Conversation'}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => deleteSession(e, s.id)}
                  title="Delete chat"
                  className={`p-1 rounded-md transition-opacity hover:bg-black/15 ${
                    isActive ? 'text-white opacity-80 hover:opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-600'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom Bar: Clear All */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={clearAllSessions}
            className="text-[11px] font-mono font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
          <span className="text-[10px] font-mono text-slate-400">
            {sessions.length} {sessions.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>
      </aside>

    </div>
  )
}
