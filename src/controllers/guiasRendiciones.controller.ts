import {Request, Response} from "express"
import {
    rendicion_getById_DALC
} from '../DALC/guiasRendiciones_DALC'

export const get_RendicionById = async (req: Request, res: Response): Promise <Response> => {
    const result=await rendicion_getById_DALC(Number(req.params.IdRendicion))

    if (result.status=="ERROR") {
        return res.json(require("lsi-util-node/API").getFormatedResponse("", result.data))
    } else {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result.data))
    }


}

