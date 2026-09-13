import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from '../components/PlatformAdminSkeleton'

export default function ModulesLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="modules" />
    </PlatformAdminShell>
  )
}
