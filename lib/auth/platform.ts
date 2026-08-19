import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUsuarioPermissionCodes } from '@/lib/auth/permissions'

export type PlatformUsuario = {
  id: string
  nome: string
  email: string
  tipo: string
  status: string
}

export type PlatformModule = {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  status: string
  href: string
}

const MODULE_PATHS: Record<string, string> = {
  ciclo: '/modulos/ciclo',
  core: '/admin',
  'gkli-ate': '/modulos/gkli-ate',
  'gkli-dir': '/modulos/gkli-dir',
  'gkli-flex': '/modulos/gkli-flex',
  'gkli-new': '/modulos/gkli-new',
  gkli_ate: '/modulos/gkli-ate',
  gkli_dir: '/modulos/gkli-dir',
  gkli_flex: '/modulos/gkli-flex',
  gkli_new: '/modulos/gkli-new',
  'gkit-ate': '/modulos/gkli-ate',
  'gkit-dir': '/modulos/gkli-dir',
  'gkit-flex': '/modulos/gkli-flex',
  'gkit-jur': '/modulos/gkit-jur',
  'gkit-new': '/modulos/gkli-new',
  'gkit-performa': '/modulos/gkit-performa',
  gkit_ate: '/modulos/gkli-ate',
  gkit_dir: '/modulos/gkli-dir',
  gkit_flex: '/modulos/gkli-flex',
  gkit_jur: '/modulos/gkit-jur',
  gkit_new: '/modulos/gkli-new',
  gkit_performa: '/modulos/gkit-performa',
  colab: '/modulos/colab',
  painel: '/modulos/painel',
  sind: '/modulos/sind',
}

function admin() {
  return createSupabaseAdminClient() as any
}

function safeNext(next: string) {
  return next.startsWith('/') && !next.startsWith('//') ? next : '/plataforma'
}

function moduleHref(app: any, codigo: string) {
  const knownPath = MODULE_PATHS[codigo] ?? MODULE_PATHS[String(app.codigo)]
  if (knownPath) return knownPath

  if (typeof app.url_path === 'string' && app.url_path.startsWith('/') && !app.url_path.startsWith('//')) {
    return app.url_path
  }

  return `/modulos/${codigo}`
}

function moduleCode(codigo: unknown) {
  const value = String(codigo)
  if (value === 'gkit_ate' || value === 'gkit-ate' || value === 'gkli_ate' || value === 'gkli-ate') return 'gkli-ate'
  if (value === 'gkit_dir' || value === 'gkit-dir' || value === 'gkli_dir' || value === 'gkli-dir') return 'gkli-dir'
  if (value === 'gkit_flex' || value === 'gkit-flex' || value === 'gkli_flex' || value === 'gkli-flex') return 'gkli-flex'
  if (value === 'gkit_new' || value === 'gkit-new' || value === 'gkli_new' || value === 'gkli-new') return 'gkli-new'
  if (value === 'gkit_jur') return 'gkit-jur'
  if (value === 'gkit_performa') return 'gkit-performa'
  return value
}

function normalizeModule(app: any): PlatformModule {
  const codigo = moduleCode(app.codigo)

  return {
    id: app.id,
    codigo,
    nome: app.nome,
    descricao: app.descricao,
    status: app.status,
    href: moduleHref(app, codigo),
  }
}

function activePlatformModules(data: any[] | null): PlatformModule[] {
  return (data ?? []).map(normalizeModule)
}

async function listActiveModulesFor(usuario: PlatformUsuario, permissions: string[]): Promise<PlatformModule[]> {
  const supabase = admin()

  if (usuario.tipo === 'admin_global' || permissions.includes('*')) {
    const { data, error } = await supabase
      .schema('core')
      .from('apps')
      .select('*')
      .eq('status', 'ativo')
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true })

    if (error) throw new Error(error.message)
    return activePlatformModules(data)
  }

  const { data: accessRows, error: accessError } = await supabase
    .schema('security')
    .from('usuario_app_acessos')
    .select('app_id')
    .eq('usuario_id', usuario.id)
    .eq('ativo', true)

  if (accessError) throw new Error(accessError.message)

  const appIds = [...new Set((accessRows ?? []).map((row: any) => row.app_id))]
  if (!appIds.length) return []

  const { data, error } = await supabase
    .schema('core')
    .from('apps')
    .select('*')
    .in('id', appIds)
    .eq('status', 'ativo')
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true })

  if (error) throw new Error(error.message)
  return activePlatformModules(data)
}

export async function requirePlatformContext(next = '/plataforma'): Promise<{
  authUser: User
  usuario: PlatformUsuario
  permissions: string[]
  modules: PlatformModule[]
}> {
  const target = safeNext(next)
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect(`/login?next=${encodeURIComponent(target)}`)
  }

  const { data: usuario, error } = await admin()
    .schema('security')
    .from('usuarios')
    .select('id, nome, email, tipo, status')
    .eq('id', user.id)
    .single()

  if (error || !usuario || usuario.status !== 'ativo') {
    redirect(`/logout?next=${encodeURIComponent(target)}&error=${encodeURIComponent('Sessão sem acesso ativo.')}`)
  }

  const typedUsuario = usuario as PlatformUsuario
  const permissions = await getUsuarioPermissionCodes(typedUsuario)
  const modules = await listActiveModulesFor(typedUsuario, permissions)

  return {
    authUser: user,
    usuario: typedUsuario,
    permissions,
    modules,
  }
}

export type ModuleSearchParams = Record<string, string | string[] | undefined>

export function moduleTarget(path: string, searchParams?: ModuleSearchParams | null) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) query.append(key, item)
      })
    } else if (value) {
      query.set(key, value)
    }
  }

  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

export async function requireModuleAccess(codigo: string, target = `/modulos/${codigo}`) {
  const context = await requirePlatformContext(target)
  const requestedCode = moduleCode(codigo)

  if (context.usuario.tipo === 'admin_global' || context.permissions.includes('*')) {
    return context
  }

  if (!context.modules.some((modulo: PlatformModule) => modulo.codigo === requestedCode)) {
    redirect('/plataforma')
  }

  return context
}

