import {Between, getRepository,Like, Not, createQueryBuilder} from "typeorm"
import { Destino } from "../entities/Destino"
import { Empresa } from "../entities/Empresa"
import {Orden} from "../entities/Orden"
import { OrdenDetalle } from "../entities/OrdenDetalle"
import { Posicion } from "../entities/Posicion"
import { PosicionEnOrdenDetalle } from "../entities/PosicionEnOrdenDetalle"
import { PosicionProducto } from "../entities/PosicionProducto"
import { destino_getByDomicilio_DALC, destino_getById_DALC, destino_new_DALC } from "./destinos.dalc"
import { getLotesDetalle_DALC, producto_desposicionar_DALC, producto_desposicionar_Lote_DALC, producto_desposicionar_paqueteria_DALC, producto_getByBarcodeAndEmpresa_DALC, producto_getByIdAndEmpresa_DALC, producto_getPosiciones_byIdProducto_Lote_DALC } from "./productos.dalc"
import { mailSaliente_send_DALC } from "./mailSaliente.dalc"
import { MailSaliente } from "../entities/MailSaliente"
import { producto_getStock_ByIdAndEmpresa_DALC,stock_editOne_DALC,getProductoByPartidaAndEmpresaAndProductoV2_DALC,partida_editOne_DALC } from "./productos.dalc"
import { createMovimientosStock_DALC } from "./movimientos.dalc"
import { posicion_getById_DALC } from "./posiciones.dalc"
import { ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC, ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC, ordenDetalle_getByIdOrdenAndProducto_DALC, ordenDetalle_getByIdOrden_DALC, ordenDetalle_getByIdProducto_DALC } from "./ordenesDetalle.dalc"
import { Lote } from "../entities/Lote"
import { ordenEstadoHistorico_insert_DALC } from "./ordenEstadoHistorico.dalc"
const { logger } = require('../helpers/logger')


export const orden_getDetalleByOrden = async (orden: Orden) => {
    const results = await getRepository(OrdenDetalle).find({IdOrden: orden.Id})
    return results
}


export const orden_informarEmisionEtiqueta = async (orden: Orden) => {
    if (!orden.EmailAvisoImpresionEtiquetasEnviado) {
        const mailAMandar=new MailSaliente()
        mailAMandar.Titulo=`Etiquetas emitidas - Orden ${orden.Numero} - Cliente ${orden.Empresa.Nombre}`
        // mailAMandar.Destinatarios="leolob@logiciel.com.ar"
        mailAMandar.Destinatarios="almacenaje@area54sa.com.ar"
        mailAMandar.Cuerpo=`Se han emitido las etiquetas correspondientes a la orden <b>${orden.Numero}</b> del cliente <b>${orden.Empresa.Nombre}</b>`
        mailAMandar.Cuerpo += `<br><br>Puede reimprimir dicha orden <a href='https://gestion.area54sa.com.ar/ImprimirUnaOrden/${orden.Id}/pdf'>haciendo click aquí</a>`
        mailAMandar.Cuerpo += `<br><br><hr>Este mail ha sido enviado por un sistema automatizado e inatendido.  Por favor, no responder.`

        mailSaliente_send_DALC(mailAMandar)        
    }

    orden.EmailAvisoImpresionEtiquetasEnviado=true
    const result=await getRepository(Orden).save(orden)
    return result
}

export const orden_anular = async (orden: Orden) => {
    orden.Estado=4
    const result=await getRepository(Orden).save(orden)
    await ordenEstadoHistorico_insert_DALC(orden.Id, 4, orden.Usuario ? orden.Usuario : "", new Date())
    return result
}

export const orden_anular_by_id = async ( usuario: string,IdOrden: string, numeroOrden: string, idempresa: number) => {
    const resultado = await getRepository(Orden).find({Estado: 4,IdEmpresa: idempresa})
    let nombreOrden = numeroOrden
    for(let i = 0; i < resultado.length;){
        // buscar si nombre existe en la tabla ordenes,
        if(resultado[i].Numero == nombreOrden){
            // entrar guardar el dato
            nombreOrden = nombreOrden + "A"
            i=0
        }else{
            i++
        }
    }
    const result=await getRepository(Orden).update(IdOrden,{Estado: 4,Usuario: usuario,Numero:nombreOrden})
    await ordenEstadoHistorico_insert_DALC(Number(IdOrden), 4, usuario, new Date())
    return result
}

export const orden_setPreorden_DALC = async (orden: Orden, preOrden: boolean, fecha: string, usuario: string) => {
    orden.PreOrden=preOrden
    orden.LiberarPreOrden=fecha
    orden.UsuarioQuitoPreOrd=usuario
    const result=await getRepository(Orden).save(orden)
    return result
}

