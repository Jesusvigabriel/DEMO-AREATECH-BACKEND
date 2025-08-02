import { notEqual, notStrictEqual } from "assert"
import { url } from "inspector"
import { nanoid } from "nanoid"
import {Between, createQueryBuilder,Like, getRepository, LessThan, LessThanOrEqual, LockNotSupportedOnGivenDriverError, MoreThanOrEqual, Not} from "typeorm"
import { Destino } from "../entities/Destino"
import { Empresa } from "../entities/Empresa"
import {Guia} from "../entities/Guia"
import { GuiaActualizacion } from "../entities/GuiaActualizacion"
import { GuiaRendicion } from "../entities/GuiasRendicion"
import { Orden } from "../entities/Orden"
import { destino_new_DALC } from "./destinos.dalc"
import { empresa_getById_DALC } from "./empresas.dalc"
import { guiasActualizaciones_getByIdGuia_DALC } from "./guiasActualizacion_DALC"
import { localidad_getByCodigoPostal_DALC } from "./localidades.dalc"
import { emailService } from "../services/email.service"
import { renderEmailTemplate } from "../helpers/emailTemplates"
import { orden_getDetalleByOrden, orden_editEstado_DALC } from "./ordenes.dalc"
import { producto_getById_DALC } from "./productos.dalc"
import { Usuario } from "../entities/Usuario"
import { insertGuiaEstadoHistorico } from "./guiasEstadoHistorico.dalc"
import { emailProcesoConfig_get } from "./emailProcesoConfig.dalc"
const { logger } = require('../helpers/logger')


//select * from planchada where guia in (948888, 949285, 949286, 949287, 949288, 949289, 949290, 949291, 949292, 949293, 949294, 949295, 949296, 949500, 949501, 949502, 949503, 949504, 949505, 949506, 949507, 949508, 949509, 949510, 949807, 949879, 949880, 949881, 949882, 949883, 949884, 949885, 949886, 949887, 949888, 949889, 949890, 949891, 949892, 949893, 949894, 949895)

export const guias_repararCRR_DALC = async() => {
  // const guiasAReparar=[948888, 949285, 949286, 949287, 949288, 949289, 949290, 949291, 949292, 949293, 949294, 949295, 949296, 949500, 949501, 949502, 949503, 949504, 949505, 949506, 949507, 949508, 949509, 949510, 949807, 949879, 949880, 949881, 949882, 949883, 949884, 949885, 949886, 949887, 949888, 949889, 949890, 949891, 949892, 949893, 949894, 949895]
  const guiasAReparar=[949345, 949346, 949347, 949348, 949349, 949350, 949351, 949352, 949353, 949354, 949355, 949356, 949357, 949358, 949359, 949360, 949361, 949362, 949497, 949660, 949661, 949662, 949663, 949664, 949665, 949666, 949667, 949668, 949669, 949670, 949671, 949672, 949673, 949674, 949829, 949830, 949831, 949832, 949833, 949834, 949835, 949836, 949837, 949838, 949934, 949935, 949936, 949937, 949938, 949939, 949940, 949941, 949942, 949943, 949944, 949945, 949946, 949947, 949948, 949949, 949950, 950053]
  for (const unaIdAReparar of guiasAReparar) {
    const unaGuia=await guia_getById_DALC(unaIdAReparar)
    if (unaGuia) {
      const detalleCalculo=JSON.parse(String(unaGuia.DetalleCalculo))
      
      let posicionCRR=-1
      let posicionActual=0

      while (posicionActual<detalleCalculo.length) {
        const unDetalle=detalleCalculo[posicionActual]        
        if (unDetalle.Concepto.includes("CTR")) {
          posicionCRR=posicionActual
        }
        posicionActual++
      }
      // console.log(unaGuia.DetalleCalculo, posicionCRR)

      if (posicionCRR>=0) {
        detalleCalculo.splice(posicionCRR)
        console.log(unaGuia.Id, detalleCalculo)
      } else {
        console.log("No existía CRR")
      }

      await getRepository(Guia).update(unaGuia.Id, {DetalleCalculo: JSON.stringify(detalleCalculo)})

    


    }
  }
}

