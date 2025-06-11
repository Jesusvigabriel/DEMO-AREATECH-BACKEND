import {Request, Response} from "express"
import { Stock } from '../entities/Stock';
import {empresa_getById_DALC} from '../DALC/empresas.dalc'

import {
    producto_getPosiciones_byIdProducto_Lote_DALC,
    producto_moverDePosicion_DALC,
    productos_getAll_ByEmpresa_DALC,
    producto_getByBarcodeAndEmpresa_DALC,
    producto_getByIdAndEmpresa_DALC,
    producto_getPosiciones_byIdProducto_DALC,
    productos_getId_byBarcodes_DALC,
    producto_desposicionar_DALC,
    producto_posicionar_DALC,
    producto_getById_DALC,
    producto_getStock_ByIdAndIdEmpresa_DALC,
    stock_editOne_DALC,
    productos_deleteById_DALC,
    producto_edit_ByProducto_DALC,
    producto_add_DALC,
    getAllLotesSoloDetalle_DALC,
    producto_SaveHistoricoDePosicion_DALC,
    reposicionar_producto_excel_DALC,
    productos_getAll_ByEmpresaOptimizado_DALC,
    producto_getStock_ByIdAndEmpresa_DALC,
    productoLOTE_add_DALC,
    getAllLotes_DALC,
    getAllLotesDetalle_DALC,
    lote_getByBarcodeAndEmpresa_DALC,
    putLote_ByBarcodeAndEmpresa_DALC,
    getLotesDetalle_DALC,
    update_productosPosicionByLoteAndIdPosicion,
    getLoteDetalleProducto_DALC,
    getLote_DALC,
    getOnlyLoteDetalle_DALC,
    getOnlyLote_DALC,
    getAllLotesV2_DALC,
    getComprometidoLote_DALC,
    getLotesDetalleV2_DALC,
    getAllLotesStock_DALC,
    productoPART_add_DALC,
    getProductoByPartidaAndEmpresaAndProducto_DALC,
    partida_editOneUnidades_DALC,
    getAllPartidasByEmpresa_DALC,
    getAllProductoByPartidaAndEmpresaAndProductoV2_DALC,
    getProductoByPartidaAndEmpresaAndProductoV2_DALC,
    reposicionar_partida_excel_DALC,
    producto_getByCodeEmpresaAndEmpresa_DALC
} from "../DALC/productos.dalc"

import {
    posicion_getById_DALC,
    posicion_getByNombre_DALC,
    posicion_getContent_ByIdPosicion_DALC,
    posicion_vaciar_DALC,
} from "../DALC/posiciones.dalc"
import { Producto } from "../entities/Producto";
import { Any } from "typeorm";



export const set_posicionar = async (req: Request, res: Response): Promise <Response> => {

    if (isNaN(parseInt(req.params.cantidadAPosicionar))) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a posicionar inválida"))
    }

    if (parseInt(req.params.cantidadAPosicionar)<=0) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a posicionar debe ser positiva"))
    }

    const posicion=await posicion_getById_DALC(parseInt(req.params.idPosicion))
    if (posicion===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición inexistente"))
    }

    const producto=await producto_getByIdAndEmpresa_DALC(parseInt(req.params.idProducto),parseInt(req.params.idEmpresa))
    if (producto===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }
    
    if(producto){
        if (producto.StockSinPosicionar < parseInt(req.params.cantidadAPosicionar)) {
            const mensaje = "El producto tiene " + producto.StockSinPosicionar + " stock sin posicionar, intentas posicionar: " + parseInt(req.params.cantidadAPosicionar)
            return res.json(require("lsi-util-node/API").getFormatedResponse("", mensaje))
        }
    }

    const result=await producto_posicionar_DALC(producto!, posicion!, parseInt(req.params.cantidadAPosicionar),parseInt(req.params.idEmpresa))

    if (result.status==="OK") {
        return res.json(require("lsi-util-node/API").getFormatedResponse("OK"))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result.error))
    }
    
}

//Reposicionamiento Mediante Excel Solo para Stock Unitario
export const set_posicionar_excel = async (req: Request, res: Response): Promise <Response> => {
    if (isNaN(parseInt(req.params.cantidadAPosicionar))) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a posicionar inválida"))
    }

    if (parseInt(req.params.cantidadAPosicionar)<=0) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a posicionar debe ser positiva"))
    }

    const posicion=await posicion_getById_DALC(parseInt(req.params.idPosicion))
    if (posicion===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición inexistente"))
    }
    
    const producto=await producto_getByIdAndEmpresa_DALC(parseInt(req.params.idProducto),parseInt(req.params.idEmpresa))
    if (producto===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }
    const result=await reposicionar_producto_excel_DALC(producto!, posicion!, parseInt(req.params.cantidadAPosicionar),req.params.usuario)

    if (result.status==="OK") {
        return res.json(require("lsi-util-node/API").getFormatedResponse("OK"))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result.error))
    }
    
}
export const reposicionamientoExcelMasivo = async (req: Request, res: Response): Promise <Response> => {
    console.log(req.params)
    const loteNulo=""
    const embarqueNulo=""
    //verificamos que origen y destino no sean el mismo
    if (req.params.posicionOrigen==req.params.posicionDestino) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Posición de destino no puede ser igual a posición de origen"))
    }
    //verificamos y conseguimos datos de posicion origen
    const posicionOrigen=await posicion_getByNombre_DALC(req.params.posicionOrigen)
    if (posicionOrigen==null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición de origen inexistente"))
    }
    //verificamos y conseguimos datos de posicion destino
    const posicionDestino=await posicion_getByNombre_DALC(req.params.posicionDestino)
    if (posicionDestino==null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición de destino inexistente"))
    }
    const respuestas=[]
    const unProducto = req.params.barcodeProducto
    //revisa que este en esa posicion
    const posicionesDelArticulo=await producto_getPosiciones_byIdProducto_DALC(parseInt(req.params.idProducto))
    const posicionDeOrigenDelArticulo=posicionesDelArticulo.filter(e=>e.idPosicion==posicionOrigen.Id)[0]
    if(typeof posicionDeOrigenDelArticulo == "undefined"){
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "la posición de origen no coincide con la posición física"))
    }else{
        if(posicionDeOrigenDelArticulo.unidades< parseInt(req.params.cantidadAPosicionar)){
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Esta intentando desposicionar mas cantidad de la disponible"))
        } else {
            const result=await producto_moverDePosicion_DALC(parseInt(req.params.idProducto), parseInt(req.params.idEmpresa), posicionOrigen.Id, posicionDestino.Id, parseInt(req.params.cantidadAPosicionar), loteNulo, embarqueNulo,req.body.usuario)
            respuestas.push({unProducto, result})
            const historico =  await producto_SaveHistoricoDePosicion_DALC(parseInt(req.params.idProducto), parseInt(req.params.idEmpresa), posicionOrigen.Id, parseInt(req.params.cantidadAPosicionar), loteNulo, req.body.usuario)
        }
    }
    
    return res.json(require("lsi-util-node/API").getFormatedResponse(respuestas))
}


