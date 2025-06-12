import { getRepository } from "typeorm"
import { OrdenAuditoria } from "../entities/OrdenAuditoria"
import { auditoria_insert_DALC } from "./auditoria.dalc"

export const ordenAuditoria_insert_DALC = async (idOrden: number, accion: string, usuario: string, fecha: Date) => {
    const nuevo = new OrdenAuditoria()
    nuevo.IdOrden = idOrden
    nuevo.Accion = accion
    nuevo.Usuario = usuario
    nuevo.Fecha = fecha
    const registro = getRepository(OrdenAuditoria).create(nuevo)
    const result = await getRepository(OrdenAuditoria).save(registro)
    await auditoria_insert_DALC("Orden", idOrden, accion, usuario, fecha)
    return result
}

export const ordenAuditoria_getEliminadas_DALC = async () => {
    const results = await getRepository(OrdenAuditoria).find({ where: { Accion: "ELIMINADA" }, order: { Fecha: "ASC" } })
    return results
}
