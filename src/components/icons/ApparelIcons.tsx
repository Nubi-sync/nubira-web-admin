import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  strokeWidth?: number | string
}

/* ========================================================================= */
/* GROUP 1: TOP NAVIGATION TABS (9 ICONS)                                   */
/* ========================================================================= */

/**
 * 1. DashboardNavIcon
 * Dedicated Factory Operations Executive Dashboard with live KPI dial gauge & production metric bars.
 */
export function DashboardNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Dashboard Console Frame */}
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      {/* Upper Analytics Dial Gauge */}
      <path d="M7 12a5 5 0 0 1 10 0" />
      <line x1="12" y1="12" x2="14.5" y2="9.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      {/* KPI Performance Bar Charts */}
      <line x1="6.5" y1="16.5" x2="9.5" y2="16.5" />
      <line x1="11.5" y1="16.5" x2="14.5" y2="16.5" />
      <line x1="16.5" y1="16.5" x2="17.5" y2="16.5" />
    </svg>
  )
}

/**
 * 2. AllModulesNavIcon
 * Connected 4-division workstation nexus representing the 11 integrated MES modules.
 */
export function AllModulesNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* 4 Division Node Tiles */}
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      {/* Interconnecting sync conduits */}
      <line x1="10" y1="6.5" x2="14" y2="6.5" />
      <line x1="6.5" y1="10" x2="6.5" y2="14" />
      <line x1="17.5" y1="10" x2="17.5" y2="14" />
      <line x1="10" y1="17.5" x2="14" y2="17.5" />
      {/* Center integration core */}
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}

/**
 * 3. BuyersVendorsNavIcon
 * B2B commercial trade & mill partnership handshake linking buyer towers and vendor supply.
 */
export function BuyersVendorsNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Buyer Enterprise Tower */}
      <path d="M3 21V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
      {/* Vendor Supply Tower */}
      <path d="M13 21V11a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10" />
      {/* Ground baseline */}
      <line x1="2" y1="21" x2="22" y2="21" />
      {/* Windows on Buyer tower */}
      <line x1="6" y1="9" x2="8" y2="9" />
      <line x1="6" y1="13" x2="8" y2="13" />
      <line x1="6" y1="17" x2="8" y2="17" />
      {/* Windows on Vendor tower */}
      <line x1="16" y1="13" x2="18" y2="13" />
      <line x1="16" y1="17" x2="18" y2="17" />
      {/* Commercial handshake node connecting both */}
      <path d="M11 11h2" strokeWidth={2} />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}

/**
 * 4. SupervisorWorkersNavIcon
 * Floor Supervisor with safety headgear alongside skilled line operators.
 */
export function SupervisorWorkersNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Floor Supervisor Head & Safety Cap */}
      <circle cx="12" cy="7" r="3" />
      <path d="M9 5.5h6" />
      <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      {/* Left operator silhouette */}
      <path d="M4.5 10.5a2.2 2.2 0 0 1 2-2" />
      <path d="M2 19a4.5 4.5 0 0 1 3.5-4.2" />
      {/* Right operator silhouette */}
      <path d="M17.5 8.5a2.2 2.2 0 0 1 2 2" />
      <path d="M18.5 14.8A4.5 4.5 0 0 1 22 19" />
      {/* Floor Supervisor Badge Pin */}
      <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

/**
 * 5. AllDesignsNavIcon
 * Garment Fashion Tech Pack & CAD Pattern Spec Sheet.
 */
export function AllDesignsNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Garment Silhouette with Collar */}
      <path d="M9 3.5h6l1 2.5H8L9 3.5z" />
      <path d="M8 6L3.5 8.5l1.8 3.8 2.7-1.3V20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-9l2.7 1.3 1.8-3.8L16 6" />
      {/* Tech pack CAD specification pocket */}
      <rect x="13" y="10.5" width="3" height="3" rx="0.5" />
      {/* Center alignment seam */}
      <line x1="12" y1="6" x2="12" y2="9.5" />
      <line x1="9.5" y1="14" x2="11.5" y2="14" strokeDasharray="1 1" />
    </svg>
  )
}

/**
 * 6. FabricStoreNavIcon
 * Textile Fabric Roll unrolling onto the central godown storage rack with roll spindle core.
 */
export function FabricStoreNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Fabric Roll Cylinder End */}
      <ellipse cx="7" cy="7.5" rx="3.5" ry="2.2" />
      <circle cx="7" cy="7.5" r="1" fill="currentColor" />
      {/* Roll body running across */}
      <path d="M7 5.3h10.5a3.5 2.2 0 0 1 3.5 2.2v6a3.5 2.2 0 0 1-3.5 2.2H7" />
      {/* Unrolling fabric layer */}
      <path d="M7 9.7v6.8c0 1.2 1.6 2.2 3.5 2.2h8c1.5 0 2.8-.8 3-1.8" />
      {/* Weft & warp measurement marks */}
      <line x1="11" y1="12" x2="11" y2="15" />
      <line x1="14" y1="12" x2="14" y2="15" />
      <line x1="17" y1="12" x2="17" y2="15" />
    </svg>
  )
}

/**
 * 7. ZigzaAiNavIcon
 * Industrial AI neural core with sparkle synapse and hexagonal intelligence processor.
 */