export const set_posicionar_excel_partida = async (req: Request, res: Response): Promise <Response> => {
    if (isNaN(parseInt(req.params.cantidadAPosicionar))) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a posicionar inválida"))
    }
    if (parseInt(req.params.cantidadAPosicionar)<=0) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a posicionar debe ser positiva"))
    }

    const posicion=await posicion_getById_DALC(parseInt(req.params.idPosicion))
    if (posicion===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición inexistente"))
    }
    
    const producto=await getProductoByPartidaAndEmpresaAndProducto_DALC(parseInt(req.params.idEmpresa), req.params.Partida, req.params.barcode)
    if (producto===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }
    const partida = producto[0]
    const result=await reposicionar_partida_excel_DALC(partida!, posicion!, parseInt(req.params.cantidadAPosicionar),req.params.usuario)

    if (result.status==="OK") {
        return res.json(require("lsi-util-node/API").getFormatedResponse("OK"))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result.error))
    }
    
}

export const set_desposicionar = async (req: Request, res: Response): Promise <Response> => {

    if (isNaN(parseInt(req.params.cantidadADesposicionar))) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a desposicionar inválida"))
    }

    if (parseInt(req.params.cantidadADesposicionar)<=0) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Cantidad a desposicionar debe ser positiva"))
    }

    const posicion=await posicion_getById_DALC(parseInt(req.params.idPosicion))
    if (posicion===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición inexistente"))
    }

    const producto=await producto_getById_DALC(parseInt(req.params.idProducto))
    if (producto===null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }

    const result=await producto_desposicionar_DALC(producto!, posicion!, parseInt(req.params.cantidadADesposicionar), "")

    if (result.status==="OK") {
        return res.json(require("lsi-util-node/API").getFormatedResponse("OK"))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result.error))
    }
    
}



export const get_Varios_ByBarcodesAndEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const lsiValidators=require("lsi-util-node/validators")
    const missingParameters=lsiValidators.requestParamsFilled(req.body, ["barcodes"])
    if (missingParameters.length>0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {missingParameters}))
    }
    const results=await productos_getId_byBarcodes_DALC(parseInt(req.params.idEmpresa), req.body.barcodes)
    if (results!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(results))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Productos inexistentes"))
    }

}

export const reposicionamiento = async (req: Request, res: Response): Promise <Response> => {
    
    const loteNulo=""
    const embarqueNulo=""
    const lsiValidators=require("lsi-util-node/validators")
    const missingParameters=lsiValidators.requestParamsFilled(req.body, ["posicionOrigen", "posicionDestino", "vaciarPosicionOrigen", "articulos"])
    if (missingParameters.length>0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {missingParameters}))
    }

    if (req.body.posicionOrigen==req.body.posicionDestino) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Posición de destino no puede ser igual a posición de origen"))
    }
    const posicionOrigen=await posicion_getByNombre_DALC(req.body.posicionOrigen)
    if (posicionOrigen==null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición de origen inexistente"))
    }
    const posicionDestino=await posicion_getByNombre_DALC(req.body.posicionDestino)
    if (posicionDestino==null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Posición de destino inexistente"))
    }
    const respuestas=[]
    //Obtengo los datos de la empresa
    const empresa = await empresa_getById_DALC(req.body.articulos[0].IdEmpresa)
    for (const unProducto of req.body.articulos) {
        const posicionesDelArticulo=await producto_getPosiciones_byIdProducto_DALC(unProducto.Id)
        const posicionDeOrigenDelArticulo=posicionesDelArticulo.filter(e=>e.idPosicion==posicionOrigen.Id)[0]

        if(typeof posicionDeOrigenDelArticulo == "undefined"){
            //return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error: la posición de origen no coincide con la posición física"))
            respuestas.push({unProducto, result: {status: "la posición de origen no coincide con la posición física"}})
        }else{
        if (!empresa.ClienteTextil) {
            //console.log("NO es textil. Unidades: " + posicionDeOrigenDelArticulo.unidades)
        }
        else {
            posicionDeOrigenDelArticulo.unidades === 1
            //console.log("Es textil. Unidades: " + posicionDeOrigenDelArticulo.unidades)
        }
        if (typeof posicionDeOrigenDelArticulo=="undefined") {
            respuestas.push({unProducto, result: {status: "No hay unidades en el origen"}})
        }else if(posicionDeOrigenDelArticulo.unidades< unProducto.cantidad){
            respuestas.push({unProducto, result: {status: "Esta intentando desposicionar mas cantidad de la disponible"}})
        } else {
            if(empresa.LOTE){
                const result=await producto_moverDePosicion_DALC(unProducto.Id, unProducto.IdEmpresa, posicionOrigen.Id, posicionDestino.Id, unProducto.cantidad, unProducto.lote, unProducto.Embarque,req.body.usuario)
                respuestas.push({unProducto, result})
                const historico =  await producto_SaveHistoricoDePosicion_DALC(unProducto.Id, unProducto.IdEmpresa, posicionOrigen.Id, unProducto.cantidad, unProducto.lote, req.body.usuario)
            }else{
                const result=await producto_moverDePosicion_DALC(unProducto.Id, unProducto.IdEmpresa, posicionOrigen.Id, posicionDestino.Id, unProducto.cantidad, loteNulo, embarqueNulo,req.body.usuario)
                respuestas.push({unProducto, result})
                const historico =  await producto_SaveHistoricoDePosicion_DALC(unProducto.Id, unProducto.IdEmpresa, posicionOrigen.Id, unProducto.cantidad, loteNulo, req.body.usuario)
            }
        }
    }
    }
    if (req.body.vaciarPosicionOrigen) {
        const resultVaciado=await posicion_vaciar_DALC(posicionOrigen.Id)
        respuestas.push(resultVaciado)
    } else {
        respuestas.push({status: "Indicacion de no vaciar"})
    }

    return res.json(require("lsi-util-node/API").getFormatedResponse(respuestas))

}

