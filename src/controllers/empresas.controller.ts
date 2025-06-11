import {Request, Response} from "express"
import {
    empresas_getAll_DALC,
    empresa_getById_DALC,
    empresaConfiguracion_getById_DALC,
    empresa_putConfiguracion_DALC,
    empresa_activar_DALC,
    empresa_getAlmacenajePeriodo_DALC,
    empresasConfiguracion_getAll_DALC,
    empresa_editOne_configuracion_DALC,
    empresa_activar_autogestion_DALC,
    empresa_activar_mostrarTyC_DALC,
    empresa_registrar_autogestion_opciones_DALC,
    empresa_putConfiguracionHistorico_DALC,
    empresaConfiguraciones_getById_DALC,
    save_Empresa_DALC,
    empresa_DALC,
    empresaConfiguraciones_getOneById_DALC,
    empresa_editOne_configuracionHistorico_DALC
} from '../DALC/empresas.dalc'
import { EmpresaConfiguracion } from "../entities/EmpresaConfiguracion"

export const empresa_editOne_configuracion = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(Number(req.params.id))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const configuracion=await empresaConfiguracion_getById_DALC(empresa.Id)
    const configuracionActualizada=await empresa_editOne_configuracion_DALC(configuracion, req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(configuracionActualizada))
}

export const empresa_editOne_configuracionHistorico = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(Number(req.params.id))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

    const configuracion=await empresaConfiguraciones_getOneById_DALC(empresa.Id)
    const configuracionActualizada=await empresa_editOne_configuracionHistorico_DALC(configuracion, req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(configuracionActualizada))
}

export const empresa_getAlmacenajePeriodo = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(Number(req.params.idEmpresa))
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
    const result=await empresa_getAlmacenajePeriodo_DALC(empresa, req.params.fechaDesde, req.params.fechaHasta, "")    
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}
export const getAllEmpresas = async (req: Request, res: Response): Promise <Response> => {
    const results = await empresas_getAll_DALC()
    // console.log("Results", results);
    
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const setEmpresaActivar = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(parseInt(req.params.id))

    if (empresa) {
        const result=await empresa_activar_DALC(empresa, req.params.activa=="true")
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}

export const setEmpresaActivarAutogestion = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(parseInt(req.params.id))

    if (empresa) {
        const result=await empresa_activar_autogestion_DALC(empresa, req.params.activa=="true")
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}


export const setEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(parseInt(req.params.id))
    if (empresa) {
        const result=await save_Empresa_DALC(req.body)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}

// Se crea un Nueva empresa
export const putEmpresa = async (req: Request, res: Response): Promise <Response> => {
  
    //console.log(req.body)

    const result = await empresa_DALC(req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result, "Empresa Creada Correctamente"))

}

export const setEmpresaAutogestionOpciones = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(parseInt(req.params.id))

    if (empresa) {
        const result=await empresa_registrar_autogestion_opciones_DALC(empresa, req.params.opciones)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}

export const setEmpresaActivarMostrarTyC = async (req: Request, res: Response): Promise <Response> => {
    const empresa=await empresa_getById_DALC(parseInt(req.params.id))

    if (empresa) {
        const result=await empresa_activar_mostrarTyC_DALC(empresa, req.params.activa=="true")
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}


export const getById = async (req: Request, res: Response): Promise <Response> => {
    const unaEmpresa = await empresa_getById_DALC(parseInt(req.params.Id))
    
    if (unaEmpresa!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unaEmpresa))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}

export const getConfiguracionAll = async (req: Request, res: Response): Promise <Response> => {
    const results=await empresasConfiguracion_getAll_DALC()
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const getConfiguracionById = async (req: Request, res: Response): Promise <Response> => {
    const unaEmpresa = await empresa_getById_DALC(parseInt(req.params.Id))
    
    if (unaEmpresa!=null) {
        const configuracion=await empresaConfiguracion_getById_DALC(parseInt(req.params.Id))
        if (configuracion) {
            return res.json(require("lsi-util-node/API").getFormatedResponse(configuracion))
        } else {
            const result = await empresa_putConfiguracion_DALC({}, parseInt(req.params.Id))
            return res.json(require("lsi-util-node/API").getFormatedResponse(result))
        }
        
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}

export const getConfiguracionesById = async (req: Request, res: Response): Promise <Response> => {
    const unaEmpresa = await empresa_getById_DALC(Number(req.params.idEmpresa))
    
    if (unaEmpresa!=null) {
        const configuracion=await empresaConfiguraciones_getById_DALC(Number(req.params.idEmpresa),req.params.fechaDesde,req.params.fechaHasta)
        if (configuracion) {
            return res.json(require("lsi-util-node/API").getFormatedResponse(configuracion))
        } else {
            const result = await empresa_putConfiguracion_DALC({}, parseInt(req.params.idEmpresa))
            return res.json(require("lsi-util-node/API").getFormatedResponse(result))
        }
        
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
}


// Se crea o Actualiza la Configuración de una Empresa
export const putConfiguracionEmpresa = async (req: Request, res: Response): Promise <Response> => {
    const idEmpresa = (parseInt(req.params.idEmpresa)) ? parseInt(req.params.idEmpresa) : 0
    const empresa = await empresa_getById_DALC(idEmpresa)

    if(empresa){
        const result = await empresa_putConfiguracion_DALC(req.body, idEmpresa)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }
    return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
}

// Se crea un nuevo registro en la tabla historico de Configuracion de Empresas
export const putConfiguracionEmpresaHistorico = async (req: Request, res: Response): Promise <Response> => {
    const idEmpresa = (parseInt(req.params.idEmpresa)) ? parseInt(req.params.idEmpresa) : 0
    const empresa = await empresa_getById_DALC(idEmpresa)

    if(empresa){
        const result = await empresa_putConfiguracionHistorico_DALC(req.body, idEmpresa)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }
    return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
}



