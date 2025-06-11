import { getRepository } from "typeorm"
import { GuiaActualizacion } from "../entities/GuiaActualizacion"

export const guiasActualizaciones_getByIdGuia_DALC = async (IdGuia: number) => {
  const results=await getRepository(GuiaActualizacion).find({IdGuia})
  return results
}

