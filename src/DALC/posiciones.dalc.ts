import {createQueryBuilder, getRepository} from "typeorm"

import {Posicion} from "../entities/Posicion"
import {PosicionProducto} from "../entities/PosicionProducto"
import {HistoricoPosiciones} from "../entities/HistoricoPosiciones"
import { producto_getPosiciones_byIdProducto_DALC, producto_moverDePosicion_DALC } from "./productos.dalc"

export const posicion_add = async (nombre: string) => {
    const resultToSave = getRepository(Posicion).create({Nombre: nombre})
    try {
        const result = await getRepository(Posicion).save(resultToSave)
        return {status: true, detalle: result}
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {status: false, detalle: error.message}
        }
        return {status: false, detalle: 'Error desconocido al guardar la posición'}
    }
  }

export const posicion_modify = async (id: number, body: object) => {
    const posicionActual=await getRepository(Posicion).findOne(id)
    if (posicionActual!=null) {
        getRepository(Posicion).merge(posicionActual, body)
        const result=await getRepository(Posicion).save(posicionActual)
        return result
    } else {
        return null
    }
}


//Editamos las Pos Prod
export const fechaPos_edit_DALC = async (id: number, fecha: Date) => {
    const result = await getRepository(PosicionProducto)
                  .createQueryBuilder()
                  .update()
                  .set({asigned: fecha, })
                  .where("IdPosicion = :id", {id})
                  .execute()

        return result
}

export const posicion_delete_DALC = async (id: number) => {
    const posicion=await getRepository(Posicion).findOne(id)
    if (posicion!=null) {
        const result=getRepository(Posicion).delete(posicion)
        return result
    } else {
        return null
    }
}



export const posicion_vaciar_DALC = async (idPosicion: number) => {
    const result = await getRepository(PosicionProducto)
        .createQueryBuilder()
        .delete()
        .from("pos_prod")
        .where("posicionId = :idPosicion", {idPosicion})
        .execute()
    
        return result
}

export const posiciones_obtenerConPosicionadoNegativo = async () => {
    const todasLasPosiciones=await posiciones_getAll_DALC()
    // const todasLasPosiciones=[{Id: 2126}, {Id: 2450}, {Id: 2465}]
    if (todasLasPosiciones!=null) {
        //console.log(todasLasPosiciones);

        let cantidad=0
        for (const [index, unaPosicion] of todasLasPosiciones.entries()) {
            console.log(index+"/"+todasLasPosiciones.length);
                
            const contenido=await posicion_getContent_ByIdPosicion_DALC(unaPosicion.Id)
            for (const unItem of contenido) {
                if (unItem.Unidades<0) {
                    cantidad++
                    const ubicacionesDelProducto=await producto_getPosiciones_byIdProducto_DALC(unItem.IdProducto)
                    const posicionesConPositivo=ubicacionesDelProducto.filter(e => e.unidades>0)
                    console.log("unaPosicion", unaPosicion)
                    console.log("unItem", unItem)
                    console.log("ubicacionesDelProducto", ubicacionesDelProducto)
                    console.log("posicionesConPositivo", posicionesConPositivo)
                    if (posicionesConPositivo.length>0) {
                        const unaPosicionConPositivo=posicionesConPositivo[0]
                        console.log("IdProducto", unItem.IdProducto, "Empresa", unItem.IdEmpresa, "IdPosicionOrigen", unaPosicionConPositivo.idPosicion, "IdPosicionDestino", unaPosicion.Id);
                        const resultMovida=await producto_moverDePosicion_DALC(unItem.IdProducto, unItem.IdEmpresa, unaPosicionConPositivo.idPosicion, unaPosicion.Id, 1, "", "","")                        
                        console.log("Resultado de la movida", resultMovida);
                    }
                    //  return todasLasPosiciones
                }
            }
        }
        console.log(cantidad);
        
    }
    return todasLasPosiciones
}

