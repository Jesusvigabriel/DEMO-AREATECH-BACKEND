import { Request, Response } from "express"
import { auditoria_getByEntidad_DALC, auditoria_getByEntidadId_DALC } from "../DALC/auditoria.dalc"

export const getAuditoriaByEntidad = async (req: Request, res: Response): Promise<Response> => {
    const result = await auditoria_getByEntidad_DALC(req.params.entidad)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

export const getAuditoriaByEntidadId = async (req: Request, res: Response): Promise<Response> => {
    const result = await auditoria_getByEntidadId_DALC(req.params.entidad, Number(req.params.id))
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}
