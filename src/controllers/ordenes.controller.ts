import {Request, Response} from "express"
import { empresa_getById_DALC } from "../DALC/empresas.dalc"
import {
    orden_getById_DALC,
    ordenes_getByPeriodo_DALC,
    orden_generarNueva,
    orden_informarEmisionEtiqueta,
    ordenes_getByEmpresa_DALC,
    ordenes_getByEmpresaPeriodoConDestinos_DALC,
    ordenes_getPreparadasNoGuias_DALC,
    orden_marcarComoRetiraCliente,
    orden_anular,
    orden_anular_by_id,
    ordenes_delete_DALC,
    ordenes_getByPeriodoEmpresa_DALC,
    orden_setPreorden_DALC,
     destino_getAll_DALC,
     ordenes_getCantPeriodo_DALC,
     ordenes_getCantPeriodoEmpresa_DALC,
     ordenes_getByPeriodoEmpresaSoloPreparadasYNoPreorden_DALC,
     ordenes_getPendientes_DALC,
     orden_editEstado_DALC,
     orden_getByNumeroAndIdEmpresa_DALC,
     orden_delete_DALC,
     ordenes_getOrdenes_DALC,
     ordenes_SalidaOrdenes_DALC,
     orden_editImpresion_DALC,
     ordenes_getPreparadasNoGuiasByIdEmpresa_DALC,
    contador_bultos_dia_DLAC,
    getProductosYPosicionesByOrden_DALC
} from '../DALC/ordenes.dalc'
import { ordenEstadoHistorico_getByIdOrden_DALC } from '../DALC/ordenEstadoHistorico.dalc'
import { ordenAuditoria_insert_DALC, ordenAuditoria_getEliminadas_DALC } from '../DALC/ordenAuditoria.dalc'
import { bultos_setByIdOrdenAndIdEmpresa,
         ordenDetalle_getByIdOrden_DALC,
         ordenDetalle_delete_DALC,
         ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC,
         ordenDetalle_getByIdOrdenAndProducto_DALC,
         ordenDetalle_getByIdProducto_DALC,
         ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC
 }from "../DALC/ordenesDetalle.dalc"


export const informarEmisionEtiqueta = async (req: Request, res: Response): Promise<Response> => {
    //Me fijo si la orden existe
    const orden=await orden_getById_DALC(parseInt(req.params.id))
    if (!orden) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Id orden inexistente"))
    }

    const response=await orden_informarEmisionEtiqueta(orden)

    return res.json(require("lsi-util-node/API").getFormatedResponse(response))

}

export const anularOrden = async (req: Request, res: Response): Promise<Response> => {
    //Me fijo si la orden existe
    const orden=await orden_getById_DALC(parseInt(req.params.id))
    if (!orden) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Id orden inexistente"))
    }
    const response=await orden_anular(orden)
    return res.json(require("lsi-util-node/API").getFormatedResponse(response))
}

export const anularOrdenById = async (req: Request, res: Response): Promise<Response> => {
    //Me fijo si la orden existe
    const orden=await orden_getById_DALC(parseInt(req.params.idOrden))
    if (!orden) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Id orden inexistente"))
    }
    // let numero = orden?.Numero
    // //si ya existe una orden anulada con el mismo nombre le agrega una A mas al numero
    // if(orden.Numero == numero){
    //     numero = req.params.numeroOrden + "A" 
    // }
    const response=await orden_anular_by_id(req.params.usuario,req.params.idOrden,req.params.numeroOrden,parseInt(req.params.idEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(response))
}

export const orden_setPreOrden = async (req: Request, res: Response): Promise<Response> => {
    //Me fijo si la orden existe
    const orden=await orden_getById_DALC(parseInt(req.params.id))
    if (!orden) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Id orden inexistente"))
    }
    const response=await orden_setPreorden_DALC(orden, (req.params.preOrden==="T"), req.params.fecha, req.params.usuario)
    return res.json(require("lsi-util-node/API").getFormatedResponse(response))

}

export const contadorBultosDia = async (req: Request, res: Response): Promise<Response> => {
    const ordenesDia = await contador_bultos_dia_DLAC(req.params.idEmpresa, req.params.fecha)
    return res.json(require("lsi-util-node/API").getFormatedResponse(ordenesDia))
}

