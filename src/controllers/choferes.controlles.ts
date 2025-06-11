import {Request, Response} from "express"
import {
    chofer_getById_DALC,
    chofer_getEntregasPorFecha_DALC,
    chofer_getAll_DALC,
    chofer_DALC,
    chofer_edit_DALC
} from '../DALC/choferes.dalc'

export const getById = async (req: Request, res: Response): Promise <Response> => {
    const unChofer = await chofer_getById_DALC(parseInt(req.params.Id))
    
    if (unChofer!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(unChofer))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Chofer inexistente"))
    }
}

export const getEntregasPorFecha = async (req: Request, res: Response): Promise <Response> => {
    const entregasDelChofer = await chofer_getEntregasPorFecha_DALC(parseInt(req.params.Id), req.params.Fecha)
    
    if (entregasDelChofer!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(entregasDelChofer))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error en obtención de entregas"))
    }
}

export const getAll = async (req: Request, res: Response): Promise <Response> => {
    const choferes = await chofer_getAll_DALC()
    if (choferes!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(choferes))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al obtener Choferes"))
    }
}

export const putChofer = async (req: Request, res: Response): Promise <Response> => {  
    console.log(req.body)
    const result = await chofer_DALC(req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result, "Chofer Creado Correctamente"))
}

export const editChofer = async (req: Request, res: Response): Promise <Response> => {
    
    const idChofer = (parseInt(req.params.Id)) ? parseInt(req.params.Id) : 0
    console.log(idChofer)
    const chofer = await chofer_getById_DALC(idChofer)

    if(chofer){
        const result = await chofer_edit_DALC(req.body, idChofer)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }
    return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Chofer inexistente"))  

}