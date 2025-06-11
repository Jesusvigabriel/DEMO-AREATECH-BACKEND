import {Request, Response} from "express"

import {
  get_guiasFotos_getByIdGuia_DALC
} from '../DALC/guiasFotos.dalc'

export const get_fotosByGuia = async (req: Request, res: Response): Promise<Response> => {

  const response=await get_guiasFotos_getByIdGuia_DALC(parseInt(req.params.IdGuia))
  return res.json(require("lsi-util-node/API").getFormatedResponse(response))
}