export const getProductosYPosicionesByOrden = async (req: Request, res: Response) => {
    try {
        const idOrden = Number(req.params.idOrden);
        const data = await getProductosYPosicionesByOrden_DALC(idOrden);
        return res.json({ status: "OK", data });
    } catch (error) {
        console.error("Error en getProductosYPosicionesByOrden:", error);
        return res.status(500).json({ status: "ERROR", message: error.message });
    }
};


export const generarNueva = async (req: Request, res: Response): Promise<Response> => {

    //Me fijo si mandó todos los parámetros requeridos
    const lsiValidators=require("lsi-util-node/validators")
    const missingParameters=lsiValidators.requestParamsFilled(req.body, ["idEmpresa", "detalle", "comprobante", "fecha", "cliente", "domicilio", "codigoPostal", "observaciones", "emailDestinatario", "preOrden"])
    if (missingParameters.length>0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {missingParameters}))
    }

    //Me fijo si la empresa existe
    const empresa=await empresa_getById_DALC(parseInt(req.body.idEmpresa))
    if (empresa==null) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const {
        detalle,
        comprobante,
        fecha,
        cliente,
        domicilio,
        codigoPostal,
        observaciones,
        emailDestinatario,
        valorDeclarado,
        preOrden,
        kilos,
        metros,
        tieneLote,
        tienePART,
        usuario,
        desdePosicion,  // nuevo
        posicionId      // nuevo
      } = req.body
      
      const result = await orden_generarNueva(
        empresa,
        detalle,
        comprobante,
        fecha,
        cliente,
        domicilio,
        codigoPostal,
        observaciones,
        emailDestinatario,
        valorDeclarado,
        preOrden,
        kilos,
        metros,
        tieneLote,
        tienePART,
        usuario,
        desdePosicion,  // lo agregamos
        posicionId      // lo agregamos
      )  
        if (result.status=="OK") {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result.data))
    } else {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", result.data))
    }    
}

