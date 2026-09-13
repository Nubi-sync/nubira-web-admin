import { PlatformAdminShell } from './components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from './components/PlatformAdminSkeleton'

export default function PlatformAdminLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="dashboard" />
    </PlatformAdminShell>
  )
}