export const getPosicionesByProductoAndLote= async (req: Request, res: Response): Promise <Response> => {
    const respuesta = await producto_getPosiciones_byIdProducto_Lote_DALC(parseInt(req.params.producto),parseInt(req.params.posicion),req.params.lote)

    return res.json(require("lsi-util-node/API").getFormatedResponse(respuesta))
}

export const getByBarcodeAndEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const unProducto = await producto_getByBarcodeAndEmpresa_DALC(req.params.Barcode, parseInt(req.params.IdEmpresa))

    if (unProducto!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unProducto))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }
}

export const getByCodeEmpresaAndEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const unProducto = await producto_getByCodeEmpresaAndEmpresa_DALC(req.params.Barcode, parseInt(req.params.IdEmpresa))

    if (unProducto!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unProducto))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }
}

export const getLoteByBarcodeAndEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const unLote = await lote_getByBarcodeAndEmpresa_DALC(req.params.Barcode, parseInt(req.params.IdEmpresa))

    if (unLote!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unLote))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Lote inexistente"))
    }
}

export const putLoteByBarcodeAndEmpresa = async (req: Request, res: Response): Promise <Response> => {
    
    const unLote = await putLote_ByBarcodeAndEmpresa_DALC(req.params.Barcode, parseInt(req.params.IdEmpresa), req.params.loteCompleto, req.params.userName, req.params.comprobante, req.params.fecha)

    if (unLote) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unLote))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Ocurrio un error en el ingreso"))
    }
}

export const getByIdAndIdEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const unProducto = await producto_getByIdAndEmpresa_DALC(parseInt(req.params.Id), parseInt(req.params.IdEmpresa))
    
    if (unProducto!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unProducto))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }
}

