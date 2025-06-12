import { getRepository } from "typeorm"
import { ProductoHistorico } from "../entities/ProductoHistorico"
import { auditoria_insert_DALC } from "./auditoria.dalc"

export const productosHistorico_insert_DALC = async (idProducto: number, accion: string, usuario: string, fecha: Date, detalle: string) => {
    const nuevo = new ProductoHistorico()
    nuevo.IdProducto = idProducto
    nuevo.Accion = accion
    nuevo.Usuario = usuario
    nuevo.Fecha = fecha
    nuevo.Detalle = detalle
    const registro = getRepository(ProductoHistorico).create(nuevo)
    const result = await getRepository(ProductoHistorico).save(registro)
    await auditoria_insert_DALC("Producto", idProducto, accion, usuario, fecha)
    return result
}

export const productosHistorico_getByIdProducto_DALC = async (idProducto: number) => {
    const results = await getRepository(ProductoHistorico).find({where: {IdProducto: idProducto}, order: {Fecha: "ASC"}})
    return results
}