export const getByID = async (req: Request, res: Response): Promise <Response> => {
    const result = await orden_getById_DALC(parseInt(req.params.id))

    if (result!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}

export const getDetalleOrdenByID = async (req: Request, res: Response): Promise <Response> => {
    const result = await orden_getById_DALC(parseInt(req.params.id))
    const detalle = await ordenDetalle_getByIdOrden_DALC(parseInt(req.params.id))

    if (result!=null && detalle!=null) {
         return res.json(require("lsi-util-node/API").getFormatedResponse(detalle))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}

export const getDetalleOrdenAndProductoById = async (req: Request, res: Response): Promise <Response> => {
    const result = await orden_getById_DALC(parseInt(req.params.id))
    const detalle = await ordenDetalle_getByIdOrdenAndProducto_DALC(parseInt(req.params.id))

    if (result!=null && detalle!=null) {
         return res.json(require("lsi-util-node/API").getFormatedResponse(detalle))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}

export const getDetalleOrdenAndProductoAndPartidaById = async (req: Request, res: Response): Promise <Response> => {
    const result = await orden_getById_DALC(parseInt(req.params.id))
    const detalle = await ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC(parseInt(req.params.id))


    if (result!=null && detalle!=null) {
         return res.json(require("lsi-util-node/API").getFormatedResponse(detalle))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}

export const getDetallePosicionesOrdenByID = async (req: Request, res: Response): Promise <Response> => {
    //const result = await orden_getById_DALC(parseInt(req.params.id))
    const detallePosiciones = await ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC(parseInt(req.params.id),parseInt(req.params.idEmpresa))
    
    if (detallePosiciones!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(detallePosiciones))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}

export const getOrdenDetalleByIdProducto = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenDetalle_getByIdProducto_DALC(parseInt(req.params.idProducto))
    if (result!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}



export const getByNumeroAnIdEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const result = await orden_getByNumeroAndIdEmpresa_DALC(req.params.numero, parseInt(req.params.idEmpresa))

    if (result!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}




export const getAllDestinoByIdEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const result = await destino_getAll_DALC(parseInt(req.params.idEmpresa))

    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}

export const getByPeriodo = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenes_getByPeriodo_DALC(req.params.fechaDesde, req.params.fechaHasta)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const editCantidadImpresion = async (req: Request, res: Response): Promise <Response> => {
    const result = await orden_editImpresion_DALC(parseInt(req.params.orden), req.params.impresion)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getCantByPeriodo = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenes_getCantPeriodo_DALC(req.params.fechaDesde, req.params.fechaHasta)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getByPeriodoEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const result = await ordenes_getByPeriodoEmpresa_DALC(req.params.fechaDesde, req.params.fechaHasta, empresa)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getByPeriodoEmpresaSoloPreparadasYNoPreorden = async (req: Request, res: Response): Promise <Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const result = await ordenes_getByPeriodoEmpresaSoloPreparadasYNoPreorden_DALC(req.params.fechaDesde, req.params.fechaHasta, empresa)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getCantByPeriodoEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const result = await ordenes_getCantPeriodoEmpresa_DALC(req.params.fechaDesde, req.params.fechaHasta, empresa.Id)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getByEmpresaPeriodoConDestinos = async (req: Request, res: Response): Promise<Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const result = await ordenes_getByEmpresaPeriodoConDestinos_DALC(
        empresa.Id,
        req.params.fechaDesde,
        req.params.fechaHasta
    )
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const ordenesByEmpresaId = async (req: Request, res: Response): Promise <Response> => {
    const idEmpresa = (parseInt(req.params.idEmpresa)) ? (parseInt(req.params.idEmpresa)) : 0
    const result = await ordenes_getByEmpresa_DALC(idEmpresa)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}
   
export const getPreparadasNoGuias = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenes_getPreparadasNoGuias_DALC()
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getPreparadasNoGuiasByIdEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenes_getPreparadasNoGuiasByIdEmpresa_DALC(Number(req.params.idEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getPendientes = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenes_getPendientes_DALC()
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getOrdenes = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenes_getOrdenes_DALC()
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const saleOrder = async (req: Request, res: Response): Promise <Response> => {
    
    const result = await ordenes_SalidaOrdenes_DALC(req.body)
    const estadoObj = result as { estado: string; mensaje: string; };
    if(!result){
        return res.json(require("lsi-util-node/API").getFormatedResponse("", "Error al registar la salida de la Orden"))
    }else{
        if(estadoObj.estado == "ERROR"){
            return res.json(require("lsi-util-node/API").getFormatedResponse("", "Error al registar la salida de Orden. " + estadoObj.mensaje))
        }
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }
    
}

export const setRetiraCliente = async (req: Request, res: Response): Promise <Response> => {
    const orden=await orden_getById_DALC(Number(req.params.id))
    if (!orden) {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }

    const result = await orden_marcarComoRetiraCliente(orden, req.params.fecha)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const setBultos = async (req: Request, res: Response): Promise <Response> => {
    const orden=await orden_getById_DALC(Number(req.params.id))
    if (!orden) {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }

    const result = await bultos_setByIdOrdenAndIdEmpresa(orden, Number(req.params.idEmpresa), Number(req.params.cantidad))
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const setEstado = async (req: Request, res: Response): Promise <Response> => {
    const orden=await orden_getById_DALC(Number(req.params.id))
    if (!orden) {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }

    const result = await orden_editEstado_DALC(orden, Number(req.params.estado), "")
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}



export const getBultosByIdOrden = async (req: Request, res: Response): Promise <Response> => {
    const orden=await orden_getById_DALC(Number(req.params.id))
    if (!orden) {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }

    const result = await ordenDetalle_getByIdOrden_DALC(orden.Id)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getPosicionPorOrdendetalleByIdOrden = async (req: Request, res: Response): Promise <Response> => {
    const result = await ordenDetalle_getByIdOrden_DALC(Number(req.params.idOrden))
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const eliminarOrden = async (req: Request, res: Response): Promise <Response> => {
    const orden=await orden_getById_DALC(Number(req.params.id))
    if (!orden) {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
    await ordenAuditoria_insert_DALC(orden.Id, "ELIMINADA", orden.Usuario ? orden.Usuario : "", new Date())
    const results = await orden_delete_DALC(Number(req.params.id))
    const results2 = await ordenDetalle_delete_DALC(Number(req.params.id))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results+". "+results2))
}

export const getHistoricoEstadosOrden = async (req: Request, res: Response): Promise<Response> => {
    const result = await ordenEstadoHistorico_getByIdOrden_DALC(Number(req.params.idOrden))
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getOrdenesEliminadas = async (_req: Request, res: Response): Promise<Response> => {
    const result = await ordenAuditoria_getEliminadas_DALC()
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}
