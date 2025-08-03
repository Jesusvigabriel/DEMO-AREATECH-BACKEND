import {Request, Response} from "express"
import { createQueryBuilder } from "typeorm"
import { empresa_getById_DALC } from "../DALC/empresas.dalc"
import { puntoVenta_getInternoByEmpresa_DALC } from "../DALC/puntosVenta.dalc"
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
     orden_getByNumeroAndIdEmpresaWithEmpresa_DALC,
     orden_delete_DALC,
     ordenes_getOrdenes_DALC,
     ordenes_SalidaOrdenes_DALC,
     orden_editImpresion_DALC,
     ordenes_getPreparadasNoGuiasByIdEmpresa_DALC,
    contador_bultos_dia_DLAC,
    getProductosYPosicionesByOrden_DALC,
     ordenes_getHistoricoMultiplesOrdenes_DALC
} from '../DALC/ordenes.dalc'
import { destino_getById_DALC } from '../DALC/destinos.dalc'
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
import { detallePosicion_getByIdProd_DALC } from "../DALC/posiciones.dalc"


export const informarEmisionEtiqueta = async (req: Request, res: Response): Promise<Response> => {
    //Me fijo si la orden existe
    const orden=await orden_getById_DALC(parseInt(req.params.id))
    if (!orden) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Id orden inexistente"))
    }

    const response=await orden_informarEmisionEtiqueta(orden, req.body.destinatarioTest)

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
    } catch (error: unknown) {
        console.error("Error en getProductosYPosicionesByOrden:", error);
        if (error instanceof Error) {
            return res.status(500).json({ status: "ERROR", message: error.message });
        }
        return res.status(500).json({ status: "ERROR", message: "Error desconocido al obtener productos y posiciones" });
    }
};


export const generarNueva = async (req: Request, res: Response): Promise<Response> => {
    // Validar parámetros requeridos
    const lsiValidators = require("lsi-util-node/validators");
    
    // Parámetros base requeridos
    const requiredParams = [
        "idEmpresa", 
        "detalle", 
        "comprobante", 
        "fecha", 
        "cliente", 
        "domicilio", 
        "codigoPostal", 
        "observaciones", 
        "emailDestinatario", 
        "preOrden"
    ];
    
    // Obtener la empresa para verificar si requiere campos adicionales
    const empresa = await empresa_getById_DALC(parseInt(req.body.idEmpresa));
    if (!empresa) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"));
    }
    const puntoVentaInterno = await puntoVenta_getInternoByEmpresa_DALC(empresa.Id);
    
    // Si la empresa usa partidas y remitos, agregar validación de campos adicionales
    if (empresa.PART && empresa.UsaRemitos) {
        requiredParams.push(
            "cuitIva",
            "domicilioEntrega",
            "codigoPostalEntrega",
            "transporte",
            "domicilioTransporte",
            "codigoPostalTransporte",
            "cuitIvaTransporte",
            "ordenCompra",
            "nroPedidos"
        );
        if (!puntoVentaInterno) {
            requiredParams.push("nroRemito");
        }
        
        // Validar que todos los ítems tengan partida y despachoPlaza
        if (req.body.detalle && Array.isArray(req.body.detalle)) {
            const itemsSinPartida = req.body.detalle.filter((item: any) => !item.partida);
            if (itemsSinPartida.length > 0) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Todos los ítems deben tener un número de partida",
                    itemsSinPartida: itemsSinPartida.map((item: any) => ({
                        barcode: item.barcode,
                        descripcion: item.descripcion
                    }))
                });
            }

            const itemsSinDespachoPlaza = req.body.detalle.filter((item: any) => !item.despachoPlaza);
            if (itemsSinDespachoPlaza.length > 0) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Todos los ítems deben tener un despacho plaza",
                    itemsSinDespachoPlaza: itemsSinDespachoPlaza.map((item: any) => ({
                        barcode: item.barcode,
                        descripcion: item.descripcion
                    }))
                });
            }
        }
    }
    
    // Verificar parámetros faltantes
    const missingParameters = lsiValidators.requestParamsFilled(req.body, requiredParams);
    if (missingParameters.length > 0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", { missingParameters }));
    }

    // Extraer todos los campos necesarios
    const {
        detalle: detalleOrden,
        comprobante,
        fecha,
        cliente,
        domicilio,
        codigoPostal,
        observaciones,
        emailDestinatario,
        valorDeclarado = 0,
        preOrden,
        kilos = 0,
        metros = 0,
        tieneLote = false,
        tienePART = empresa.PART, // Usar el valor de la empresa si no se especifica
        usuario = "sistema",
        desdePosicion = false,
        posicionId = null,
        puntoVentaId,
        // Nuevos campos para empresas con partidas y remitos
        cuitIva,
        domicilioEntrega,
        codigoPostalEntrega,
        transporte,
        domicilioTransporte,
        codigoPostalTransporte,
        cuitIvaTransporte,
        ordenCompra,
        nroPedidos,
        nroRemito: nroRemitoBody,
        observacionesLugarEntrega
    } = req.body;

    const nroRemito = typeof nroRemitoBody === 'string' && nroRemitoBody.trim() === '' ? undefined : nroRemitoBody;

    try {
        const result = await orden_generarNueva(
            empresa,
            detalleOrden,
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
            desdePosicion,
            posicionId,
            puntoVentaId,
            nroRemito,
            // Nuevos campos
            cuitIva,
            domicilioEntrega,
            codigoPostalEntrega,
            transporte,
            domicilioTransporte,
            codigoPostalTransporte,
            cuitIvaTransporte,
            ordenCompra,
            nroPedidos,
            observacionesLugarEntrega
        );

        if (result.status === "OK") {
            return res.json(require("lsi-util-node/API").getFormatedResponse(result.data));
        } else {
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", result.data));
        }
    } catch (error: unknown) {
        console.error("Error al generar nueva orden:", error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar la orden';
        return res.status(500).json({
            status: "ERROR",
            message: "Error interno del servidor al procesar la orden",
            error: errorMessage
        });
    }
};

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
    const orden = await orden_getById_DALC(parseInt(req.params.id))
    const detalle = await ordenDetalle_getByIdOrdenAndProducto_DALC(parseInt(req.params.id))

    if (orden != null && detalle != null) {
        const detalleConPosiciones = await Promise.all(
            detalle.map(async (item: any) => {
                const posiciones = await detallePosicion_getByIdProd_DALC(item.IdOrdendetalle, orden.IdEmpresa)
                return { ...item, Posiciones: posiciones }
            })
        )
        return res.json(require("lsi-util-node/API").getFormatedResponse(detalleConPosiciones))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }
}

