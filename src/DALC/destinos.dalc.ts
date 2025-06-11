import {getRepository} from "typeorm"
import { Destino } from "../entities/Destino"

export const destino_getById_DALC = async (id: number) => {
    const result = await getRepository(Destino).findOne( {where: {Id: id}})
    return result
}

export const destino_getByDomicilio_DALC = async (cliente: string, domicilio: string, codigoPostal: string, idEmpresa: number) => {
  const result = await getRepository(Destino).findOne( {where: {Nombre: cliente, Domicilio: domicilio, CodigoPostal: codigoPostal, IdEmpresa: idEmpresa }})
  return result
}

export const destino_getByNombreAndDomicilio_DALC = async (nombre: string, domicilio: string, codigoPostal: string, idEmpresa: number) => {
  const result = await getRepository(Destino).findOne( {where: {Nombre: nombre, Domicilio: domicilio, CodigoPostal: codigoPostal, IdEmpresa: idEmpresa }})
  return result
}

export const destino_new_DALC = async (destinoACrear:Destino) => {  
  const resultToSave = getRepository(Destino).create(destinoACrear)
  const result = await getRepository(Destino).save(resultToSave)
  return result
}


export const busca_agregaDestino_DALC = async(venta:any, idEmpresaEnArea:number) => {

  const {name, address, number, floor, zipCode} = venta.shippingAddress
  
  const nombreDomicilio = (address != undefined) ? `${address.trim()}` : '';
  const numberDomicilio = (number != undefined) ? `${number.trim()}` : '';
  const floorDomicilio = (floor !=  undefined) ? `${floor.trim()}` : '';

  const domicilio =`${nombreDomicilio} ${numberDomicilio} ${floorDomicilio}` 

  // Se consulta si esta Destino ya esta en la base de Area
  // const Eventual = await destino_getByDomicilio_DALC(domicilio.trim(), zipCode, idEmpresaEnArea)
  const Eventual = await destino_getByNombreAndDomicilio_DALC(name.trim(), domicilio.trim(), zipCode, idEmpresaEnArea)

  if(Eventual === undefined){
      // Se agrega eventual
      const data = await addDestinoEventual(venta.shippingAddress, idEmpresaEnArea)
      console.log(`Se ha agregado el Eventual`)
      // Se retorna el Id del nuevo destino / eventual creado
      return data
  }
  // Si el eventual existe se retorna el Id del Eventual encontrado
  return Eventual.Id
  
}

/**
 * 
 * @param {object} datosDestino -- Datos del nuevo destino / eventual agregar 
 * @param {number} idEmpresaEnArea -- id de la Emprea en Area
 * @returns {number} - Retorna el Id del nuevo eventual agregado
 */
const addDestinoEventual = async(datosDestino:any, idEmpresaEnArea:number) => {

  const {name, address, number, floor, locality, zipCode } = datosDestino

  const nombreDomicilio = (address != undefined) ? `${address.trim()}` : '';
  const numberDomicilio = (number != undefined) ? `${number.trim()}` : '';
  const floorDomicilio = (floor !=  undefined) ? `${floor.trim()}` : '';

  const domicilio =`${nombreDomicilio} ${numberDomicilio} ${floorDomicilio}` 

  const newEventual = new Destino()
  newEventual.Nombre=name
  newEventual.Domicilio= `${domicilio.trim()}`
  newEventual.Localidad=locality
  newEventual.CodigoPostal=zipCode
  newEventual.IdEmpresa=idEmpresaEnArea
  newEventual.Observaciones= ''  
  // Se agrega el nuevo eventual
  const data = await destino_new_DALC(newEventual)
  console.log(data)
  // Se retorna el Id del nuevo eventual agregado
  return data.Id
}