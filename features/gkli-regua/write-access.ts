import { canAccess } from '@/lib/auth/permissions'
import { requireModuleAccess } from '@/lib/auth/platform'

export async function requireWriteRegua(target = '/modulos/gkli-regua') {
  const context = await requireModuleAccess('gkli-regua', target)
  if (!canAccess(context.permissions, 'gkli_regua.write')) throw new Error('Você não tem permissão para operar o GKLI Régua.')
  return context
}
