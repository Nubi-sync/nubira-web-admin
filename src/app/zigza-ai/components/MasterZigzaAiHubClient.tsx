'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  Send,
  Trash2,
  Plus,
  MessageSquare,
  Copy,
  Check,
  PanelLeft,
  X,
  LayoutGrid,
  Store,
  Scissors,
  Layers,
  Boxes,
  Palette,
  Briefcase,
  Printer,
  Sparkles,
  Waves,
  Flame,
  Truck,
  Building2,
  Loader2,
  Tag,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { MasterAiKpis } from '../actions'

export type PortalType = 
  | 'modules' 
  | 'design'
  | 'merchandising'
  | 'cutting'
  | 'printing' 
  | 'embroidery' 
  | 'stitching-sewing'
  | 'washing' 
  | 'iron'
  | 'ready-goods'
  | 'alter'
  | 'store'
  | 'dispatch'
  | 'factory' 
  | 'brands'

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

interface QueryCard {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  prompt: string
}

const PORTAL_METADATA: Record<PortalType, {
  title: string
  subtitle: string
  badge: string
  heroTitle: string
  heroDescription: string
  queries: QueryCard[]
}> = {
  'modules': {
    title: 'Master Enterprise Copilot',
    subtitle: 'Cross-division executive intelligence and multi-plant operations',
    badge: 'SUPER ADMIN AI',
    heroTitle: 'Executive multi-plant intelligence & factory oversight',
    heroDescription: 'Ask for holistic updates across all 11 operating divisions, fabric store stock, floor output, QC rates, and master dispatches.',
    queries: [
      {
        icon: LayoutGrid,
        title: 'Enterprise Health Check',
        description: 'Audit live operations across all 11 manufacturing divisions.',
        prompt: 'Give me an overall factory health check across all operational divisions including total running orders, ready stock, and dispatches.'
      },
      {
        icon: Store,
        title: 'Fabric & Trims in Store',
        description: 'Audit cloth meters and trims left in godown store and allocated styles.',
        prompt: 'How much fabric cloth and required trims are left in store, and what articles are they assigned to?'
      },
      {
        icon: Briefcase,
        title: 'Buyers & Active Contracts',
        description: 'Review registered buyers, contracted pieces, and vendor modules.',
        prompt: 'Show our registered buyers, active style contracts, and vendor module assignments.'
      },
      {
        icon: Boxes,
        title: 'Master Finished Stock',
        description: 'Audit finished garment inventory ready in central godown.',
        prompt: 'How many ready pieces are in Godown right now? Show me the breakdown across articles.'
      },
      {
        icon: Layers,
        title: 'Floor Production Logs',
        description: 'Review today\'s sewing logs, pieces stitched, and lineman throughput.',
        prompt: 'Show today\'s sewing production logs, total pieces stitched, and lineman breakdown.'
      },
      {
        icon: CheckCircle2,
        title: 'Plant QC & Defect Rates',
        description: 'Inspect passed pieces vs rejections and defect rates.',
        prompt: 'What are our recent QC inspection results? Show passed vs rejected piece counts and defect types.'
      }
    ]
  },
  'store': {
    title: 'Central Store & Fabric Godown',
    subtitle: 'Raw fabric rolls, trims inventory, cutting challan issue, and finished carton storage',
    badge: 'CENTRAL STORE AI',
    heroTitle: 'What store inventory or fabric stock would you like to audit?',
    heroDescription: 'Ask about fabric roll meters in godown, trims balance, cutting challans issued, and stock reconciliation.',
    queries: [
      {
        icon: Store,
        title: 'Raw Material & Fabric Stock',
        description: 'Rolls in stock by GSM, color, and supplier lot number.',
        prompt: 'Show our current fabric inventory in Godown grouped by color, GSM, and roll count.'
      },
      {
        icon: Boxes,
        title: 'Finished Goods Inventory',
        description: 'Finished pieces stored in central warehouse ready for dispatch.',
        prompt: 'How many ready pieces are in Godown right now? Show me the breakdown across articles.'
      },
      {
        icon: Truck,
        title: 'Cutting Challans Issued',
        description: 'Fabric rolls issued to the cutting floor with lot reference.',
        prompt: 'Show all fabric and trim issues dispatched to cutting and production floors today.'
      }
    ]
  },
  'cutting': {
    title: 'Cutting & Lay Floor',
    subtitle: 'Fabric roll lays, CAD nesting efficiency, cut order lots, and bundle tags',
    badge: 'CUTTING AI',
    heroTitle: 'What cutting order or lay sheet would you like to inspect?',
    heroDescription: 'Ask about fabric rolls spread today, CAD marker utilization, cutting orders in progress, and bundle tickets.',
    queries: [
      {
        icon: Scissors,
        title: 'Active Lay Sheets & Marker',
        description: 'Review lay count, plies, end-loss, and CAD marker efficiency.',
        prompt: 'Show all active lay sheets and marker efficiency logged today.'
      },
      {
        icon: Layers,
        title: 'Bundle Tickets & Barcodes',
        description: 'Check bundles cut and generated for floor sewing distribution.',
        prompt: 'Show bundle tickets generated from recent cutting lots ready for sewing line allocation.'
      },
      {
        icon: LayoutGrid,
        title: 'Cut Order Backlog',
        description: 'Running cutting orders vs pending queue.',
        prompt: 'What is the current cutting order queue, pending pieces, and target completion dates?'
      }
    ]
  },
  'stitching-sewing': {
    title: 'Stitching & Sewing Floor',
    subtitle: 'Cutting orders, tailor pieces, bundle allocations, 3-stage QC, and godown stock',
    badge: 'SEWING FLOOR AI',
    heroTitle: 'What factory data would you like to check?',
    heroDescription: 'Ask in plain English. Verified numbers directly from cutting orders, sewing lines, godown stock, and dispatches.',
    queries: [
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
      }
    ]
  },
  'ready-goods': {
    title: 'Quality Clinic & Export Packing',
    subtitle: '100% final garment inspection, alteration repairs, polybag tagging, and carton packing',
    badge: 'QUALITY & PACKING AI',
    heroTitle: 'What final inspection or carton packing lot would you like to review?',
    heroDescription: 'Ask about passing rates, alteration rework queues, polybag bagging progress, and packed cartons.',
    queries: [
      {
        icon: CheckCircle2,
        title: 'Final Quality Clearance',
        description: 'Inspect passed vs rejected piece counts and common defects.',
        prompt: 'What are our recent QC inspection results? Show passed vs rejected piece counts and alteration types.'
      },
      {
        icon: Boxes,
        title: 'Packed Export Cartons',
        description: 'Check cartons packed, weighed, and ready for buyer shipment.',
        prompt: 'How many cartons and pieces are currently packed and ready for dispatch?'
      },
      {
        icon: Store,
        title: 'Finished Goods in Godown',
        description: 'Total completed garments staged in godown stock.',
        prompt: 'How many ready pieces are in Godown right now across articles?'
      }
    ]
  },
  'design': {
    title: 'Design & Tech-Pack Studio',
    subtitle: 'CAD sketches, tech-packs, measurement specs, and grading matrices',
    badge: 'DESIGN AI',
    heroTitle: 'What design style or spec sheet would you like to review?',
    heroDescription: 'Ask about tech-pack measurements, size grading breakdowns, sample iterations, and fabric specs.',
    queries: [
      {
        icon: Palette,
        title: 'Active Tech-Pack Catalog',
        description: 'Review active style sketches, BOM specs, and colorways.',
        prompt: 'Show me all active tech-packs and style specifications currently under sample review.'
      },
      {
        icon: Tag,
        title: 'Size & Grading Specs',
        description: 'Inspect fit specifications across size ranges.',
        prompt: 'Show the measurement grading table and tolerance matrix for our current production styles.'
      }
    ]
  },
  'merchandising': {
    title: 'Merchandising & Sourcing',
    subtitle: 'Buyer PO contracts, style costing, fabric consumption, and T&A calendar milestones',
    badge: 'MERCHANDISING AI',
    heroTitle: 'What buyer purchase order or costing sheet would you like to check?',
    heroDescription: 'Ask about order delivery deadlines, FOB costing, fabric sourcing needs, and critical T&A milestones.',
    queries: [
      {
        icon: Briefcase,
        title: 'Active Buyer Purchase Orders',
        description: 'Track orders, delivery dates, running styles, and target quantities.',
        prompt: 'Show all active buyer purchase orders, target quantities, delivery deadlines, and current progress.'
      },
      {
        icon: Store,
        title: 'Fabric & Trim Requirements',
        description: 'Audit BOM material needs vs current godown stock.',
        prompt: 'How much fabric and trims are required for active buyer orders vs stock currently in store?'
      }
    ]
  },
  'printing': {
    title: 'Screen & Digital Printing',
    subtitle: 'Table printing runs, ink recipes, curing oven temperatures, and strike-off approvals',
    badge: 'PRINTING AI',
    heroTitle: 'What printing run or strike-off would you like to track?',
    heroDescription: 'Ask about active screen table runs, strike-off approvals, daily panel prints, and print quality inspection.',
    queries: [
      {
        icon: Printer,
        title: 'Table Production Runs',
        description: 'Review pieces printed across tables and operators today.',
        prompt: 'Show today\'s printing table runs, total panels printed, and operator output.'
      },
      {
        icon: CheckCircle2,
        title: 'Sample Strike-Off Status',
        description: 'Approved prints vs pending buyer sample strike-offs.',
        prompt: 'What is the status of pending print sample strike-off approvals?'
      }
    ]
  },
  'embroidery': {
    title: 'Multi-Head Embroidery',
    subtitle: 'Punch files, machine head running status, stitch counts, and daily lot output',
    badge: 'EMBROIDERY AI',
    heroTitle: 'What embroidery machine or punch design would you like to monitor?',
    heroDescription: 'Ask about running machine heads, daily stitch throughput, punch file specifications, and thread break records.',
    queries: [
      {
        icon: Sparkles,
        title: 'Machine Running Status',
        description: 'Track running machines, active design files, and RPM speeds.',
        prompt: 'Give me an update on active embroidery machines, running design lots, and daily stitch output.'
      },
      {
        icon: CheckCircle2,
        title: 'Thread Break & QC Defect',
        description: 'Puckering, needle cut alterations, and pass rates.',
        prompt: 'What are our recent QC inspection results? Show passed vs rejected piece counts and defect types.'
      }
    ]
  },
  'washing': {
    title: 'Industrial Washing',
    subtitle: 'Garment enzyme wash, silicon softeners, and liquor ratio batch tracking',
    badge: 'WASHING AI',
    heroTitle: 'What industrial wash lot would you like to track?',
    heroDescription: 'Ask about garment enzyme baths, hydro extractor logs, tumble drying, and wash floor throughput.',
    queries: [
      {
        icon: Waves,
        title: 'Active Wash Recipes & Batches',
        description: 'Review running enzyme, softener, and tint wash recipes.',
        prompt: 'Show all garment wash batches processed today with recipe and piece counts.'
      }
    ]
  },
  'iron': {
    title: 'Ironing & Steam Pressing',
    subtitle: 'Steam iron tables, operator pressing counts, and transfer to packing',
    badge: 'IRONING AI',
    heroTitle: 'What ironing table or operator count would you like to verify?',
    heroDescription: 'Ask about pieces pressed per operator table, boiler steam telemetry, and handover to packing.',
    queries: [
      {
        icon: Flame,
        title: 'Daily Table Pressing Counts',
        description: 'Review pieces steam pressed across operator tables today.',
        prompt: 'Show today\'s steam iron table output, total pieces pressed, and operator logs.'
      }
    ]
  },
  'dispatch': {
    title: 'Dispatch & Delivery Logistics',
    subtitle: 'Container loading, delivery challans, gate pass verification, and pre-loading audits',
    badge: 'DISPATCH LOGISTICS AI',
    heroTitle: 'What delivery shipment or container loading would you like to verify?',
    heroDescription: 'Ask about delivery challans, vehicle gate passes, pre-loading counting audits, buyer shipments, and carton piece reconciliations.',
    queries: [
      {
        icon: Truck,
        title: 'Delivery Challan Verification',
        description: 'Verify active delivery challans, buyer destinations, and vehicle numbers.',
        prompt: 'Show all delivery challans generated for buyer shipments today with vehicle and piece counts.'
      },
      {
        icon: Boxes,
        title: 'Ready for Gate-Out Clearance',
        description: 'Cartons and lots staged in dispatch bay awaiting transport departure.',
        prompt: 'How many cartons and pieces are currently staged in the dispatch loading bay?'
      }
    ]
  },
  'brands': {
    title: 'Brands & Buyer CRM',
    subtitle: 'Buyer PO contracts, style catalogs, and export delivery schedules',
    badge: 'BUYER CRM AI',
    heroTitle: 'What brand accounts or PO contracts would you like to review?',
    heroDescription: 'Ask about purchase order fulfillment, buyer styles, delivery deadlines, and dispatched shipments.',
    queries: [
      {
        icon: Building2,
        title: 'Buyer PO Status',
        description: 'Active export orders, running styles, and target quantities.',
        prompt: 'Give me an overview of all active buyer production orders, target quantities, and current progress.'
      },
      {
        icon: Truck,
        title: 'Buyer Dispatches',
        description: 'Track completed challans dispatched to brand clients.',
        prompt: 'Show recent delivery challans dispatched to buyers with total pieces and vehicle details.'
      }
    ]
  },
  'alter': {
    title: 'Alteration & Repair Clinic',
    subtitle: 'Stitch repairs, panel replacements, and secondary quality audits',
    badge: 'ALTERATION AI',
    heroTitle: 'What alteration queue would you like to check?',
    heroDescription: 'Ask about alteration pieces returned from checking, repair progress, and scrap salvage.',
    queries: [
      {
        icon: CheckCircle2,
        title: 'Defect Alteration Queue',
        description: 'Check pieces undergoing repair before secondary inspection.',
        prompt: 'Show recent defect types logged and current alteration queue status.'
      }
    ]
  },
  'factory': {
    title: 'Factory Master Control',
    subtitle: 'Master plant telemetry, machinery health, and floor OEE',
    badge: 'PLANT HUB AI',
    heroTitle: 'What plant or machinery data would you like to check?',
    heroDescription: 'Ask about equipment uptime, shift allocations, running cutting lines, and plant throughput.',
    queries: [
      {
        icon: LayoutGrid,
        title: 'Plant OEE & Health',
        description: 'Review overall equipment efficiency and machine utilization.',
        prompt: 'Give me a plant health check including active line efficiency, running orders, and shift output.'
      }
    ]
  }
}

