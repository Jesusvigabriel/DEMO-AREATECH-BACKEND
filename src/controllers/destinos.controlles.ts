import {Request, Response} from "express"
import {
    chofer_getById_DALC,
    chofer_getEntregasPorFecha_DALC
} from '../DALC/choferes.dalc'
import { destino_getById_DALC } from "../DALC/destinos.dalc"

export const getById = async (req: Request, res: Response): Promise <Response> => {
    const result = await destino_getById_DALC(parseInt(req.params.id))
    
    if (result) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Destino inexistente"))
    }
}
