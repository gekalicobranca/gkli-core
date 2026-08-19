import { requireModuleAccess } from '@/lib/auth/platform';
import { SaneamentoPage } from '@/features/gkit-flex/saneamento/SaneamentoPage';
import { AppFrame } from '@/features/gkit-flex/ui/AppFrame';

export default async function GkitFlexSaneamentoPage() {
  const context = await requireModuleAccess('gkli-flex', '/modulos/gkli-flex/saneamento');

  return (
    <AppFrame usuario={context.usuario}>
      <SaneamentoPage />
    </AppFrame>
  );
}

