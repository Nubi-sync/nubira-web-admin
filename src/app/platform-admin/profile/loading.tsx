import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from '../components/PlatformAdminSkeleton'

export default function ProfileLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="profile" />
    </PlatformAdminShell>
  )
}
