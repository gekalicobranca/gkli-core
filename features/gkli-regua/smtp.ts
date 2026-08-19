import crypto from 'node:crypto'
import net from 'node:net'
import tls from 'node:tls'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type SmtpConfig = {
  host: string; port: number; user?: string; pass?: string; from: string; replyTo?: string
  secure: boolean; starttls: boolean; ehloDomain: string
}

export type SmtpStatus = {
  source: 'carteira' | 'global' | 'environment' | 'missing'
  carteiraId: string | null; configured: boolean; active: boolean; host: string | null; port: number
  user: string | null; from: string | null; replyTo: string | null; secure: boolean; starttls: boolean
  ehloDomain: string; hasPassword: boolean; updatedAt: string | null; unavailableReason?: string
}

function admin() { return createSupabaseAdminClient() as any }
function key() {
  const source = process.env.GKLI_REGUA_SMTP_ENCRYPTION_KEY
  if (!source) throw new Error('GKLI_REGUA_SMTP_ENCRYPTION_KEY não configurada no servidor.')
  return crypto.createHash('sha256').update(source).digest()
}
export function encryptSmtpPassword(value: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.')
}
function decryptSmtpPassword(value?: string | null) {
  if (!value) return undefined
  const [iv, tag, encrypted] = value.split('.')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8')
}

function environmentStatus(reason?: string): SmtpStatus {
  const host = process.env.SMTP_HOST ?? null
  const user = process.env.SMTP_USER ?? null
  const from = process.env.SMTP_FROM || user
  const port = Number(process.env.SMTP_PORT ?? 587)
  return {
    source: host && from ? 'environment' : 'missing', carteiraId: null, configured: Boolean(host && from), active: Boolean(host && from),
    host, port: Number.isFinite(port) ? port : 587, user, from, replyTo: process.env.SMTP_REPLY_TO ?? null,
    secure: String(process.env.SMTP_SECURE ?? '').toLowerCase() === 'true' || port === 465,
    starttls: String(process.env.SMTP_STARTTLS ?? 'true').toLowerCase() !== 'false', ehloDomain: process.env.SMTP_EHLO_DOMAIN || 'gekali.com.br',
    hasPassword: Boolean(process.env.SMTP_PASS), updatedAt: null, unavailableReason: reason,
  }
}

function statusFromRow(row: any, source: 'carteira' | 'global'): SmtpStatus {
  return {
    source, carteiraId: row.carteira_id ?? null, configured: Boolean(row.host && row.remetente), active: Boolean(row.ativo),
    host: row.host, port: Number(row.porta ?? 587), user: row.usuario, from: row.remetente, replyTo: row.reply_to,
    secure: Boolean(row.secure), starttls: !row.secure && row.starttls !== false, ehloDomain: row.ehlo_domain || 'gekali.com.br',
    hasPassword: Boolean(row.senha_encriptada), updatedAt: row.atualizado_em,
  }
}

async function row(carteiraId?: string | null, activeOnly = false) {
  const db = admin().schema('gkli_regua')
  if (carteiraId) {
    let query = db.from('smtp_configuracoes').select('*').eq('carteira_id', carteiraId)
    if (activeOnly) query = query.eq('ativo', true)
    const scoped = await query.maybeSingle()
    if (!scoped.error && scoped.data) return { data: scoped.data, source: 'carteira' as const }
  }
  let query = db.from('smtp_configuracoes').select('*').is('carteira_id', null)
  if (activeOnly) query = query.eq('ativo', true)
  const global = await query.maybeSingle()
  if (!global.error && global.data) return { data: global.data, source: 'global' as const }
  return { data: null, source: 'global' as const, error: global.error }
}

export async function getSmtpStatus(carteiraId?: string | null): Promise<SmtpStatus> {
  try {
    const result = await row(carteiraId)
    return result.data ? statusFromRow(result.data, result.source) : environmentStatus(result.error?.message)
  } catch (error) {
    return environmentStatus(error instanceof Error ? error.message : 'Configuração SMTP indisponível.')
  }
}

