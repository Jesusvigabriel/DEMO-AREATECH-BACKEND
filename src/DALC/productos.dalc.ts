import {getRepository, createQueryBuilder, Any} from "typeorm"
import {Producto} from "../entities/Producto"
import {PosicionProducto} from '../entities/PosicionProducto'
import {HistoricoPosiciones} from '../entities/HistoricoPosiciones'
import {posicion_getById_DALC,posicion_getByIdProd_DALC,posicion_getAllByIdProd_DALC} from "../DALC/posiciones.dalc"
import { Posicion } from "../entities/Posicion"
import { ProductoPosicionado } from "../interfaces/ProductoPosicionado"
import { Stock } from "../entities/Stock"
import { getByIdAndIdEmpresa, updateUnidadesArticulo } from '../controllers/productos.controller';
import { ok } from "assert"
import { ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC, ordenDetalle_getByIdProducto_DALC } from "./ordenesDetalle.dalc"
import { PosicionEnOrdenDetalle } from "../entities/PosicionEnOrdenDetalle"
import { Empresa } from "../entities/Empresa"
import { Lote } from "../entities/Lote"
import { Partida} from "../entities/Partida"
import { LoteDetalle } from "../entities/LoteDetalle"
import { exists } from "fs"
import { createMovimientosStock_DALC } from "./movimientos.dalc"
import { Orden } from "../entities/Orden"
import { OrdenDetalle } from "../entities/OrdenDetalle"
import { response } from "express"
import { stringify } from "querystring"


export const producto_posicionar_DALC = async (producto: Producto, posicion: Posicion, unidadesAPosicionar: number, idEmpresa: number) => {

    if (producto.StockSinPosicionar<unidadesAPosicionar) {
        return {status: "ERROR", error: "El producto tiene " + producto.StockSinPosicionar + " stock sin posicionar, intentas posicionar: " + unidadesAPosicionar}
    }

    
    const entradaAPosicion=new PosicionProducto()
    //entradaAPosicion.IdEmpresa=producto.IdEmpresa
    entradaAPosicion.IdEmpresa=idEmpresa
    entradaAPosicion.IdPosicion=posicion.Id
    entradaAPosicion.IdProducto=producto.Id
    entradaAPosicion.Unidades=unidadesAPosicionar
    entradaAPosicion.asigned= new Date()
    entradaAPosicion.Existe=0

    const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
    const result=await getRepository(PosicionProducto).save(registroEntrada)
    if (result!=null) {
        return {status: "OK"}
    } else {
        return {status: "ERROR", error: result}    
    }
}

//Reposicionamiento mediante excel
export const reposicionar_producto_excel_DALC = async (producto: Producto, posicion: Posicion, unidadesAPosicionar: number, usuario: string) => {
    let result
    //Me fijo que posicion tiene el articulo previamente
    const pos = await posicion_getByIdProd_DALC(producto.Id, producto.IdEmpresa)
    if(pos){
         if(pos.IdPosicion == posicion.Id){
             return {status: "ERROR", error: "Ya se encuentra en la posicion"}
         }
        const loteNulo=""
    
        //Si tiene una posicion existente, muevo el articulo
        if(pos.Existe==0){
             result=await producto_moverDePosicion_DALC(producto.Id, producto.IdEmpresa, pos.IdPosicion, posicion.Id, 1, "", "",usuario)
            
           const saveHistorico = await producto_SaveHistoricoDePosicion_DALC(producto.Id, producto.IdEmpresa, pos.IdPosicion, 1, loteNulo, usuario)
          
        }else{

            //lo vuelvo a posicionar
            const entradaAPosicion=new PosicionProducto()
            entradaAPosicion.IdEmpresa=producto.IdEmpresa
            entradaAPosicion.IdPosicion=posicion.Id
            entradaAPosicion.IdProducto=producto.Id
            entradaAPosicion.Unidades=unidadesAPosicionar
            entradaAPosicion.asigned = new Date()
            entradaAPosicion.Existe=0
            entradaAPosicion.UsuarioNombre = usuario
        
            const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
            result=await getRepository(PosicionProducto).save(registroEntrada)
            //Puede que tenga una posicion existe en 1, pero sea distinta a la que vino entonces si eso pasa guardo en el historico.
            if(pos.IdPosicion!=posicion.Id){
                const saveHistorico = await producto_SaveHistoricoDePosicion_DALC(producto.Id, producto.IdEmpresa, pos.IdPosicion, 1, loteNulo, usuario)
            }

        }


    }else{
        const entradaAPosicion=new PosicionProducto()
        entradaAPosicion.IdEmpresa=producto.IdEmpresa
        entradaAPosicion.IdPosicion=posicion.Id
        entradaAPosicion.IdProducto=producto.Id
        entradaAPosicion.Unidades=unidadesAPosicionar
        entradaAPosicion.asigned= new Date()
        entradaAPosicion.Existe=0
        entradaAPosicion.UsuarioNombre = usuario
    
        const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
        result=await getRepository(PosicionProducto).save(registroEntrada)
    }

  
    if (result!=null) {
        return {status: "OK"}
    } else {
        return {status: "ERROR", error: result}    
    }
}

export const reposicionar_partida_excel_DALC = async (partida: Partida, posicion: Posicion, unidadesAPosicionar: number, usuario: string) => {
    let result
    //Me fijo que posicion tiene el articulo previamente
    const pos = await posicion_getAllByIdProd_DALC(partida.Id, partida.IdEmpresa, posicion.Id)

    let idPosicion = 0
    let cantRemov = 0
    let cantAsig = 0
    let cantTotalPosicion=0
    const loteNulo=""
    for(const posiciones of pos ){
        idPosicion= posiciones.IdPosicion
        if(posiciones.Existe==0){
            cantAsig += posiciones.Unidades
        }else if(posiciones.Existe==1){
            cantRemov += posiciones.Unidades
        }
    }
    cantTotalPosicion = cantAsig - cantRemov
    if(pos){
         if(idPosicion == posicion.Id && 0 < cantTotalPosicion){
            if(partida.Stock <= cantTotalPosicion){
                return {status: "ERROR", error: "No se puede posicionar este stock "}
            }
         }
    
        //Si tiene una posicion existente, muevo el articulo
        if(cantTotalPosicion>0 && partida.Stock==cantTotalPosicion){
            result=await producto_moverDePosicion_DALC(partida.Id, partida.IdEmpresa, idPosicion, posicion.Id, 1, "", "",usuario)
            
           const saveHistorico = await producto_SaveHistoricoDePosicion_DALC(partida.Id, partida.IdEmpresa, idPosicion, 1, loteNulo, usuario)
          
        }else{

            //lo vuelvo a posicionar
            const entradaAPosicion=new PosicionProducto()
            entradaAPosicion.IdEmpresa=partida.IdEmpresa
            entradaAPosicion.IdPosicion=posicion.Id
            entradaAPosicion.IdProducto=partida.Id
            entradaAPosicion.Unidades=unidadesAPosicionar
            entradaAPosicion.asigned = new Date()
            entradaAPosicion.Existe=0
            entradaAPosicion.UsuarioNombre = usuario
        
            const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
            result=await getRepository(PosicionProducto).save(registroEntrada)
            //Puede que tenga una posicion existe en 1, pero sea distinta a la que vino entonces si eso pasa guardo en el historico.
            if(idPosicion!=posicion.Id){
                const saveHistorico = await producto_SaveHistoricoDePosicion_DALC(partida.Id, partida.IdEmpresa, idPosicion, 1, loteNulo, usuario)
            }

        }


    }else{
        const entradaAPosicion=new PosicionProducto()
        entradaAPosicion.IdEmpresa=partida.IdEmpresa
        entradaAPosicion.IdPosicion=posicion.Id
        entradaAPosicion.IdProducto=partida.Id
        entradaAPosicion.Unidades=unidadesAPosicionar
        entradaAPosicion.asigned= new Date()
        entradaAPosicion.Existe=0
        entradaAPosicion.UsuarioNombre = usuario
    
        const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
        result=await getRepository(PosicionProducto).save(registroEntrada)
    }

  
    if (result!=null) {
        return {status: "OK"}
    } else {
        return {status: "ERROR", error: result}    
    }
}