export const getDetalleOrdenAndProductoAndPartidaById = async (req: Request, res: Response): Promise <Response> => {
    const result = await orden_getById_DALC(parseInt(req.params.id))
    const detalle = await ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC(parseInt(req.params.id))

    if (result!=null && detalle!=null) {
        // Obtener las posiciones para cada detalle de la orden
        const detallesConPosiciones = await Promise.all(detalle.map(async (item: any) => {
            console.log(`Buscando posiciones para detalle: ${item.IdOrdendetalle}, producto: ${item.IdProducto}`);
            
            try {
                // Consulta para obtener las posiciones relacionadas con el detalle de la orden
                // Primero obtenemos los IDs de las posiciones
                const posicionesIds = await createQueryBuilder("posiciones_por_orderdetalle", "pod")
                    .select([
                        'pod.id_posicion as idPosicion',
                        'pod.cantidad as cantidad',
                        'pod.id as idPosicionOrdenDetalle'
                    ])
                    .where('pod.id_orderdetalle = :idOrdenDetalle', { 
                        idOrdenDetalle: item.IdOrdendetalle 
                    })
                    .getRawMany();
                
                console.log('IDs de posiciones encontradas:', JSON.stringify(posicionesIds, null, 2));
                
                // Si hay posiciones, obtenemos sus detalles
                let posiciones = [];
                if (posicionesIds.length > 0) {
                    posiciones = await createQueryBuilder("posiciones", "p")
                        .select([
                            'p.id as idPosicion',
                            'p.descripcion as descripcion'
                        ])
                        .where('p.id IN (:...ids)', { 
                            ids: posicionesIds.map(p => p.idPosicion) 
                        })
                        .getRawMany();
                        
                    // Combinamos la información de cantidades con los detalles de las posiciones
                    posiciones = posiciones.map(pos => ({
                        ...pos,
                        cantidad: posicionesIds.find(p => p.idPosicion === pos.idPosicion)?.cantidad || 0,
                        idPosicionOrdenDetalle: posicionesIds.find(p => p.idPosicion === pos.idPosicion)?.idPosicionOrdenDetalle
                    }));
                }
                
                console.log('Posiciones encontradas:', JSON.stringify(posiciones, null, 2));
                
                return {
                    ...item,
                    posiciones: posiciones || []
                };
                
            } catch (error) {
                console.error('Error al obtener posiciones:', error);
                return {
                    ...item,
                    posiciones: []
                };
            }
        }));
        
        return res.json(require("lsi-util-node/API").getFormatedResponse(detallesConPosiciones));
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"));
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



export const getByNumeroAnIdEmpresa = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { numero, idEmpresa } = req.params;

    if (!numero) {
        return res.status(400).json(
            require('lsi-util-node/API').getFormatedResponse(
                '',
                'Parámetro numero inválido'
            )
        );
    }

    const idEmp = Number(idEmpresa);
    if (isNaN(idEmp)) {
        return res.status(400).json(
            require('lsi-util-node/API').getFormatedResponse(
                '',
                'Parámetro idEmpresa inválido'
            )
        );
    }

    const orden = await orden_getByNumeroAndIdEmpresa_DALC(numero, idEmp)

    if (!orden) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }

    const detalle = await ordenDetalle_getByIdOrden_DALC(orden.Id)
    ;(orden as any).Detalle = detalle ?? []

    return res.json(require("lsi-util-node/API").getFormatedResponse(orden))
}