export const orden_generarNueva = async (
    empresa: Empresa,
    detalle: any[],
    comprobante: string,
    fecha: string,
    cliente: string,
    domicilio: string,
    codigoPostal: string,
    observaciones: string,
    emailDestinatario: string,
    valorDeclarado: number,
    preOrden: boolean,
    kilos: number,
    metros: number,
    tieneLote: boolean,
    tienePART: boolean,
    usuario: string,
    desdePosicion: boolean,
    posicionId: number | null,
    puntoVentaId?: number,
    nroRemito?: string,
    cuitIva?: string,
    domicilioEntrega?: string,
    codigoPostalEntrega?: string,
    transporte?: string,
    domicilioTransporte?: string,
    cuitIvaTransporte?: string,
    ordenCompra?: string,
    nroPedidos?: string,
    despachoPlaza?: string,
    observacionesLugarEntrega?: string
) => {
    let mensaje
    const errores=[]
  
    //Me fijo si no existía otra orden con el mismo número para la misma empresa
    const ordenPreviamenteExistente=await getRepository(Orden).findOne({Numero: String(comprobante), IdEmpresa: empresa.Id}) 
    if (ordenPreviamenteExistente!=null) {
        errores.push("Comprobante previamente existente")
    }
    if (desdePosicion && posicionId != null) {
        for (const unDetalle of detalle) {
          // Sólo asigno idProducto (existe porque el front lo validó)
          const producto = await producto_getByBarcodeAndEmpresa_DALC(unDetalle.barcode, empresa.Id)
          if (!producto) {
            errores.push(`Producto ${unDetalle.barcode} no existe en empresa ${empresa.Id}`)
          } else {
            unDetalle.idProducto = producto.Id
            unDetalle.producto   = producto
            // Uso tal cual la posición y cantidad que envió el front
            unDetalle.posicionesUsadas = [
              { Id: posicionId, Unidades: unDetalle.cantidad }
            ]
          }
        }
      } else {
    
    //Si la orden que vamos a crear es de una empresa que maneja LOTE 
    if(tieneLote){
        //Iteramos todos los productos que estan en detalle
        for await(const unDetalle of detalle){
            const posicionesUsadas=[]
            unDetalle.cantidadPendienteDeAsignacion=unDetalle.cantidad
            //Obtenemos los productos que hay en cada LOTE
            const loteDetalle = await getLotesDetalle_DALC(empresa.Id, unDetalle.lote)
            
            //Iteramos el Lote completo
            for(const unProducto of loteDetalle){
                //Por cada producto del LOTE que coicida 
                if(unProducto.Barcode == unDetalle.barcode){
                    unDetalle.stockDisponible = unProducto.StockDisponible
                    unDetalle.stockComprometido = unProducto.StockComprometido
                    unDetalle.idProducto = unProducto.IdProducto
                    unDetalle.posProdPosicionId = unProducto.PosProdPosicionId 
                    unDetalle.idPosicion = unProducto.IdPosicion   
                    unDetalle.stockPosicionadoDisponible = unProducto.StockPosicionadoDisponible        
                    if (unDetalle.cantidad > unProducto.StockDisponible) {
                        errores.push("Id producto "+unProducto.IdProducto+" - Barcode: "+unProducto.Barcode+" - Nombre: "+unProducto.Descripcion+" - Stock: "+unProducto.Unidades+" - Comprometido: "+unProducto.StockComprometido+" - Solicitado: "+unDetalle.cantidad+" - Estado: Insuficiente")
                    }
                }
            }
            
            const idOrderDetalle = await ordenDetalle_getByIdProducto_DALC(unDetalle.idProducto)
            
            if(idOrderDetalle.length > 0){
                for (const detalleOrden of idOrderDetalle){
                    const posicionPorOrdendetalle = await getRepository(PosicionEnOrdenDetalle).find({IdOrdenDetalle: detalleOrden.id, IdEmpresa: empresa.Id})     
                    
                    if(posicionPorOrdendetalle.length > 0){
                        /*Si las posiciones coinciden con unaPosicion.Id que viene de la pos_prod,
                        descontamos la cantidad que está comprometida en otra orden anterior
                        para saber cuántas unidades tenemos disponibles*/
                        for ( const cadaPosicion of posicionPorOrdendetalle){
                            if(cadaPosicion.IdPosicion == unDetalle.posProdPosicionId){
                                unDetalle.stockPosicionadoDisponible -= cadaPosicion.Cantidad
                            }
                        }
                    }
                }  
            }

            if (unDetalle.cantidadPendienteDeAsignacion > 0) {
                if (unDetalle.stockDisponible >= unDetalle.cantidadPendienteDeAsignacion) {
                    posicionesUsadas.push({Id: unDetalle.idPosicion, Unidades: unDetalle.cantidadPendienteDeAsignacion})
                    unDetalle.cantidadPendienteDeAsignacion=0
                } else {
                    if(unDetalle.stockPosicionadoDisponible > 0){
                        posicionesUsadas.push({Id: unDetalle.idPosicion, Unidades: unDetalle.stockPosicionadoDisponible})
                        unDetalle.cantidadPendienteDeAsignacion -= unDetalle.stockPosicionadoDisponible
                    }
                    // posicionesUsadas.push({Id: unDetalle.idPosicion, Unidades: unDetalle.stockPosicionadoDisponible})
                    // unDetalle.cantidadPendienteDeAsignacion -= unDetalle.stockPosicionadoDisponible
                }
            }
            unDetalle.posicionesUsadas=posicionesUsadas
        }
    } else if(tienePART){
        //Me fijo si todos los artículos del detalle existen para la empresa
        for (const unDetalle of detalle) {
            if (!unDetalle.idProducto) {
                const producto = await producto_getByBarcodeAndEmpresa_DALC(String(unDetalle.barcode), empresa.Id)
                console.log('[ORDEN] Producto por barcode', unDetalle.barcode, producto?.Id)
                if (!producto) {
                    errores.push("Barcode producto " + unDetalle.barcode + " inexistente")
                    continue
                }
                unDetalle.idProducto = producto.Id
            }

            const productos = await getProductoByPartidaAndEmpresaAndProductoV2_DALC(
                empresa.Id,
                unDetalle.partida,
                unDetalle.idProducto
            )
            console.log('[ORDEN] Buscar partida', unDetalle.partida, 'producto', unDetalle.idProducto, 'resultado', productos?.length)
            if (!productos || productos.length === 0) {
                errores.push("Barcode producto " + unDetalle.barcode + " inexistente")
            } else {
                const unProducto = productos[0]
                unDetalle.producto = unProducto
                unDetalle.idPartida = unProducto.Id
                if (unDetalle.cantidad > (unProducto.Stock - unProducto.StockComprometido)) {
                    errores.push("Partida " + unProducto.Partida + " - Barcode: " + unProducto.Barcode + " - Nombre: " + unProducto.Nombre + " - Stock: " + unProducto.Stock + " - Comprometido: " + unProducto.StockComprometido + " - Solicitado: " + unDetalle.cantidad + " - Estado: Insuficiente")
                } else {
                    if (empresa.StockPosicionado) {
                        if (unDetalle.cantidad > (unProducto.StockPosicionado - unProducto.StockComprometido)) {
                            errores.push("Partida " + unProducto.Partida + " - Barcode: " + unProducto.Barcode + " - Nombre: " + unProducto.Nombre + " - Stock: " + unProducto.Stock + " - Posicionado: " + unProducto.StockPosicionado + " - Solicitado: " + unDetalle.cantidad + " - Estado: Insuficiente")
                        } else {
                            //unProducto.Posiciones.sort((a,b) => a.Unidades>b.Unidades ? -1 : 1)
                            const posicionesUsadas=[]
                            unDetalle.cantidadPendienteDeAsignacion=unDetalle.cantidad
                            for (const unaPosicion of unProducto.Posiciones) {
                                let cantidadNoComprometido = unaPosicion.Unidades
            
                                // Traemos todas las órdenes que tengan el producto que pasamos y que su órden este en estado 1(pendiente)
                                const idOrderDetalle = await ordenDetalle_getByIdProducto_DALC(unProducto.Id)
                                
                                // Iteramos para traer todas las posiciones de la tabla posiciones_por_orderdetalle
                                for (const detalleOrden of idOrderDetalle){
                                    const posicionPorOrdendetalle = await getRepository(PosicionEnOrdenDetalle).find({IdOrdenDetalle: detalleOrden.id, IdEmpresa: empresa.Id})     
    
                                    /*Si las posiciones coinciden con unaPosicion.Id que viene de la pos_prod,
                                        descontamos la cantidad que está comprometida en otra orden anterior
                                        para saber cuántas unidades tenemos disponibles*/
                                    for ( const cadaPosicion of posicionPorOrdendetalle){
                                        if(cadaPosicion.IdPosicion == unaPosicion.Id){
                                            cantidadNoComprometido -= cadaPosicion.Cantidad
                                        }
                                    }
                                }                           
                                if (unDetalle.cantidadPendienteDeAsignacion>0) {
                                    if (cantidadNoComprometido>=unDetalle.cantidadPendienteDeAsignacion) {
                                        posicionesUsadas.push({Id: unaPosicion.Id, Unidades: unDetalle.cantidadPendienteDeAsignacion})
                                        unDetalle.cantidadPendienteDeAsignacion=0
                                    } else {
                                        if(cantidadNoComprometido > 0){
                                            posicionesUsadas.push({Id: unaPosicion.Id, Unidades: cantidadNoComprometido})
                                            unDetalle.cantidadPendienteDeAsignacion -= cantidadNoComprometido
                                        }
                                        // posicionesUsadas.push({Id: unaPosicion.Id, Unidades: cantidadNoComprometido})
                                        // unDetalle.cantidadPendienteDeAsignacion -= cantidadNoComprometido
                                    }
                                }
                            }                 
                            unDetalle.posicionesUsadas=posicionesUsadas                        
                        }
                    } else {
                        unDetalle.posicionesUsadas=[]
                    }
                }
            }
        }
    }else{
        //Me fijo si todos los artículos del detalle existen para la empresa
        for (const unDetalle of detalle) {
            const unProducto=await producto_getByBarcodeAndEmpresa_DALC(unDetalle.barcode, empresa.Id)
            if (unProducto==null) {
                errores.push("Barcode producto "+unDetalle.barcode+" inexistente")
            } else {
                unDetalle.producto=unProducto

                if (unDetalle.cantidad > (unProducto.Stock - unProducto.StockComprometido)) {
                    errores.push("Id producto "+unProducto.Id+" - Barcode: "+unProducto.Barcode+" - Nombre: "+unProducto.Nombre+" - Stock: "+unProducto.Stock+" - Comprometido: "+unProducto.StockComprometido+" - Solicitado: "+unDetalle.cantidad+" - Estado: Insuficiente")
                } else {
    
                    if (empresa.StockPosicionado) {
                        if (unDetalle.cantidad > (unProducto.StockPosicionado - unProducto.StockComprometido)) {
                            errores.push("Id producto "+unProducto.Id+" - Barcode: "+unProducto.Barcode+" - Nombre: "+unProducto.Nombre+" - Stock: "+unProducto.Stock+" - Posicionado: "+unProducto.StockPosicionado+" - Solicitado: "+unDetalle.cantidad+" - Estado: Insuficiente")
                        } else {
                            //unProducto.Posiciones.sort((a,b) => a.Unidades>b.Unidades ? -1 : 1) 
                            const posicionesUsadas=[]
                            unDetalle.cantidadPendienteDeAsignacion=unDetalle.cantidad
                            
                            for (const unaPosicion of unProducto.Posiciones) {
                                let cantidadNoComprometido = unaPosicion.Unidades 
            
                                // Traemos todas las órdenes que tengan el producto que pasamos y que su órden este en estado 1(pendiente)
                                const idOrderDetalle = await ordenDetalle_getByIdProducto_DALC(unProducto.Id)
                                
                                // Iteramos para traer todas las posiciones de la tabla posiciones_por_orderdetalle
                                for (const detalleOrden of idOrderDetalle){
                                    const posicionPorOrdendetalle = await getRepository(PosicionEnOrdenDetalle).find({IdOrdenDetalle: detalleOrden.id, IdEmpresa: empresa.Id})     
    
                                    /*Si las posiciones coinciden con unaPosicion.Id que viene de la pos_prod,
                                        descontamos la cantidad que está comprometida en otra orden anterior
                                        para saber cuántas unidades tenemos disponibles*/
                                    for ( const cadaPosicion of posicionPorOrdendetalle){
                                        if(cadaPosicion.IdPosicion == unaPosicion.Id){
                                            cantidadNoComprometido -= cadaPosicion.Cantidad
                                        }
                                    }
                                }                           
    
                                if (unDetalle.cantidadPendienteDeAsignacion>0) {
                                    if (cantidadNoComprometido>=unDetalle.cantidadPendienteDeAsignacion) {
                                        posicionesUsadas.push({Id: unaPosicion.Id, Unidades: unDetalle.cantidadPendienteDeAsignacion})
                                        unDetalle.cantidadPendienteDeAsignacion=0
                                    } else {
                                        if(cantidadNoComprometido > 0){
                                            posicionesUsadas.push({Id: unaPosicion.Id, Unidades: cantidadNoComprometido})
                                            unDetalle.cantidadPendienteDeAsignacion -= cantidadNoComprometido
                                        }
                                        // posicionesUsadas.push({Id: unaPosicion.Id, Unidades: cantidadNoComprometido})
                                        // unDetalle.cantidadPendienteDeAsignacion -= cantidadNoComprometido
                                    }
                                }
                            }                 
                            unDetalle.posicionesUsadas=posicionesUsadas                        
                        }
                    } else {
                        unDetalle.posicionesUsadas=[]
                    }
                }
            }
        }
    }
}

    // //Me fijo si el destino existe o es nuevo
    let destino=await destino_getByDomicilio_DALC(cliente,domicilio, codigoPostal, empresa.Id)
    if (destino==null) {
        const nuevoDestino=new Destino()
        nuevoDestino.CodigoPostal=codigoPostal
        nuevoDestino.Domicilio=domicilio
        nuevoDestino.IdEmpresa=empresa.Id
        nuevoDestino.Localidad=""
        nuevoDestino.Nombre=cliente
        nuevoDestino.Observaciones=observaciones
        destino=await destino_new_DALC(nuevoDestino)
    }

    if (destino==null) {
        errores.push("Destino: "+domicilio+" no pudo ser creado")
    }
        
    //Si no hubo errores, puedo empezar a procesar
    if (errores.length==0) {
        
        let importeTotal=0

        if (!valorDeclarado) {
            detalle.forEach(e => importeTotal+=e.importe)
        } else {
            importeTotal=Number(valorDeclarado)
        }
        
        //Creo la orden
        const nuevaOrden=new Orden()
        nuevaOrden.IdEmpresa=empresa.Id
        nuevaOrden.Eventual=destino.Id
        nuevaOrden.ValorDeclarado=importeTotal
        nuevaOrden.Numero=comprobante
        nuevaOrden.EmailDestinatario=emailDestinatario
        nuevaOrden.Observaciones=observaciones
        nuevaOrden.PreOrden=preOrden
        nuevaOrden.Kilos=kilos
        nuevaOrden.Metros=metros
        nuevaOrden.Usuario=usuario
        nuevaOrden.UsuarioCreoOrd=usuario
        nuevaOrden.CuitIva = cuitIva ?? ""
        nuevaOrden.DomicilioEntrega = domicilioEntrega ?? ""
        nuevaOrden.CodigoPostalEntrega = codigoPostalEntrega ?? ""
        nuevaOrden.Transporte = transporte ?? ""
        nuevaOrden.DomicilioTransporte = domicilioTransporte ?? ""
        nuevaOrden.CuitIvaTransporte = cuitIvaTransporte ?? ""
        nuevaOrden.OrdenCompra = ordenCompra ?? ""
        nuevaOrden.NroPedidos = nroPedidos ?? ""
        nuevaOrden.DespachoPlaza = despachoPlaza ?? ""
        nuevaOrden.ObservacionesLugarEntrega = observacionesLugarEntrega ?? ""
        if (puntoVentaId !== undefined) {
            nuevaOrden.PuntoVentaId = puntoVentaId;
        }
        if (nroRemito !== undefined) {
            nuevaOrden.NroRemito = nroRemito;
        }
        
        const resultToSave=getRepository(Orden).create(nuevaOrden)
        const nuevaOrdenCreada=await getRepository(Orden).save(resultToSave)
        if (nuevaOrdenCreada) {
            await ordenEstadoHistorico_insert_DALC(nuevaOrdenCreada.Id, nuevaOrdenCreada.Estado, usuario, new Date())
        }
        if (nuevaOrdenCreada==null) {
            errores.push("La nueva orden no pudo ser creada")
        }

        for (const unItem of detalle) {
            const unaOrdenDetalle=new OrdenDetalle()
            unaOrdenDetalle.IdOrden=nuevaOrdenCreada.Id
            if(tieneLote){
                unaOrdenDetalle.Lote = unItem.lote
                unaOrdenDetalle.LoteCompleto = unItem.loteCompleto
                unaOrdenDetalle.IdProducto=unItem.idProducto 
            } else if(tienePART){
                unaOrdenDetalle.IdProducto=unItem.idPartida
            }else{
                unaOrdenDetalle.IdProducto=unItem.producto.Id 
            }
            unaOrdenDetalle.Precio=unItem.importe
            parseInt(unaOrdenDetalle.Unidades=unItem.cantidad)

            const resultToSave=getRepository(OrdenDetalle).create(unaOrdenDetalle)
            const nuevoDetalleCreado=await getRepository(OrdenDetalle).save(resultToSave)
        
            for (const unaPosicionUsada of unItem.posicionesUsadas) {
                const unaPosicionEnOrdenDetalle=new PosicionEnOrdenDetalle()
                unaPosicionEnOrdenDetalle.IdPosicion=unaPosicionUsada.Id
                unaPosicionEnOrdenDetalle.IdOrdenDetalle=nuevoDetalleCreado.Id
                unaPosicionEnOrdenDetalle.Cantidad=unaPosicionUsada.Unidades
                if(tieneLote){
                    unaPosicionEnOrdenDetalle.IdProducto=unItem.idProducto
                } else {
                    unaPosicionEnOrdenDetalle.IdProducto=unItem.producto.Id
                }
                unaPosicionEnOrdenDetalle.IdEmpresa=empresa.Id

                const resultToSave=getRepository(PosicionEnOrdenDetalle).create(unaPosicionEnOrdenDetalle)
                const nuevaPosicionEnDetalle=await getRepository(PosicionEnOrdenDetalle).save(resultToSave)
           
            }
        
        }

        const ordenCreada=await orden_getById_DALC(nuevaOrdenCreada.Id)
        return {status: "OK", data: ordenCreada}
    } else {
        return {status: "ERROR", data: errores}
    }

}


