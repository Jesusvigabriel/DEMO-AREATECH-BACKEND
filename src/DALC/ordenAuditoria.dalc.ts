import { getRepository } from "typeorm"
import { OrdenAuditoria } from "../entities/OrdenAuditoria"

export const ordenAuditoria_insert_DALC = async (idOrden: number, accion: string, usuario: string, fecha: Date) => {
    const nuevo = new OrdenAuditoria()
    nuevo.IdOrden = idOrden
    nuevo.Accion = accion
    nuevo.Usuario = usuario
    nuevo.Fecha = fecha
    const registro = getRepository(OrdenAuditoria).create(nuevo)
    const result = await getRepository(OrdenAuditoria).save(registro)
    return result
}

export const ordenAuditoria_getEliminadas_DALC = async () => {
    const results = await getRepository(OrdenAuditoria).find({ where: { Accion: "ELIMINADA" }, order: { Fecha: "ASC" } })
    return results
}
