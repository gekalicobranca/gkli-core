import { canAccess } from '@/lib/auth/permissions'
import { ReguaPage, ReguaShell } from '@/features/gkli-regua/components'
import { getReguaData, requireReguaContext } from '@/features/gkli-regua/queries'

export default async function GkliReguaRoute() {
  const context = await requireReguaContext()
  const data = await getReguaData()
  return <ReguaShell usuario={context.usuario}><ReguaPage data={data} canWrite={canAccess(context.permissions, 'gkli_regua.write')} /></ReguaShell>
}
