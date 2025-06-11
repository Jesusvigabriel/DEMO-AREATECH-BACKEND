import {Request, Response} from "express"
import {
    
    createMovimientosStock_DALC,
    eliminarMovimientoStock_DALC,
    getMovimientoByOrdenBarcodeAndEmpresa_DALC,
    set_stockArticulo_movimientoVSStock_DALC,
    valida_movimientosStock_DALC,
    informar_IngresoStock_DALC,
    validarMovimento_DALC,
    validarMovimentos_DALC,
} from '../DALC/movimientos.dalc'

export const  createMovimientosStock = async (req: Request, res: Response): Promise <Response> => {
       
    const movimientoDuplicado = await validarMovimento_DALC(req.body)
    if(movimientoDuplicado){
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error, movimiento duplicado!"))
    }

    const result = await createMovimientosStock_DALC(req.body)
    
    if(!result){
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al crear el movimiento de stock"))
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))     
}

export const validarMovimientos = async (req: Request, res: Response): Promise <Response> =>{
    let result = await validarMovimentos_DALC(req.params.comprobante, Number(req.params.idEmpresa),req.params.barrcodes)
    if(!result){
        result = false
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))     
}

export const  validaMovimientosStock = async (req: Request, res: Response): Promise <Response> => {     
    const result = await valida_movimientosStock_DALC(req.params.idOrden,Number(req.params.idEmpresa),req.params.barrcodes)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))     
}

export const eliminarMovimientoStock = async (req: Request, res: Response): Promise <Response> => {     
    const result = await eliminarMovimientoStock_DALC(parseInt(req.params.id))
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))     
}

export const getMovimientoByOrdenBarcodeAndEmpresa = async (req: Request, res: Response): Promise <Response> => {     
    const result = await getMovimientoByOrdenBarcodeAndEmpresa_DALC(parseInt(req.params.id),req.params.orden.toString(),req.params.barcode.toString())
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))     
    }


export const conciliarMovimientosStock = async (req: Request, res: Response): Promise <Response> => {     
    const result = await set_stockArticulo_movimientoVSStock_DALC(Number(req.params.id), req.params.tipoForzado)


    if (result.status) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result.detalle))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result.detalle))
    }
}


export const informarIngresoStock = async (req: Request, res: Response): Promise<Response> => {
    
     const response=await informar_IngresoStock_DALC(req.body)

     return res.json(require("lsi-util-node/API").getFormatedResponse(response))
    
}