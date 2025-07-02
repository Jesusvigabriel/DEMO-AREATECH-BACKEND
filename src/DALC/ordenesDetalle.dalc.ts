import { createQueryBuilder, getRepository } from "typeorm";
import { Orden } from "../entities/Orden";
import { OrdenBultos } from "../entities/OrdenBultos";
import { OrdenDetalle } from "../entities/OrdenDetalle";
import { PosicionEnOrdenDetalle } from "../entities/PosicionEnOrdenDetalle";

export const addDetalleOrden_DALC = async(detalleOrden:Object) => {
    try {
        const newOrden = await getRepository(OrdenDetalle).create(detalleOrden);
        const result = await getRepository(OrdenDetalle).save(newOrden)
        return result
         
    } catch (error) {
        console.error(error);
        return undefined
    }
}

export const generaDetalleOrden_DALC = async (producto:any ,IdOrden: number, quantity:number) => {
    // Se instancia la nueva orden a agregar
    const newDetalleOrden = new OrdenDetalle() 
    // Se asignan los datos a la nueva orden a agregar
    newDetalleOrden.IdOrden = IdOrden;
    newDetalleOrden.IdProducto = producto.Id;
    newDetalleOrden.Unidades = quantity;
    newDetalleOrden.Precio = producto.price || 0
    // Se agrega la nueva orden
    const result = await addDetalleOrden_DALC(newDetalleOrden)

    return result
}

export const ordenDetalle_getByIdOrden_DALC = async (idOrden:number) => {
    const result = await getRepository(OrdenDetalle).find({IdOrden:idOrden})
    return result
}

export const ordenDetalle_getByIdOrdenAndProducto_DALC = async (idOrden:number) => {
    const result = await createQueryBuilder("orderdetalle", "ord")
        .select("ord.id as IdOrdendetalle, ord.unidades as Unidades, ord.precio as Precio, pro.descripcion as Productos, pro.barrCode as Barcode,"+
        " pro.stock_unitario as StockUnitario, pro.codeEmpresa as CodeEmpresa, pro.id as IdProducto, o.id as IdOrden, ord.lote as lote, ord.loteCompleto as loteCompleto, ord.despacho_plaza as DespachoPlaza")
        .innerJoin("ordenes", "o", "o.id = ord.ordenId")
        .innerJoin("productos", "pro", "pro.id = ord.productid")
        .where("o.id = :idOrden", {idOrden})
        .execute()
    return result
}

export const ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC = async (idOrden:number) => {
    const result = await createQueryBuilder("orderdetalle", "ord")
        .select("ord.id as IdOrdendetalle, emp.RazonSocial as Empresa, ord.unidades as Unidades, ord.precio as Precio, pro.descripcion as Productos, pro.barrCode as Barcode, part.numeroPartida as Partida,"+
        " pro.stock_unitario as StockUnitario, pro.codeEmpresa as CodeEmpresa, pro.id as IdProducto, o.id as IdOrden, ord.lote as lote, ord.loteCompleto as loteCompleto, ord.despacho_plaza as DespachoPlaza, part.id as IdPartida")
        .innerJoin("ordenes", "o", "o.id = ord.ordenId")
        .innerJoin("partidas", "part", "part.id = ord.productid")
        // .innerJoin("pos_prod", "posprod", "part.id = posprod.productId")
        // .innerJoin("posiciones", "pos", "pos.id = posprod.posicionId")
        .innerJoin("productos", "pro", "pro.id = part.idProducto")
        .innerJoin("empresas", "emp", "part.idEmpresa = emp.ID")
        .where("o.id = :idOrden", {idOrden})
        .execute()
    return result
}

export const editCantidadDetalleOrden_DALC = async (IdDetalle:number, cantidad:number) => {
    const detalle = await getRepository(OrdenDetalle).findOne({Id: IdDetalle})
    const editDetalle = new OrdenDetalle()
    editDetalle.Unidades = cantidad
    if(detalle){
        getRepository(OrdenDetalle).merge(detalle, editDetalle)
        const result = await getRepository(OrdenDetalle).save(detalle)
        return result
    }
    
}