export const producto_desposicionar_DALC = async (producto: Producto, posicion: Posicion, unidadesADesposicionar: number, usuario: string) => {

    const unidadesEnLaPosicion:ProductoPosicionado[] =producto.Posiciones.filter( e => (e.Nombre===posicion.Nombre))

    if (unidadesEnLaPosicion.length==0) {
        return {status: "ERROR", error: "En la posición indicada no está posicionado el producto solicitado"}
    }
    if (unidadesEnLaPosicion[0].Unidades>=unidadesADesposicionar) {
        const salidaDePosicion=new PosicionProducto()
        salidaDePosicion.IdEmpresa=producto.IdEmpresa
        salidaDePosicion.IdPosicion=posicion.Id
        salidaDePosicion.IdProducto=producto.Id
        salidaDePosicion.Unidades=unidadesADesposicionar
        salidaDePosicion.removed = new Date()
        salidaDePosicion.Existe=1


        const registroSalida=getRepository(PosicionProducto).create(salidaDePosicion)
        const result=await getRepository(PosicionProducto).save(registroSalida)

        if(producto.StockUnitario)
        {
           
            const saveHistorico = await producto_SaveHistoricoDePosicion_DALC(producto.Id,producto.IdEmpresa, posicion.Id,unidadesADesposicionar, "", usuario) 
        }

        if (result!=null) {
            return {status: "OK"}
        } else {
            return {status: "ERROR", error: result}    
        }
    } else {
        return {status: "ERROR", error: "No hay suficientes unidades - Posicionadas: "+unidadesEnLaPosicion[0].Unidades+" - A desposicionar: "+unidadesADesposicionar}
    }
}


export const producto_desposicionar_paqueteria_DALC = async (producto: number, posicion: number, unidadesADesposicionar: number, idEmpresa: number) => {

    const salidaDePosicion=new PosicionProducto()
    salidaDePosicion.IdEmpresa=idEmpresa
    salidaDePosicion.IdPosicion=posicion
    salidaDePosicion.IdProducto=producto
    salidaDePosicion.Unidades=unidadesADesposicionar
    salidaDePosicion.removed = new Date()
    salidaDePosicion.Existe=1

    const registroSalida=getRepository(PosicionProducto).create(salidaDePosicion)
    const result=await getRepository(PosicionProducto).save(registroSalida)
    
    if (result!=null) {
        return {status: "OK"}
    } else {
        return {status: "ERROR", error: result}    
    }
}

export const producto_desposicionar_Lote_DALC = async (posicion: number, unidadesADesposicionar: number, idEmpresa: number, idProducto: number, lote: string, usuario: string) => {

    const embarque = await getRepository(Lote).findOne({where: {Lote: lote}})
    const salidaDePosicion=new PosicionProducto()
    salidaDePosicion.IdEmpresa=idEmpresa
    salidaDePosicion.IdPosicion=posicion
    salidaDePosicion.IdProducto=idProducto
    salidaDePosicion.Lote = lote
    if(embarque){
        salidaDePosicion.Embarque = embarque.Embarque
    }
    salidaDePosicion.UsuarioNombre = usuario
    salidaDePosicion.Unidades=unidadesADesposicionar
    salidaDePosicion.removed = new Date()
    salidaDePosicion.Existe=1

    const registroSalida=getRepository(PosicionProducto).create(salidaDePosicion)
    const result=await getRepository(PosicionProducto).save(registroSalida)
    
    if (result!=null) {
        return {status: "OK"}
    } else {
        return {status: "ERROR", error: result}    
    }
}

export const producto_getPosiciones_byIdProducto_DALC = async (idProducto: number) => {
    const resDet=await getRepository(PosicionProducto)
        .createQueryBuilder()
        .select("posicionId, sum(unidades * if(existe, -1, 1)) as total")
        .where("productId = :idProducto", {idProducto})
        .groupBy("posicionId")
        .having("total<>0")
        .getRawMany()

    const devolver=[]
    for (const una of resDet) {
        const posicionDeUna=await posicion_getById_DALC(una.posicionId)
        devolver.push(
            {   idProducto, 
                unidades: parseInt(una.total), 
                idPosicion: una.posicionId,
                posicion: posicionDeUna                
            }
        )
    }

    return devolver
}

export const producto_getPosiciones_byIdProducto_Lote_DALC = async (idProducto: number, idPosicion: number, lote: string) => {
    const resDet=await getRepository(PosicionProducto)
        .createQueryBuilder()
        .select("posicionId, sum(unidades * if(existe, -1, 1)) as total")
        .where("productId = :idProducto", {idProducto})
        .andWhere("posicionId = :idPosicion", {idPosicion})
        .andWhere("lote = :lote", {lote})
        .having("total<>0")
        .getRawOne()

        return resDet
}

export const getComprometidoLote_DALC = async (lote: string, idEmpresa: number) => {
    // const orderDetalle = false
    const orderDetalle = await createQueryBuilder("orderdetalle", "det")
        .select("sum(det.unidades) as unidades")
        .innerJoin("ordenes", "ord", "det.ordenId = ord.id")
        .where("ord.empresa = :idEmpresa", {idEmpresa: idEmpresa})
        .andWhere("det.lote = :lote", {lote: lote})
        .andWhere("ord.estado = 1")
        .getRawOne()

    return orderDetalle
}

export const productos_getId_byBarcodes_DALC = async (idEmpresa: number, barcodes: string[]) => {
    const todosLosArticulos=[]
    for (const unBarcode of barcodes) {
        const unArticulo=await producto_getByBarcodeAndEmpresa_DALC(unBarcode, idEmpresa)
        if (unArticulo!=null) {
            todosLosArticulos.push(unArticulo)
        } else {
            todosLosArticulos.push({Id: -1, Barcode: unBarcode, Nombre: null})
        }
    }
    return todosLosArticulos
}

export const productos_getAll_ByEmpresa_DALC = async (idEmpresa: number) => {
    const results = await getRepository(Producto).find( {where: {IdEmpresa: idEmpresa}})
    return results
}

export const productos_getAll_ByEmpresaOptimizado_DALC = async (idEmpresa: number) => {
    const results = await createQueryBuilder("productos", "p")
        .select("p.id as Id, p.empresa as IdEmpresa, p.barrcode as Barcode, unXcaja as UnXCaja, p.descripcion as Nombre, p.codeEmpresa as CodeEmpresa, " + 
          "s.unidades as Stock, p.stock_unitario as StockUnitario, p.alto as Alto, p.ancho as Ancho, p.largo as Largo, p.peso as Peso, p.precio as Precio, " +
          "(select sum(unidades) as total  from orderdetalle det " +
          "INNER JOIN ordenes ord ON det.ordenId = ord.Id " +
          " where det.productId = p.id and ord.empresa = p.empresa and ord.estado = 1 ) as StockComprometido, "+
          "(select  sum(unidades * if(existe, -1, 1)) as total from pos_prod " +
          " where productId = p.id and empresaId = p.empresa  having total<>0 ) as StockPosicionado, " +
          "(SELECT descripcion FROM posiciones where id = (SELECT posicionId FROM pos_prod where productId = p.id and existe = 0 order by id desc limit 1)) as Posiciones "
          )
        .innerJoin("stock", "s", "p.id = s.producto")
        .where("p.empresa = :idEmpresa", {idEmpresa: idEmpresa})
        .execute()
     
    return results
}

export const producto_getByIdAndEmpresa_DALC = async (id: number, idEmpresa: number) => {
    const unProducto = await getRepository(Producto).findOne( {where: {Id: id, IdEmpresa: idEmpresa}})
    return unProducto
}

export const producto_getById_DALC = async (id: number) => {
    const unProducto = await getRepository(Producto).findOne( {where: {Id: id}})
    return unProducto
}



export const producto_getByBarcodeAndEmpresa_DALC = async (barcode: string, idEmpresa: number) => {
    let unProducto
    if (idEmpresa>0) {
        unProducto = await getRepository(Producto).findOne( {where: {Barcode: barcode, IdEmpresa: idEmpresa}})
    } else {
        unProducto = await getRepository(Producto).findOne( {where: {Barcode: barcode}})
    }

    // const unProducto = await getRepository(Producto).findOne( {where: {Barcode: barcode, IdEmpresa: idEmpresa}})
    return unProducto
}

export const producto_getByCodeEmpresaAndEmpresa_DALC = async (barcode: string, idEmpresa: number) => {
    console.log(idEmpresa)
    console.log(barcode)
    const results = await createQueryBuilder("productos", "p")
        .select("p.id as Id, p.empresa as IdEmpresa, p.barrcode as Barcode, p.descripcion as Nombre, p.codeEmpresa as CodeEmpresa")
        .where("p.empresa = :idEmpresa", {idEmpresa: idEmpresa})
        .andWhere("p.codeEmpresa = :codeEmpresa", {codeEmpresa: barcode})
        .execute()

        console.log(results)
        console.log(results[0].Barcode)
    let unProducto
    if (idEmpresa>0) {
        unProducto = await getRepository(Producto).findOne( {where: {Barcode: results[0].Barcode, IdEmpresa: idEmpresa}})
    } else {
        unProducto = await getRepository(Producto).findOne( {where: {Barcode: results[0].Barcode}})
    }
    console.log(unProducto)
    // const unProducto = await getRepository(Producto).findOne( {where: {Barcode: barcode, IdEmpresa: idEmpresa}})
    return unProducto
}