export const guias_revisarRetroactivamentePorFlete_DALC = async() => {
  console.log("Revisando retroactivamente por flete...")

  const guias=await getRepository(Guia).find({where: {Fecha: MoreThanOrEqual('2022-02-01'),  Flete: 0, DetalleCalculo: Not('')}})
  // console.log(guias)
  for (const unaGuia of guias) {
    // console.log(unaGuia.DetalleCalculo)

    const DetalleCalculo=JSON.parse(String(unaGuia.DetalleCalculo))

    console.log(unaGuia.Id, unaGuia.Estado, unaGuia.Fecha)
    if (DetalleCalculo) {
      for (const unConcepto of DetalleCalculo) {
        // console.log(unConcepto)
        if (unConcepto.Concepto.includes("Guia")) {
          if (isNaN(Number(unConcepto.Total))) {
            console.log("No hay dato numérico")
          } else {
            await getRepository(Guia).update(unaGuia.Id, {Flete: unConcepto.Total})
          }
  
        }
      }
    }


  }


}


export const guia_editOne_DALC = async (guiaOriginal: Guia, body: any) => {
  const datosAGuardar={}
  Object.assign(datosAGuardar, body)
  const result=await getRepository(Guia).update(guiaOriginal.Id, datosAGuardar)
  return result
}

export const guias_registrarRendiciones = async (empresa: Empresa, guiasARendir: Guia[], usuario: string) => {
  //Genero una nueva rendicion
  const nuevaRendicion=getRepository(GuiaRendicion).create()
  nuevaRendicion.IdEmpresa=empresa.Id
  nuevaRendicion.Usuario = usuario
  const result = await getRepository(GuiaRendicion).save(nuevaRendicion)

  //A cada guia le registro su rendicion
  for (const unaGuiaARendir of guiasARendir) {
    await getRepository(Guia).update(unaGuiaARendir.Id, {IdRendicion: result.Id})
  }

  return result

  
}



export const guia_registrar_entrega = async (id: number, idChofer: number, fecha: string, estado: string) => {
  const guiaAActualizar=await getRepository(Guia).findOne({where: {Id: id, IdChofer: idChofer, Fecha: fecha}})
  if (guiaAActualizar!=null) {
    guiaAActualizar.Estado=estado
    //guiaAActualizar.NombreReceptor=nombreReceptor
    const guiaActualizada=await getRepository(Guia).save(guiaAActualizar)
    await insertGuiaEstadoHistorico(guiaActualizada.Id, estado, "", new Date())
    return guiaActualizada
  } else {
    return null
  }
}

export const guia_getHashFoto = async (idGuia: number, idChofer: number, fecha: string) => {
  const guiaAActualizar=await getRepository(Guia).findOne({where: {Id: idGuia, IdChofer: idChofer, Fecha: fecha}})
  if (guiaAActualizar!=null) {

    //Genero un hash, lo guardo en la guia, y lo devuelvo
    const hashGenerado=require("nanoid").nanoid()
    guiaAActualizar.HashFotoNoEntregado=hashGenerado
    const guiaActualizada=await getRepository(Guia).save(guiaAActualizar)
    return hashGenerado
  } else {
    return null    
  }
}

export const guias_actualizarFecha = async (fecha: string, idsGuias: string) => {
  const arrIdsGuias=idsGuias.split("|")
  for (const unaId of arrIdsGuias) {
    const guiaPreviaActualizacion=await getRepository(Guia).findOne({Id: Number(unaId)})
    if (guiaPreviaActualizacion) {
      const corrimiento=require("lsi-util-node/fechas").getDistanciaEntreFechas(fecha, guiaPreviaActualizacion.Fecha)
      // console.log("Corrimiento", corrimiento, "Atraso actual", guiaPreviaActualizacion!.Atraso)
      const nuevoAtraso=Number(Math.max(0, corrimiento)) + Number(guiaPreviaActualizacion.Atraso)
      // console.log("Nuevo atraso", nuevoAtraso)
      await getRepository(Guia).update(unaId, {Fecha: fecha, Atraso: nuevoAtraso, Estado: "En Planchada", IdChofer: 0})
      await insertGuiaEstadoHistorico(Number(unaId), "En Planchada", "", new Date())

      const guiaActualizadaToSave=new GuiaActualizacion()
      guiaActualizadaToSave.IdGuia=guiaPreviaActualizacion.Id
      
      guiaActualizadaToSave.EstadoAnterior=guiaPreviaActualizacion.Estado
      guiaActualizadaToSave.FechaAnterior=guiaPreviaActualizacion.Fecha
      guiaActualizadaToSave.AtrasoAnterior=guiaPreviaActualizacion.Atraso
      
      guiaActualizadaToSave.EstadoActualizado=guiaPreviaActualizacion.Estado
      guiaActualizadaToSave.FechaActualizada=fecha
      guiaActualizadaToSave.AtrasoActualizado=nuevoAtraso

      const newGuiaActualizada=getRepository(GuiaActualizacion).create(guiaActualizadaToSave)
      getRepository(GuiaActualizacion).save(newGuiaActualizada)
    }


  }
  return arrIdsGuias.length
}


