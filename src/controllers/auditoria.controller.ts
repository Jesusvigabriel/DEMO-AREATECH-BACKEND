import { Request, Response } from "express"
import { auditoria_get_DALC } from "../DALC/auditoria.dalc"

export const getAuditoria = async (req: Request, res: Response): Promise<Response> => {
    const entidad = req.params.entidad
    const idRegistro = req.params.idRegistro ? Number(req.params.idRegistro) : undefined
    const result = await auditoria_get_DALC(entidad, idRegistro)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}
