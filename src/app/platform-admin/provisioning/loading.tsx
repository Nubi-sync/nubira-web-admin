import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PlatformAdminPageSkeleton } from '../components/PlatformAdminSkeleton'

export default function ProvisioningLoading() {
  return (
    <PlatformAdminShell>
      <PlatformAdminPageSkeleton variant="provisioning" />
    </PlatformAdminShell>
  )
}
