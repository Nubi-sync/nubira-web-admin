import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from '../components/PlatformAdminSkeleton'

export default function InfrastructureLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="telemetry" />
    </PlatformAdminShell>
  )
}
