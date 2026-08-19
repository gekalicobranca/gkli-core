type BrandLogoProps = {
  className?: string
  label?: string
}

/**
 * Marca oficial GKLI usada no painel, menus, login e modulos.
 */
export function BrandLogo({ className = '', label = 'GKLI' }: BrandLogoProps) {
  return (
    <span className={`brand-logo inline-flex shrink-0 items-center justify-center ${className}`} aria-label={label}>
      <img src="/GKLI_ico.png" alt="" aria-hidden="true" loading="eager" decoding="async" />
    </span>
  )
}
