import { getRepository } from "typeorm"
import { Guia } from "../entities/Guia"
import { GuiaRendicion } from "../entities/GuiasRendicion"
import { empresa_getById_DALC } from "./empresas.dalc"

export const rendicion_getById_DALC = async (idRendicion: number) => {
  const rendicion =  await getRepository(GuiaRendicion).findOne({Id: idRendicion})
  if (!rendicion) {
    return {status: "ERROR", data: "Id de rendición inexistente"}
  }

  const empresa=await empresa_getById_DALC(rendicion.IdEmpresa)

  const guias=await getRepository(Guia).find({IdRendicion: idRendicion})

  rendicion.Guias=guias
  rendicion.Empresa=empresa
  
  return {status: "OK", data: rendicion}
  
}


