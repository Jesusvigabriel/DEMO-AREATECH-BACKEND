import { getRepository } from "typeorm"
import { GuiaEstadoHistorico } from "../entities/GuiaEstadoHistorico"
import { auditoria_insert_DALC } from "./auditoria.dalc"

export const insertGuiaEstadoHistorico = async (idGuia: number, estado: string, usuario: string, fecha: Date) => {
    const nuevo = new GuiaEstadoHistorico()
    nuevo.IdGuia = idGuia
    nuevo.Estado = estado
    nuevo.Usuario = usuario
    nuevo.Fecha = fecha
    const registro = getRepository(GuiaEstadoHistorico).create(nuevo)
    const result = await getRepository(GuiaEstadoHistorico).save(registro)
    await auditoria_insert_DALC("Guia", idGuia, estado, usuario, fecha)
    return result
}

export const guiaEstadoHistorico_getByIdGuia_DALC = async (idGuia: number) => {
    const results = await getRepository(GuiaEstadoHistorico).find({where: {IdGuia: idGuia}, order: {Fecha: "ASC"}})
    return results
}
