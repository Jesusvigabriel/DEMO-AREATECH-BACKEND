import {Request, Response} from "express"
import {
  guia_getByComprobante_DALC,
  guia_getById_DALC,
  guias_getByFecha_soloDespachadas_DALC,
  guia_registrar_entrega,
  guia_getHashFoto,
  guias_get_sinRendirByIdEmpresa_DALC,
  guias_registrarRendiciones,
  crearNuevaGuiaDesdeOrden_DALC,
  guias_getAllEnPlanchada_DALC,
  guias_getPlanchadaByComprobanteAndToken_DALC,
  guias_actualizarFecha,
  crearNuevaGuiaDesdeExcel_DALC,
  guias_getByPeriodoEmpresa_DALC,
  guia_editOne_DALC,
  guias_revisarRetroactivamentePorFlete_DALC,
  guias_repararCRR_DALC,
  guia_getRemitos_DALC,
  guias_getPlanchadaByComprobanteAndByIdEmpresa_DALC,
  guiasChoferes_getByPeriodoEmpresa_DALC,
  guias_getByPeriodoIdEmpresa_DALC
} from '../DALC/guias_DALC'

import {
    set_guiasFotos_new
} from '../DALC/guiasFotos.dalc'

import { empresaConfiguracion_getById_DALC, empresa_getById_DALC, getEmpresaByToken_Dalc } from '../DALC/empresas.dalc'

import { orden_getById_DALC } from "../DALC/ordenes.dalc";

import { ordenDetalle_getByIdOrden_DALC, get_BultosOrden_ByNumeroOrdenAndIdEmpresa } from "../DALC/ordenesDetalle.dalc";

import { producto_getById_DALC } from "../DALC/productos.dalc";

import { chequeaServicio, validaConfiguracionServicio } from "../helpers/servicios";
import { destino_getById_DALC } from "../DALC/destinos.dalc";


export const guias_repararCRR_controller = async(req: Request, res: Response): Promise<Response> => {
    const results = await guias_repararCRR_DALC()
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}


export const guias_revisarRetroactivasPorFlete = async(req: Request, res: Response): Promise<Response> => {
    const results = await guias_revisarRetroactivamentePorFlete_DALC()
    // console.log(results)

    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const guia_editOne = async (req: Request, res: Response): Promise <Response> => {
    const guia=await guia_getById_DALC(Number(req.params.id))
    if (!guia) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Guia inexistente"))
    }
    const guiaActualizada=await guia_editOne_DALC(guia, req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(guiaActualizada))
}

export const setRegistrarRendicionesByEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const guiasARendir=[]
    const idsGuias=req.params.idsGuias.split("|")
    const errores=[]
    for (const unIdGuia of idsGuias) {
        const unaGuia=await guia_getById_DALC(Number(unIdGuia))
        if (!unaGuia) {
            if (errores.filter(e=>e=='Guías inexistentes').length==0) {
                errores.push("Guías inexistentes")
            }
        } else {
            if (unaGuia.NombreCliente.trim()!=empresa.RazonSocial.trim()) {
                if (errores.filter(e=>e=='Guías pertenecientes a otra empresa').length==0) {
                    errores.push("Guías pertenecientes a otra empresa")
                }
            } else {
                if (unaGuia.IdRendicion>0) {
                    if (errores.filter(e=>e=='Guías previamente rendidas').length==0) {
                        errores.push("Guías previamente rendidas")
                    }    
                } else {
                    guiasARendir.push(unaGuia)
                }
            }
        }
    }

    if (errores.length>0) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", errores))
    }

    const results=await guias_registrarRendiciones(empresa, guiasARendir, req.params.usuario)
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const getSinRendirByIdEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
    const results=await guias_get_sinRendirByIdEmpresa_DALC(empresa)
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const crearNuevaGuiaDesdeOrden = async (req: Request, res: Response): Promise <Response> => {

    const lsiValidators=require("lsi-util-node/validators")
    const missingParameters=lsiValidators.requestParamsFilled(req.body, ["Calculo", "EsCRR"])
    if (missingParameters.length>0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {missingParameters}))
    }

    const orden=await orden_getById_DALC(Number(req.params.idOrden))
    if (!orden) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }

    if (orden.Estado!=2) {
        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("", "La orden no está preparada"))
    }

    if (orden.IdGuia!=-1) {
        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("", "La orden ya está asignada a una guía"))
    }

    const destino=await destino_getById_DALC(orden.Eventual)
    if (!destino) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden sin destino"))
    }

    const result=await crearNuevaGuiaDesdeOrden_DALC(orden, destino, req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const crearNuevaGuiaDesdeExcel = async (req: Request, res: Response): Promise <Response> => {

    const lsiValidators=require("lsi-util-node/validators")
    const missingParameters=lsiValidators.requestParamsFilled(req.body, ["IdEmpresa", "Bultos", "CRR", "Desglose", "Destinatario", "DomicilioDestinatario", "CodigoPostal", "Kilos", "M3", "Remitos", "TipoEntrega", "FechaEntrega", "Unidades", "ValorDeclarado", "Observaciones", "EmailDestinatario"])
    if (missingParameters.length>0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {missingParameters}))
    }

    const empresa=await empresa_getById_DALC(Number(req.body.IdEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const result=await crearNuevaGuiaDesdeExcel_DALC(empresa, req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}



export const calculaValor = async (req: Request, res: Response): Promise <Response> => {
    // Revisa el Servicio
    const servicio = chequeaServicio(req.params.tipoServicio)
    if (!servicio) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Servicio inexistente"))
    }    
    
    const orden = await orden_getById_DALC(parseInt(req.params.idOrden))
    if (!orden) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"))
    }

    //console.log("Orden", orden);
    

    // Se obtienen los datos de empresa
    const empresa = await empresa_getById_DALC(orden.IdEmpresa)
    const configuracionEmpresa = await empresaConfiguracion_getById_DALC(orden.IdEmpresa)
    if (!configuracionEmpresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "La empresa no posee la configuración necesaria para completar la solicitud."))
    }
    
    const validaConfiguracionEmpresa = await validaConfiguracionServicio(servicio, configuracionEmpresa)    
    if(!validaConfiguracionEmpresa){
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Uno o más de los parámetros de configuración están vacíos o incorrectamente seteados"))
    }

    // console.log(validaConfiguracionEmpresa);
    
    const ordenDetalle = await ordenDetalle_getByIdOrden_DALC(orden.Id)
    const productos = []
    for (let index = 0; index < ordenDetalle.length; index++) {
        const element = ordenDetalle[index];
        const Producto = await producto_getById_DALC(element.IdProducto)
        const Unidades = element.Unidades
        const result = {Producto, Unidades}
        productos.push(result)
        
    }


    const response = servicio.calculaCostos(empresa, orden, productos ,validaConfiguracionEmpresa)
    return res.json(require("lsi-util-node/API").getFormatedResponse(response));
}


export const getHashFotoNoEntregado = async (req: Request, res: Response): Promise<Response> => {

    const hashGenerado=await guia_getHashFoto(parseInt(req.params.idGuia), parseInt(req.params.idChofer), req.params.fecha)
    if (hashGenerado!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(hashGenerado))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Guía inexistente o inconsistente"))
    }
}

export const setGuiaEntregada = async (req: Request, res: Response): Promise<Response> => {

    const lsiValidators=require("lsi-util-node/validators")
    const missingParameters=lsiValidators.requestParamsFilled(req.body, ["idChofer", "fecha", "estado"])
    if (missingParameters.length>0) {
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", {missingParameters}))
    }
    const guia=await guia_registrar_entrega(parseInt(req.params.id), parseInt(req.body.idChofer), req.body.fecha, req.body.estado)
    if (guia!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(guia))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Guía inexistente o inconsistente"))
    }
}

export const getByFecha = async (req: Request, res: Response): Promise <Response> => {
    const Guias = await guias_getByFecha_soloDespachadas_DALC(req.params.Fecha)
    
    if (Guias!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(Guias))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de guías"))
    }
}

