import { AdminShell } from '@/components/layout/AdminShell'
import { IronPageSkeleton } from '../components/IronSkeleton'

export default function IronBoilerTelemetryLoading() {
  return (
    <AdminShell>
      <IronPageSkeleton variant="boiler-telemetry" />
    </AdminShell>
  )
}