export const posiciones_getContenidos_byNombre_DALC = async (nombresPosiciones: string[]) => {  
    const contenidoDeTodasLasPosiciones=[]  
    for (const nombreUnaPosicion of nombresPosiciones) {
        const unaPosicion=await getRepository(Posicion).findOne({Nombre: nombreUnaPosicion})
        if (unaPosicion!=null) {
            const contenidoDeLaPosicion=await posicion_getContent_ByIdPosicion_DALC(unaPosicion.Id)
            contenidoDeTodasLasPosiciones.push({Posicion: unaPosicion, Contenido: contenidoDeLaPosicion})
        } else {
            contenidoDeTodasLasPosiciones.push({Posicion: {Id: -1, Nombre: nombreUnaPosicion}, contenido: []})        
        }
    }
    return contenidoDeTodasLasPosiciones    
}

export const posicion_getContent_ByIdPosicion_DALC = async (idPosicion: number) => {
    const productosDeLaPosicion=await createQueryBuilder("pos_prod", "pp")
        .select("pp.posicionId, productId, empresaId, sum(unidades * if(existe, -1, 1)) as total, prod.barrcode as barcode, prod.descripcion as nombre, pp.asigned as fechaPosicionado")
        .where("posicionId = :idPosicion", {idPosicion})
        .innerJoin("productos", "prod", "prod.id=pp.productId")
        .groupBy("productId")
        .having("total<>0")
        .getRawMany()

    const devolver=[]

    for (const unProductoDeLaPosicion of productosDeLaPosicion) {
        devolver.push(
            {   
                posicionId: unProductoDeLaPosicion.posicionId,
                Unidades: parseInt(unProductoDeLaPosicion.total), 
                IdProducto: unProductoDeLaPosicion.productId,
                IdEmpresa: unProductoDeLaPosicion.empresaId,
                BarcodeProducto: unProductoDeLaPosicion.barcode,
                NombreProducto: unProductoDeLaPosicion.nombre,
                Fecha: unProductoDeLaPosicion.fechaPosicionado
            }
        )
    }

    return devolver
}

export const getAllPosicionesByIdEmpresa_DALC = async (idEmpresa: number) => {
    const cantidadPosicionados=await createQueryBuilder("pos_prod", "pp")
        .select("SUM(CASE WHEN pp.existe THEN -pp.unidades ELSE pp.unidades END) as total")
        .where("pp.empresaId = :idEmpresa", { idEmpresa })
        .andWhere("pp.lote > 0")
        .getRawOne();

        return cantidadPosicionados
}

export const posicion_getContent_ByIdProducto_DALC = async (idProducto: number) => {
    const productosDeLaPosicion=await createQueryBuilder("pos_prod", "pp")
        .select("pp.posicionId, pp.productId, pp.empresaId, sum(pp.unidades * if(pp.existe, -1, 1)) as total,"+ 
        "pp.asigned as fechaPosicionado, pp.id, pp.removed, pp.existe")
        .where("productId = :idProducto", {idProducto})
        .groupBy("pp.productId")
        .having("total<>0")
        .getRawMany()

    const devolver=[]
   
    for (const unProductoDeLaPosicion of productosDeLaPosicion) {
        devolver.push(
            {   
                Id: unProductoDeLaPosicion.id,
                posicionId: unProductoDeLaPosicion.posicionId,
                Unidades: Number(unProductoDeLaPosicion.total), 
                IdProducto: unProductoDeLaPosicion.productId,
                IdEmpresa: unProductoDeLaPosicion.empresaId,
                Fecha: unProductoDeLaPosicion.fechaPosicionado,
                removed: unProductoDeLaPosicion.removed,
                Existe: unProductoDeLaPosicion.existe,
            }
        )
    }

    return devolver
}

export const posiciones_getAll_DALC = async () => {
    const results = await getRepository(Posicion).find()
    results.sort((a,b) => {
        return a.Nombre.localeCompare(b.Nombre)
    })
    return results
}

export const posicion_getByNombre_DALC = async (nombre: string) => {
    const results = await getRepository(Posicion).findOne( {where: {Nombre: nombre}})
    return results
}

export const posicion_getById_DALC = async (id: number) => {
    const results = await getRepository(Posicion).findOne( {where: {Id: id}})
    return results
}