export function ZigzaAiNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Hexagonal Neural Intelligence Enclosure */}
      <polygon points="12,2.5 19.5,6.8 19.5,17.2 12,21.5 4.5,17.2 4.5,6.8" />
      {/* Central Sparkle Intellect Diamond */}
      <path d="M12 7l1.3 3.7L17 12l-3.7 1.3L12 17l-1.3-3.7L7 12l3.7-1.3z" fill="currentColor" fillOpacity="0.18" />
      {/* Core Neural Synapse */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      {/* Connection Bus Nodes */}
      <circle cx="12" cy="2.5" r="0.8" fill="currentColor" />
      <circle cx="19.5" cy="6.8" r="0.8" fill="currentColor" />
      <circle cx="19.5" cy="17.2" r="0.8" fill="currentColor" />
      <circle cx="12" cy="21.5" r="0.8" fill="currentColor" />
      <circle cx="4.5" cy="17.2" r="0.8" fill="currentColor" />
      <circle cx="4.5" cy="6.8" r="0.8" fill="currentColor" />
    </svg>
  )
}

/**
 * 8. ReportsNavIcon
 * Factory MIS Production Report with bar analytics chart and upward performance trajectory.
 */
export function ReportsNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* MIS Report Document */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {/* Production Analytics Bar Chart */}
      <line x1="8" y1="18" x2="8" y2="15" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="16" y1="18" x2="16" y2="10" />
      {/* Trend trajectory vector */}
      <polyline points="7.5 13.5 11 11 13.5 12.5 17 8.5" />
      <polyline points="15 8.5 17 8.5 17 10.5" />
    </svg>
  )
}

/**
 * 9. CompanyProfileNavIcon
 * Corporate Enterprise Manufacturing Unit ID Badge & Registered Organization Entity.
 */
export function CompanyProfileNavIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Corporate Badge Frame */}
      <rect x="4" y="3" width="16" height="18" rx="3" />
      {/* Badge Clip Slot */}
      <path d="M9.5 3V1.8a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 .8.8V3" />
      {/* Executive Silhouette */}
      <circle cx="12" cy="9" r="2.5" />
      <path d="M7.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      {/* Enterprise Organization Bar */}
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  )
}

/* ========================================================================= */
/* GROUP 2: TRUST PILLARS (4 ICONS)                                         */
/* ========================================================================= */

/**
 * 10. FloorReadyWorkflowsIcon
 * Clean 3-step connected workflow process flowchart.
 */
export function FloorReadyWorkflowsIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="3" width="6" height="6" rx="1.5" />
      <rect x="9" y="15" width="6" height="6" rx="1.5" />
      <path d="M9 6h6" />
      <path d="M18 9v3a2 2 0 0 1-2 2h-1" />
      <path d="M6 9v3a2 2 0 0 0 2 2h1" />
    </svg>
  )
}

/**
 * 11. StrictDataPrivacyIcon
 * Enterprise security shield with a clean vault lock.
 */
export function StrictDataPrivacyIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="11" width="6" height="5" rx="1" />
      <path d="M10 11V9a2 2 0 1 1 4 0v2" />
    </svg>
  )
}

/**
 * 12. OfflineFirstSyncIcon
 * Edge continuous dual-arrow synchronization cycle.
 */
export function OfflineFirstSyncIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

/**
 * 13. ZeroGhostPiecesIcon
 * 100% verified discrepancy-free check badge.
 */
export function ZeroGhostPiecesIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="8.5 12 11 14.5 15.5 9.5" />
    </svg>
  )
}

/* ========================================================================= */
/* GROUP 3: CORE MODULAR ENGINES (6 ICONS)                                   */
/* ========================================================================= */

/**
 * 14. FabricInwardTrimsStoreIcon
 * Clean logistics delivery truck for gate roll and trims inwarding.
 */
export function FabricInwardTrimsStoreIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-4v10" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

/**
 * 15. BuyerOrdersTechPacksIcon
 * Clean technical garment spec sheet and purchase order document.
 */
export function BuyerOrdersTechPacksIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

/**
 * 16. CuttingRoomLayMatrixIcon
 * Clean precision tailor cutting shears.
 */
export function CuttingRoomLayMatrixIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

/**
 * 17. StitchingLinesWagesIcon
 * Clean industrial sewing machine for piece-rate stitching lines.
 */
export function StitchingLinesWagesIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 19h18" />
      <path d="M19 19V8a2 2 0 0 0-2-2H8a3 3 0 0 0-3 3v10" />
      <line x1="9" y1="9" x2="9" y2="14" />
      <line x1="7" y1="14" x2="11" y2="14" />
      <circle cx="15" cy="10" r="1.5" />
    </svg>
  )
}

/**
 * 18. QualityChecksAlterationIcon
 * Clean quality audit inspection clipboard with verified checkmark.
 */
export function QualityChecksAlterationIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <polyline points="9 14 11 16 15 11" />
    </svg>
  )
}

/**
 * 19. CartonPackingDispatchIcon
 * Clean 3D master shipping carton box.
 */
export function CartonPackingDispatchIcon({ className = "w-5 h-5", strokeWidth = 1.75, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
