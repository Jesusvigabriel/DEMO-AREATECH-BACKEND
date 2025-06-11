import {createQueryBuilder, getRepository} from "typeorm"
import {Chofer} from "../entities/Chofer"
import {Guia} from '../entities/Guia'
import {
    calcularEntregasPreviasDelChofer
} from "../DALC/guias_DALC"
import { Empresa } from "../entities/Empresa"

export const chofer_getById_DALC = async (id: number) => {
    const unChofer = await getRepository(Chofer).findOne( {where: {Id: id}})
    return unChofer
}

export const chofer_getEntregasPorFecha_DALC = async (idChofer: number, fecha: string) => {
    const guiasDelDia = await getRepository(Guia).find( {where: {IdChofer: idChofer, Fecha: fecha, Estado: "DESPACHADO"}})

    if (guiasDelDia!=null) {
        for (const unaGuia of guiasDelDia) {
          const cantidadEntregasPrevias=await calcularEntregasPreviasDelChofer(unaGuia)!
          unaGuia.CantidadEntregasPrevias=cantidadEntregasPrevias! 
    
          const empresa=await getRepository(Empresa).findOne({Nombre: unaGuia.NombreCliente})
          if (empresa!=null) {
              unaGuia.PedirFotoDocumentacionEntrega=empresa?.RequiereFotoDocumentacionEntrega!
            } else {
                unaGuia.PedirFotoDocumentacionEntrega=false                
          }
    
        }
    }
    
    return guiasDelDia
}

export const chofer_getAll_DALC = async () => {
    const choferes = await getRepository(Chofer).find()
    return choferes
}

export const chofer_DALC = async (body:any) => {
    console.log(body)
    const newChofer = await getRepository(Chofer).create(body)
    const result = await getRepository(Chofer).save(newChofer);
    return result
}

export const chofer_edit_DALC = async (body:any, idEmpresa: number) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    console.log(datosAGuardar)
        const result = await getRepository(Chofer).save(datosAGuardar)
        return result
}