export const posicion_getByIdProd_DALC = async (id: number, idEmpresa: number) => {
    const results = await getRepository(PosicionProducto).findOne( 
        {where: {IdProducto: id, IdEmpresa: idEmpresa }
        ,
        order: {Id:'DESC'}})
    return results
}

export const posicion_getAllByIdProd_DALC = async (id: number, idEmpresa: number, idPosicion: number) => {
    const results = await getRepository(PosicionProducto).find( 
        {where: {IdProducto: id, IdEmpresa: idEmpresa ,IdPosicion: idPosicion}
        ,
        order: {Id:'DESC'}})
    return results
}

export const posicionAnterior_getByIdProd_DALC = async (id: number, idEmpresa: number): Promise<any> => {
    const results = await getRepository(HistoricoPosiciones).find( {where: {IdProducto: id, IdEmpresa: idEmpresa }
        ,
        order: {Id:'DESC'}})
    return results
}

export const posiciones_getByIdProd_DALC = async (id: number, idEmpresa: number) => {
    const results = await createQueryBuilder("pos_prod", "pp")
        .select(" pp.empresaId as Empresa, pp.posicionId as IdPosicion, sum(pp.unidades * if(pp.existe,-1,1)) as Unidades, pp.existe as Existe, pos.descripcion as Descripcion ")
        .where("pp.empresaid  = :idEmpresa", {idEmpresa})
        .andWhere("pp.productid  = :id", {id})
        .innerJoin("posiciones", "pos", "pp.posicionID = pos.id")
        .groupBy("pp.posicionid")
        .having("unidades>0")
        .execute()


    
    return results
}

export const posiciones_getByIdProdAndLote_DALC = async (id: number, idEmpresa: number, lote: string) => {
    const results = await createQueryBuilder("pos_prod", "pp")
        .select(" pp.empresaId as Empresa, pp.posicionId as IdPosicion, sum(pp.unidades * if(pp.existe,-1,1)) as Unidades, pp.existe as Existe, pos.descripcion as Descripcion ")
        .where("pp.empresaid  = :idEmpresa", {idEmpresa})
        .andWhere("pp.productid  = :id", {id})
        .andWhere("pp.lote  = :lote", {lote})
        .innerJoin("posiciones", "pos", "pp.posicionID = pos.id")
        .groupBy("pp.posicionid")
        .having("unidades>0")
        .execute()
    return results
}

export const posiciones_getByLote_DALC = async (idEmpresa: number, lote: string) => {
    const results = await createQueryBuilder("pos_prod", "pp")
        .select(" pp.empresaId as Empresa, pp.posicionId as IdPosicion, sum(unidades * if(existe, -1, 1)) as total")
        .where("pp.empresaid  = :idEmpresa", {idEmpresa})
        .andWhere("pp.lote  = :lote", {lote})
        .groupBy("pp.posicionId")
        .execute()

    return results
}

export const posiciones_getByLoteDetalle_DALC = async (idEmpresa: number) => {
    const results = await createQueryBuilder("lote_detalle", "ld")
        .select("ld.idPosicion as IdPosicion, ld.unidades as Unidades")
        .where("ld.idEmpresa  = :idEmpresa", {idEmpresa})
        .execute()
    return results
}

export const detallePosicion_getByIdProd_DALC = async (id: number, idEmpresa: number) => {
    const results = await createQueryBuilder("posiciones_por_orderdetalle", "ppd")
        .select(" ppd.id_posicion as IdPosicion, ppd.id_orderdetalle as IdDetalle, ppd.cantidad as Cantidad, ppd.id_producto as IdProducto, ppd.id_empresa as IdEmpresa, pos.descripcion as Posicion ")
        .where("ppd.id_empresa  = :idEmpresa", {idEmpresa})
        .andWhere("ppd.id_orderdetalle  = :id", {id})
        .innerJoin("posiciones", "pos", "ppd.id_posicion = pos.id")
        .execute()


    
    return results
}


export interface PosicionConDetalle {
  IdProducto: number
  NombreProducto: string
  IdPosicion: number
  NombrePosicion: string
  Unidades: number
}