export const getAllByEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const results=await productos_getAll_ByEmpresa_DALC(parseInt(req.params.IdEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const getAllProductosByEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const results=await productos_getAll_ByEmpresaOptimizado_DALC(parseInt(req.params.IdEmpresa))
    
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const getPosiciones = async (req: Request, res: Response): Promise <Response> => {
    const results=await producto_getPosiciones_byIdProducto_DALC(parseInt(req.params.Id))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const getComprometidoLote = async (req: Request, res: Response): Promise <Response> => {
    const results=await getComprometidoLote_DALC(req.params.Lote, parseInt(req.params.idEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const getAllByIdPosicion = async (req: Request, res: Response): Promise <Response> => {
    const results=await posicion_getContent_ByIdPosicion_DALC(parseInt(req.params.IdPosicion))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const updateUnidadesArticulo =  async (req: Request, res: Response): Promise <Response> =>{
    
    const stock=await producto_getStock_ByIdAndIdEmpresa_DALC(Number(req.params.id))
    if (!stock) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Articulo inexistente"))
    }
    const stockActualizado=await stock_editOne_DALC(stock, req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(stockActualizado))
}


export const updateUnidadesProducto =  async (req: Request, res: Response): Promise <Response> =>{
    
    
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    let stock;
    let stockActualizado
    let nuevoStock = 0
    
    const producto=await producto_getByBarcodeAndEmpresa_DALC(req.params.barcode, Number(req.params.idEmpresa))
    if(producto){
        stock=await producto_getStock_ByIdAndEmpresa_DALC(producto.Id, Number(req.params.idEmpresa))

        if (!stock) {
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Articulo inexistente"))
        }else {
            if(empresa.StockUnitario && stock.Unidades >= 1){
                return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "El producto maneja stock unitario, no puede tener stock mayor a 1"))
            }
        } 
    }

    if(stock){
        nuevoStock = Number(stock.Unidades) + parseInt(req.body.Unidades)
        stockActualizado=await stock_editOne_DALC(stock, {Unidades:nuevoStock})
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(stockActualizado))  
}

export const updateUnidadesPartida =  async (req: Request, res: Response): Promise <Response> =>{
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    let partida;
    let stockActualizado
    let nuevoStock = 0
    
    const producto=await producto_getByBarcodeAndEmpresa_DALC(req.params.barcode, Number(req.params.idEmpresa))
    if(producto){
        partida=await getProductoByPartidaAndEmpresaAndProducto_DALC(Number(req.params.idEmpresa),req.params.partida, req.params.barcode)

        if (!partida) {
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Articulo inexistente"))
        }else {
            if(empresa.StockUnitario && partida.Stock >= 1){
                return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "El producto maneja stock unitario, no puede tener stock mayor a 1"))
            }
        } 
    }

    if(partida){
        nuevoStock = Number(partida[0].Stock) + parseInt(req.body.Stock)
        stockActualizado=await partida_editOneUnidades_DALC(partida[0], {Stock:nuevoStock})
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(stockActualizado))  
}

export const getAllPartidasByIdEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const productosPartida = await getAllPartidasByEmpresa_DALC(parseInt(req.params.idEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(productosPartida))
}

export const getAllPartidas = async (req: Request, res: Response): Promise <Response> => {
    const productosPartida = await getAllProductoByPartidaAndEmpresaAndProductoV2_DALC(parseInt(req.params.idEmpresa))

    return res.json(require("lsi-util-node/API").getFormatedResponse(productosPartida))
}
export const producto_editOne_configuracion = async (req: Request, res: Response): Promise <Response> => {
    const producto=await producto_getById_DALC(Number(req.params.id))
    if (!producto) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Producto inexistente"))
    }

    const result=await producto_edit_ByProducto_DALC(producto, req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}


export const producto_delete_byId = async (req: Request, res: Response): Promise <Response> =>{

    const producto=await producto_getById_DALC(Number(req.params.id))
    if (!producto) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Articulo inexistente"))
    }
    const results=await productos_deleteById_DALC(Number(req.params.id))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const producto_addNew = async (req: Request, res: Response): Promise<Response> => {
    let result 
    const empresa: any = await empresa_getById_DALC(Number(req.body.IdEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    const newProducto=new Producto()

    Object.assign(newProducto, req.body)

    if(empresa.LOTE){
        result=await productoLOTE_add_DALC(newProducto)
    } else if(empresa.PART){
        result=await productoPART_add_DALC(newProducto,req.body.Fecha)
    } else{
        result=await producto_add_DALC(newProducto)
    }
    if (result?.status) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result.data))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result?.data))
    }
}

export const getProductoByPartidaAndEmpresaAndProducto = async (req: Request, res: Response): Promise<Response> => {
    const result = await getProductoByPartidaAndEmpresaAndProducto_DALC(parseInt(req.params.idEmpresa),req.params.partida,req.params.barcode)

    if(result){
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }else{
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }
}

export const getProductoByPartidaAndEmpresaAndBarcode = async (req: Request, res: Response): Promise<Response> => {
    const result = await getProductoByPartidaAndEmpresaAndProducto_DALC(parseInt(req.params.idEmpresa),req.params.partida,req.params.barcode)

    if(result){
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }else{
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }
}

export const getProductoByPartidaAndEmpresaAndProductov2 = async (req: Request, res: Response): Promise<Response> => {
    const result = await getProductoByPartidaAndEmpresaAndProductoV2_DALC(parseInt(req.params.idEmpresa),req.params.partida,parseInt(req.params.idProducto))

    if(result){
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }else{
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }
}

export const getAllLotes = async (req: Request, res: Response): Promise<Response> => {
    
    const result = await getAllLotes_DALC(Number(req.params.idEmpresa))

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }

}

export const getAllLotesV2 = async (req: Request, res: Response): Promise<Response> => {
    
    const result = await getAllLotesV2_DALC(Number(req.params.idEmpresa))

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }

}

export const getAllLotesStock = async (req: Request, res: Response): Promise<Response> => {
    
    const result = await getAllLotesStock_DALC(Number(req.params.idEmpresa))

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }

}

export const getAllLotesSoloDetalle = async (req: Request, res: Response): Promise<Response> => {
    
    const result = await getAllLotesSoloDetalle_DALC(Number(req.params.idEmpresa))

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }

}

export const getLote = async (req: Request, res: Response): Promise<Response> => {

    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    
    const result = await getLote_DALC(empresa.Id, req.params.lote)

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }

}

export const getAllLotesDetalle = async (req: Request, res: Response): Promise<Response> => {
    
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    
    const result = await getAllLotesDetalle_DALC(empresa.Id)

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }

}

export const getLotesDetalle = async (req: Request, res: Response): Promise<Response> => {
    
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    
    const result = await getLotesDetalle_DALC(empresa.Id, req.params.lote)

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }  
}

export const getLotesDetalleV2 = async (req: Request, res: Response): Promise<Response> => {
    
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    
    const result = await getLotesDetalleV2_DALC(empresa.Id, req.params.lote)

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }  
}

export const getOnlyLoteDetalle = async (req: Request, res: Response): Promise<Response> => {
    
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    
    const result = await getOnlyLoteDetalle_DALC(empresa.Id, req.params.lote)

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }  
}

export const getOnlyLote = async (req: Request, res: Response): Promise<Response> => {
    
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    
    const result = await getOnlyLote_DALC(empresa.Id, req.params.lote)

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }  
}

export const getLoteDetalleProducto = async (req: Request, res: Response): Promise<Response> => {
    
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))

    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al elegir la empresa"))
    }
    
    const result = await getLoteDetalleProducto_DALC(empresa.Id, req.params.lote, parseInt(req.params.idProducto))

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }  
}

