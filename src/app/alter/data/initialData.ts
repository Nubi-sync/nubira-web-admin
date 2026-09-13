import {
  AlterationTicket,
  RepairStation,
  SpotCleaningLog,
  ScrapRequisition,
  AlterationMetrics
} from '../types/alter'

export const INITIAL_METRICS: AlterationMetrics = {
  activeInQueueCount: 0,
  repairedAndClearedToday: 0,
  topRecurringDefect: 'None',
  recoveryClearanceRatePct: 0,
  scrapCountToday: 0
}

export const INITIAL_TICKETS: AlterationTicket[] = []

export const INITIAL_STATIONS: RepairStation[] = [
  {
    id: 'stn-01',
    stationCode: 'STN-MEND-01',
    stationName: 'Mending Station 01 (Collar & Neckband)',
    menderName: 'Master Seamstress',
    equipmentType: 'Juki DDL-9000C Direct-Drive Lockstitch',
    activeTicketsCount: 0,
    repairedTodayCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'stn-02',
    stationCode: 'STN-MEND-02',
    stationName: 'Mending Station 02 (Flatlock & Overlock Seams)',
    menderName: 'Senior Tailor',
    equipmentType: 'Pegasus W500PV Cylinder Bed Interlock',
    activeTicketsCount: 0,
    repairedTodayCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'stn-03',
    stationCode: 'STN-MEND-03',
    stationName: 'Mending Station 03 (Labels, Welts & Bartack)',
    menderName: 'Trim Specialist',
    equipmentType: 'Brother KE-430HX Electronic Direct Drive Bartack',
    activeTicketsCount: 0,
    repairedTodayCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'stn-04',
    stationCode: 'STN-MEND-04',
    stationName: 'Mending Station 04 (Component & Panel Replacement)',
    menderName: 'Pattern Mender',
    equipmentType: 'Juki LH-3568A 2-Needle Semi-Dry Lockstitch',
    activeTicketsCount: 0,
    repairedTodayCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'stn-05',
    stationCode: 'STN-MEND-05',
    stationName: 'Spot Cleaning Gun 05 (Oil & Grease Dissolver)',
    menderName: 'Spotting Specialist',
    equipmentType: 'Trevil Texi Vacuum Spotting Table & Spray Gun',
    activeTicketsCount: 0,
    repairedTodayCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'stn-06',
    stationCode: 'STN-MEND-06',
    stationName: 'Spot Cleaning Gun 06 (Water & Dye Stain Desk)',
    menderName: 'Spotting Tech',
    equipmentType: 'Trevil Texi Vacuum Spotting Table & Cold Gun',
    activeTicketsCount: 0,
    repairedTodayCount: 0,
    status: 'ACTIVE'
  }
]

export const INITIAL_SPOTTING_LOGS: SpotCleaningLog[] = []

export const INITIAL_SCRAP_REQUISITIONS: ScrapRequisition[] = []
