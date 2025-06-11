import {getRepository} from "typeorm"
import { Localidad } from "../entities/Localidad"

export const localidad_getById_DALC = async (id: number) => {

    const result = await getRepository(Localidad).findOne( {where: {Id: id}})
    return result
}

export const localidad_getByCodigoPostal_DALC = async (codigoPostal: string) => {
    const result = await getRepository(Localidad).findOne( {where: {CodigoPostal: codigoPostal}})
    return result
}