export const lote_getByBarcodeAndEmpresa_DALC = async (barcode: string, idEmpresa: number) => {
    let unLote
    if (idEmpresa>0) {
        unLote = await getRepository(Lote).findOne( {where: {Lote: barcode, IdEmpresa: idEmpresa}})
    } else {
        unLote = await getRepository(Lote).findOne( {where: {Lote: barcode}})
    }

    return unLote
}

export const putLote_ByBarcodeAndEmpresa_DALC = async (barcode: string, idEmpresa: number, lote: string, userName: string, comprobante: string, fecha: string) => {  
    const listaBarcodes = barcode.split(','); 
    let response = []
    const horaActual: Date = new Date()
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaDate: Date = new Date(year, month - 1, day, horaActual.getHours(), horaActual.getMinutes(), horaActual.getSeconds())
    for await( const unBarcode of listaBarcodes){
        if(typeof lote == "undefined" || lote == "null"){
            // const ingresoExist = await getRepository(LoteDetalle).find({where: {Lote: unBarcode, IdEmpresa: idEmpresa, Ingreso: true}})
            
            // if(ingresoExist.length > 0){
            //     response.push({status: "ERROR", data: ingresoExist, mensaje: "Ya ingresado"}) 
            //     continue
            // }
            const barcodeLote = unBarcode
            // const result = await createQueryBuilder("Lote", "l")
            // .select("ld.unidades as unidades, ld.idProducto as idProducto, ld.barcode as barcode, ld.idPosicion as idPosicion, ld.lote as lote, ld.embarque as embarque, ld.idEmpresa as idEmpresa")
            // .innerJoin("LoteDetalle", "ld", "ld.lote = l.lote")
            // .where("l.lote = :barcodeLote", {barcodeLote})
            // .andWhere("l.idEmpresa = :idEmpresa", {idEmpresa})
            // .execute()
            
            // const result = await createQueryBuilder("LoteDetalle", "ld")
            // .select("ld.unidades as unidades, ld.idProducto as idProducto, ld.barcode as barcode, ld.idPosicion as idPosicion," + 
            // "ld.lote as lote, ld.embarque as embarque, ld.idEmpresa as idEmpresa, ld.ingreso as ingreso")
            // .where("ld.lote = :barcodeLote", {barcodeLote})
            // .andWhere("ld.idEmpresa = :idEmpresa", {idEmpresa})
            // .execute()
            const result = await getRepository(LoteDetalle).find({where: {Lote: barcodeLote, IdEmpresa: idEmpresa}})

            if(result){
                for await(const unResultado of result){
                    let ingresoExitoso = []
                    let ingresoError = []
                    
                    // const noEstaIngresado = await getRepository(LoteDetalle).findOne({where: {Lote: unResultado.Lote, IdEmpresa: idEmpresa, IdProducto: unResultado.IdProducto, Ingreso: false}})

                    if(unResultado.Ingreso == false){
                        
                        const entradaAPosicion=new PosicionProducto()
                        entradaAPosicion.IdEmpresa=idEmpresa
                        entradaAPosicion.IdPosicion=unResultado.IdPosicion
                        entradaAPosicion.IdProducto=unResultado.IdProducto
                        entradaAPosicion.Unidades=unResultado.Unidades
                        entradaAPosicion.asigned= new Date()
                        entradaAPosicion.Existe=0
                        entradaAPosicion.Lote=unBarcode
                        entradaAPosicion.Embarque=unResultado.Embarque
                        entradaAPosicion.UsuarioNombre=userName
                        
                        const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
                        const result=await getRepository(PosicionProducto).save(registroEntrada)
                        await createMovimientosStock_DALC({Orden: comprobante, IdProducto: unResultado.IdProducto, Unidades: unResultado.Unidades, Tipo: 0, IdEmpresa: idEmpresa, Fecha: fechaDate, codprod: unResultado.Barcode, Usuario: userName,  Lote: unBarcode})    
                        ingresoExitoso.push(unResultado)
                        response.push({status: "OK", data: ingresoExitoso, mensaje: "Se ingreso con exito"}) 
                        
                        await getRepository(LoteDetalle).update({Lote: unResultado.Lote, IdEmpresa: idEmpresa, IdProducto: unResultado.IdProducto}, {Ingreso: true})
                    } else {
                        ingresoError.push(unResultado)
                        response.push({status: "ERROR", data: ingresoError, mensaje: "Ya ingresado"}) 
                    }
                }
        
            } else {
                response.push({status: "ERROR", data: result, mensaje: "Error en el ingreso"})    
            }
        } else {
            const ingresoExist = await getRepository(LoteDetalle).find({where: {Barcode: unBarcode, Lote: lote,  IdEmpresa: idEmpresa, Ingreso: true}})
            
            if(ingresoExist.length > 0){
                response.push({status: "ERROR", data: ingresoExist, mensaje: "Ya ingresado"}) 
                continue
            }
            
            const exist = await getRepository(LoteDetalle).find({where: {Barcode: unBarcode, Lote: lote,  IdEmpresa: idEmpresa}})
            if(exist.length == 0){

                response.push({status: "ERROR", data: false, mensaje: "No existe" , barcodeNoExiste: unBarcode, loteNoExiste: lote}) 
                continue
            }

            const barcodeBusqueda = unBarcode
            // const result = await createQueryBuilder("Lote", "l")
            // .select("ld.unidades as unidades, ld.idProducto as idProducto, ld.barcode as barcode, ld.idPosicion as idPosicion, ld.lote as lote, ld.embarque as embarque, ld.idEmpresa as idEmpresa")
            // .innerJoin("LoteDetalle", "ld", "ld.lote = l.lote")
            // .where("ld.lote = :lote", {lote})
            // .andWhere("ld.barcode = :barcode", {barcode})
            // .andWhere("l.idEmpresa = :idEmpresa", {idEmpresa})
            // .execute()
            const resultLoteDetalle = await createQueryBuilder("LoteDetalle", "ld")
            .select("ld.unidades as unidades, ld.idProducto as idProducto, ld.barcode as barcode, ld.idPosicion as idPosicion, ld.lote as lote, ld.embarque as embarque, ld.idEmpresa as idEmpresa")
            .where("ld.lote = :lote", {lote})
            .andWhere("ld.barcode = :barcodeBusqueda", {barcodeBusqueda})
            .andWhere("ld.idEmpresa = :idEmpresa", {idEmpresa})
            .execute()
            
            if(resultLoteDetalle){
                for (const unResultado of resultLoteDetalle){
                
                    
                    const entradaAPosicion=new PosicionProducto()
                    //entradaAPosicion.IdEmpresa=producto.IdEmpresa
                    entradaAPosicion.IdEmpresa=idEmpresa
                    entradaAPosicion.IdPosicion=unResultado.idPosicion
                    entradaAPosicion.IdProducto=unResultado.idProducto
                    entradaAPosicion.Unidades=unResultado.unidades
                    entradaAPosicion.asigned= new Date()
                    entradaAPosicion.Existe=0
                    entradaAPosicion.Lote=unResultado.lote
                    entradaAPosicion.Embarque=unResultado.embarque
                    entradaAPosicion.UsuarioNombre=userName

                    const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
                    const result=await getRepository(PosicionProducto).save(registroEntrada)
                    
                    // await getRepository(PosicionProducto).update({Lote: unResultado.lote, IdEmpresa: idEmpresa, IdProducto: unResultado.idProducto}, {Unidades: unResultado.unidades, asigned: new Date(), UsuarioNombre: userName})
                    await createMovimientosStock_DALC({Orden: comprobante, IdProducto: unResultado.idProducto, Unidades: parseInt(unResultado.unidades), Tipo: 0, IdEmpresa: idEmpresa, Fecha: fechaDate, codprod: unResultado.barcode, Usuario: userName,  Lote: unResultado.lote}) 
                    response.push({status: "OK", data: resultLoteDetalle, mensaje: "Se ingreso con exito"}) 
                   
                    await getRepository(LoteDetalle).update({Barcode: unResultado.barcode, IdEmpresa: idEmpresa, Lote: lote}, {Ingreso: true})
                }
            } else {
                response.push({status: "ERROR", data: resultLoteDetalle, mensaje: "Error en el ingreso"})    
            }
        } 
    }

    return response  
}