export const posiciones_getAllByEmpresaConDetalle_DALC = async (
  idEmpresa: number
): Promise<PosicionConDetalle[]> => {
  // Ejecutamos la consulta cruda
  const raws: Array<{
    IdProducto: string
    NombreProducto: string
    barrCode: string;
  codeEmpresa: string;
    IdPosicion: string
    NombrePosicion: string
    Unidades: string
  }> = await createQueryBuilder("pos_prod", "pp")
    .select([
      "pp.productId     AS IdProducto",
      "prod.descripcion AS NombreProducto",
      "prod.barrCode       AS barrCode",         
      "prod.codeEmpresa   AS codeEmpresa",  
      "pp.posicionId    AS IdPosicion",
      "pos.descripcion  AS NombrePosicion",
      "SUM(pp.unidades * IF(pp.existe, -1, 1)) AS Unidades",
    ])
    .innerJoin("productos", "prod", "prod.id = pp.productId")
    .innerJoin("posiciones", "pos", "pos.id  = pp.posicionId")
    .where("pp.empresaId = :idEmpresa", { idEmpresa })
    .groupBy("pp.productId, pp.posicionId")
    .having("Unidades <> 0")
    .execute()

  // Mapeamos y convertimos a tipos adecuados
  return raws.map(r => ({
    IdProducto:    Number(r.IdProducto),
    NombreProducto: r.NombreProducto,
    barrCode:        r.barrCode,       
    codeEmpresa:    r.codeEmpresa, 
    IdPosicion:    Number(r.IdPosicion),
    NombrePosicion: r.NombrePosicion,
    Unidades:      Number(r.Unidades),
  }))
  
}



export const posiciones_getAllByEmpresaConProductos_DALC = async (idEmpresa: number) => {
    // 1. Traer TODAS las posiciones posibles (sin filtro de empresa)
    const posiciones = await getRepository(Posicion).find();

    // 2. Traer todos los productos posicionados para esa empresa, agrupados
    const productosPorPosicion = await createQueryBuilder("pos_prod", "pp")
        .select([
            "pp.posicionId AS IdPosicion",
            "pp.productId AS IdProducto",
            "SUM(pp.unidades * IF(pp.existe, -1, 1)) AS Unidades"
        ])
        .where("pp.empresaId = :idEmpresa", { idEmpresa })
        .groupBy("pp.posicionId, pp.productId")
        .having("Unidades <> 0")
        .getRawMany();

    // 3. Traer info de productos (solo los que están posicionados)
    const idsProductos = productosPorPosicion.map(p => p.IdProducto);
    let productosCatalogo: any[] = [];
    if (idsProductos.length > 0) {
        productosCatalogo = await createQueryBuilder("productos", "p")
            .select([
                "p.id AS IdProducto",
                "p.codeEmpresa AS CodeEmpresa",
                "p.descripcion AS Descripcion"
            ])
            .where("p.id IN (:...ids)", { ids: idsProductos })
            .getRawMany();
    }

    // 4. Indexar productos por Id para lookup rápido
    const productosById: Record<number, any> = {};
    productosCatalogo.forEach(p => { productosById[p.IdProducto] = p; });

    // 5. Indexar productos por posición
    const productosPorPosId: Record<number, any[]> = {};
    productosPorPosicion.forEach(prod => {
        if (!productosPorPosId[prod.IdPosicion]) productosPorPosId[prod.IdPosicion] = [];
        productosPorPosId[prod.IdPosicion].push({
            IdProducto:   Number(prod.IdProducto),
            Unidades:     Number(prod.Unidades),
            CodeEmpresa:  productosById[prod.IdProducto]?.CodeEmpresa || null,
            Descripcion:  productosById[prod.IdProducto]?.Descripcion || null
        });
    });

    // 6. Formatear el resultado: para cada posición, su detalle (vacío si no hay productos)
    return posiciones.map(pos => ({
        Id: pos.Id,
        Nombre: pos.Nombre, // Ajusta si el campo se llama distinto
        Detalle: productosPorPosId[pos.Id] || []
    }));
};
