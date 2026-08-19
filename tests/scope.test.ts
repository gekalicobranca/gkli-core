import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'
import { resolve } from 'node:path'

test('o repositório mantém somente Core e Régua como superfícies de produto', () => {
  assert.equal(existsSync(resolve('app/admin')), true)
  assert.equal(existsSync(resolve('app/modulos/gkli-regua')), true)

  for (const retired of ['ciclo', 'colab', 'gkit-ate', 'gkit-dir', 'gkit-flex', 'gkit-new', 'gkit-performa', 'gkit-jur']) {
    assert.equal(existsSync(resolve('app/modulos', retired)), false, `${retired} não deve existir`)
  }
})