export const orden_marcarComoRetiraCliente = async (orden: Orden, fecha: string) => {
    orden.RetiraCliente=true
    orden.Fecha=fecha
    orden.Estado=5
    const result=await getRepository(Orden).save(orden)
    await ordenEstadoHistorico_insert_DALC(orden.Id, 5, orden.Usuario ? orden.Usuario : "", new Date())
    return result
}

export const orden_getById_DALC = async (id: number) => {
    const results = await getRepository(Orden).findOne(id, {relations: ["Empresa"]})
    return results
}

export const destino_getAll_DALC = async (IdEmpresa: any) => {
    const results = await getRepository(Destino).find({where: {IdEmpresa: IdEmpresa}})
    return results
}


export const orden_getByNumeroAndIdEmpresa_DALC = async (Numero: string, IdEmpresa: number) => {
    const results = await getRepository(Orden).findOne({Numero, IdEmpresa})
    return results
}

export const ordenes_getByPeriodo_DALC = async (fechaDesde: string, fechaHasta: string) => {
    fechaDesde+=" 00:00:00"
    fechaHasta+=" 23:59:59"

    const results = await getRepository(Orden).find(
        {
            where: {Fecha: Between(fechaDesde, fechaHasta)},
            relations: ["Empresa", "Detalle", "Detalle.Producto"]
        }        
    )

    for (const unaOrden of results) {
        const destino=await destino_getById_DALC(unaOrden.Eventual)
        if (destino) {
            unaOrden.Destino = destino
        }
    }

    return results
}

