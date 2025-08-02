import { template_getByTipo, template_getById } from '../DALC/emailTemplates.dalc'

export const renderEmailTemplate = async (
  codigo: string,
  valores: Record<string, string>,
  idTemplate?: number
): Promise<{ asunto: string; cuerpo: string } | null> => {
  const template = idTemplate
    ? await template_getById(idTemplate)
    : await template_getByTipo(codigo);
  if (!template || !template.Activo) {
    return null;
  }
  
  // Usar Titulo como asunto y Cuerpo como cuerpo del mensaje
  let asunto = template.Titulo || 'Sin asunto';
  let cuerpo = template.Cuerpo || '';
  
  // Reemplazar variables en el asunto y cuerpo
  for (const [key, value] of Object.entries(valores)) {
    const regex = new RegExp(`{{\s*${key}\s*}}`, 'g');
    asunto = asunto.replace(regex, value);
    cuerpo = cuerpo.replace(regex, value);
  }
  
  return { asunto, cuerpo };
}
