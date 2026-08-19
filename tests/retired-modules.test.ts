import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isRetiredApiPath,
  isRetiredModuleCode,
  isRetiredModulePath,
  RETIRED_MODULE_CODES,
} from '@/lib/auth/retired-modules'

test('retired module codes include removed legacy and skipped modules', () => {
  assert.deepEqual([...RETIRED_MODULE_CODES].sort(), [
    'crm',
    'din',
    'fix',
    'flex',
    'gkit-jur',
    'gkit-performa',
    'gkit_jur',
    'gkit_performa',
    'intr',
  ])
})

test('retired module paths are detected for root and nested module routes', () => {
  assert.equal(isRetiredModulePath('/modulos/crm'), true)
  assert.equal(isRetiredModulePath('/modulos/flex/financeiro'), true)
  assert.equal(isRetiredModulePath('/modulos/intr/pagamentos/novo'), true)
  assert.equal(isRetiredModulePath('/modulos/gkit-jur'), true)
  assert.equal(isRetiredModulePath('/modulos/gkit-jur/processos'), true)
  assert.equal(isRetiredModulePath('/modulos/gkit-performa/auditoria'), true)
})

test('retired api paths return module deactivation status', () => {
  assert.equal(isRetiredApiPath('/api/gkit-jur/sincronizacao/cron'), true)
  assert.equal(isRetiredApiPath('/api/gkit-performa/rankings'), true)
  assert.equal(isRetiredApiPath('/api/gkit-flex/dashboard/resumo'), false)
})

test('active canonical module paths are not treated as retired', () => {
  assert.equal(isRetiredModuleCode('gkit_flex'), false)
  assert.equal(isRetiredModulePath('/modulos/gkli-flex'), false)
  assert.equal(isRetiredModulePath('/modulos/gkli-new/oportunidades'), false)
  assert.equal(isRetiredModulePath('/modulos/ciclo/clientes'), false)
})

