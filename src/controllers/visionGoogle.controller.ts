
import {Request, Response} from "express"

import {
    getNumeroGuiaImage
} from "../helpers/visionGoogle"


  

  export const getNumeroGuiaFoto = async (req: Request, res: Response): Promise <Response> => {
    const result = await getNumeroGuiaImage()
    return res.json(require("lsi-util-node/API").getFormatedResponse(result))
}

