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
 * Industrial assembly floor pipeline with progressive multi-station stages and flow transitions.
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
      {/* Assembly Conveyor Pipeline Base */}
      <path d="M2 19h20" />
      {/* Station 1: Inward Store */}
      <rect x="3" y="12" width="4.5" height="7" rx="1" />
      {/* Station 2: High-Speed Cutting & Sewing */}
      <rect x="9.75" y="7" width="4.5" height="12" rx="1" />
      {/* Station 3: Final QC Packing */}
      <rect x="16.5" y="10" width="4.5" height="9" rx="1" />
      {/* Progression Flow Curve Accents */}
      <path d="M5.25 8a2.5 2.5 0 0 1 4.5-1.5" />
      <path d="M12 4a2.5 2.5 0 0 1 4.5 1.5" />
      {/* Arrow Heads */}
      <polyline points="9.5 5 10.5 6.5 8.5 7.5" />
      <polyline points="16.5 4.5 17.2 6.5 15.2 7" />
    </svg>
  )
}

/**
 * 11. StrictDataPrivacyIcon
 * Fortified enterprise security shield with a cryptographic vault padlock.
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
      {/* Fortress Security Shield */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {/* Secure Vault Padlock */}
      <path d="M9 10.5V8.5a3 3 0 0 1 6 0v2" />
      <rect x="8" y="10.5" width="8" height="6.5" rx="1.5" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" />
      <line x1="12" y1="14.5" x2="12" y2="15.5" />
    </svg>
  )
}

/**
 * 12. OfflineFirstSyncIcon
 * Edge device cloud caching with continuous dual circular synchronization loop.
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
      {/* Cloud Store Envelope */}
      <path d="M17.5 19H6.5A4.5 4.5 0 0 1 4 11.5a5.5 5.5 0 0 1 10.5-2.5 4.5 4.5 0 0 1 5 4 3.5 3.5 0 0 1-2 6z" />
      {/* Upper Sync Arrow */}
      <path d="M9.5 13a2.5 2.5 0 0 1 4.5-.8" />
      <polyline points="14.5 9.8 15 12.2 12.5 12" />
      {/* Lower Sync Arrow */}
      <path d="M14.5 15.5a2.5 2.5 0 0 1-4.5.8" />
      <polyline points="9.5 18.2 9 15.8 11.5 16" />
    </svg>
  )
}

/**
 * 13. ZeroGhostPiecesIcon
 * 100% Zero Ghost Piece Guarantee with QR bundle ticket and verified alignment crosshairs.
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
      {/* Precision 100% Target Reconciliation Brackets */}
      <path d="M3 8V5a2 2 0 0 1 2-2h3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      {/* Cut Bundle QR Ticket */}
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      {/* 100% Zero Discrepancy Checkmark */}
      <polyline points="9.5 12 11.2 13.7 14.5 10.3" strokeWidth={2} />
    </svg>
  )
}

/* ========================================================================= */
/* GROUP 3: CORE MODULAR ENGINES (6 ICONS)                                   */
/* ========================================================================= */

/**
 * 14. FabricInwardTrimsStoreIcon
 * Supplier gate delivery truck carrying inward fabric rolls with barcode reception signal.
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
      {/* Logistics Delivery Truck */}
      <path d="M1 5h10v11H1z" />
      <path d="M11 8h4.5l3 3.5V16H11" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="16" cy="18" r="2" />
      <line x1="7" y1="18" x2="14" y2="18" />
      {/* Loaded Fabric Rolls in Truck Bed */}
      <ellipse cx="6" cy="8.5" rx="2.5" ry="1.2" />
      <ellipse cx="6" cy="12" rx="2.5" ry="1.2" />
      {/* Gate Inward Signal */}
      <path d="M19 6l2-2" />
      <path d="M21 8.5h2" />
    </svg>
  )
}

