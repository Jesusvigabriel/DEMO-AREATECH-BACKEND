import { template_getByTipo, template_getById } from '../DALC/emailTemplates.dalc'

export const renderEmailTemplate = async (
  codigo: string,
  valores: Record<string, string>,
  idTemplate?: number
): Promise<{ asunto: string; cuerpo: string } | null> => {
  console.log('[EmailTemplate] Código', codigo, 'idTemplate', idTemplate);
  const template = idTemplate
    ? await template_getById(idTemplate)
    : await template_getByTipo(codigo);
  if (!template || !template.Activo) {
    return null;
  }

  console.log('[EmailTemplate] Título original', template.Titulo);
  console.log('[EmailTemplate] Variables', valores);
  
  // Usar Titulo como asunto y Cuerpo como cuerpo del mensaje
  let asunto = template.Titulo || 'Sin asunto';
  let cuerpo = template.Cuerpo || '';
  
  // Reemplazar variables en el asunto y cuerpo
  for (const [key, value] of Object.entries(valores)) {
    const regex = new RegExp(`{{\s*${key}\s*}}`, 'g');
    asunto = asunto.replace(regex, value);
    cuerpo = cuerpo.replace(regex, value);
  }

  console.log('[EmailTemplate] Asunto final', asunto);
  console.log('[EmailTemplate] Cuerpo preview', cuerpo.slice(0, 100));

  return { asunto, cuerpo };
}
