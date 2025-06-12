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

export const auditoria_get_DALC = async (
    entidad?: string,
    idRegistro?: number
) => {
    const where: any = {}
    if (entidad) where.Entidad = entidad
    if (idRegistro !== undefined) where.IdRegistro = idRegistro
    const results = await getRepository(Auditoria).find({
        where,
        order: { Fecha: "DESC" }
    })
    return results
}