const MASTER_DIVISIONS: Array<{
  id: PortalType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { id: 'modules', label: 'All Divisions (Master)', icon: LayoutGrid },
  { id: 'store', label: 'Central Store & Fabric', icon: Store },
  { id: 'cutting', label: 'Cutting Floor', icon: Scissors },
  { id: 'stitching-sewing', label: 'Stitching & Sewing', icon: Layers },
  { id: 'ready-goods', label: 'Quality & Packing', icon: Boxes },
  { id: 'design', label: 'Design Studio', icon: Palette },
  { id: 'merchandising', label: 'Merchandising', icon: Briefcase },
  { id: 'printing', label: 'Printing Division', icon: Printer },
  { id: 'embroidery', label: 'Embroidery Unit', icon: Sparkles },
  { id: 'washing', label: 'Industrial Washing', icon: Waves },
  { id: 'iron', label: 'Ironing & Finishing', icon: Flame },
  { id: 'dispatch', label: 'Dispatch Logistics', icon: Truck },
  { id: 'brands', label: 'Buyers & Vendors', icon: Building2 },
]

interface MasterZigzaAiHubClientProps {
  userEmail?: string
  companyName?: string
  initialKpis?: MasterAiKpis
}

export function MasterZigzaAiHubClient({
  userEmail = 'admin@nubira.local',
  companyName = 'Apparel Factory',
  initialKpis
}: MasterZigzaAiHubClientProps) {
  const [selectedDivision, setSelectedDivision] = useState<PortalType>('modules')
  const meta = PORTAL_METADATA[selectedDivision] || PORTAL_METADATA['modules']

  const [isMounted, setIsMounted] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)
  const [inputPrompt, setInputPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load chat sessions keyed by email & portal
  useEffect(() => {
    let initialLocalSessions: ChatSession[] = []
    const storageKey = userEmail 
      ? `zigza_ai_chat_sessions_${selectedDivision}_${userEmail}` 
      : `zigza_ai_chat_sessions_${selectedDivision}`

    try {
      const local = localStorage.getItem(storageKey)
      if (local) {
        const parsed: ChatSession[] = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialLocalSessions = parsed
          setSessions(parsed)
          const active = parsed.find(s => s.messages && s.messages.length > 0) || parsed[0]
          setCurrentSessionId(active.id)
        } else {
          setSessions([])
        }
      } else {
        setSessions([])
      }
    } catch (e) {
      console.error('Failed to parse local sessions', e)
    }

    // Cloud fetch
    async function loadCloudHistory() {
      try {
        const emailQuery = userEmail ? `&email=${encodeURIComponent(userEmail)}` : ''
        const res = await fetch(`/api/chat/history?portal=${selectedDivision}${emailQuery}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.sessions)) {
            setSessions(prev => {
              const baseList = prev.length > 0 ? prev : initialLocalSessions
              const map = new Map<string, ChatSession>()
              for (const s of baseList) map.set(s.id, s)
              for (const cs of data.sessions) {
                const existing = map.get(cs.id)
                if (!existing) {
                  map.set(cs.id, cs)
                } else if ((cs.messages?.length || 0) >= (existing.messages?.length || 0)) {
                  map.set(cs.id, cs)
                }
              }
              const finalList = Array.from(map.values())
              if (finalList.length > 0) {
                setCurrentSessionId(curr => {
                  const found = finalList.find(s => s.id === curr && s.messages?.length > 0)
                  return found ? curr : finalList[0].id
                })
                return finalList
              }
              const fresh: ChatSession = {
                id: 'session_' + Date.now(),
                title: 'New Conversation',
                messages: [],
                updatedAt: Date.now()
              }
              setCurrentSessionId(fresh.id)
              return [fresh]
            })
            return
          }
        }
      } catch (_) {}

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

    loadCloudHistory()
  }, [userEmail, selectedDivision])

  function persistSessions(newSessions: ChatSession[]) {
    setSessions(newSessions)
    const storageKey = userEmail 
      ? `zigza_ai_chat_sessions_${selectedDivision}_${userEmail}` 
      : `zigza_ai_chat_sessions_${selectedDivision}`

    try {
      localStorage.setItem(storageKey, JSON.stringify(newSessions))
    } catch (_) {}

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/chat/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userEmail,
            portal: selectedDivision,
            sessions: newSessions 
          })
        })
      } catch (_) {}
    }, 400)
  }

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0]

  function createNewSession() {
    const fresh: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    }
    const updated = [fresh, ...sessions]
    persistSessions(updated)
    setCurrentSessionId(fresh.id)
    setIsHistoryDrawerOpen(false)
  }

  function deleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const remaining = sessions.filter(s => s.id !== id)
    if (remaining.length === 0) {
      createNewSession()
    } else {
      persistSessions(remaining)
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id)
      }
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

    let activeId = currentSessionId
    let updatedSessions = [...sessions]
    const existingIndex = updatedSessions.findIndex(s => s.id === activeId)

    if (existingIndex >= 0) {
      const isFirst = updatedSessions[existingIndex].messages.length === 0
      updatedSessions[existingIndex] = {
        ...updatedSessions[existingIndex],
        title: isFirst ? (query.length > 28 ? query.slice(0, 28) + '...' : query) : updatedSessions[existingIndex].title,
        messages: [...updatedSessions[existingIndex].messages, userMessage],
        updatedAt: Date.now()
      }
    } else {
      const freshSession: ChatSession = {
        id: activeId || ('session_' + Date.now()),
        title: query.length > 28 ? query.slice(0, 28) + '...' : query,
        messages: [userMessage],
        updatedAt: Date.now()
      }
      activeId = freshSession.id
      setCurrentSessionId(activeId)
      updatedSessions = [freshSession, ...updatedSessions]
    }

    persistSessions(updatedSessions)
    setInputPrompt('')
    setIsLoading(true)

    try {
      const targetSession = updatedSessions.find(s => s.id === activeId)
      const history = (targetSession?.messages.slice(0, -1) || []).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
          portal: selectedDivision
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch response')

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

      const latestPersist = updatedSessions.map(s => {
        if (s.id === activeId) {
          if (s.messages.some(m => m.id === botMessage.id)) return s
          return {
            ...s,
            messages: [...s.messages, botMessage],
            updatedAt: Date.now()
          }
        }
        return s
      })
      persistSessions(latestPersist)
    } catch (err: any) {
      const errorMessage: Message = {
        id: 'err_' + Date.now(),
        role: 'model',
        content: `⚠️ **Unable to fetch factory data**: ${err.message || 'Error executing request'}. Please verify your connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const latestPersist = updatedSessions.map(s => {
        if (s.id === activeId) {
          return { ...s, messages: [...s.messages, errorMessage], updatedAt: Date.now() }
        }
        return s
      })
      persistSessions(latestPersist)
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedMsgId(id)
    setTimeout(() => setCopiedMsgId(null), 2000)
  }

  function formatInline(text: string) {
    let formatted = text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#0B1220]">$1</strong>')
    formatted = formatted.replace(/\*"(.*?)"\*/g, '<span class="font-medium text-[#1D4ED8] italic">"$1"</span>')
    formatted = formatted.replace(/"\*(.*?)\*"/g, '<span class="font-medium text-[#1D4ED8] italic">"$1"</span>')
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-[#F0FDFA] text-[#0B1220] font-mono px-1.5 py-0.5 rounded text-xs font-bold border border-black/15">$1</code>')
    return formatted
  }

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
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B1220] shrink-0 mt-2 shadow-2xs" />
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
                <thead className="bg-[#F0FDFA] text-[#0B1220] font-bold border-b border-slate-200">
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

      if (trimmed.startsWith('### ')) {
        flushList()
        blocks.push(
          <h4 key={idx} className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0B1220] font-mono mt-3 mb-1.5 pb-1 border-b border-slate-100">
            {trimmed.replace('### ', '')}
          </h4>
        )
        continue
      }
      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        flushList()
        blocks.push(
          <h3 key={idx} className="text-sm sm:text-base font-extrabold text-[#0B1220] mt-4 mb-2 pb-1 border-b border-slate-200">
            {trimmed.replace(/^#+ /, '')}
          </h3>
        )
        continue
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        currentList.push(trimmed.replace(/^(\*|-|\d+\.)\s+/, ''))
        continue
      }

      flushList()
      blocks.push(
        <p key={idx} className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-slate-800 my-1.5" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
      )
    }

    flushList()
    return <div className="space-y-1">{blocks}</div>
  }

  const displayMessages = (currentSession?.messages || []).filter((msg, idx, arr) => 
    arr.findIndex(m => m.id === msg.id) === idx
  )

  const kpis = initialKpis || {
    activeStylesCount: 2,
    runningOrdersCount: 2,
    readyStockGodownPieces: 8000,
    dispatchedPieces: 0
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220]">
      
      {/* 1. Header Banner - Matching Tab Header Standard */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 transition-all">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <Bot className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Zigza AI • <span className="text-[#1D4ED8]">Master Copilot</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                SUPER ADMIN AI • {companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Executive cross-division intelligence across all 11 manufacturing divisions and central warehouse.
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-center">
          <TvViewButton size="md" />
          <button
            type="button"
            onClick={createNewSession}
            className="min-h-[42px] px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Conversation</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Summary KPI Cards - Exact Approved Color Rules (Numbers Black, Icons Blackout on Cyan, Only Green Permitted) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Active Styles */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Styles
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-mono">
              {kpis.activeStylesCount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Live Production Designs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Tag className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Box 2: Running Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Running Orders
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-mono">
              {kpis.runningOrdersCount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Cutting &amp; Sewing Lots</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Layers className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Box 3: Finished Godown Stock (Green Permitted) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Godown Stock
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono truncate">
              {kpis.readyStockGodownPieces.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-slate-400">pcs</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Ready for Dispatch
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Box 4: Dispatched Goods */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dispatched Goods
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-mono">
              {kpis.dispatchedPieces.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-slate-400">pcs</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Buyer Gate Passes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Truck className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>
      </div>

      {/* 3. Division Quick Switcher Bar (Filter Pills) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold text-[#0B1220] font-[family-name:var(--font-heading)] flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-[#1D4ED8]" />
            Division Intelligence Focus
          </h2>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
            {MASTER_DIVISIONS.length} Divisions Active
          </span>
        </div>

        {/* Horizontal scrollable pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {MASTER_DIVISIONS.map(div => {
            const DivIcon = div.icon
            const isSelected = selectedDivision === div.id
            return (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivision(div.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 text-xs ${
                  isSelected
                    ? 'bg-[#14C8B4] text-[#0B1220] border-[#14C8B4] font-bold shadow-2xs'
                    : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <DivIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{div.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Master Copilot Interactive Studio Card (Opens Downwards) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6">
        
        {/* Studio Card Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs shrink-0">
              <Bot className="w-5 h-5 text-[#0B1220]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#0B1220] truncate font-[family-name:var(--font-heading)]">
                  {meta.title}
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                  {meta.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>History ({sessions.length})</span>
            </button>
          </div>
        </div>

        {/* History Drawer Popover (when open) */}
        {isHistoryDrawerOpen && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
                Saved Conversations
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
              {sessions.map(s => {
                const isActive = s.id === currentSessionId
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setCurrentSessionId(s.id)
                      setIsHistoryDrawerOpen(false)
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#14C8B4] text-[#0B1220] border-[#14C8B4] font-bold shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="truncate flex-1 mr-2">{s.title || 'New Conversation'}</span>
                    <button
                      type="button"
                      onClick={(e) => deleteSession(e, s.id)}
                      className="p-1 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* EMPTY STATE: Hero Greetings & Quick Query Cards */}
        {(!currentSession || displayMessages.length === 0) && (
          <div className="py-4 space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5 text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 text-[10px] font-mono font-bold shadow-2xs">
                <Bot className="w-3.5 h-3.5 text-[#0B1220]" />
                <span>{meta.badge}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B1220] tracking-tight leading-snug font-[family-name:var(--font-heading)]">
                {meta.heroTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                {meta.heroDescription}
              </p>
            </div>

            {/* Grid of Query Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {meta.queries.map((card, idx) => {
                const CardIcon = card.icon
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(card.prompt)}
                    className="text-left p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-black/30 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer select-none bg-gradient-to-b from-white to-[#F8FAFC] active:scale-[0.98] shadow-2xs min-h-[100px]"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs shrink-0">
                        <CardIcon className="w-4 h-4 text-[#0B1220]" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B1220] group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0B1220] group-hover:text-[#1D4ED8] transition-colors leading-snug">
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

        {/* ACTIVE CONVERSATION: Message Stream */}
        {currentSession && displayMessages.length > 0 && (
          <div 
            ref={messagesContainerRef}
            className="space-y-4 max-h-[500px] overflow-y-auto px-1 py-2"
          >
            {displayMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Bot className="w-4 h-4 text-[#0B1220]" />
                  </div>
                )}

                <div className={`space-y-1 max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="px-4 py-2.5 rounded-2xl rounded-tr-xs bg-[#0B1220] text-white shadow-sm select-text">
                      <p className="text-white text-xs sm:text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-5 rounded-2xl rounded-tl-xs bg-slate-50/70 border border-slate-200 text-slate-900 shadow-2xs leading-relaxed">
                      {renderAiContent(msg.content)}
                    </div>
                  )}

                  <div className="flex items-center gap-3 px-1 text-[10px] font-mono text-slate-400">
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
                  <div className="w-8 h-8 rounded-xl bg-[#0B1220] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs font-extrabold text-xs">
                    {userEmail.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4 animate-pulse text-[#0B1220]" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-[#0B1220] animate-spin shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">
                    Querying live factory database...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prompt Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="relative flex items-center rounded-2xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:border-[#0B1220] focus-within:ring-2 focus-within:ring-[#0B1220]/15 transition-all px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-2xs"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask about ${meta.title.toLowerCase()}, orders, stock, or production...`}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 outline-none font-medium min-w-0 py-1"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white disabled:opacity-35 transition-all cursor-pointer shadow-sm shadow-blue-500/20 flex items-center justify-center shrink-0 ml-2 active:scale-95"
            aria-label="Send query"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

    </div>
  )
}
