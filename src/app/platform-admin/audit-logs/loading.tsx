import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from '../components/PlatformAdminSkeleton'

export default function AuditLogsLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="table" />
    </PlatformAdminShell>
  )
}