export const ordenes_getByPeriodoEmpresa_DALC = async (fechaDesde: string, fechaHasta: string, empresa: Empresa) => {
    fechaDesde+=" 00:00:00"
    fechaHasta+=" 23:59:59"

    const results = await getRepository(Orden).find(
        {
            where: {Fecha: Between(fechaDesde, fechaHasta), IdEmpresa: empresa.Id},
            relations: ["Empresa", "Detalle", "Detalle.Producto"]
        }        
    )

    for (const unaOrden of results) {
        const destino=await destino_getById_DALC(unaOrden.Eventual)
        if (destino) {
            unaOrden.Destino = destino
        }
    }
    return results
}

export const ordenes_getByPeriodoEmpresaSoloPreparadasYNoPreorden_DALC = async (fechaDesde: string, fechaHasta: string, empresa: Empresa) => {
    fechaDesde+=" 00:00:00"
    fechaHasta+=" 23:59:59"
    const empresaId = empresa.Id

    const results = await createQueryBuilder("ordenes", "ord")
    .select(
            "emp.Nombre as Nombre, emp.stock_unitario as stockUnitario, emp.Stock_Posicionado as stockPosicionado," +
            "des.nombre as Destino, ord.id as Id, ord.tipo as Tipo," +
            "ord.id_integracion as IdIntegracion, ord.numero as Numero, ord.retira_cliente as RetiraCliente," +
            "ord.preOrden as PreOrden, ord.eventual as Eventual, ord.valor as Valor, ord.metros as Metros," +
            "ord.estado as Estado, ord.id_guia as IdGuia, ord.observ as Observacion, ord.valor_ctr as ValorCtr," +
            "ord.prioridad as Prioridad, ord.fecha as Fecha, ord.fechaCreacion as FechaCreacion," +
            "ord.fechaPreparado as FechaPreparado, emp.id as IdEmpresa, ord.punto_venta_id as PuntoVentaId, ord.nro_remito as NroRemito")
    .innerJoin("empresas", "emp", "ord.empresa = emp.id")
    .innerJoin("destinos", "des", "ord.eventual = des.id")
    .where("ord.estado = 1")
    .andWhere("ord.preOrden = false")
    .andWhere("ord.empresa = :empresaId", {empresaId})
    .andWhere("ord.fecha BETWEEN :fechaDesde AND :fechaHasta", { fechaDesde, fechaHasta })
    .execute()

    for (const unaOrden of results) {
        const destino=await destino_getById_DALC(unaOrden.Eventual)
        if (destino) {
            unaOrden.Destino = destino
        }
    }
    return results
}

