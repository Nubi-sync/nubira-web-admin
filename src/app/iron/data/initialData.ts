import {
  IronTable,
  IronProductionLog,
  BoilerTelemetryLog,
  FinishQcAudit,
  PackingHandover,
} from '../types/iron'

export const INITIAL_TABLES: IronTable[] = Array.from({ length: 12 }, (_, idx) => ({
  id: `tbl-${String(idx + 1).padStart(2, '0')}`,
  tableNumber: `Table ${String(idx + 1).padStart(2, '0')}`,
  operatorName: 'Unassigned',
  challanId: 'IDLE',
  articleName: 'Ready for lot assignment',
  targetHourlyPcs: 60,
  pieceRate: 2.20,
  currentPiecesPressed: 0,
  status: 'IDLE',
  ironTempC: 25,
  vacuumActive: false,
  teflonShoeVerified: true,
  shiftStartTime: '08:00',
}))

export const INITIAL_PRODUCTION_LOGS: IronProductionLog[] = []
export const INITIAL_BOILER_LOGS: BoilerTelemetryLog[] = []
export const INITIAL_QC_AUDITS: FinishQcAudit[] = []
export const INITIAL_HANDOVERS: PackingHandover[] = []
