import { createClient } from '@supabase/supabase-js'
import { readLocalEnv } from './env.mjs'

function summary(result) {
  return result.error
    ? { ok: false, code: result.error.code ?? null, message: result.error.message }
    : { ok: true, count: result.count ?? result.data?.length ?? null, data: result.data ?? null }
}

const env = readLocalEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.log(JSON.stringify({ ok: false, message: 'Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.' }, null, 2))
  process.exitCode = 1
} else {
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const [apps, usuarios, eventos, carteirasRegua] = await Promise.all([
    supabase.schema('core').from('apps').select('codigo,nome,status').in('codigo', ['gkli-regua', 'gkli_regua']),
    supabase.schema('security').from('usuarios').select('id', { count: 'exact', head: true }),
    supabase.schema('audit').from('eventos').select('id', { count: 'exact', head: true }),
    supabase.schema('gkli_regua').from('carteiras').select('id', { count: 'exact', head: true }),
  ])
  const report = {
    ok: !apps.error && !usuarios.error && !eventos.error && !carteirasRegua.error,
    schemas: {
      core_apps: summary(apps),
      security_usuarios: summary(usuarios),
      audit_eventos: summary(eventos),
      gkli_regua_carteiras: summary(carteirasRegua),
    },
  }
  console.log(JSON.stringify(report, null, 2))
  process.exitCode = report.ok ? 0 : 1
}
