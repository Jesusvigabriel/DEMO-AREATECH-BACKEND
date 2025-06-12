import { getRepository } from "typeorm"
import { OrdenEstadoHistorico } from "../entities/OrdenEstadoHistorico"
import { auditoria_insert_DALC } from "./auditoria.dalc"

export const ordenEstadoHistorico_insert_DALC = async (idOrden: number, estado: number, usuario: string, fecha: Date) => {
    const nuevo = new OrdenEstadoHistorico()
    nuevo.IdOrden = idOrden
    nuevo.Estado = estado
    nuevo.Usuario = usuario
    nuevo.Fecha = fecha
    const registro = getRepository(OrdenEstadoHistorico).create(nuevo)
    const result = await getRepository(OrdenEstadoHistorico).save(registro)
    await auditoria_insert_DALC("Orden", idOrden, String(estado), usuario, fecha)
    return result
}

export const ordenEstadoHistorico_getByIdOrden_DALC = async (idOrden: number) => {
    const results = await getRepository(OrdenEstadoHistorico).find({where: {IdOrden: idOrden}, order: {Fecha: "ASC"}})
    return results
}
