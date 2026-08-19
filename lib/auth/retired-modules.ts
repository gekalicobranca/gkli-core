export const RETIRED_MODULE_CODES = [
  'crm',
  'din',
  'fix',
  'flex',
  'gkit-jur',
  'gkit-performa',
  'gkit_jur',
  'gkit_performa',
  'intr',
] as const

const retiredModuleSet = new Set<string>(RETIRED_MODULE_CODES)

function normalizeModuleCode(value: string) {
  return value.replaceAll('_', '-')
}

export function isRetiredModuleCode(value: string) {
  return retiredModuleSet.has(value) || retiredModuleSet.has(normalizeModuleCode(value))
}

export function isRetiredModulePath(pathname: string) {
  return RETIRED_MODULE_CODES.some((code) => {
    const prefix = `/modulos/${normalizeModuleCode(code)}`
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

export function isRetiredApiPath(pathname: string) {
  return RETIRED_MODULE_CODES.some((code) => {
    const normalized = normalizeModuleCode(code)
    const prefix = `/api/${normalized}`
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}