export const ordenes_getCantPeriodo_DALC = async (fechaDesde: string, fechaHasta: string) => {
    fechaDesde+=" 00:00:00"
    fechaHasta+=" 23:59:59"

    const result = await createQueryBuilder("ordenes", "OR")
        .select("id as Id, fecha as Fecha")
        .where("fecha >= :fechaDesde", {fechaDesde})
        .andWhere("fecha <= :fechaHasta", {fechaHasta})
        .execute()
    

    return result
 }

export const ordenes_getCantPeriodoEmpresa_DALC = async (fechaDesde: string, fechaHasta: string, empresa: number) => {
    fechaDesde+=" 00:00:00"
    fechaHasta+=" 23:59:59"

    const result = await createQueryBuilder("ordenes", "OR")
        .select("id as Id, fecha as Fecha")
        .where("fecha >= :fechaDesde", {fechaDesde})
        .andWhere("fecha <= :fechaHasta", {fechaHasta})
        .andWhere("empresa = :empresa", {empresa})
        .execute()

    return result
 }


// Devuelve todas las ordenes preparadas que aun no son guias
export const ordenes_getPreparadasNoGuias_DALC = async () => {
    const results=await getRepository(Orden).find({ where: [{Estado: 2, IdGuia: -1, RetiraCliente: false},{Estado: 5, IdGuia: -1, RetiraCliente: false}], relations: ["Empresa"]})
    return results
    
}

// Devuelve todas las ordenes preparadas que aun no son guias, por idEmpresa
export const ordenes_getPreparadasNoGuiasByIdEmpresa_DALC = async (idEmpresa: number) => {
    const results=await getRepository(Orden).find({ where: [{Estado: 2, IdGuia: -1, RetiraCliente: false, IdEmpresa: idEmpresa},{Estado: 5, IdGuia: -1, RetiraCliente: false, IdEmpresa: idEmpresa}], relations: ["Empresa"]})
    return results
}

// Devuelve todas las ordenes pendientes
export const ordenes_getPendientes_DALC = async () => {
    const results=await getRepository(Orden).find({ where: {Estado: 1}, relations: ["Empresa"]})
    for (const unaOrden of results) {
        const destino=await destino_getById_DALC(unaOrden.Eventual)
        if (destino) {
            unaOrden.Destino = destino
        }
    }
    return results
    
}


// Devuelve todas las ordenes 
export const ordenes_getOrdenes_DALC = async () => {
    const results = await createQueryBuilder("ordenes", "ord")
        .select(
            "ord.id as IdOrden, ord.empresa as IdEmpresa, e.nombre, ord.tipo, ord.numero, d.direccion, ord.prioridad, ord.valor, ord.estado as Estado, ord.fechacreacion as Creada, ord.fechapreparado as Preparado, ord.fecha as Modificada, ord.preOrden, ord.usuario, ord.punto_venta_id as PuntoVentaId, ord.nro_remito as NroRemito"
        )
        .innerJoin("empresas", "e", "ord.empresa = e.id")
        .innerJoin("destinos","d", "ord.eventual = d.id")
        .orderBy("ord.fechacreacion","DESC")
        .limit(5000)
        .execute()
     
    return results
    
}



// Devuelve todas las Ordenes de una Empresa por el IdEmpresa
export const ordenes_getByEmpresa_DALC = async (id: number) => {
    const result = await getRepository(Orden).find({
        where: {
            IdEmpresa: id
        },
        order: {Id: 'DESC'}})


    return result
}

;

export const ordenes_getByEmpresaPeriodoConDestinos_DALC = async (
    idEmpresa: number,
    fechaDesde: string,
    fechaHasta: string
) => {
    fechaDesde += " 00:00:00";
    fechaHasta += " 23:59:59";

    const results = await createQueryBuilder("ordenes", "ord")
        .select([
            "ord.Id as IdOrden",
            "ord.Numero as Numero",
            "ord.Fecha as Fecha",
            "ord.punto_venta_id as PuntoVentaId",
            "ord.nro_remito as NroRemito",
            "des.Nombre as NombreDestino",
            "des.direccion as DomicilioDestino",
            "des.postal as CodigoPostalDestino",
            "des.localidad as LocalidadDestino",
            "det.Id as IdDetalle",
            "det.Unidades as Unidades",
            "prod.Id as IdProducto",
            "prod.barrcode as Barcode",
            "prod.Descripcion as NombreProducto",
        ])
        .innerJoin("destinos", "des", "des.id = ord.eventual")
        .innerJoin("orderdetalle", "det", "det.ordenId = ord.Id")
        .innerJoin("productos", "prod", "prod.id = det.productId")
        .where("ord.empresa = :idEmpresa", { idEmpresa })
        .andWhere("ord.fecha BETWEEN :fechaDesde AND :fechaHasta", {
            fechaDesde,
            fechaHasta,
        })
        .orderBy("ord.fecha", "ASC")
        .execute();

    return results;
}

