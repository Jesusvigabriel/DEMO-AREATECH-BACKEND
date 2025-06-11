import {getRepository} from "typeorm"
import { Factura } from "../entities/Factura"

export const factura_generarNueva_DALC = async (facturaAEmitir:Factura) => {  
  const resultToSave = getRepository(Factura).create(facturaAEmitir)
  const result = await getRepository(Factura).save(resultToSave)
  return {status: "OK", data: result}
}