export const ordenDetalle_getByIdProducto_DALC = async (IdProducto:number) => {
    const result = await createQueryBuilder("orderdetalle", "ord")
    .select("ord.id, o.Numero, ord.Unidades, pro.barrCode as barcode")
    .innerJoin("ordenes", "o", "o.id = ord.ordenId")
    .innerJoin("productos", "pro", "pro.id = ord.productid")
    .where("pro.id = :IdProducto", {IdProducto})
    .andWhere("o.estado = 1")
    .execute()
    
    return result
}

export const ordenBultos_getByIdOrdenAndIdEmpresa_DALC = async (idOrden:string, idEmpresa:number) => {
    const result = await getRepository(OrdenBultos).find({IdOrden:idOrden, IdEmpresa: idEmpresa})
    return result
}

export const ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC = async (idOrden:number, idEmpresa:number) => {
    const result = await getRepository(PosicionEnOrdenDetalle).find({IdOrdenDetalle: idOrden, IdEmpresa: idEmpresa})
    return result
}

//DALC: Obtiene los bultos de una Orden por su numero y por su Id
export const get_BultosOrden_ByNumeroOrdenAndIdEmpresa = async (numeroOrden:string, idEmpresa:number):Promise<number | null> => {

    const result = await getRepository(OrdenBultos).findOne({IdOrden:numeroOrden, IdEmpresa:idEmpresa})
    if(result){
        return result.Bultos
    }else{
        return null
    }

}


//DALC: Obtiene todos los bultos Cargados
export const get_AllBultos_DALC = async () => {
    const result = await getRepository(OrdenBultos).find()
    return result
}

//DALC: Obtiene todos los bultos Cargados por el Id de una empresa
export const get_AllBultos_ByIdEmpresaDALC = async (idEmpresa:number) => {
    const result = await getRepository(OrdenBultos).find({IdEmpresa:idEmpresa})
    return result
}

//DALC: Registra los bultos asociados a una orden
export const bultos_setByIdOrdenAndIdEmpresa = async (orden: Orden, idEmpresa: number, cantidad: number) => {

    try {
        const newBultos = new OrdenBultos()
        newBultos.Bultos=cantidad
        newBultos.IdEmpresa=idEmpresa
        newBultos.IdOrden=orden.Numero
        
        const newBultosToSave=getRepository(OrdenBultos).create(newBultos);
        const result = await getRepository(OrdenBultos).save(newBultosToSave)
        return result
         
    } catch (error: unknown) {
        if (error instanceof Error && 'errno' in error && error.errno === 1062) {
            //Ya estaba registrado, lo modifico
            try {
                await getRepository(OrdenBultos).update({IdOrden: orden.Numero, IdEmpresa: idEmpresa}, {Bultos: cantidad})
                const result=await getRepository(OrdenBultos).findOne({IdEmpresa: idEmpresa, IdOrden: orden.Numero})
                return result
            } catch (innerError: unknown)  {
                if (innerError instanceof Error) {
                    console.error('Error al actualizar bultos:', innerError.message);
                } else {
                    console.error('Error desconocido al actualizar bultos:', innerError);
                }
                return undefined;
            }
        } else {
            console.error(error);
            return undefined
        }

    }



    const result = await getRepository(OrdenBultos).find({IdEmpresa:idEmpresa})
    return result
}

export const ordenDetalle_delete_DALC = async (idOrden: number) => {
    let result
    const orden=await getRepository(OrdenDetalle).find({IdOrden: idOrden})
    if (orden!=null) {
        orden.forEach(orden =>{
            result=getRepository(OrdenDetalle).delete(orden)
        })
        
        return result
    } else {
        return result
    }

} 