export const setActualizarFecha = async (req: Request, res: Response): Promise <Response> => {
    const results = await guias_actualizarFecha(req.params.fecha, req.params.idsGuias)
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const getAllEnPlanchada = async (req: Request, res: Response): Promise <Response> => {
    const Guias = await guias_getAllEnPlanchada_DALC()
    
    if (Guias!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(Guias))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de guías"))
    }
}

export const getPlanchadaByComprobanteAndToken = async (req: Request, res: Response): Promise <Response> => {
    const Guias = await guias_getPlanchadaByComprobanteAndToken_DALC(req.params.comprobante, req.params.token)
    if (Guias!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(Guias))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de guías"))
    }
}

export const getByPeriodoEmpresa = async (req: Request, res: Response): Promise <Response> => {
    let empresa
    if (typeof req.params.idEmpresa==="undefined") {
        empresa=null
    } else {
        empresa=await empresa_getById_DALC(Number(req.params.idEmpresa))
        if (!empresa) {
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
        }
    }

    const Guias = await guias_getByPeriodoEmpresa_DALC(req.params.fechaDesde, req.params.fechaHasta, empresa)
    
    if (Guias!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(Guias))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de guías"))
    }
}

export const getByPeriodoIdEmpresa = async (req: Request, res: Response): Promise <Response> => {
    let empresa
    if (typeof req.params.idEmpresa==="undefined") {
        empresa=null
    } else {
        empresa=await empresa_getById_DALC(Number(req.params.idEmpresa))
        if (!empresa) {
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
        }
    }

    const Guias = await guias_getByPeriodoIdEmpresa_DALC(req.params.fechaDesde, req.params.fechaHasta, empresa)
    
    if (Guias!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(Guias))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de guías"))
    }
}

export const getByPeriodoEmpresaFecha = async (req: Request, res: Response): Promise <Response> => {
    let empresa
    if (typeof req.params.idEmpresa==="undefined") {
        empresa=null
    } else {
        empresa=await empresa_getById_DALC(Number(req.params.idEmpresa))
        if (!empresa) {
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
        }
    }

    const Guias = await guiasChoferes_getByPeriodoEmpresa_DALC(req.params.fechaDesde, req.params.fechaHasta, empresa)
    
    if (Guias!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(Guias))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de guías"))
    }
}

export const getById = async (req: Request, res: Response): Promise <Response> => {
    const unaGuia = await guia_getById_DALC(parseInt(req.params.Id))
    
    if (unaGuia!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unaGuia))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Guia inexistente"))
    }
}

export const getByGuiaAndToken = async (req: Request, res: Response): Promise <Response> => {

    const empresa = await getEmpresaByToken_Dalc(req.params.token)

    if(empresa == undefined){
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "The token is incorrect"))
    }
    
    const unaGuia = await guias_getPlanchadaByComprobanteAndByIdEmpresa_DALC(parseInt(req.params.guia), empresa.Id)
    
    if(unaGuia.length == 0){
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "The guide number does not exist"))
    }
    
    if (unaGuia!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unaGuia))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Guia inexistente"))
    }
}

export const getByComprobante = async (req: Request, res: Response): Promise <Response> => {
    const unaGuia = await guia_getByComprobante_DALC(req.params.Comprobante)
    
    if (unaGuia!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unaGuia))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Guia inexistente"))
    }
}

export const addFotoEntrega = async (req: Request, res: Response): Promise <Response> => {

    const guia=await guia_getById_DALC(parseInt(req.params.idGuia))
    if (guia==null) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Guia inexistente"))
    }

    const response = await set_guiasFotos_new(parseInt(req.params.idGuia), req.params.hash)
    return res.json(require("lsi-util-node/API").getFormatedResponse(response))
}

export const getByRemito = async (req: Request, res: Response): Promise <Response> => {
    const Guias = await guia_getRemitos_DALC(Number(req.params.idEmpresa),req.params.idRemito)
    
    if (Guias!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(Guias))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de guías"))
    }
}