// Devuelve la ultima Orden de una Empresa por el Id
export const ordenes_getLastByEmpresa_DALC = async (id: number) => {
    const result = await getRepository(Orden).createQueryBuilder('ordenes').where({IdEmpresa: id}).orderBy('Id', 'DESC').getOne()
    return result
}
    
;

export const ordenes_getByIdIntAndEmpresa_DALC = async (id:number , idIntegracion:string | number) => 
    await getRepository(Orden).findOne({where: {IdEmpresa: id, IdIntegracion: idIntegracion}})



// Agrega una Orden
export const ordenes_addOrden_DALC = async(orden:object) => {
    try {
        const newOrden = await getRepository(Orden).create(orden);
        const result = await getRepository(Orden).save(newOrden);
        return result
    } catch (error) {
        console.log(error);
        return null
        
    }
    
    
}

export const orden_editEstado_DALC = async (orden: Orden, estado: number, usuario: string) => {

        orden.Estado=estado
        orden.UsuarioModificacion = usuario;
        orden.FechaModificacion = new Date();
        const result=await getRepository(Orden).save(orden)
        await ordenEstadoHistorico_insert_DALC(orden.Id, estado, usuario, new Date())
        return result
    
}

export const orden_actualizarEstado_DALC = async (idOrden: number, estado: number, usuario: string) => {
    const orden = await orden_getById_DALC(idOrden);
    if (!orden) {
        throw new Error("Orden no encontrada");
    }
    return await orden_editEstado_DALC(orden, estado, usuario);
};

export const orden_datosPreparado_DALC = async (orden: Orden, fecha:string, usuario: string) => {
    orden.UsuarioPreparoOrd = usuario
    orden.FechaOrdenPreparada = fecha
    const result=await getRepository(Orden).save(orden)
    return result
}

export const orden_editImpresion_DALC = async (orden: number, impresion: string) => {
    await getRepository(Orden).update({Id: orden}, {Impresion: impresion})
    return
}

export const getProductosYPosicionesByOrden_DALC = async (idOrden: number) => {
    return await getRepository(OrdenDetalle)
      .createQueryBuilder("od")
      .select([
        "od.Id AS id_orderdetalle",
        "od.IdOrden",
        "od.IdProducto AS id_producto",
        "od.Unidades AS unidades_orden",
        "p.Nombre AS nombre_producto",         
        "p.CodeEmpresa",                       
        "ppod.IdPosicion",                     
        "pos.Nombre AS nombre_posicion",       
        "ppod.Cantidad AS cantidad_posicion"  
      ])
      .innerJoin(PosicionEnOrdenDetalle, "ppod", "ppod.IdOrdenDetalle = od.Id")
      .innerJoin(Posicion, "pos", "pos.Id = ppod.IdPosicion")
      .innerJoin("od.Producto", "p")
      .where("od.IdOrden = :idOrden", { idOrden })
      .orderBy("od.Id, ppod.IdPosicion")
      .getRawMany();
}