/**
 * 15. BuyerOrdersTechPacksIcon
 * Technical garment tech pack spec document with buyer PO size ratio matrix table.
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
      {/* Tech Pack Specification Document */}
      <path d="M5 3h10l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <polyline points="15 3 15 8 20 8" />
      {/* Garment Header Spec Notch */}
      <line x1="7.5" y1="7" x2="11.5" y2="7" />
      {/* PO Matrix Grid Table */}
      <rect x="7" y="11" width="10" height="8" rx="0.8" />
      <line x1="12" y1="11" x2="12" y2="19" />
      <line x1="7" y1="15" x2="17" y2="15" />
    </svg>
  )
}

/**
 * 16. CuttingRoomLayMatrixIcon
 * Industrial tailor cutting shears slicing multi-ply fabric lay matrix along marker line.
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
      {/* Precision Tailor Shears cutting Fabric Lay Matrix */}
      <circle cx="6" cy="6.5" r="2.5" />
      <circle cx="6" cy="13.5" r="2.5" />
      <path d="M8.2 7.8L19 15.5" />
      <path d="M8.2 12.2L19 4.5" />
      <circle cx="11.5" cy="10" r="0.9" fill="currentColor" />
      {/* Multi-Ply Fabric Spread Below */}
      <path d="M3 18.5h18" />
      <path d="M3 21h18" />
      {/* Laser Alignment Guide */}
      <line x1="19.5" y1="10" x2="22" y2="10" strokeDasharray="1 1" />
    </svg>
  )
}

/**
 * 17. StitchingLinesWagesIcon
 * Industrial sewing machine with thread spool, needle bar, and dynamic stitch line for piece-rate wages.
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
      {/* Industrial Sewing Machine Frame */}
      <path d="M3 18h18v-2.5h-3.5V8a2.5 2.5 0 0 0-2.5-2.5H7.5A3.5 3.5 0 0 0 4 9v6.5H3V18z" />
      {/* Needle Bar & Foot */}
      <line x1="7.5" y1="9" x2="7.5" y2="15" />
      <path d="M6.5 15h2" />
      {/* Spool of Thread on Top */}
      <rect x="12.5" y="3.5" width="2.5" height="2" rx="0.5" />
      <path d="M13.7 3.5V2.5H7.5v3" />
      {/* Stitch Dash line on the bed */}
      <line x1="9.5" y1="15.5" x2="14.5" y2="15.5" strokeDasharray="1.2 1.2" strokeWidth={2} />
    </svg>
  )
}

/**
 * 18. QualityChecksAlterationIcon
 * Quality assurance inspection clipboard with garment seam magnifying audit lens and QA PASS stamp.
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
      {/* Quality Inspection Clipboard */}
      <rect x="4" y="4" width="16" height="17" rx="2" />
      <path d="M8.5 4V2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5V4" />
      {/* Magnifier Seam Inspection Lens */}
      <circle cx="11" cy="12" r="3.5" />
      <line x1="13.5" y1="14.5" x2="17.5" y2="18.5" strokeWidth={2} />
      {/* QA Passed Checkmark */}
      <polyline points="9.3 12 10.7 13.4 12.8 10.6" strokeWidth={1.8} />
    </svg>
  )
}

/**
 * 19. CartonPackingDispatchIcon
 * Heavy-duty 3D export shipping carton with strapping tape, barcode label, and outbound motion streaks.
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
      {/* 3D Master Export Carton Box */}
      <path d="M12 2.5L20 7l-8 4.5L4 7z" />
      <path d="M4 7v10l8 4.5V11.5z" />
      <path d="M20 7v10l-8 4.5V11.5z" />
      {/* Sealing Tape Spine */}
      <path d="M12 2.5v9" />
      {/* Shipping Barcode Label on front face */}
      <line x1="14.5" y1="13" x2="17.5" y2="14.7" />
      <line x1="14.5" y1="15" x2="17.5" y2="16.7" />
      {/* Fast Dispatch motion streaks */}
      <line x1="1" y1="10" x2="2.5" y2="10" />
      <line x1="0.5" y1="13" x2="2" y2="13" />
    </svg>
  )
}