export const update_posicionByLoteAndIdPosicion = async (req: Request, res: Response): Promise<Response> => {
    const result = await update_productosPosicionByLoteAndIdPosicion(req.params.boxNumber, parseInt(req.params.idPosicion), req.params.userName)
    
    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result))
    }
}


export const repararTextilKatalina = async (req: Request, res: Response): Promise<Response> => {


    // const codigos=['50396816015','50412803004','50426206001','50426212001','50429713007','50429713012','50432423008','50433725004','50437317014','50437412008','50440404006','50440404010','50440404012','50440906006','50440908001','50441115002','50441115013','50441410006','50441410007','50441410008','50442101001','50442101002','50442101003','50442101004','50442101005','50442102002','50442102018','50442110011','50442112016','50442212007','50442902012','50442903001','50442903003','50442903006','50442903015','50443115012','50443115014','50443403002','50443403006','50443403008','50444001002','50444001003','50444003001','50444003002','50444003003','50444003007','50444003015','50444003016','50444012018','50444106013','50444106015','50444211005','50444518002','50444518007','50444518008','50444721002','50445508002','50445508010','50445508015','50445521007','50445521011','50445521017','50445813009','50445813010','50445813012','50446004001','50446004002','50446004004','50446004006','50446004015','50446004018','50446106002','50446106003','50446106004','50446106005','50446106006','50446106007','50446123001','50446123002','50446123003','50446218002','50446218003','50446218004','50446218013','50446604013','50446702010','50446711001','50446715006','50446908009','50447009013','50447318005','50447318010','50447318012','50447318018','50447320001','50447320003','50447320004','50447701001','50447701002','50447811003','50447821002','50447821003','50447821005','50448021001','50448021002','50448021007','50448106007','50448106008','50448106009','50448106010','50448106011','50448106015','50448108001','50448108003','50448108004','50448108005','50448108006','50448516007','50448806016','50448811011','50448816004','50448818009','50449023002','50449023003','50449023005','50449023010','50449023011','50449023014','50449104013','50449104016','50449111020','50449111022','50449111024','50449111025','50449113013','50449113014','50449113015','50449113016','50449116014','50449214014','50449314010','50449314012','50449314013','50449316001','50449316002','50449316003','50449316004','50449316005','50449316006','50449316007','50449316008','50449316009','50449316010','50449316011','50449316012','50449316013','50449322002','50449322003','50449322004','50449322005','50449322006','50449322007','50449322008','50449322009','50449322010','50449322012','50449323001','50449323002','50449323003','50449323004','50449323005','50449323006','50449323007','50449528001','50449528003','50449611001','50449611002','50449611003','50449611004','50449611005','50449611006','50449611007','50449611008','50449611009','50449611010','50449611011','50449611012','50449611013','50449611014','50449611015','50449612002','50449612006','50449612007','50449613001','50449613002','50449613003','50449613004','50449613005','50449613006','50449613007','50449613008','50449613009','50449613010','50449613011','50449613012','50449613013','50449613015','50449622001','50449622002','50449622003','50449622004','50449622005','50449622007','50449622008','50449802003','50449802004','50449802005','50449802006','50449802007','50449802009','50449803001','50449803002','50449803003','50449803004','50449803005','50449803009','50450512006','50450512008','50450512016','50450704011','50450708006','50450809008','50450812008','50450925001','50450925002','50450925003','50450925004','50450925006','50450925013','50450926001','50450926001','50450926002','50450926003','50450926004','50450926005','50450926012','50451008013','50451012006','50451012010','50451012013','50451012014','50451014004','50451014005','50451014026','50451018002','50451018012','50451018018','50451101003','50451112015','50451112017','50451112019','50451112021','50451112022','50451112023','50451115015','50451115016','50451115018','50451115019','50451115020','50451117015','50451118015','50451118017','50451123013','50451201014','50451208006','50451208007','50451208008','50451208009','50451208011','50451208012','50451208014','50451218013','50451218015','50451219014','50451220015','50451221014','50451221016','50451225001','50451225002','50451225003','50451225004','50451225005','50451225006','50451225007','50451225008','50451225009','50451302001','50451302004','50451302006','50451302011','50451302017','50451302018','50451307006','50451307007','50451307008','50451307009','50451404006','50451404007','50451404008','50451404009','50451404010','50451404011','50451404013','50451404017','50451404024','50451409001','50451416006','50451506012','50451509001','50451509008','50451509009','50451509010','50451514014','50451517006','50451517008','50451517009','50451517010','50451517011','50451519001','50451519002','50451519003','50451519004','50451519005','50451519006','50451519007','50451519008','50451519009','50451519010','50451519011','50451519012','50451519014','50451520001','50451520002','50451520003','50451520004','50451520005','50451520006','50451520007','50451520008','50451520009','50451520010','50451520011','50451520013','50451520014','50451520015','50451521002','50451521003','50451521004','50451521005','50451521006','50451521007','50451521008','50451521009','50451521010','50451521011','50451521012','50451521013','50451521014','50451521015','50451523001','50451523002','50451523003','50451523004','50451523005','50451523006','50451523007','50451523008','50451523009','50451523010','50451523011','50451523012','50451523013','50451523014','50451525001','50451525002','50451525003','50451525004','50451525005','50451525006','50451525007','50451525008','50451525009','50451525010','50451525011','50451525012','50451525013','50451525014','50451525015','50451525016','50451526001','50451526002','50451526003','50451526004','50451526005','50451526006','50451526007','50451526008','50451526009','50451526011','50451607001','50451614002','50451615005','50451615006','50451701001','50451701002','50451701003','50451701004','50451701005','50451701006','50451701007','50451701008','50451701009','50451701010','50451713001','50451713013','50451715011','50451721001','50451721002','50451721003','50451721004','50451802001','50451802002','50451802003','50451802004','50451802005','50451802006','50451802007','50451802008','50451802009','50451802010','50451802011','50451802012','50451802014','50451802015','50451804001','50451804002','50451804003','50451804004','50451804005','50451804006','50451804007','50451804008','50451804009','50451804010','50451804011','50451804012','50451804013','50451804014','50452401013','50452401021','50452401022','50452403001','50452404001','50452510009','50452510010','50452510012','50452510013','50452510015','50452512010','50452512016','50452512019','50452515003','50452515006','50452515007','50452515010','50452515011','50452515016','50452515022','50452618001','50452618002','50452618003','50452618004','50452618005','50452618006','50452618007','50452618008','50452618009','50452618010','50452618011','50452618012','50452621001','50452621002','50452621003','50452621004','50452621005','50452621006','50452621007','50452621008','50452621009','50452621010','50452621011','50452621013','50452621014','50452621015','50452623006','50452623008','50452623009','50452623010','50452623012','50452623013','50452623014','50452702012','50452702015','50452710001','50452710008','50452710009','50452710010','50452710011','50452710012','50452710013','50452711001','50452711002','50452711003','50452711004','50452711005','50452711006','50452711007','50452711008','50452711009','50452711010','50452711011','50452711012','50452711013','50452718007','50452718008','50452718009','50452718010','50452718011','50452718012','50452718014','50452720012','50452720013','50452720014','50452720015','50452720016','50452721001','50452721002','50452721003','50452721004','50452721005','50452721006','50452721007','50452721008','50452721009','50452721010','50452721011','50452721012','50452721013','50452721015','50452723001','50452723002','50452723003','50452723004','50452723005','50452723006','50452723007','50452723008','50452723009','50452723010','50452723011','50452723012','50452723013','50452723014','50452915020','50453104023','50453104024','50453211001','50453211002','50453211003','50453211004','50453211005','50453211006','50453211007','50453211008','50453211009','50453211010','50453211011','50453211012','50453211013','50453211015','50453701014','50454307003','50454307008','50454307013','50454307014','50454307015','50454312002','50454312003','50454312004','50454312005','50454312006','50454312007','50454312008','50454312010','50454312011','50454312012','50454312013','50454312014','50454312015','50454520014','50454605001','50454607001','50454701011','50454702014','50454705003','50454707003','50454707008','50454707011','50454714022','50454806001','50454806002','50454806003','50454806004','50454806005','50454806006','50454806007','50454809001','50454809002','50454809003','50454809004','50454809005','50454809006','50454809007','50454809009','50454810001','50454810002','50454810003','50454810004','50454810005','50454810007','50454810008','50454810009','50454810010','50454810011','50454810012','50454810013','50454810014','50454810015','50454813001','50454813002','50454813003','50454819001','50454819002','50454819003','50454819004','50454819005','50454904007','50455001001','50455001002','50455001003','50455001004','50455001005','50455001006','50455001007','50455002015','50455015017','50455020016','50455021009','50455021010','50455021012','50455021014','50455112002','50455113008','50455119014','50455309010','50455309014','50455404007','50455419001','50455419002','50455419003','50455419004','50455419005','50455419006','50455419007','50455419008','50455419009','50455419010','50455419011','50455419012','50455419014','50455421014','50455426001','50455426002','50455501019','50455510027','50455515013','50455621016','50455625014','50455807017','50455809012','50455809013','50455809014','50455809015','50455809016','50455812010','50455812011','50455812012','50455812014','50455813003','50455813004','50455813007','50455813009','50455813010','50455813013','50455813015','50455813016','50455814001','50455814002','50455814003','50455814004','50455814005','50455814006','50455814007','50455814009','50455814010','50455814012','50455814013','50455814014','50455814015','50455820001','50455820002','50455820003','50455820004','50455820005','50455820006','50455820007','50455820008','50455901009','50455901010','50455901011','50455901012','50455901013','50455909003','50455913009','50456002001','50456002010','50456003016','50456007004','50456007009','50456115001','50456115002','50456115003','50456115004','50456115005','50456115006','50456115007','50456115008','50456115009','50456115010','50456115011','50456115012','50456115014','50456115015','50456115016','50456116001','50456116002','50456116003','50456116004','50456202015','50456220004','50456404001','50456404002','50456404003','50456404006','50456404008','50456404009','50456404011','50456404012','50456404013','50456404014','50456404015','50456404016','50456407013','50456411001','50456411003','50456411004','50456411005','50456411006','50456411007','50456411008','50456411010','50456411011','50456411012','50456411013','50456411014','50456411016','50456414001','50456414002','50456414003','50456414004','50456420001','50456420002','50456420003','50456420004','50456420005','50456420006','50456420007','50456420008','50456420009','50456420010','50456420011','50456420012','50456420013','50456420014','50456420015','50456420016','50456504001','50456504002','50456504003','50456504004','50456504005','50456504006','50456504007','50456505001','50456505002','50456505003','50456505004','50456505005','50456505006','50456505007','50456505009','50456505010','50456505011','50456505012','50456505013','50456505014','50456505016','50456505017','50456511006','50456515001','50456515002','50456515003','50456515004','50456515005','50456515006','50456515008','50456515011','50456515012','50456515014','50456515015','50456515016','50456515017','50456515018','50456516003','50456516007','50456516009','50456802001','50456804009','50456804016','50456805001','50456805002','50456805003','50456805004','50456805005','50456805006','50456805007','50456805008','50456805009','50456805010','50456805011','50456805012','50456805014','50456809001','50456809002','50456809003','50456809004','50456809005','50456809006','50456809007','50456809009','50456809010','50456809011','50456809012','50456809014','50456809017','50456810001','50456810002','50456810003','50456810004','50456810005','50456810006','50456810007','50456810008','50456810009','50456810010','50456810011','50456810012','50456810013','50456810014','50456820003','50456820004','50456820005','50456820006','50456820008','50456820010','50457105001','50457105002','50457105003','50457105004','50457105005','50457105006','50457105007','50457105008','50457105009','50457105010','50457105012','50457105013','50457105015','50457105019','50457105020','50457111016','50457111018','50457115001','50457115002','50457115003','50457115004','50457115005','50457115006','50457115007','50457115008','50457115009','50457115010','50457115011','50457115012','50457115013','50457115014','50457115017','50457115018','50457115019','50457118009','50457118018','50457202001','50457202002','50457202003','50457202004','50457202005','50457202006','50457202007','50457202008','50457202009','50457202010','50457202012','50457202013','50457202014','50457202015','50457205002','50457208001','50457208002','50457208003','50457208004','50457208005','50457208006','50457208007','50457208008','50457208009','50457208010','50457208013','50457208014','50457208015','50457209013','50457210001','50457210002','50457210003','50457210004','50457210005','50457210006','50457210008','50457210009','50457210010','50457210011','50457210012','50457210013','50457210014','50457210015','50457215010','50457218001','50457218002','50457218003','50457218004','50457218005','50457218006','50457218008','50457410001','50457410002','50457410003','50457410004','50457410005','50457410006','50457410007','50457410008','50457410009','50457410010','50457410011','50457410013','50457521001','50457521002','50457602002','50457602003','50457602004','50457602005','50457602006','50457602008','50457602009','50457602010','50457707021','50457708018','50457711006','50457712014','50457714017','50457717017','50457718016','50457817019','50457817021','50457910001','50457910002','50457910007','50457910009','50457910010','50457910011','50457910012','50457910014','50457910017','50457910018','50457914014','50457915015','50457918010','50458007016','50458102016','50458107016','50458111011','50458112008','50458115002','50458116019','50458116021','50458119001','50458119010','50458201014','50458201021','50458202007','50458206002','50458206003','50458206009','50458207004','50458212002','50458213002','50458213003','50458213010','50458220020','50458222004','50458222008','50458222009','50458305016','50458307001','50458307002','50458307003','50458307005','50458307006','50458307007','50458307008','50458307009','50458307010','50458307011','50458307012','50458307013','50458307014','50458307015','50458307016','50458307017','50458307018','50458307019','50458307021','50458312002','50458312016','50458312019','50458312020','50458312022','50458605009','50458605011','50458605013','50458608017','50458610014','50458612001','50458612002','50458612003','50458612004','50458612005','50458612006','50458612007','50458612008','50458612009','50458612010','50458612011','50458612012','50458612013','50458612014','50458612015','50458612016','50458612017','50458612019','50458612020','50458613018','50458708002','50458708003','50458708004','50458708005','50458708007','50458708009','50458708011','50458802014','50458803006','50458803015','50458804001','50458804002','50458804004','50458804005','50458804007','50458804009','50458804011','50458804012','50458804013','50458914001','50458914003','50458914004','50458914005','50458914006','50458914007','50458914008','50458914009','50458914011','50458914012','50458914014','50458914015','50458914016','50459002003','50459101001','50459101010','50459101011','50459101012','50459101016','50459101018','50459101019','50459101020','50459101021','50459108001','50459108008','50459505006','51436218013','51439211009','51444513001','51444513002','51445204007','51445508001','51447906002','51447906003','51447906004','51447906005','51447906006','51447906007','51447906008','51447906009','51447906010','51447906011','51450714001','51450714002','51450714003','51451019006','51451101002','51451104003','51451511004','51452319010','51454318001','51454318004','51454318005','51454318006','51454318007','51454318008','51454519009','51455718001','51455718002','51455913006','51455913009','51455916007','51456217007','51456217009','51456311002','51456311003','51456311004','51456311005','51456311006','51456311007','51457404001','51457404002','51457603001','51457603002','51457603003','51457603011','51458008008','51458912001','51458912003','51458912004','51459004009','51459012001','51459016008','51459020007','51459215009','52448717001','52448717002','52454113003','52454909001','52454909002','52454909003','52454909004','52454919001','52454919003','52454919004','52454919005','52454919006','52455516002','52455516004','52455806002','52455806003','52457004001','52457004002','52457004003','52457004004','52457611003','53450218001','53455511005','53455518012','53457004001','53457004002','53457004004','53457004005','53457004006','53457004008','53457004010','53457004011','53457611001','53457611004','27213386','27213387','27213388','27213389','27213391','27213392','27213393','27213394','27213397','27213398','27213510','27213855','27213988','27214004','27214059','27214061','27214063','27214065','27214163','27214164','27214165','27214166','27214167','27214168','27214169','27214370','27214374','27214375','27214376','27214377','27214378','27214379','27214380','27214381','27214382','27215767','27215768','27215769','27215770','27215771','27215772','27215775','27215776','27215777','27215778','27215779','27215780','27215781','27215785','27216495','27216499','27216919','27309210','27309211','27309212','27309213','27309214','27309215','27309216','27309217','27310018','27310019','27310020','27310021','27310022','27310654','27310655','27310656','27310657','27310658','27310659','27310660','27310661','27310662','27310665','27311135','27311145','27311148','27311286','27311458','27311463','27311466','27311472','27311473','27311474','27311477','27311478','27311480','27311482','27311483','27311484','27311485','27311488','27311489','27311490','27311495','27311497','27311878','27314646','27314649','27314650','27314651','27316088','27316977','27316978','27316979','27316980','27316981','27316982','27316983','27316984','27316986','27316987','27317509','27317510','27317511','27317512','27317513','27317514','27317515','27317516','27317517','27403218','27404604','27404605','27405409','27405410','27405629','27405674','27405677','27405930','27405935','27406307','27407785','27407786','27407788','27407789','27407790','27407791','27407792','27407793','27407794','27407795','27622519','27622521','27625026','27625050','27625088','27625109','27625118','27625250','27625520','27625539','27625553','27625557','27625838','27625842','27625880','27625888','27625939','27628235','27628236','27628237','27628238','27628239','27628242','27628243','27628244','27628246','27628489','27628490','27629477','27629486','27630432','27630446','27630452','27630454','27630456','27630462','27631777','27631778','27631779','27631780','27631781','27631782','27631783','27631784','27631785','27631786','27631787','27631792','27631793','27631952','27631953','27631954','27631955','27631956','27631957','27631958','27631959','27631960','27631961','27632628','27632629','27632630','27632631','27632632','27632633','27632634','27632637','27632638','27632639','27632640','27632641','27632642','27632643','27632644','27632645','27632646','27632647','27632648','27632649']

    const codigos=['27213386','27213387','27213388','27213389','27213391','27213392','27213393','27213394','27213397','27213398','27213510','27213855','27213988','27214004','27214059','27214061','27214063','27214065','27214163','27214164','27214165','27214166','27214167','27214168','27214169','27214370','27214374','27214375','27214376','27214377','27214378','27214379','27214380','27214381','27214382','27215767','27215768','27215769','27215770','27215771','27215772','27215775','27215776','27215777','27215778','27215779','27215780','27215781','27215785','27216495','27216499','27216919','27309210','27309211','27309212','27309213','27309214','27309215','27309216','27309217','27310018','27310019','27310020','27310021','27310022','27310654','27310655','27310656','27310657','27310658','27310659','27310660','27310661','27310662','27310665','27311135','27311145','27311148','27311286','27311458','27311463','27311466','27311472','27311473','27311474','27311477','27311478','27311480','27311482','27311483','27311484','27311485','27311488','27311489','27311490','27311495','27311497','27311878','27314646','27314649','27314650','27314651','27316088','27316977','27316978','27316979','27316980','27316981','27316982','27316983','27316984','27316986','27316987','27317509','27317510','27317511','27317512','27317513','27317514','27317515','27317516','27317517','27403218','27404604','27404605','27405409','27405410','27405629','27405674','27405677','27405930','27405935','27406307','27407785','27407786','27407788','27407789','27407790','27407791','27407792','27407793','27407794','27407795','27622519','27622521','27625026','27625050','27625088','27625109','27625118','27625250','27625520','27625539','27625553','27625557','27625838','27625842','27625880','27625888','27625939','27628235','27628236','27628237','27628238','27628239','27628242','27628243','27628244','27628246','27628489','27628490','27629477','27629486','27630432','27630446','27630452','27630454','27630456','27630462','27631777','27631778','27631779','27631780','27631781','27631782','27631783','27631784','27631785','27631786','27631787','27631792','27631793','27631952','27631953','27631954','27631955','27631956','27631957','27631958','27631959','27631960','27631961','27632628','27632629','27632630','27632631','27632632','27632633','27632634','27632637','27632638','27632639','27632640','27632641','27632642','27632643','27632644','27632645','27632646','27632647','27632648','27632649']

    // const axios=require("axios")
    
    // let existen=0
    // let noExisten=0
    // let revisados=0
    // let estabanOK=0
    // let estabanMal=0
    // let sePuedenCorregir=0
    // let noSePuedenCorregir=0
    // console.log("Codigos", codigos.length )
    // for (const unCodigo of codigos) {
        //     console.log(++revisados, "de", codigos.length, unCodigo, "existen", existen, "No existen", noExisten)
        //     try {
            //         const producto=await axios(`http://localhost:8080/apiv3/productos/byBarcodeYEmpresa/${unCodigo}/70`)
            //         // console.log(producto.data.data)
            //         existen++
            
            //         const situacion=await axios.post(`http://localhost:8080/apiv3/movimientos/conciliarStock/${producto.data.data.Id}/N`)
            //         // console.log("Situacion", situacion.data.data)
            //         if (situacion.data.data.conciliacionEraOK) {
                //             estabanOK++
                //         } else {
                    //             estabanMal++
                    //             if (situacion.data.data.movimientosEnStock==0) {
    //                 sePuedenCorregir++
    //                 const situacionCorregida=await axios.post(`http://localhost:8080/apiv3/movimientos/conciliarStock/${producto.data.data.Id}/S`)
    //             } else {
    //                 noSePuedenCorregir++
    //             }
    //         }
    

    //     } catch (error) {
        //         console.log("Error", error)
        //         noExisten++
        
        //     }
        
        // }
        // return res.json(require("lsi-util-node/API").getFormatedResponse({existen, noExisten, estabanOK, estabanMal, sePuedenCorregir, noSePuedenCorregir}))
        
        
        const axios=require("axios")
        const response=await axios(`http://localhost:8080/apiv3/productos/allByEmpresa/70`)
        const productos=await response.data.data
        let cantidadACorregir=0
        for (const unProducto of productos) {
            // console.log(unProducto)
            if (unProducto.StockSinPosicionar===-1 && unProducto.Stock===0) {
                cantidadACorregir++
            }
        }
        
        const mensaje="Hay "+cantidadACorregir+" para corregir"
        
        return res.json(require("lsi-util-node/API").getFormatedResponse({mensaje}))
    
}