export const ordenes_SalidaOrdenes_DALC = async (body: any) => {
    
    let registros 
    registros =  body
    const idEmpresa = body.Cabeceras.IdEmpresa
    const idOrden = body.Cabeceras.IdOrden
    const comprobante = body.Cabeceras.Comprobante
    const usuario = body.Cabeceras.Usuario
    const fecha = body.Cabeceras.Fecha
    const textil = body.Cabeceras.Textil
    const stockPosicionado = body.Cabeceras.StockPosicionado
    const tieneLote = body.Cabeceras.TieneLote
    const tienePART = body.Cabeceras.TienePART
    let posicionProducto
    let idOrderDetalle 
    let result 
    let todosTienenStock = false
    let mensaje
    let cantidadPosicion = 0
    let lotesDetalle

    const orden = await orden_getById_DALC(Number(idOrden))
    const idOrderDetalleGet2 = await ordenDetalle_getByIdOrdenAndProducto_DALC(idOrden)
    const idOrderDetalleGet3 = await ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC(idOrden)

    if(tieneLote){
        // iteramos para verificar y confirmar que todos los productos tengan stock y stock en posiciones antes de iniciar los procesos
        for ( const registro of registros.Cabeceras.Detalle){
            //lotesDetalle = await getLotesDetalle_DALC(idEmpresa, registro.Lote)

            for(const detalle of idOrderDetalleGet2){
            
                if(registro.IdProducto == detalle.IdProducto && registro.Lote == detalle.lote){
                    idOrderDetalle = detalle.IdOrdendetalle
                    if(idOrderDetalle){
                        const ordenDetallePosicion = await ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC(idOrderDetalle, idEmpresa)
                        
                        for(const detallePosicion of ordenDetallePosicion){       
                            let bultosPosProd = await producto_getPosiciones_byIdProducto_Lote_DALC(registro.IdProducto, detallePosicion.IdPosicion, registro.Lote)
                            if (typeof bultosPosProd === "undefined") {
                                bultosPosProd = { total: 0 };
                            } else {
                                bultosPosProd.total = bultosPosProd.total || 0;
                            }
                            if(parseInt(bultosPosProd.total) >= detallePosicion.Cantidad){
                                todosTienenStock = true
                            } else {
                                todosTienenStock = false
                                return {estado:"ERROR", mensaje: "Lote:("+registro.Lote+") - Barcode:("+registro.Barcode + ") La cantidad que ingresaste es mayor a la que tenemos posicionada"}
                            }
                        }
                    }
                }  
            }           
        }
    } else if(tienePART){
        // iteramos para verificar y confirmar que todos los productos tengan stock y stock en posiciones antes de iniciar los procesos
        for ( const registro of registros.Cabeceras.Detalle){
            if (!registro.idProducto) {
                const prod = await producto_getByBarcodeAndEmpresa_DALC(String(registro.Barcode), idEmpresa)
                console.log('[SALIDA] Producto por barcode', registro.Barcode, prod?.Id)
                if (prod) {
                    registro.idProducto = prod.Id
                }
            }
            const productos = await getProductoByPartidaAndEmpresaAndProductoV2_DALC(idEmpresa, registro.partida,registro.idProducto)
            console.log('[SALIDA] Buscar partida', registro.partida, 'producto', registro.idProducto, 'resultado', productos?.length)

            // iteramos todas las posiciones en las que esta un producto para saber cuanto stock posicionado tenemos disponible
            if(productos && productos.length > 0){
                const producto = productos[0]
                const stock = producto.Stock
                for(const cantidadPorPosicion of producto.Posiciones){
                    cantidadPosicion += cantidadPorPosicion.Unidades
                }
                if(producto.Stock >= registro.Cantidad){
                    todosTienenStock = true
                } else {
                    todosTienenStock = false
                    if(textil){
                        mensaje = "No hay stock del Partida: " + producto.Partida + " Barcode: " + producto.Barcode
                    } else {
                        mensaje = "No hay stock de la Partida: " + producto.Partida
                    }
                    return {estado: "ERROR", mensaje: mensaje}
                }
            }
    
            // verificamos que el stock posicionado no sea menor que la cantidad que necesita la orden
            if(stockPosicionado){
                if(cantidadPosicion < registro.Cantidad){
                    const barcodeMensaje = productos && productos[0] ? productos[0].Barcode : ""
                    mensaje = `No se pudo desposicionar la Partida: ${barcodeMensaje} por ${registro.Cantidad} ${(registro.Cantidad == 1 ? "Unidad. " : "Unidades.")} ${(cantidadPosicion == 0 ? "No hay productos posicionados." : `Hay solo ${cantidadPosicion} ${(cantidadPosicion == 1 ? "producto posicionado." :"productos posicionados.")}`)}`
                    return {estado: "ERROR", mensaje: mensaje}
                }
            }
        }
    }else{
        // iteramos para verificar y confirmar que todos los productos tengan stock y stock en posiciones antes de iniciar los procesos
        for ( const registro of registros.Cabeceras.Detalle){
            const stock = await producto_getStock_ByIdAndEmpresa_DALC(registro.IdProducto, Number(idEmpresa))
            const producto = await producto_getByIdAndEmpresa_DALC(registro.IdProducto, idEmpresa)
    
            // iteramos todas las posiciones en las que esta un producto para saber cuanto stock posicionado tenemos disponible
            if(producto){
                for(const cantidadPorPosicion of producto.Posiciones){
                    cantidadPosicion += cantidadPorPosicion.Unidades
               }
            }
            
            //verificamos si hay stock disponible
            if(stock){
                if(stock.Unidades >= registro.Cantidad){  
                    todosTienenStock = true
                } else {
                    todosTienenStock = false   
                    if(textil){
                        mensaje = "No hay stock del Barcode: " + producto?.Barcode + " CodeEmpresa: " + producto?.CodeEmpresa
                    } else {
                        mensaje = "No hay stock del Barcode: " + producto?.Barcode 
                    }
                    return {estado: "ERROR", mensaje: mensaje}
                }
            }
    
            // verificamos que el stock posicionado no sea menor que la cantidad que necesita la orden
            if(stockPosicionado){
                if(cantidadPosicion < registro.Cantidad){
                    mensaje = `No se pudo desposicionar el Barcode: ${producto?.Barcode} por ${registro.Cantidad} ${(registro.Cantidad == 1 ? "Unidad. ": "Unidades.")} ${(cantidadPosicion == 0 ? "No hay productos posicionados." : `Hay solo ${cantidadPosicion} ${(cantidadPosicion == 1 ? "producto posicionado.":"productos posicionados.")}`)}`
                    return {estado: "ERROR", mensaje: mensaje}
                }        
            }
        }
    }

    if(todosTienenStock){
       if(tieneLote){
           //Iteramos detalle para obtener cada producto
            for (const unRegistro of registros.Cabeceras.Detalle){
                
               let unidades = 0    
                    for(const detalle of idOrderDetalleGet2){
                        if(unRegistro.IdProducto == detalle.IdProducto && unRegistro.Lote == detalle.lote){
                            idOrderDetalle = detalle.IdOrdendetalle
                            
                            if(idOrderDetalle){
                                const ordenDetallePosicion = await ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC(idOrderDetalle, idEmpresa)
            
                                for(const detallePosicion of ordenDetallePosicion){   
                                   result=await producto_desposicionar_Lote_DALC(detallePosicion.IdPosicion, detallePosicion.Cantidad , idEmpresa, unRegistro.IdProducto, unRegistro.Lote, usuario)
                                }
        
                                if(result?.status == 'OK'){
                                      const movimiento = await createMovimientosStock_DALC({Orden: comprobante, IdProducto: unRegistro.IdProducto, Unidades: parseInt(unRegistro.Cantidad), Tipo: 1, IdEmpresa: parseInt(idEmpresa), fecha: new Date(), codprod: unRegistro.Barcode, Usuario: usuario,  Lote: unRegistro.Lote})
                                      logger.info(`Movement created: ${JSON.stringify(movimiento)}`)
                                    if(orden){
                                        await orden_editEstado_DALC(orden, 2, usuario)
                                        logger.info(`Order ${orden.Id} updated to estado 2`)
                                        await orden_datosPreparado_DALC(orden, fecha, usuario)
                                    }
                                } else {
                                    mensaje = "no se pudo desposicionar el producto ID:" + unRegistro.IdProducto 
                                return {estado: "ERROR", mensaje: mensaje}
                                }
                            }
                        }  
                    }           
                }
            } else if(tienePART){
                for (const unRegistro of registros.Cabeceras.Detalle){

                    let unidades = 0

                    if (!unRegistro.idProducto) {
                        const prod = await producto_getByBarcodeAndEmpresa_DALC(unRegistro.Barcode, idEmpresa)
                        if (prod) {
                            unRegistro.idProducto = prod.Id
                        }
                    }

                    const productos = await getProductoByPartidaAndEmpresaAndProductoV2_DALC(idEmpresa, unRegistro.partida,unRegistro.idProducto)

                    if(productos && productos.length > 0){
                        const producto = productos[0]
                        if(producto.Stock >= unRegistro.Cantidad){
                            unidades = producto.Stock - unRegistro.Cantidad
                        }
                    }
                    if(stockPosicionado){
                        for(const detalle of idOrderDetalleGet3){
                            if(productos && productos[0]?.Id == detalle.IdPartida){
                                idOrderDetalle = detalle.IdOrdendetalle
                                if(idOrderDetalle){
                                    const ordenDetallePosicion = await ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC(idOrderDetalle, idEmpresa)
                
                                    for(const detallePosicion of ordenDetallePosicion){                       
                                        posicionProducto = detallePosicion.IdPosicion
                                        if(posicionProducto){
                                            const posicion = await posicion_getById_DALC(posicionProducto)
                                            if(textil){
                                                //result=await producto_desposicionar_DALC(producto!, posicion!, detallePosicion.Cantidad, usuario)
                                            } else {
                                                result=await producto_desposicionar_paqueteria_DALC(productos[0]?.Id!, posicion?.Id!, detallePosicion.Cantidad, idEmpresa)
                                            }
                                        }
                                    }
                                    if(result?.status == 'OK'){
                                        if(productos && productos.length > 0){
                                            const unArticulo = await partida_editOne_DALC(productos[0], {Stock: unidades})
                                            const movimiento = await createMovimientosStock_DALC({Orden: comprobante, IdProducto: unRegistro.idPartida, Unidades: parseInt(unRegistro.Cantidad), Tipo: 1, IdEmpresa: parseInt(idEmpresa), fecha: new Date(), codprod: productos[0].Partida, Usuario: usuario })
                                            logger.info(`Movement created: ${JSON.stringify(movimiento)}`)

                                            if(orden){
                                                await orden_editEstado_DALC(orden, 2, usuario)
                                                logger.info(`Order ${orden.Id} updated to estado 2`)
                                                await orden_datosPreparado_DALC(orden, fecha, usuario)
                                            }
                                        }  
                                    } else {
                                        mensaje = "no se pudo desposicionar el articulo Partida:"+(productos && productos[0]?.Partida)+ " Barcode:" + (productos && productos[0]?.Barcode)
                                        return {estado: "ERROR", mensaje: mensaje}
                                    }
                                }
                            }
                        }
                    }
                }  
            }
            else {
                // Iteramos detalle para obtener cada producto
                for (const unRegistro of registros.Cabeceras.Detalle) {
                    let unidades = 0;
                    const stock = await producto_getStock_ByIdAndEmpresa_DALC(unRegistro.IdProducto, Number(idEmpresa));
                    const producto = await producto_getByIdAndEmpresa_DALC(unRegistro.IdProducto, idEmpresa);
            
                    if (stock) {
                        if (stock.Unidades >= unRegistro.Cantidad) {
                            unidades = stock.Unidades - unRegistro.Cantidad;
                        }
                    }
            
                    if (stockPosicionado) {
                        // Tomamos el IdProducto, Cantidad e IdPosicion ya seleccionados en el front.
                        const idProducto = unRegistro.IdProducto;
                        const cantidad = unRegistro.Cantidad;
                        const idPosicion = unRegistro.IdPosicion;
                        console.log(`[DESPOSICIONANDO] Producto: ${idProducto}, Posición: ${idPosicion}, Cantidad: ${cantidad}`);
                        const posicion = await posicion_getById_DALC(idPosicion);
            
                        let result;
                        if (textil) {
                            // Si hay lógica especial para textiles, llamala aquí
                            // result = await producto_desposicionar_DALC(producto, posicion, cantidad, usuario);
                        } else {
                            result = await producto_desposicionar_paqueteria_DALC(
                                idProducto,
                                idPosicion,
                                cantidad,
                                idEmpresa
                            );
                        }
            
                        if (result?.status === 'OK') {
                            if (stock && producto) {
                                const unidadesActualizadas = stock.Unidades - cantidad;
                                await stock_editOne_DALC(stock, { Unidades: unidadesActualizadas });
            
                                const movimiento = await createMovimientosStock_DALC({
                                    Orden: comprobante,
                                    IdProducto: idProducto,
                                    Unidades: parseInt(cantidad),
                                    Tipo: 1, // Salida
                                    IdEmpresa: parseInt(idEmpresa),
                                    fecha: new Date(),
                                    codprod: producto.Barcode,
                                    Usuario: usuario
                                });
                                logger.info(`Movement created: ${JSON.stringify(movimiento)}`);
            
                                if (orden) {
                                    await orden_editEstado_DALC(orden, 2, usuario);
                                    logger.info(`Order ${orden.Id} updated to estado 2`);
                                    await orden_datosPreparado_DALC(orden, fecha, usuario);
                                }
                            }
                        } else {
                            mensaje = `No se pudo desposicionar el artículo Barcode: ${producto?.Barcode} (Posición: ${idPosicion})`;
                            return { estado: "ERROR", mensaje: mensaje };
                        }
                    } else {
                        if (stock && producto) {
                            await stock_editOne_DALC(stock, { Unidades: unidades });
                            const movimiento = await createMovimientosStock_DALC({
                                Orden: comprobante,
                                IdProducto: unRegistro.IdProducto,
                                Unidades: parseInt(unRegistro.Cantidad),
                                Tipo: 1,
                                IdEmpresa: parseInt(idEmpresa),
                                fecha: new Date(),
                                codprod: producto.Barcode,
                                Usuario: usuario
                            });
                            logger.info(`Movement created: ${JSON.stringify(movimiento)}`);
                            if (orden) {
                                await orden_editEstado_DALC(orden, 2, usuario);
                                logger.info(`Order ${orden.Id} updated to estado 2`);
                                await orden_datosPreparado_DALC(orden, fecha, usuario);
                            }
                        }
                    }
                }
            }
            
    }
    
    return orden
}

