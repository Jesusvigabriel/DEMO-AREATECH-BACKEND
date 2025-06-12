import { getRepository } from "typeorm"
import { GuiaEstadoHistorico } from "../entities/GuiaEstadoHistorico"

export const insertGuiaEstadoHistorico = async (idGuia: number, estado: string, usuario: string, fecha: Date) => {
    const nuevo = new GuiaEstadoHistorico()
    nuevo.IdGuia = idGuia
    nuevo.Estado = estado
    nuevo.Usuario = usuario
    nuevo.Fecha = fecha
    const registro = getRepository(GuiaEstadoHistorico).create(nuevo)
    const result = await getRepository(GuiaEstadoHistorico).save(registro)
    return result
}

export const guiaEstadoHistorico_getByIdGuia_DALC = async (idGuia: number) => {
    const results = await getRepository(GuiaEstadoHistorico).find({where: {IdGuia: idGuia}, order: {Fecha: "ASC"}})
    return results
}
