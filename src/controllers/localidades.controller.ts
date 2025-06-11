import {Request, Response} from "express"
import { localidad_getByCodigoPostal_DALC, localidad_getById_DALC } from "../DALC/localidades.dalc"

export const localidades_getById = async (req: Request, res: Response): Promise <Response> => {
    const result = await localidad_getById_DALC(parseInt(req.params.Id))
    
    if (!result) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Localidad inexistente"))
    } 
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    
}

export const localidades_getByCodigoPostal = async (req: Request, res: Response): Promise <Response> => {
    const result = await localidad_getByCodigoPostal_DALC(req.params.codigoPostal)
    
    if (!result) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Localidad inexistente"))
    } 
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    
}

