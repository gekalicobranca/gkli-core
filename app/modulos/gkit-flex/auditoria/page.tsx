import { requireModuleAccess } from '@/lib/auth/platform'
import { AuditPage } from '@/features/gkit-flex/auditoria/AuditPage'
import { AppFrame } from '@/features/gkit-flex/ui/AppFrame'

export default async function GkitFlexAuditoriaPage() {
  const context = await requireModuleAccess('gkli-flex', '/modulos/gkli-flex/auditoria')

  return (
    <AppFrame usuario={context.usuario}>
      <AuditPage />
    </AppFrame>
  )
}