export const producto_getBySKUAndEmpresa_DALC = async (sku: string, idEmpresa: number):Promise<Producto> => {
    const unProducto = await getRepository(Producto).findOne( {where: {CodeEmpresa: sku, IdEmpresa: idEmpresa}})
    return unProducto!
}

export const producto_moverDePosicion_DALC =  async (idProducto: number, idEmpresa: number, idPosicionOrigen: number, idPosicionDestino: number, cantidad: number,lote: string, embarque: string, usuario: string) => {

    const salidaDePosicion=new PosicionProducto()
    salidaDePosicion.IdEmpresa=idEmpresa
    salidaDePosicion.IdPosicion=idPosicionOrigen
    salidaDePosicion.IdProducto=idProducto
    salidaDePosicion.Unidades=cantidad
    salidaDePosicion.removed = new Date()
    salidaDePosicion.Existe=1
    salidaDePosicion.Lote = lote
    salidaDePosicion.Embarque = embarque
    salidaDePosicion.UsuarioNombre = usuario
    

    const registroSalida=getRepository(PosicionProducto).create(salidaDePosicion)
    let result=await getRepository(PosicionProducto).save(registroSalida)
    if (result!=null) {
        const entradaAPosicion=new PosicionProducto()
        entradaAPosicion.IdEmpresa=idEmpresa
        entradaAPosicion.IdPosicion=idPosicionDestino
        entradaAPosicion.IdProducto=idProducto
        entradaAPosicion.Unidades=cantidad
        entradaAPosicion.asigned = new Date()
        entradaAPosicion.Existe=0
        entradaAPosicion.Lote = lote
        entradaAPosicion.Embarque = embarque
        entradaAPosicion.UsuarioNombre=usuario

        const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
        result=await getRepository(PosicionProducto).save(registroEntrada)

        if (result!=null) {
            if(lote!=""){
                const result=await getRepository(LoteDetalle).update({Lote: lote},{IdPosicion: idPosicionDestino})
            }
            const idOrderDetalle = await ordenDetalle_getByIdProducto_DALC(idProducto) 
            for (const detalleOrden of idOrderDetalle){
             
                const posicionOk = await getRepository(PosicionEnOrdenDetalle).update({IdOrdenDetalle: detalleOrden.id, IdPosicion:idPosicionOrigen}, {IdPosicion: idPosicionDestino})
                if(!posicionOk){
                   return {status: "ERROR"}
                }
            }
            return {status: "OK"}
        } else {
            return {status: "ERROR"}
        }     
    } else {
        return {status: "ERROR"}
    }

}



// Guardo la Posicionanterior en el Historico
export const producto_SaveHistoricoDePosicion_DALC =  async (idProducto: number, idEmpresa: number, idPosicionOrigen: number, cantidad: number, lote: string, usuario:string) => {
    const salidaDePosicion=new HistoricoPosiciones()
    salidaDePosicion.IdEmpresa=idEmpresa
    salidaDePosicion.IdPosicion=idPosicionOrigen
    salidaDePosicion.IdProducto=idProducto
    salidaDePosicion.Unidades=cantidad
    salidaDePosicion.Fecha= new Date()
    salidaDePosicion.Lote = lote
    salidaDePosicion.Usuario = usuario

    const registroSalida=getRepository(HistoricoPosiciones).create(salidaDePosicion)
    let result=await getRepository(HistoricoPosiciones).save(registroSalida)


}

export const producto_editByBarcodeAndEmpresa_DALC = async ( barcode: string, idEmpresa: number, propiedades:any) => {
    const data =  await producto_getByBarcodeAndEmpresa_DALC(barcode, idEmpresa)
    if(data){
        getRepository(Producto).merge(data, propiedades)
        const result = await getRepository(Producto).save(data)
        if(result != null){
            return {
                SKU: data.CodeEmpresa,
                Barcode: data.Barcode,
                Nombre: data.Nombre,
                msg: 'Actualizado'
            }
        } else {
            return {status: "ERROR"}
        }
   
    }

    return {status: "ERROR"}
   
}

export const producto_edit_ByProducto_DALC = async ( productoOriginal: Producto, body :any) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    await getRepository(Producto).update(productoOriginal.Id, datosAGuardar)
    const result=await producto_getById_DALC(productoOriginal.Id)
    return result   
}

export const producto_add_DALC = async(producto: Producto) => {
    const newProducto = getRepository(Producto).create(producto)
    try {
        const result = await getRepository(Producto).save(newProducto);

        if(result != null){ 
            const newProductoStock = new Stock()
            newProductoStock.Producto=newProducto.Id
            newProductoStock.Unidades=0
            newProductoStock.Empresa=newProducto.IdEmpresa
            
            const newProductoStockAGuardar = getRepository(Stock).create(newProductoStock)
            try {
                const resp = await getRepository(Stock).save(newProductoStockAGuardar)
                return {status: true, data: result}
            } catch (error) {
                getRepository(Producto).delete(newProducto.Id)
                return {status: false, data: `Error creando la tabla stock del producto`}
            }

        } else {
            return {status: false, data: "Error al ingresar el producto"}
        }
    } catch (error) {
        if(error.errno == 1062){
            return {status: false, data: "Barcode duplicado"}         
        }
        return {status: false, data: "Error al ingresar el producto"}
    }
}

export const productoPART_add_DALC = async(producto: Producto, fecha: Date) => {
    let saveProduct
    let partExist
    let productoActual = producto

    const productExist = await getRepository(Producto).findOne({where: {Barcode: producto.Barcode, IdEmpresa: producto.IdEmpresa}})

    if(!productExist){//si el producto no existe
        const newProducto = await getRepository(Producto).create(producto)

        try{
            saveProduct = await getRepository(Producto).save(newProducto)

            partExist = await getRepository(Partida).findOne({where:  {Partida: producto.Partida, IdProducto: saveProduct.Id, IdEmpresa: producto.IdEmpresa}})
            if(partExist != null){
                const newPart = new Partida()
                newPart.IdProducto = saveProduct.Id
                newPart.IdEmpresa = producto.IdEmpresa
                newPart.Partida = producto.Partida
                newPart.Fecha = fecha
                newPart.Usuario = producto.UsuarioAlta

                const partCreate = getRepository(Partida).create(newPart)
                const partSave = getRepository(Partida).save(partCreate)

                return {status: true, data: producto} 
            }else{
                //que se fije si existe la partida sola 
                return {status: false, data: "Ya existe un registro con esta partida y barcode"}
            }
        }
        catch{
            return {status: false, data: "Error al ingresar el producto"}
        }
    }else{//si el producto existe
        try{
            partExist = await getRepository(Partida).findOne({where:  {IdEmpresa: producto.IdEmpresa, Partida: producto.Partida, IdProducto: productExist.Id}})
            
            if(!partExist){
                const newPart = new Partida()
                newPart.IdProducto = productExist.Id
                newPart.IdEmpresa = producto.IdEmpresa
                newPart.Partida = producto.Partida
                newPart.Fecha = fecha
                newPart.Usuario = producto.UsuarioAlta
                
                const partCreate = await getRepository(Partida).create(newPart)
                const partSave = await getRepository(Partida).save(partCreate)
                return {status: true, data: partSave} 
            }else{
                return {status: false, data: "Ya existe un registro con esta partida y barcode"}
            }
        }
        catch{
            return {status: false, data: "Error al ingresar el producto"}
        }
    }
}

export const getProductoByPartidaAndEmpresaAndProducto_DALC = async(idEmpresa:number,partida: string,barcode: string) => {
    const productoPartida = await createQueryBuilder("partidas", "part")
        .select("part.id as Id, part.idEmpresa as IdEmpresa, part.numeroPartida as Partida, part.idProducto as IdProducto, part.unidades as Stock, prod.descripcion as Nombre, prod.barrcode as Barcode")
        .innerJoin("productos", "prod", "part.idProducto = prod.id")
        .where("part.idEmpresa = :idEmpresa", {idEmpresa: idEmpresa})
        .andWhere("part.numeroPartida = :partida", {partida: partida})
        .andWhere("prod.barrcode = :barrcode", {barrcode: barcode})
        .execute()
    return productoPartida
}

export const getProductoByPartidaAndEmpresaAndBarcode_DALC = async(idEmpresa:number,partida: string,barcode: string) => {
    const productoPArtida = await getRepository(Partida).find({where:  {IdEmpresa: idEmpresa, Partida: partida, Barcode: barcode}})

    return productoPArtida
}