export const getDetalleOrdenByNumeroAnIdEmpresa = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { numero, idEmpresa } = req.params;

    if (!numero) {
        return res.status(400).json(
            require('lsi-util-node/API').getFormatedResponse(
                '',
                'Parámetro numero inválido'
            )
        );
    }

    const idEmp = Number(idEmpresa);
    if (isNaN(idEmp)) {
        return res.status(400).json(
            require('lsi-util-node/API').getFormatedResponse(
                '',
                'Parámetro idEmpresa inválido'
            )
        );
    }

    const orden = await orden_getByNumeroAndIdEmpresaWithEmpresa_DALC(
        numero,
        idEmp
    )
    if (!orden) {
        return res
            .status(404)
            .json(
                require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente")
            )
    }

    const destino = await destino_getById_DALC(orden.Eventual)

    const detalle = await ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC(orden.Id)
    if (!detalle || detalle.length === 0) {
        return res
            .status(404)
            .json(
                require("lsi-util-node/API").getFormatedResponse("", "Detalle inexistente")
            )
    }

    const respuesta = {
        idOrden: orden.Id,
        comprobante: orden.Numero,
        idEmpresa: orden.IdEmpresa,
        fecha: orden.Fecha,
        cliente: destino?.Nombre ?? "",
        nroRemito: orden.NroRemito,
        codigoPostal: destino?.CodigoPostal ?? "",
        domicilio: destino?.Domicilio ?? "",
        cuitIva: orden.CuitIva,
        domicilioEntrega: orden.DomicilioEntrega,
        codigoPostalEntrega: orden.CodigoPostalEntrega,
        transporte: orden.Transporte,
        domicilioTransporte: orden.DomicilioTransporte,
        codigoPostalTransporte: orden.CodigoPostalTransporte,
        cuitIvaTransporte: orden.CuitIvaTransporte,
        ordenCompra: orden.OrdenCompra,
        nroPedidos: orden.NroPedidos,
        observacionesLugarEntrega: orden.ObservacionesLugarEntrega,
        observaciones: orden.Observaciones,
        emailDestinatario: orden.EmailDestinatario,
        valorDeclarado: orden.ValorDeclarado,
        preOrden: orden.PreOrden,
        kilos: orden.Kilos,
        metros: orden.Metros,
        estado: orden.Estado,
        usuario: orden.UsuarioCreoOrd ?? orden.Usuario,
        Detalle: detalle
    }

    return res.json(require("lsi-util-node/API").getFormatedResponse(respuesta))
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
    const result = await ordenAuditoria_getEliminadas_DALC();
    return res.json(require("lsi-util-node/API").getFormatedResponse(result));
};

export const getHistoricoMultiplesOrdenes = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { ids } = req.query;
        if (!ids || typeof ids !== 'string') {
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse(
                null,
                "Se requiere el parámetro 'ids' con los IDs de las órdenes separados por comas"
            ));
        }

        const idsArray = ids.split(',').map(id => parseInt(id.trim()));
        if (idsArray.some(isNaN)) {
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse(
                null,
                "Los IDs de las órdenes deben ser números válidos"
            ));
        }

        const result = await ordenes_getHistoricoMultiplesOrdenes_DALC(idsArray);
        return res.json(require("lsi-util-node/API").getFormatedResponse(result));
    } catch (error) {
        console.error('Error en getHistoricoMultiplesOrdenes:', error);
        return res.status(500).json(require("lsi-util-node/API").getFormatedResponse(
            null,
            "Error al obtener los históricos de las órdenes"
        ));
    }
};
