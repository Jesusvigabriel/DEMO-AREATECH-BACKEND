import { getRepository } from "typeorm"
import { Auditoria } from "../entities/Auditoria"

export const auditoria_insert_DALC = async (
    entidad: string,
    idRegistro: number,
    accion: string,
    usuario: string,
    fecha: Date
) => {
    const nuevo = new Auditoria()
    nuevo.Entidad = entidad
    nuevo.IdRegistro = idRegistro
    nuevo.Accion = accion
    nuevo.Usuario = usuario
    nuevo.Fecha = fecha
    const registro = getRepository(Auditoria).create(nuevo)
    const result = await getRepository(Auditoria).save(registro)
    return result
}

export const auditoria_getByEntidad_DALC = async (entidad: string) => {
    const results = await getRepository(Auditoria).find({ where: { Entidad: entidad }, order: { Fecha: "ASC" } })
    return results
}

export const auditoria_getByEntidadId_DALC = async (entidad: string, idRegistro: number) => {
    const results = await getRepository(Auditoria).find({ where: { Entidad: entidad, IdRegistro: idRegistro }, order: { Fecha: "ASC" } })
    return results
}
