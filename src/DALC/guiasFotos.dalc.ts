import { getRepository } from "typeorm"
import { GuiaFoto } from "../entities/GuiaFoto"

export const get_guiasFotos_getByIdGuia_DALC = async (idGuia: number) => {
  const unaGuia = await getRepository(GuiaFoto).find({where: {IdGuia: idGuia}})
  return unaGuia
}
  
export const set_guiasFotos_new = async (idGuia: number, hash: string) => {
  const newGuiaFoto=new GuiaFoto()
  newGuiaFoto.IdGuia=idGuia
  newGuiaFoto.Hash=hash

  const resultToSave=getRepository(GuiaFoto).create(newGuiaFoto)
  const result=await getRepository(GuiaFoto).save(resultToSave)

  return result

}