export const crearNuevaGuiaDesdeOrden_DALC = async (orden: Orden, destino: Destino, requestBody: any) => {

  const empresa=await empresa_getById_DALC(orden.IdEmpresa)

  const detalleDeLaOrden=await orden_getDetalleByOrden(orden)
  // console.log("Detalle de la orden", detalleDeLaOrden);

  let kilos=0
  let M3=0
  for (const unDetalle of detalleDeLaOrden) {
    const producto=await producto_getById_DALC(unDetalle.IdProducto)
    if (producto) {

      kilos += Number(producto.Peso) * Number(unDetalle.Unidades)
      M3 += Number(producto.Largo) * Number(producto.Alto) * Number(producto.Ancho) * Number(unDetalle.Unidades)
    }
  }
  
  const nuevaGuia=new Guia()
  nuevaGuia.Bultos=orden.Bultos===null ? 0 : orden.Bultos
  nuevaGuia.IdChofer=0
  nuevaGuia.IdOrden = orden.Id
  if(orden.Estado==5){
    nuevaGuia.Estado="RETIRA CLIENTE"
  }else{
    nuevaGuia.Estado="En Planchada"
  }
  
  nuevaGuia.Ventana=0
  nuevaGuia.Eventual=0
  nuevaGuia.CodigoPostal=destino.CodigoPostal
  nuevaGuia.Domicilio=destino.Domicilio
  nuevaGuia.Fecha=orden.Fecha
  nuevaGuia.Kilos=kilos
  nuevaGuia.Volumen=M3

  const localidad=await localidad_getByCodigoPostal_DALC(nuevaGuia.CodigoPostal)
  if (localidad) {
    nuevaGuia.Localidad=localidad.Nombre
  } else {
    nuevaGuia.Localidad=destino.Localidad
  }

  nuevaGuia.NombreCliente=empresa.RazonSocial
  nuevaGuia.IdEmpresa = empresa.Id
  nuevaGuia.NombreDestino=destino.Nombre
  nuevaGuia.Observaciones=orden.Observaciones
  nuevaGuia.Remitos=orden.Numero
  nuevaGuia.ValorDeclarado=orden.ValorDeclarado

  nuevaGuia.EmailDestinatario=orden.EmailDestinatario
  nuevaGuia.TokenAccesoTracking=nanoid()

  if (requestBody.EsCRR) {
    nuevaGuia.ContraReembolso=orden.ValorDeclarado
  } else {
    nuevaGuia.ContraReembolso=0
  }
  
  nuevaGuia.DetalleCalculo=JSON.stringify(requestBody.Calculo)

  let importeGuia=0
  for (const unDetalle of requestBody.Calculo) {
    if (unDetalle.Concepto.toUpperCase()=="Guia".toUpperCase()) {
      importeGuia=unDetalle.Total
    }
  }
  nuevaGuia.Flete=importeGuia
 
  const guiaAGrabar=getRepository(Guia).create(nuevaGuia)
  const result=await getRepository(Guia).save(guiaAGrabar)
  await insertGuiaEstadoHistorico(result.Id, result.Estado, "", new Date())

  getRepository(Guia).update(result.Id, {Comprobante: String(result.Id)})
  result.Comprobante=String(result.Id)

  orden.IdGuia = result.Id
  const ordenActualizada = await orden_editEstado_DALC(orden, 3, '')
  logger.info(`Order ${orden.Id} moved to 3 with guide ${result.Id}`)

  if (nuevaGuia.EmailDestinatario && nuevaGuia.EmailDestinatario!=="") {
    const config = await emailProcesoConfig_get(nuevaGuia.IdEmpresa, 'GUIA_TRACKING')
    const destinatarioFinal = config?.Destinatarios || nuevaGuia.EmailDestinatario

    if (destinatarioFinal.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      const valores = {
        nombreDestino: nuevaGuia.NombreDestino,
        comprobante: result.Comprobante,
        domicilio: nuevaGuia.Domicilio,
        urlAcceso: `<a href='https://seguimiento.area54sa.com.ar/tracking/${result.Comprobante}/${nuevaGuia.TokenAccesoTracking}'>Haga click aquí para ver el estado de la guía</a>`
      }

      let titulo = `Seguí tu envío ${result.Comprobante}`
      let cuerpo = `Estimado <b>${nuevaGuia.NombreDestino}</b><br><br>Adjuntamos a continuación el link de acceso para el seguimiento de la guía <b>${result.Comprobante}</b> que se ha generado para el despacho a <b>${nuevaGuia.Domicilio}</b><br><br>${valores.urlAcceso}`

      const plantilla = await renderEmailTemplate('GUIA_TRACKING', valores, config?.IdEmailTemplate)
      if (plantilla) {
        titulo = plantilla.asunto
        cuerpo = plantilla.cuerpo
      }

      await emailService.sendEmail({
        idEmpresa: nuevaGuia.IdEmpresa,
        destinatarios: destinatarioFinal,
        titulo,
        cuerpo,
        idEmailServer: config?.IdEmailServer,
        idEmailTemplate: config?.IdEmailTemplate
      })
    } else {
      console.log("Email invalido", destinatarioFinal)
    }

  }



  return result  

}
 