export const getProductoByPartidaAndEmpresaAndProductoV2_DALC = async(idEmpresa:number, partida:string, idProducto:number) => {
    const productoPArtida = await getRepository(Partida).find({where:  {IdEmpresa: idEmpresa, Partida: partida, IdProducto: idProducto}})
    return productoPArtida
}

export const getAllProductoByPartidaAndEmpresaAndProductoV2_DALC = async(idEmpresa:number) => {
    const productoPArtida = await getRepository(Partida).find({where:  {IdEmpresa: idEmpresa}})
    return productoPArtida
}

export const partida_editOneUnidades_DALC = async (articuloOriginal: Partida, body: any) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    const result=await getRepository(Partida).update(articuloOriginal.Id , datosAGuardar)
    const res = await getRepository(Partida).findOne(articuloOriginal.Id)
    return result
    
}

export const getAllPartidasByEmpresa_DALC = async(idEmpresa:number) => {
    const productoPartida = await createQueryBuilder()
        .select("part.Id, part.idEmpresa as IdEmpresa, part.numeroPartida as Partida, part.idProducto as IdProducto, part.unidades as Unidades, prod.barrcode as Barcode, prod.descripcion as Nombre, prod.alto as Alto, prod.ancho as Ancho, prod.largo as Largo, prod.peso as Peso, prod.unXcaja as UnXCaja")
        .from(Partida, 'part')
        .innerJoin("productos", "prod", "part.idProducto = prod.id")
        .where("part.idEmpresa = :idEmpresa", {idEmpresa: idEmpresa})
        .execute()

    return productoPartida
}

export const productoLOTE_add_DALC = async(producto: Producto) => {
    let resultIdPosition = null
    let resultIdLote = null
    let resultIdLoteDetalle = null
    let loteExist
    let saveProduct
    //let loteCreate = new Lote()
    const productExist = await getRepository(Producto).findOne({where: {Barcode: producto.Barcode, IdEmpresa: producto.IdEmpresa}})
    
    if(!productExist){
        const newProducto = getRepository(Producto).create(producto)
        
        try{
            saveProduct = await getRepository(Producto).save(newProducto)
            
            loteExist = await getRepository(Lote).findOne({where: {Lote: producto.BoxNumber, IdEmpresa: producto.IdEmpresa, Embarque: producto.DeliveryBatch}})
            
            if(!loteExist){
                const newLote = new Lote()
                newLote.Embarque = producto.DeliveryBatch
                newLote.Lote = producto.BoxNumber
                // newLote.Unidades = producto.Bultos
                newLote.IdEmpresa = producto.IdEmpresa
                const loteCreate = getRepository(Lote).create(newLote)
                const saveLote = await getRepository(Lote).save(loteCreate)
                resultIdLote = saveLote
            }

            const newLoteDetalle = new LoteDetalle()
            newLoteDetalle.Barcode = producto.Barcode
            newLoteDetalle.IdProducto = saveProduct.Id
            newLoteDetalle.Unidades = producto.Bultos
            newLoteDetalle.Descripcion = saveProduct.Nombre
            newLoteDetalle.IdPosicion = 7481
            newLoteDetalle.Lote = producto.BoxNumber
            newLoteDetalle.Embarque = producto.DeliveryBatch
            newLoteDetalle.IdEmpresa = producto.IdEmpresa
            const loteDetalleCreate = getRepository(LoteDetalle).create(newLoteDetalle)
            const saveLoteDetalle = await getRepository(LoteDetalle).save(loteDetalleCreate)
            resultIdLoteDetalle = saveLoteDetalle
            if(saveProduct){
                return {status: true, data: producto}
            }           
        } catch (error){
            if(saveProduct){
                getRepository(Producto).delete(saveProduct.Id)
            }

            if(loteExist){
                getRepository(Lote).delete(loteExist.Id)
            } else if (resultIdLote != null){
                getRepository(Lote).delete(resultIdLote.Id)
            }
            if(resultIdLoteDetalle != null){
                getRepository(LoteDetalle).delete(resultIdLoteDetalle.Id)
            }
            return {status: false, data: `Error al dar de alta el producto`}
        }

       
    } else {
        try{
            loteExist = await getRepository(Lote).findOne({where: {Lote: producto.BoxNumber, IdEmpresa: productExist.IdEmpresa, Embarque: producto.DeliveryBatch}})
            if(!loteExist){
                const newLote = new Lote()
                newLote.Embarque = producto.DeliveryBatch
                newLote.Lote = producto.BoxNumber
                newLote.IdEmpresa = producto.IdEmpresa
                const loteCreate = getRepository(Lote).create(newLote)
                const loteResult = await getRepository(Lote).save(loteCreate)
                resultIdLote = loteResult
            }
            
            const loteDetalleExist = await getRepository(LoteDetalle).findOne({where: {Lote: producto.BoxNumber, IdEmpresa: productExist.IdEmpresa, Embarque: producto.DeliveryBatch, IdProducto: productExist.Id}})

            if(loteDetalleExist){
                resultIdLote = loteDetalleExist
                loteDetalleExist.Unidades += producto.Bultos
                await getRepository(LoteDetalle).update({Id: loteDetalleExist.Id}, {Unidades: loteDetalleExist.Unidades})
            } else {
                const newLoteDetalle = new LoteDetalle()
                newLoteDetalle.Barcode = producto.Barcode
                newLoteDetalle.IdProducto = productExist.Id
                newLoteDetalle.Unidades = producto.Bultos
                newLoteDetalle.Descripcion = productExist.Nombre
                newLoteDetalle.IdPosicion = 7481
                newLoteDetalle.Lote = producto.BoxNumber
                newLoteDetalle.Embarque = producto.DeliveryBatch
                newLoteDetalle.IdEmpresa = productExist.IdEmpresa
                const loteDetalleCreate = getRepository(LoteDetalle).create(newLoteDetalle)
                const loteDetalleResult = await getRepository(LoteDetalle).save(loteDetalleCreate)
                resultIdLoteDetalle = loteDetalleResult
            }
            
            return {status: true, data: producto}

        } catch (error){            
            if(loteExist){
                getRepository(Lote).update({Id: loteExist.Id}, {Unidades: loteExist.Unidades})
            } else if (resultIdLote != null){
                getRepository(Lote).delete(resultIdLote.Id)  
            }
            
            if(resultIdLoteDetalle != null){
                getRepository(LoteDetalle).delete(resultIdLoteDetalle.Id)
            }
            
            return {status: false, data: `Error al dar de alta el producto`}
        }      
    }         
}

export const producto_getProductos_ById_DALC = async(idProductos:any) => {
    const result = await createQueryBuilder()
    .select()
    .from(Producto, "Producto")
    .where("Producto.Id IN (:...Id)", {Id: idProductos })
    .getRawMany()
    
    return result
}

export const producto_getProductos_ByBarcodeAndIdEmpresa_DALC = async(barcodeProductos:any, idEmpresa:number) => {
    const result = await createQueryBuilder()
    .select()
    .from(Producto, "Producto")
    .where("Producto.Barcode IN (:...barcode)", {barcode: barcodeProductos })
    .andWhere("Producto.IdEmpresa = :id", {id: idEmpresa})
    .getRawMany()
    
    return result
}