export const contador_bultos_dia_DLAC = async(idEmpresa: string, fechaActual: string) => {
    const fechaTotal = "%" + fechaActual + "%"
    const unidadesOrdenes = await createQueryBuilder("ordenes","ord")
    .select("ord.id , sum(orddet.unidades) as unidades")
    .innerJoin("orderdetalle", "orddet", "ord.Id = orddet.ordenId")
    .where("ord.fechaCreacion like :fechaTotal",{fechaTotal})
    .andWhere("ord.empresa = :idEmpresa",{idEmpresa})
    .execute()

    const unidadesPreOrden = await createQueryBuilder("ordenes","ord")
    .select("ord.id , sum(orddet.unidades) as unidades")
    .innerJoin("orderdetalle", "orddet", "ord.Id = orddet.ordenId")
    .where("ord.liberarPreOrden like :fechaTotal",{fechaTotal})
    .andWhere("ord.empresa = :idEmpresa",{idEmpresa})
    .execute()
    if(!unidadesPreOrden[0].unidades){
        unidadesPreOrden[0].unidades = 0
    }
    if(!unidadesOrdenes[0].unidades){
        unidadesOrdenes[0].unidades = 0
    }
    const result = parseInt(unidadesOrdenes[0].unidades) + parseInt(unidadesPreOrden[0].unidades)
    return result
}

export const ordenes_delete_DALC = async(idTienda:number) => {
    const results = await getRepository(Orden)
        .createQueryBuilder()
        .delete()
        .from("ordenes")
        .where("IdEmpresa = :idTienda", {idTienda})
        .andWhere("IdIntegracion != ''")
        .execute()
    return
}

export const orden_delete_DALC = async(id:number) => {
    const results = await getRepository(Orden)
        .createQueryBuilder()
        .delete()
        .from("ordenes")
        .where("Id = :id", {id})
        .execute()
    return
}