export const crearNuevaGuiaDesdeExcel_DALC = async (empresa: Empresa, requestBody: any) => {

  const nuevaGuia=new Guia()
  nuevaGuia.Bultos=Number(requestBody.Bultos)
  nuevaGuia.IdChofer=0
  nuevaGuia.Estado="En Planchada"
  nuevaGuia.Ventana=0
  nuevaGuia.Eventual=0
  nuevaGuia.CodigoPostal=requestBody.CodigoPostal
  nuevaGuia.Domicilio=requestBody.DomicilioDestinatario
  nuevaGuia.EmailDestinatario=requestBody.EmailDestinatario

  nuevaGuia.TokenAccesoTracking=nanoid()

  // nuevaGuia.Fecha=require("lsi-util-node/fechas").getHoy()
  nuevaGuia.Fecha=requestBody.FechaEntrega
  nuevaGuia.Kilos=requestBody.Kilos
  nuevaGuia.Volumen=requestBody.M3

  const localidad=await localidad_getByCodigoPostal_DALC(nuevaGuia.CodigoPostal)
  if (localidad) {
    nuevaGuia.Localidad=localidad.Nombre
  } else {
    nuevaGuia.Localidad=''
  }

  nuevaGuia.NombreCliente=empresa.RazonSocial
  nuevaGuia.IdEmpresa = empresa.Id
  nuevaGuia.NombreDestino=requestBody.Destinatario
  nuevaGuia.Observaciones="Generada desde Excel - "+requestBody.Observaciones
  nuevaGuia.Remitos=requestBody.Remitos
  nuevaGuia.ValorDeclarado=requestBody.ValorDeclarado
  nuevaGuia.ContraReembolso=requestBody.CRR
  
  nuevaGuia.DetalleCalculo=JSON.stringify(requestBody.Desglose)

  let importeGuia=0
  for (const unDetalle of requestBody.Desglose) {
    // if (unDetalle.Concepto.toUpperCase()=="Guia".toUpperCase()) {
    if (unDetalle.Concepto.includes("Guia")) {
      importeGuia=unDetalle.Total
    }
  }
  nuevaGuia.Flete=importeGuia
 
  const guiaAGrabar=getRepository(Guia).create(nuevaGuia)
  const result=await getRepository(Guia).save(guiaAGrabar)

  getRepository(Guia).update(result.Id, {Comprobante: String(result.Id)})
  result.Comprobante=String(result.Id)

    if (nuevaGuia.EmailDestinatario && nuevaGuia.EmailDestinatario!=="") {
      const config = await emailProcesoConfig_get(nuevaGuia.IdEmpresa, 'GUIA_TRACKING')
      const base = config?.Destinatarios || nuevaGuia.EmailDestinatario
      const ejemplo =  base.split(",")
      ejemplo.forEach(async mails => {
        if (mails.trim().toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
          const valores = {
            nombreDestino: nuevaGuia.NombreDestino,
            comprobante: result.Comprobante,
            domicilio: nuevaGuia.Domicilio,
            urlAcceso: `<a href='https://seguimiento.area54sa.com.ar/tracking/${result.Comprobante}/${nuevaGuia.TokenAccesoTracking}'>Haga click aquí para ver el estado de la guía</a>`
          }

          let titulo = `Seguí tu envío ${result.Comprobante}`
          let cuerpo = `Estimado <b>${nuevaGuia.NombreDestino}</b><br><br>Adjuntamos a continuación el link de acceso para el seguimiento de la guía <b>${result.Comprobante}</b> que se ha generado para el despacho a <b>${nuevaGuia.Domicilio}</b><br><br>${valores.urlAcceso}`

          const plantilla = await renderEmailTemplate('GUIA_TRACKING', valores, config?.IdEmailTemplate)
          if (plantilla) {
            titulo = plantilla.asunto
            cuerpo = plantilla.cuerpo
          }

          await emailService.sendEmail({
            idEmpresa: nuevaGuia.IdEmpresa,
            destinatarios: mails.trim(),
            titulo,
            cuerpo,
            idEmailServer: config?.IdEmailServer,
            idEmailTemplate: config?.IdEmailTemplate
          })
        } else {
          console.log("Email invalido", mails.trim())
        }
      })


    }

  return result  

}
 