export const update_productosPosicionByLoteAndIdPosicion = async(boxNumber: string, idPosicion: number, userName: string) => {
    //Buscamos las posiciones que tengan el Lote y existe sea 0
    
    const result = await getRepository(PosicionProducto).find({where: {Lote: boxNumber, Existe: 0}})
    const ordenesDetalle = await getRepository(OrdenDetalle).find({Lote: boxNumber})
    const idOrdenesDetalle = []
    if(ordenesDetalle.length > 0){
        for(const ordenDetalle of ordenesDetalle){     
            const ordenes = await getRepository(Orden).find({Estado: 1,IdEmpresa: result[0].IdEmpresa, Id:ordenDetalle.IdOrden})
            if(ordenes.length > 0){
                idOrdenesDetalle.push(ordenDetalle)
            }
        }
    }

    let productosCargados = []
    let posicionesNuevas = []
    if(result.length > 0){
        productosCargados.push(" ")
        // Recorremos todos los productos que tengan ese Lote
        for(const cadaLote of result.reverse()){
            if(!productosCargados.includes(cadaLote.IdProducto.toString())){
                productosCargados.push(cadaLote.IdProducto.toString())
                
                // Por cada producto calculamos el stock que hay en la posicion
                const resDet=await getRepository(PosicionProducto)
                .createQueryBuilder()
                .select("posicionId, sum(unidades * if(existe, -1, 1)) as total")
                .where("productId = :idProducto", {idProducto : cadaLote.IdProducto})
                .andWhere("lote = :lote", {lote: cadaLote.Lote})
                .groupBy("posicionId")
                .having("total<>0")
                .getRawMany()
                
                let idPosicionOriginal=""
                let total = ""
                for(const dato of resDet){
                    idPosicionOriginal = dato.posicionId
                    total = dato.total
                }
                if(idPosicion == parseInt(idPosicionOriginal)){
                    posicionesNuevas.push({lote: cadaLote.Lote,unidades: "", IdProducto: cadaLote.IdProducto, status:"ERROR",posicion: " ",mensaje:"Ya se encuentra en la posicion"})
                }else if(!total){
                    posicionesNuevas.push({lote: cadaLote.Lote,unidades: "", IdProducto: cadaLote.IdProducto, status:"ERROR",posicion: " ",mensaje: "No hay stock posicionado"})
                }else{
                    // Ahora desposicionamos ese stock para volver a posicionar en la posicion nueva
                    const quitarPosicion=new PosicionProducto()
                    quitarPosicion.IdEmpresa=cadaLote.IdEmpresa
                    quitarPosicion.IdPosicion=cadaLote.IdPosicion
                    quitarPosicion.IdProducto=cadaLote.IdProducto
                    quitarPosicion.Unidades= parseInt(total)
                    quitarPosicion.removed= new Date()
                    quitarPosicion.Existe=1
                    quitarPosicion.Lote= cadaLote.Lote
                    quitarPosicion.Embarque= cadaLote.Embarque
                    quitarPosicion.UsuarioNombre= userName

                    const registroQuitarPosicion=getRepository(PosicionProducto).create(quitarPosicion)
                    await getRepository(PosicionProducto).save(registroQuitarPosicion)
                    const saveHistorico = await producto_SaveHistoricoDePosicion_DALC(cadaLote.IdProducto, cadaLote.IdEmpresa, cadaLote.IdPosicion, resDet[0].total, "", userName)
                    //Creamos una nueva posicion con el Id de la posicion nueva
                    const entradaAPosicion=new PosicionProducto()
                    entradaAPosicion.IdEmpresa=cadaLote.IdEmpresa
                    entradaAPosicion.IdPosicion=idPosicion
                    entradaAPosicion.IdProducto=cadaLote.IdProducto
                    entradaAPosicion.Unidades=parseInt(total)
                    entradaAPosicion.asigned= new Date()
                    entradaAPosicion.Existe=0
                    entradaAPosicion.Lote= cadaLote.Lote
                    entradaAPosicion.Embarque= cadaLote.Embarque
                    entradaAPosicion.UsuarioNombre= userName

                    const registroEntrada=getRepository(PosicionProducto).create(entradaAPosicion)
                    try{
                        const registroExitoso = await getRepository(PosicionProducto).save(registroEntrada)
                        posicionesNuevas.push(registroExitoso)
                        
                        if(posicionesNuevas.length > 0){
                            for(const ordenDetalle of idOrdenesDetalle){
                                const result=await getRepository(PosicionEnOrdenDetalle).update({IdProducto: cadaLote.IdProducto, IdOrdenDetalle: ordenDetalle.Id},{IdPosicion: idPosicion})
                            }
                            const result=await getRepository(LoteDetalle).update({IdProducto: cadaLote.IdProducto, Lote: cadaLote.Lote},{IdPosicion: idPosicion})
                        }
                    } catch(error){
                        console.log(error)
                    }
                }
            }
        }
    }else{
        posicionesNuevas.push({lote: boxNumber,unidades: "", IdProducto: " ", status:"ERROR",posicion: " ",mensaje: "El Boxnumber no existe"})
    }
    return posicionesNuevas
}


export const productos_deleteByTienda_DALC = async(idTienda:number) => {
    // const results = await getRepository(Orden).delete(idOrden)
    const results = await getRepository(Producto)
        .createQueryBuilder()
        .delete()
        .from("productos")
        .where("IdEmpresa = :idTienda", {idTienda})
        .execute()
    return
}

export const productos_deleteById_DALC = async(id: number) => {
    const results = await getRepository(Producto)
        .createQueryBuilder()
        .delete()
        .from("productos")
        .where("Id = :id", {id})
        .execute()
    return
}

export const producto_getStock_ByIdAndIdEmpresa_DALC = async(idProducto:any) => {
    const unArticulo = await getRepository(Stock).findOne({where: {Producto: idProducto}})
    return unArticulo
}

export const producto_getStock_ByIdAndEmpresa_DALC = async(idProducto:any, idEmpresa:any) => {
    const unArticulo = await getRepository(Stock).findOne({where: {Producto: idProducto, Empresa: idEmpresa}})
    return unArticulo
}

export const stock_editOne_DALC = async (articuloOriginal: Stock, body: any) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    const result=await getRepository(Stock).update(String(articuloOriginal.Id) , datosAGuardar)
    
    return result
    
}

export const partida_editOne_DALC = async (articuloOriginal: Partida, body: any) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    const result=await getRepository(Partida).update(String(articuloOriginal.Id) , datosAGuardar)
    return result
    
}

