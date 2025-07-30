import { template_getByTipo } from '../DALC/emailTemplates.dalc'

export const renderEmailTemplate = async (
  codigo: string,
  valores: Record<string, string>
): Promise<{ asunto: string; cuerpo: string } | null> => {
  const template = await template_getByTipo(codigo)
  if (!template || !template.Activo) {
    return null
  }
  let asunto = template.Asunto
  let cuerpo = template.CuerpoHtml
  for (const [k, v] of Object.entries(valores)) {
    const regex = new RegExp(`{{\s*${k}\s*}}`, 'g')
    asunto = asunto.replace(regex, v)
    cuerpo = cuerpo.replace(regex, v)
  }
  return { asunto, cuerpo }
}