export const guias_get_sinRendirByIdEmpresa_DALC = async (empresa: Empresa) => {

  const results = await getRepository(Guia).find(
    {where:
      [
        {IdEmpresa: empresa.Id, IdRendicion: -1, Estado: 'ENTREGADO'},
        {IdEmpresa: empresa.Id, IdRendicion: -1, Estado: 'PARCIAL'},
        {IdEmpresa: empresa.Id, IdRendicion: -1, Estado: 'NO ENTREGADO'},
      ]
    }
  )

  // console.log(results);
  
  return results
}

export const guias_getByFecha_soloDespachadas_DALC = async (fecha: string) => {
  const guiasDelDia = await getRepository(Guia).find( 
    {
      where: {Fecha: fecha, Estado: "DESPACHADO"},
      relations: ["Chofer"]
    }
  )
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

export const guias_getAllEnPlanchada_DALC = async () => {
  const results = await getRepository(Guia).find({
    where: 
    [
      {Estado: "En Planchada", Fecha: MoreThanOrEqual('2021-11-01')},
      {Estado: "NO ENTREGADO", Fecha: MoreThanOrEqual('2021-11-01')},
    ]
  })
    
    
  return results
}

export const guias_getPlanchadaByComprobanteAndToken_DALC = async (comprobante: String, tokenAccesoTracking: string) => {
  const results = await getRepository(Guia).find({
    where: 
    [
      {Comprobante: comprobante, TokenAccesoTracking: tokenAccesoTracking},
    ]
  })
  return results
}

export const guias_getPlanchadaByComprobanteAndByIdEmpresa_DALC = async (guia: number, idEmpresa: any) => { 

  const result = await createQueryBuilder("planchada", "p")
    .select("Comprobante, Remitos, Estado, id_rendicion as Rendicion, Destino as NombreDestino, email_destinatario as EmailDestinatario, " + 
      "Domicilio, CP as CodigoPostal, Localidad, Bultos, Kilos, Volumen")
    .where("guia = :guia", {guia})
    .andWhere("id_empresa = :idEmpresa", {idEmpresa})
    .execute()

  return result
}

export const guias_getByPeriodoEmpresa_DALC = async (fechaDesde: String, fechaHasta: String, empresa: Empresa | null) => {
  let results
  
  fechaDesde+=" 00:00:00"
  fechaHasta+=" 23:59:59"
  
  console.log(fechaDesde, fechaHasta)

  const findOptions: any = {
    where: {FechaOriginal: Between(fechaDesde, fechaHasta)},
    relations: ["Orden", "Empresa"]
  }
  if (empresa) {
    findOptions.where.IdEmpresa = empresa.Id
  }
  results = await getRepository(Guia).find(findOptions)

  for (const unaGuia of results) {
    if (unaGuia.Empresa) {
      unaGuia.NombreCliente = unaGuia.Empresa.Nombre
    }
  }
    
  return results
}

export const guias_getByPeriodoIdEmpresa_DALC = async (fechaDesde: String, fechaHasta: String, empresa: Empresa | null) => {
  let results
  
  fechaDesde+=" 00:00:00"
  fechaHasta+=" 23:59:59"

  const findOptions: any = {
    where: {FechaOriginal: Between(fechaDesde, fechaHasta)},
    relations: ["Orden", "Empresa"]
  }
  if (empresa) {
    findOptions.where.IdEmpresa = empresa.Id
  }
  results = await getRepository(Guia).find(findOptions)

  for (const unaGuia of results) {
    if (unaGuia.Empresa) {
      unaGuia.NombreCliente = unaGuia.Empresa.Nombre
    }
  }
    
  return results
}

export const guiasChoferes_getByPeriodoEmpresa_DALC = async (fechaDesde: String, fechaHasta: String, empresa: Empresa | null) => {
  let results
  
  fechaDesde+=" 00:00:00"
  fechaHasta+=" 23:59:59"
  
  const findOptions: any = {
    where: {Fecha: Between(fechaDesde, fechaHasta)},
    relations: ["Orden", "Empresa"]
  }
  if (empresa) {
    findOptions.where.IdEmpresa = empresa.Id
  }

  results = await getRepository(Guia).find(findOptions)

  for (const unaGuia of results) {
    if (unaGuia.Empresa) {
      unaGuia.NombreCliente = unaGuia.Empresa.Nombre
    }
  }
  return results
}
  
export const guia_getById_DALC = async (id: number) => {
  const unaGuia = await getRepository(Guia).findOne( {where: {Id: id}, relations: ["Chofer"]})
  if (unaGuia!=null) {
    const cantidadEntregasPrevias=await calcularEntregasPreviasDelChofer(unaGuia)!
    unaGuia.CantidadEntregasPrevias=cantidadEntregasPrevias!
  }
  return unaGuia
}
    
export const guia_getByComprobante_DALC = async (comprobante: string) => {
  const unaGuia = await getRepository(Guia).findOne( 
    {
      where: {Comprobante: comprobante}, 
      order: {Fecha: "DESC"},
      relations: ["Chofer"]
    }
  )
  if (unaGuia!=null) {
    const cantidadEntregasPrevias= await calcularEntregasPreviasDelChofer(unaGuia)
    unaGuia.CantidadEntregasPrevias=cantidadEntregasPrevias!
  }
  return unaGuia
}

export const calcularEntregasPreviasDelChofer =  async (guia: Guia)  => {
  if (guia.Estado==="DESPACHADO") {
    //Obtengo todas las guías del chofer, para el mismo día, misma ventana, cuyo orden de entrega sea menor, y no esté entregadas
    try {
      const response=await getGuiasSinEntregarByChoferAndFechaAndVentana(guia)
      return response.length
    } catch (error) {
      console.log("Error", error);     
    }
  } else {
    return -1
  }
}


async function getGuiasSinEntregarByChoferAndFechaAndVentana(guia: Guia) {
  const guias = await getRepository(Guia).find( 
    {
      where: {
        IdChofer: guia.IdChofer,
        Fecha: guia.Fecha,
        Ventana: guia.Ventana,
        Estado: "DESPACHADO",
        OrdenEntrega: LessThan(guia.OrdenEntrega)
      }
    }
  )
  return guias
}

export const guia_addFotoNoEntregada_DALC = async(id: number, hash:string) => {
  const unaGuia = await getRepository(Guia).findOne({where: {Id: id}})
  if(unaGuia){
    const body = {
      HashFotoNoEntregado: hash  
    }
    getRepository(Guia).merge(unaGuia, body);
    await getRepository(Guia).save(unaGuia);
    return 'Imagen asociada correctamente'

  } else {
    return null
  }  
  

}


export const guia_getRemitos_DALC = async(idEmpresa: number, idRemito:string) => {
  // const result=await createQueryBuilder("planchada", "p")
  //       .select("Comprobante, Remitos, Estado, token_acceso_tracking")
  //       .where("id_empresa = :idEmpresa",{idEmpresa})
  //       .andWhere("remitos LIKE :idRemito", {idRemito})
  //       .execute()
        const result = await getRepository(Guia).find({where:{Remitos: Like(`%${idRemito}%`), IdEmpresa: idEmpresa} } )
    return result
   
  

}