export const getAllLotes_DALC = async (idEmpresa: number) => {
    const result=await getRepository(Lote).find({where: {IdEmpresa : idEmpresa, Ingreso: true}})
    
    for (const unResultado of result){
        unResultado.Stock = unResultado.Unidades
        unResultado.StockDisponible = unResultado.StockDisponible == null ? unResultado.Unidades : 0
        unResultado.StockComprometido =  unResultado.StockComprometido == null ? 0 : unResultado.StockComprometido
        
        const resultLoteDetalle = await getRepository(LoteDetalle).find({where: {IdEmpresa : idEmpresa, Ingreso: true, Lote: unResultado.Lote}})
        
        for (const loteDetalle of resultLoteDetalle){
            const producto = await getRepository(Producto).findOne({where: {Id: loteDetalle.IdProducto}})
            
            if(typeof unResultado.SerialNumber == "undefined"){
                unResultado.SerialNumber = loteDetalle.Barcode 
                if(producto){
                    unResultado.PartNumber = producto.CodeEmpresa 
                }
            } else {
                unResultado.SerialNumber += " - " + loteDetalle.Barcode
                if(producto){
                    unResultado.PartNumber += " - " + producto.CodeEmpresa 
                } 
            }

            const orderDetalle = await createQueryBuilder("orderdetalle", "det")
                .select("posOrd.cantidad")
                .innerJoin("ordenes", "ord", "det.ordenId = ord.id")
                .innerJoin("posiciones_por_orderdetalle", "posOrd", "det.id = posOrd.id_orderdetalle")
                .where("ord.empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
                .andWhere("det.productid = :idProducto", {idProducto: loteDetalle.IdProducto})
                .andWhere("det.lote = :lote", {lote: unResultado.Lote})
                .andWhere("ord.estado = 1")
                .execute()
                
                // if(orderDetalle){
                //     for(const ordDetalle of orderDetalle){
                //         const posOrd = await createQueryBuilder("posiciones_por_orderdetalle", "posOrd")
                //             .select("posOrd.cantidad")
                //             // .where("posOrd.id_producto = :idProducto", {idProducto: loteDetalle.IdProducto})
                //             // .andWhere("posOrd.id_empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
                //             .where("posOrd.id_orderdetalle = :idOrderdetalle", {idOrderdetalle: ordDetalle.id})
                //             .getRawOne()
                    
                //     }
                // }
                for(const comprometidoPorOrden of orderDetalle){
                    unResultado.StockComprometido += (comprometidoPorOrden && typeof comprometidoPorOrden.cantidad !== "undefined" ? comprometidoPorOrden.cantidad : 0)                            
                }
            }
        unResultado.StockDisponible -=  unResultado.StockComprometido
    }
    return result 
}

export const getAllLotesSoloDetalle_DALC = async (idEmpresa: number) => {
    const result = await getRepository(Lote)
    .createQueryBuilder('l') 
    .select("l.id as Id, l.lote as Lote, l.unidades as Unidades, l.embarque as Embarque")
    .addSelect("JSON_ARRAYAGG(JSON_OBJECT('barcode', ld.barcode, 'lote', ld.lote, 'codeEmpresa', p.codeEmpresa, 'productoNombre', p.descripcion, 'ingreso', ld.ingreso)) AS LoteDetalle")
    .innerJoin("lote_detalle", "ld", "l.lote = ld.lote")
    .innerJoin("productos", "p", "p.id = ld.idProducto")
    .where("l.idEmpresa = :idEmpresa", { idEmpresa: idEmpresa })
    .andWhere("l.ingreso = true")
    .groupBy("l.id") 
    .execute();

    for (const unResultado of result){

        const loteDetalle = JSON.parse(unResultado.LoteDetalle)
        
        for (const detalle of loteDetalle){  
            if(typeof unResultado.SerialNumber == "undefined"){
                unResultado.SerialNumber = detalle.barcode               
                unResultado.PartNumber = detalle.codeEmpresa 
            } else {
                unResultado.SerialNumber += " - " + detalle.barcode
                unResultado.PartNumber += " - " + detalle.codeEmpresa 
            }
        }
    }
    return result 
}

export const getAllLotesV2_DALC = async (idEmpresa: number) => {
    const result = await getRepository(Lote)
        .createQueryBuilder('l') 
        .select("l.id as Id, l.lote as Lote, l.unidades as Unidades, l.embarque as Embarque")
        .addSelect("JSON_ARRAYAGG(JSON_OBJECT('barcode', ld.barcode, 'lote', ld.lote, 'unidades', ld.unidades, 'codeEmpresa', p.codeEmpresa, 'posicion', pos.descripcion, 'productoNombre', p.descripcion, 'ingreso', ld.ingreso)) AS LoteDetalle")
        .innerJoin("lote_detalle", "ld", "l.lote = ld.lote")
        .innerJoin("productos", "p", "p.id = ld.idProducto")
        .innerJoin("posiciones", "pos", "pos.id = ld.idPosicion")
        .where("l.idEmpresa = :idEmpresa", { idEmpresa: idEmpresa })
        .andWhere("l.ingreso = true")
        .andWhere("l.unidades <> 0")
        .andWhere("ld.unidades <> 0")
        .groupBy("l.id") 
        .execute();
    
    // Traemos todas las ordenes con estado 1
    const orderDetalle = await getRepository(OrdenDetalle)
        .createQueryBuilder('det') 
        .select("det.lote, SUM(det.unidades) as unidades")
        .innerJoin("ordenes", "orden", "orden.id = det.ordenId")
        .where("orden.empresa = :idEmpresa", { idEmpresa: idEmpresa })
        .andWhere("orden.estado = 1")
        .groupBy("det.lote")
        .getRawMany();

    // iteramos el resultado para buscar el comprometido por cada orden
    for(const unResultado of result){
        for(const detalle of orderDetalle){
            if(detalle.lote == unResultado.Lote){
                unResultado.StockComprometido = parseInt(detalle.unidades)
            }
        }
    }
    
    // iteramos el resultado para agregar el SerialNumber y el PartNumber
    for (const unResultado of result){
        unResultado.StockSinPosicionar = 0
        unResultado.StockPosicionado = 0
        unResultado.Stock = unResultado.Unidades
        unResultado.StockDisponible =  unResultado.Unidades - (unResultado.StockComprometido ? unResultado.StockComprometido : 0)

        const loteDetalle = JSON.parse(unResultado.LoteDetalle)
        
        for (const detalle of loteDetalle){  
            if(typeof unResultado.SerialNumber == "undefined"){
                unResultado.SerialNumber = detalle.barcode               
                unResultado.PartNumber = detalle.codeEmpresa 
            } else {
                unResultado.SerialNumber += " - " + detalle.barcode
                unResultado.PartNumber += " - " + detalle.codeEmpresa 
            }

            if(detalle.posicion == "PISO CD" && detalle.ingreso == 1){
                unResultado.StockSinPosicionar += parseInt(detalle.unidades)
            } else if(detalle.ingreso == 1){
                unResultado.StockPosicionado += parseInt(detalle.unidades)
            }
        }
    }

    return result 
}

export const getAllLotesStock_DALC = async (idEmpresa: number) => {
    const result = await getRepository(Lote)
        .createQueryBuilder('l') 
        .select("l.id as Id, l.lote as Lote, l.unidades as Unidades, l.embarque as Embarque")
        .addSelect("JSON_ARRAYAGG(JSON_OBJECT('barcode', ld.barcode, 'lote', ld.lote, 'unidades', ld.unidades, 'codeEmpresa', p.codeEmpresa, 'posicion', pos.descripcion, 'productoNombre', p.descripcion, 'ingreso', ld.ingreso)) AS LoteDetalle")
        .innerJoin("lote_detalle", "ld", "l.lote = ld.lote")
        .innerJoin("productos", "p", "p.id = ld.idProducto")
        .innerJoin("posiciones", "pos", "pos.id = ld.idPosicion")
        .where("l.idEmpresa = :idEmpresa", { idEmpresa: idEmpresa })
        .andWhere("l.ingreso = true")
        .groupBy("l.id") 
        .execute();
    
    // Traemos todas las ordenes con estado 1
    const orderDetalle = await getRepository(OrdenDetalle)
        .createQueryBuilder('det') 
        .select("det.lote, SUM(det.unidades) as unidades")
        .innerJoin("ordenes", "orden", "orden.id = det.ordenId")
        .where("orden.empresa = :idEmpresa", { idEmpresa: idEmpresa })
        .andWhere("orden.estado = 1")
        .groupBy("det.lote")
        .getRawMany();

    // iteramos el resultado para buscar el comprometido por cada orden
    for(const unResultado of result){
        for(const detalle of orderDetalle){
            if(detalle.lote == unResultado.Lote){
                unResultado.StockComprometido = parseInt(detalle.unidades)
            }
        }
    }
    
    // iteramos el resultado para agregar el SerialNumber y el PartNumber
    for (const unResultado of result){
        unResultado.StockSinPosicionar = 0
        unResultado.StockPosicionado = 0
        unResultado.Stock = unResultado.Unidades
        unResultado.StockDisponible =  unResultado.Unidades - (unResultado.StockComprometido ? unResultado.StockComprometido : 0)

        const loteDetalle = JSON.parse(unResultado.LoteDetalle)
        
        for (const detalle of loteDetalle){  
            if(typeof unResultado.SerialNumber == "undefined"){
                unResultado.SerialNumber = detalle.barcode               
                unResultado.PartNumber = detalle.codeEmpresa 
            } else {
                unResultado.SerialNumber += " - " + detalle.barcode
                unResultado.PartNumber += " - " + detalle.codeEmpresa 
            }

            if(detalle.posicion == "PISO CD" && detalle.ingreso == 1){
                unResultado.StockSinPosicionar += parseInt(detalle.unidades)
            } else if(detalle.ingreso == 1){
                unResultado.StockPosicionado += parseInt(detalle.unidades)
            }
        }
    }

    return result 
}

export const getLote_DALC = async (idEmpresa: number, lote: string) => {
    const result=await getRepository(Lote).find({where: {IdEmpresa : idEmpresa, Ingreso: true, Lote: lote}})

    for await (const unResultado of result){
        unResultado.Stock = unResultado.Unidades
        unResultado.StockDisponible = unResultado.StockDisponible == null ? unResultado.Unidades : 0
        unResultado.StockComprometido =  unResultado.StockComprometido == null ? 0 : unResultado.StockComprometido

        const resultLoteDetalle = await getRepository(LoteDetalle).find({where: {IdEmpresa : idEmpresa, Lote: unResultado.Lote}})
        
        for await(const loteDetalle of resultLoteDetalle){
            const producto = await getRepository(Producto).findOne({where: {IdEmpresa : idEmpresa, Id: loteDetalle.IdProducto}})
            
            if(typeof unResultado.SerialNumber == "undefined"){
                unResultado.SerialNumber = loteDetalle.Barcode 
                if(producto){
                    unResultado.PartNumber = producto.CodeEmpresa 
                }
            } else {
                unResultado.SerialNumber += " - " + loteDetalle.Barcode
                if(producto){
                    unResultado.PartNumber += " - " + producto.CodeEmpresa 
                } 
            }

            const orderDetalle = await createQueryBuilder("orderdetalle", "det")
                .select("det.productid, det.unidades, det.id, det.lote")
                .innerJoin("ordenes", "ord", "det.ordenId = ord.id")
                .where("ord.empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
                .andWhere("det.productid = :idProducto", {idProducto: loteDetalle.IdProducto})
                .andWhere("det.lote = :lote", {lote: unResultado.Lote})
                .andWhere("ord.estado = 1")
                .execute()
                
                if(orderDetalle){
                    for(const ordDetalle of orderDetalle){
                        const posOrd = await createQueryBuilder("posiciones_por_orderdetalle", "posOrd")
                            .select("posOrd.id_posicion, posOrd.id_orderdetalle, posOrd.id_producto, posOrd.cantidad")
                            .where("posOrd.id_producto = :idProducto", {idProducto: ordDetalle.productid})
                            .andWhere("posOrd.id_empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
                            .andWhere("posOrd.id_orderdetalle = :idOrderdetalle", {idOrderdetalle: ordDetalle.id})
                            .getRawOne()
        
                            
                        unResultado.StockComprometido += (posOrd && typeof posOrd.cantidad !== "undefined" ? posOrd.cantidad : 0)                            
                    }
                }
            }
            unResultado.StockDisponible -=  unResultado.StockComprometido
    }
    return result 
}

export const getAllLotesDetalle_DALC = async (idEmpresa: number) => {
    const result=await getRepository(LoteDetalle).find({where: {IdEmpresa : idEmpresa, Ingreso: true}, relations: ["Producto"]})

    for await (const unResultado of result){
        const totalComprometido=await createQueryBuilder("orderdetalle", "det")
            .select("sum(unidades) as total")
            .innerJoin("ordenes", "ord", "det.ordenId = ord.Id")
            .where("det.productId = :idProducto", {idProducto: unResultado.IdProducto})
            .andWhere("ord.empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
            .andWhere("ord.estado = 1")
            .getRawOne()

        unResultado.StockDisponible = unResultado.Unidades - (totalComprometido.total == null ? 0 : totalComprometido.total)
        unResultado.StockComprometido = (totalComprometido.total == null ? 0 : totalComprometido.total)
    }
    return result 
}
export const getOnlyLoteDetalle_DALC = async (idEmpresa: number, lote: string) => {

    const result=await getRepository(LoteDetalle).find({where: {IdEmpresa : idEmpresa, Ingreso: true, Lote: lote}, relations: ["Producto"]})

    return result
}

export const getOnlyLote_DALC = async (idEmpresa: number, lote: string) => {
    const result=await getRepository(Lote).findOne({where: {IdEmpresa : idEmpresa, Lote: lote}})

    return result
}

export const getLotesDetalle_DALC = async (idEmpresa: number, lote: string) => {
    let posOrd
    const result=await getRepository(LoteDetalle).find({where: {IdEmpresa : idEmpresa, Ingreso: true, Lote: lote}, relations: ["Producto"]})

    for await (const unResultado of result){
        unResultado.StockDisponible = (unResultado.StockDisponible == null ? 0 : unResultado.StockDisponible) + unResultado.Unidades
        unResultado.StockComprometido =  unResultado.StockComprometido ?? 0
        const orderDetalle=await createQueryBuilder("orderdetalle", "det")
        .select("det.Id, det.lote, det.unidades")
        .innerJoin("ordenes", "ord", "det.ordenId = ord.Id")
        .where("det.productId = :idProducto", {idProducto: unResultado.IdProducto})
        .andWhere("ord.empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
        .andWhere("det.lote = :lote", {lote: unResultado.Lote})
        .andWhere("ord.estado = 1")
        .execute()
        
        const unidadesPosicion = await createQueryBuilder("pos_prod", "pos")
        .select("pos.lote as lote, sum(pos.unidades * if(pos.existe, -1, 1)) as totalUnidades, pos.productId as idProducto, pos.posicionId as posProdPosicionId")
        .where("pos.productId = :idProducto", {idProducto: unResultado.IdProducto})
        // .andWhere("pos.posicionId = :posicionId", {posicionId: unResultado.IdPosicion})
        .andWhere("pos.lote = :lote", {lote: unResultado.Lote})
        .getRawOne()
        
        if(orderDetalle){
            for(const ordDetalle of orderDetalle){

                posOrd = await createQueryBuilder("posiciones_por_orderdetalle", "posOrd")
                    .select("posOrd.id_posicion, posOrd.id_orderdetalle, posOrd.id_producto, posOrd.cantidad")
                    .where("posOrd.id_producto = :idProducto", {idProducto: unResultado.IdProducto})
                    .andWhere("posOrd.id_empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
                    .andWhere("posOrd.id_orderdetalle = :idOrderdetalle", {idOrderdetalle: ordDetalle.Id})
                    .getRawOne()
    
                unResultado.StockComprometido += (posOrd && typeof posOrd.cantidad !== "undefined" ? posOrd.cantidad : 0)
            }
        }
        
        unResultado.PartNumber = unResultado.Producto.CodeEmpresa
        //unResultado.PosProdPosicionId = unidadesPosicion.posProdPosicionId
        //console.log(unidadesPosicion)
        unResultado.StockDisponible = parseInt(unidadesPosicion.totalUnidades) - unResultado.StockComprometido
    }
    return result 
}

export const getLotesDetalleV2_DALC = async (idEmpresa: number, lote: string) => {
    const result=await getRepository(LoteDetalle).find({where: {IdEmpresa : idEmpresa, Ingreso: true, Lote: lote}, relations: ["Producto"]})

    const orderDetalle = await getRepository(OrdenDetalle)
    .createQueryBuilder('det') 
    .select("det.lote, SUM(det.unidades) as unidades, det.productid as idProducto")
    .innerJoin("ordenes", "orden", "orden.id = det.ordenId")
    .where("orden.empresa = :idEmpresa", { idEmpresa: idEmpresa })
    .andWhere("orden.estado = 1")
    .andWhere("det.lote = :lote", {lote})
    .groupBy("det.productid")
    .getRawMany();

    for(const unResultado of result){
        unResultado.PartNumber = unResultado.Producto.CodeEmpresa
        unResultado.Stock = unResultado.Unidades
        unResultado.StockDisponible = unResultado.Unidades

        for(const detalle of orderDetalle){
            if(detalle.idProducto == unResultado.IdProducto){
                unResultado.StockComprometido = parseInt(detalle.unidades)
                continue
            }
        }

        unResultado.StockDisponible -= ( unResultado.StockComprometido) ? unResultado.StockComprometido : 0    
    }

    return result 
}

export const getLoteDetalleProducto_DALC = async (idEmpresa: number, lote: string, idProducto: number) => {
    let posOrd
    const result=await getRepository(LoteDetalle).find({where: {IdEmpresa : idEmpresa, IdProducto:idProducto, Ingreso: true, Lote: lote}, relations: ["Producto"]})

    for await (const unResultado of result){
        unResultado.StockDisponible = (unResultado.StockDisponible == null ? 0 : unResultado.StockDisponible) + unResultado.Unidades
        unResultado.StockComprometido =  unResultado.StockComprometido ?? 0
        const orderDetalle=await createQueryBuilder("orderdetalle", "det")
        .select("det.Id, det.lote, det.unidades")
        .innerJoin("ordenes", "ord", "det.ordenId = ord.Id")
        .where("det.productId = :idProducto", {idProducto: unResultado.IdProducto})
        .andWhere("ord.empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
        .andWhere("det.lote = :lote", {lote: unResultado.Lote})
        .andWhere("ord.estado = 1")
        .execute()
        
        const unidadesPosicion = await createQueryBuilder("pos_prod", "pos")
        .select("pos.lote as lote, sum(pos.unidades * if(pos.existe, -1, 1)) as totalUnidades, pos.productId as idProducto, pos.posicionId as posProdPosicionId")
        .where("pos.productId = :idProducto", {idProducto: unResultado.IdProducto})
        // .andWhere("pos.posicionId = :posicionId", {posicionId: unResultado.IdPosicion})
        .andWhere("pos.lote = :lote", {lote: unResultado.Lote})
        .getRawOne()
        
        if(orderDetalle){
            for(const ordDetalle of orderDetalle){

                posOrd = await createQueryBuilder("posiciones_por_orderdetalle", "posOrd")
                    .select("posOrd.id_posicion, posOrd.id_orderdetalle, posOrd.id_producto, posOrd.cantidad")
                    .where("posOrd.id_producto = :idProducto", {idProducto: unResultado.IdProducto})
                    .andWhere("posOrd.id_empresa = :idEmpresa", {idEmpresa: unResultado.IdEmpresa})
                    .andWhere("posOrd.id_orderdetalle = :idOrderdetalle", {idOrderdetalle: ordDetalle.Id})
                    .getRawOne()
    
                unResultado.StockComprometido += (posOrd && typeof posOrd.cantidad !== "undefined" ? posOrd.cantidad : 0)
            }
        }
        
        unResultado.PartNumber = unResultado.Producto.CodeEmpresa
        //unResultado.PosProdPosicionId = unidadesPosicion.posProdPosicionId
        //console.log(unidadesPosicion)
        unResultado.StockDisponible = parseInt(unidadesPosicion.totalUnidades) - unResultado.StockComprometido
    }
    return result 
}