import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from '../components/PlatformAdminSkeleton'

export default function CustomRequestsLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="cards" />
    </PlatformAdminShell>
  )
}