async function config(carteiraId?: string | null): Promise<SmtpConfig> {
  const result = await row(carteiraId, true)
  if (result.data) return {
    host: result.data.host, port: Number(result.data.porta), user: result.data.usuario || undefined,
    pass: decryptSmtpPassword(result.data.senha_encriptada), from: result.data.remetente, replyTo: result.data.reply_to || undefined,
    secure: Boolean(result.data.secure), starttls: !result.data.secure && result.data.starttls !== false, ehloDomain: result.data.ehlo_domain || 'gekali.com.br',
  }
  const env = environmentStatus()
  if (!env.configured || !env.host || !env.from) throw new Error('Nenhuma configuração SMTP ativa foi encontrada.')
  return { host: env.host, port: env.port, user: env.user || undefined, pass: process.env.SMTP_PASS, from: env.from, replyTo: env.replyTo || undefined, secure: env.secure, starttls: env.starttls, ehloDomain: env.ehloDomain }
}

function response(socket: net.Socket | tls.TLSSocket) {
  return new Promise<string>((resolve, reject) => {
    let buffer = ''
    const done = () => { socket.off('data', data); socket.off('error', fail) }
    const fail = (error: Error) => { done(); reject(error) }
    const data = (chunk: Buffer) => {
      buffer += chunk.toString('utf8')
      const last = buffer.split(/\r?\n/).filter(Boolean).at(-1)
      if (last && /^\d{3}\s/.test(last)) { done(); resolve(buffer) }
    }
    socket.on('data', data); socket.on('error', fail)
  })
}
async function command(socket: net.Socket | tls.TLSSocket, value: string, expected: number[], label = value.split(' ')[0]) {
  socket.write(`${value}\r\n`)
  const answer = await response(socket)
  if (!expected.includes(Number(answer.slice(0, 3)))) {
    if (answer.includes('5.7.139')) throw new Error('SMTP AUTH está desativado no Microsoft 365 para esta caixa ou tenant.')
    throw new Error(`SMTP recusou ${label}: ${answer.trim()}`)
  }
}
function socket(config: SmtpConfig) {
  return new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
    const client = config.secure ? tls.connect(config.port, config.host, { servername: config.host }, () => resolve(client)) : net.connect(config.port, config.host, () => resolve(client))
    client.once('error', reject)
  })
}
function upgrade(client: net.Socket, config: SmtpConfig) {
  return new Promise<tls.TLSSocket>((resolve, reject) => {
    const secure = tls.connect({ socket: client, servername: config.host }, () => resolve(secure)); secure.once('error', reject)
  })
}
function safe(value: string) { return value.replace(/[\r\n<>]/g, '').trim() }

export async function sendSmtpEmail(payload: { to: string; subject: string; text: string; html?: string }, carteiraId?: string | null) {
  const smtp = await config(carteiraId)
  const to = safe(payload.to); const from = safe(smtp.from)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('Destinatário inválido.')
  let client = await socket(smtp)
  try {
    await response(client); await command(client, `EHLO ${smtp.ehloDomain}`, [250])
    if (!smtp.secure && smtp.starttls) { await command(client, 'STARTTLS', [220]); client = await upgrade(client as net.Socket, smtp); await command(client, `EHLO ${smtp.ehloDomain}`, [250]) }
    if (smtp.user && smtp.pass) { await command(client, 'AUTH LOGIN', [334]); await command(client, Buffer.from(smtp.user).toString('base64'), [334], 'AUTH LOGIN'); await command(client, Buffer.from(smtp.pass).toString('base64'), [235], 'AUTH LOGIN') }
    await command(client, `MAIL FROM:<${from}>`, [250]); await command(client, `RCPT TO:<${to}>`, [250, 251]); await command(client, 'DATA', [354])
    const body = (payload.html || payload.text).replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..')
    const headers = [`From: ${from}`, `To: ${to}`, `Subject: =?UTF-8?B?${Buffer.from(payload.subject).toString('base64')}?=`, smtp.replyTo ? `Reply-To: ${safe(smtp.replyTo)}` : null, 'MIME-Version: 1.0', `Content-Type: ${payload.html ? 'text/html' : 'text/plain'}; charset=UTF-8`, 'Content-Transfer-Encoding: 8bit', '', body, '.'].filter((item) => item !== null).join('\r\n')
    await command(client, headers, [250]); await command(client, 'QUIT', [221])
  } finally { client.destroy() }
}
