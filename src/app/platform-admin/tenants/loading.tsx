import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from '../components/PlatformAdminSkeleton'

export default function TenantsLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="table" />
    </PlatformAdminShell>
  )
}
