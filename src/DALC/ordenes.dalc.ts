import {Between, getRepository, Like, Not, createQueryBuilder, In} from "typeorm"
import { Destino } from "../entities/Destino"
import { Empresa } from "../entities/Empresa"
import {Orden} from "../entities/Orden"
import { OrdenDetalle } from "../entities/OrdenDetalle"
import { Posicion } from "../entities/Posicion"
import { PosicionEnOrdenDetalle } from "../entities/PosicionEnOrdenDetalle"
import { PosicionProducto } from "../entities/PosicionProducto"
import { destino_getByDomicilio_DALC, destino_getById_DALC, destino_new_DALC } from "./destinos.dalc"
import { getLotesDetalle_DALC, producto_desposicionar_DALC, producto_desposicionar_Lote_DALC, producto_desposicionar_paqueteria_DALC, producto_getByBarcodeAndEmpresa_DALC, producto_getByIdAndEmpresa_DALC, producto_getPosiciones_byIdProducto_Lote_DALC } from "./productos.dalc"
import { MailSaliente } from "../entities/MailSaliente"
import { emailService } from "../services/email.service"
import { renderEmailTemplate } from "../helpers/emailTemplates"
import { producto_getStock_ByIdAndEmpresa_DALC, stock_editOne_DALC, getProductoByPartidaAndEmpresaAndProducto_DALC, partida_editOne_DALC } from "./productos.dalc"
import { createMovimientosStock_DALC } from "./movimientos.dalc"
import { posicion_getById_DALC } from "./posiciones.dalc"
import { ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC, ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC, ordenDetalle_getByIdOrdenAndProducto_DALC, ordenDetalle_getByIdOrden_DALC, ordenDetalle_getByIdProducto_DALC } from "./ordenesDetalle.dalc"
import { Lote } from "../entities/Lote"
import { ordenEstadoHistorico_insert_DALC, ordenEstadoHistorico_getByIdOrden_DALC } from "./ordenEstadoHistorico.dalc"
import { OrdenEstadoHistorico } from "../entities/OrdenEstadoHistorico"
import { emailProcesoConfig_get } from "./emailProcesoConfig.dalc"
import { EMAIL_PROCESOS } from "../constants/procesosEmail"
const { logger } = require('../helpers/logger')

// Move orden_getById_DALC to the top to resolve declaration order issue
export const orden_getById_DALC = async (id: number) => {
    const results = await getRepository(Orden).findOne(id, {relations: ["Empresa"]})
    return results
}


export const orden_getDetalleByOrden = async (orden: Orden) => {
    const results = await getRepository(OrdenDetalle).find({IdOrden: orden.Id})
    return results
}


export const orden_informarEmisionEtiqueta = async (orden: Orden, destinatarioTest?: string) => {
    if (!orden.EmailAvisoImpresionEtiquetasEnviado) {
        const valores = {
            numeroOrden: String(orden.Numero),
            nombreEmpresa: orden.Empresa.Nombre,
            urlReimpresion: `https://gestion.area54sa.com.ar/ImprimirUnaOrden/${orden.Id}/pdf`
        }

        let titulo = `Etiquetas emitidas - Orden ${orden.Numero} - Cliente ${orden.Empresa.Nombre}`
        let cuerpo = `Se han emitido las etiquetas correspondientes a la orden <b>${orden.Numero}</b> del cliente <b>${orden.Empresa.Nombre}</b>`
        cuerpo += `<br><br>Puede reimprimir dicha orden <a href='${valores.urlReimpresion}'>haciendo click aquí</a>`
        cuerpo += `<br><br><hr>Este mail ha sido enviado por un sistema automatizado e inatendido.  Por favor, no responder.`

        const config = await emailProcesoConfig_get(orden.IdEmpresa, EMAIL_PROCESOS.ORDEN_ETIQUETA)
        const plantilla = await renderEmailTemplate(EMAIL_PROCESOS.ORDEN_ETIQUETA, valores, config?.IdEmailTemplate)
        if (plantilla) {
            titulo = plantilla.asunto
            cuerpo = plantilla.cuerpo
        }

        let destinatarios = 'almacenaje@area54sa.com.ar'
        if (config?.Destinatarios) {
            destinatarios = config.Destinatarios
        } else if (destinatarioTest) {
            destinatarios = destinatarioTest
        }

        await emailService.sendEmail({
            idEmpresa: orden.IdEmpresa,
            destinatarios,
            titulo,
            cuerpo,
            idEmailServer: config?.IdEmailServer,
            idEmailTemplate: config?.IdEmailTemplate
        })
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
    codigoPostalTransporte?: string,
    cuitIvaTransporte?: string,
    ordenCompra?: string,
    nroPedidos?: string,
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

            // First get the product to get its barcode
            const producto = await producto_getByBarcodeAndEmpresa_DALC(String(unDetalle.barcode), empresa.Id);
            if (!producto) {
                errores.push("No se pudo encontrar el producto con barcode: " + unDetalle.barcode);
                continue;
            }
            
            // Then use the barcode to find the partida
            const productos = await getProductoByPartidaAndEmpresaAndProducto_DALC(
                empresa.Id,
                unDetalle.partida,
                producto.Barcode
            )
            console.log('[ORDEN] Buscar partida', unDetalle.partida, 'producto', unDetalle.idProducto, 'resultado', productos?.length)
            if (!productos || productos.length === 0) {
                console.log('[ORDEN] No se encontró la partida', unDetalle.partida, 'para el producto', unDetalle.idProducto);
                errores.push("No se encontró la partida " + unDetalle.partida + " para el producto con código " + unDetalle.barcode)
            } else {
                const unProducto = productos[0]
                unDetalle.producto = unProducto
                unDetalle.idPartida = unProducto.Id

                // Convertir valores a numéricos para evitar comparaciones incorrectas
                unProducto.Stock = Number(unProducto.Stock) || 0
                unProducto.StockPosicionado = Number(unProducto.StockPosicionado) || 0
                unProducto.StockComprometido = Number(unProducto.StockComprometido) || 0

                if (unProducto.Stock <= 0 ||
                    unDetalle.cantidad > (unProducto.Stock - unProducto.StockComprometido) ||
                    unDetalle.cantidad > (unProducto.StockPosicionado - unProducto.StockComprometido)) {
                    errores.push("Partida " + unProducto.Partida + " - Barcode: " + unProducto.Barcode + " - Nombre: " + unProducto.Nombre + " - Stock: " + unProducto.Stock + " - Posicionado: " + unProducto.StockPosicionado + " - Comprometido: " + unProducto.StockComprometido + " - Solicitado: " + unDetalle.cantidad + " - Estado: Insuficiente")
                    continue
                }

                if (empresa.StockPosicionado) {
                    // Aseguramos que Posiciones sea un array antes de iterar
                    const posicionesUsadas = [];
                    unDetalle.cantidadPendienteDeAsignacion = unDetalle.cantidad;

                    // Obtenemos y filtramos las posiciones directamente desde el producto
                    const posiciones = Array.isArray(unProducto.Posiciones)
                        ? unProducto.Posiciones.filter((p: any) => p.PartidaId === unProducto.Id)
                        : [];

                    console.log(`[ORDEN DALC] Procesando ${posiciones.length} posiciones para partida ${unDetalle.partida}, producto ${unProducto.Id}`);

                    // Ordenamos las posiciones por cantidad disponible (de mayor a menor)
                    const posicionesOrdenadas = [...posiciones].sort((a, b) => b.Unidades - a.Unidades);

                    for (const unaPosicion of posicionesOrdenadas) {
                        if (unDetalle.cantidadPendienteDeAsignacion <= 0) break;

                        // Obtenemos la cantidad total en esta posición
                        let cantidadDisponible = unaPosicion.Unidades;

                        console.log(`[ORDEN DALC] Procesando posición ${unaPosicion.Id} con ${cantidadDisponible} unidades disponibles`);

                        // Verificamos si hay órdenes pendientes que afecten esta posición
                        // Primero obtenemos las posiciones comprometidas para esta posición y producto
                        const posicionesComprometidas = await getRepository(PosicionEnOrdenDetalle)
                            .createQueryBuilder('pop')
                            .innerJoin('orderdetalle', 'od', 'od.id = pop.id_orderdetalle')
                            .innerJoin('ordenes', 'o', 'o.Id = od.ordenId')
                            .where('o.estado = :estado', { estado: 1 }) // 1 = pendiente
                            .andWhere('pop.id_posicion = :posicionId', { posicionId: unaPosicion.Id })
                            .andWhere('pop.id_producto = :productoId', { productoId: unProducto.Id })
                            .getMany();

                        // Obtenemos los detalles de orden comprometidos
                        const ordenesPendientes = posicionesComprometidas.length > 0 ?
                            await getRepository(OrdenDetalle)
                                .createQueryBuilder('od')
                                .where('od.Id IN (:...ids)', {
                                    ids: posicionesComprometidas.map(p => p.IdOrdenDetalle)
                                })
                                .getMany() : [];

                        // Calculamos la cantidad comprometida en órdenes pendientes
                        let cantidadComprometida = 0;
                        for (const orden of ordenesPendientes) {
                            const posicionesOrden = await getRepository(PosicionEnOrdenDetalle).find({
                                where: {
                                    IdOrdenDetalle: orden.Id,
                                    IdPosicion: unaPosicion.Id,
                                    IdProducto: unProducto.Id
                                }
                            });

                            cantidadComprometida += posicionesOrden.reduce((sum, pos) => sum + pos.Cantidad, 0);
                        }

                        const cantidadDisponibleReal = Math.max(0, cantidadDisponible - cantidadComprometida);

                        console.log(`[ORDEN DALC] Posición ${unaPosicion.Id} - Total: ${cantidadDisponible}, Comprometido: ${cantidadComprometida}, Disponible: ${cantidadDisponibleReal}`);

                        if (cantidadDisponibleReal > 0) {
                            const unidadesAUsar = Math.min(cantidadDisponibleReal, unDetalle.cantidadPendienteDeAsignacion);

                            console.log(`[ORDEN DALC] Asignando ${unidadesAUsar} unidades de la posición ${unaPosicion.Id}`);

                            posicionesUsadas.push({
                                Id: unaPosicion.Id,
                                Unidades: unidadesAUsar,
                                IdProducto: unProducto.Id // Aseguramos que el IdProducto sea el de la partida
                            });

                            unDetalle.cantidadPendienteDeAsignacion -= unidadesAUsar;

                            if (unDetalle.cantidadPendienteDeAsignacion <= 0) {
                                console.log(`[ORDEN DALC] Cantidad total asignada para el detalle`);
                                break;
                            }
                        }
                    }

                    if (unDetalle.cantidadPendienteDeAsignacion > 0) {
                        console.warn(`[ORDEN DALC] No se pudo asignar toda la cantidad solicitada. Faltan asignar ${unDetalle.cantidadPendienteDeAsignacion} unidades`);
                        errores.push(`No hay suficiente stock posicionado para la partida ${unDetalle.partida}. Faltan asignar ${unDetalle.cantidadPendienteDeAsignacion} unidades`);
                    }

                    console.log(`[ORDEN DALC] Total de posiciones a usar: ${posicionesUsadas.length}`);
                    unDetalle.posicionesUsadas = posicionesUsadas;

                    // Si después de procesar todas las posiciones no se pudo asignar la cantidad completa, limpiar posicionesUsadas
                    if (unDetalle.cantidadPendienteDeAsignacion > 0) {
                        unDetalle.posicionesUsadas = [];
                    }
                } else {
                    console.log('[ORDEN DALC] La empresa no tiene stock posicionado habilitado');
                    unDetalle.posicionesUsadas = [];
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
                            // Ensure Posiciones is an array before iterating
                            const posicionesUsadas=[]
                            unDetalle.cantidadPendienteDeAsignacion=unDetalle.cantidad
                            const posiciones = Array.isArray(unProducto.Posiciones) ? unProducto.Posiciones : [];
                            
                            for (const unaPosicion of posiciones) {
                                let cantidadNoComprometido = unaPosicion.Unidades 
            
                                // Traemos todas las órdenes que tengan el producto que pasamos y que su órden este en estado 1(pendiente)
                                const idOrderDetalle = await ordenDetalle_getByIdProducto_DALC(unProducto.Id)
                                
                                // Iteramos para traer todas las posiciones de la tabla posiciones_por_orderdetalle
                                for (const detalleOrden of idOrderDetalle) {
                                    const posicionPorOrdendetalle = await getRepository(PosicionEnOrdenDetalle).find({
                                        IdOrdenDetalle: detalleOrden.id, 
                                        IdEmpresa: empresa.Id
                                    });
            
                                    // Si las posiciones coinciden con unaPosicion.Id que viene de la pos_prod,
                                    // descontamos la cantidad que está comprometida en otra orden anterior
                                    // para saber cuántas unidades tenemos disponibles
                                    for (const cadaPosicion of posicionPorOrdendetalle) {
                                        if (cadaPosicion.IdPosicion == unaPosicion.Id) {
                                            cantidadNoComprometido -= cadaPosicion.Cantidad;
                                        }
                                    }
                                }
            
                                if (unDetalle.cantidadPendienteDeAsignacion > 0) {
                                    if (cantidadNoComprometido >= unDetalle.cantidadPendienteDeAsignacion) {
                                        posicionesUsadas.push({
                                            Id: unaPosicion.Id, 
                                            Unidades: unDetalle.cantidadPendienteDeAsignacion
                                        });
                                        unDetalle.cantidadPendienteDeAsignacion = 0;
                                    } else if (cantidadNoComprometido > 0) {
                                        posicionesUsadas.push({
                                            Id: unaPosicion.Id, 
                                            Unidades: cantidadNoComprometido
                                        });
                                        unDetalle.cantidadPendienteDeAsignacion -= cantidadNoComprometido;
                                    }
                                }
                            }
                            unDetalle.posicionesUsadas = posicionesUsadas;
                        }
                    } else {
                        unDetalle.posicionesUsadas=[]
                    }
                }
            }
        }
    }
}

    //Me fijo si el destino existe o es nuevo
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
        nuevaOrden.CodigoPostalTransporte = codigoPostalTransporte ?? ""
        nuevaOrden.CuitIvaTransporte = cuitIvaTransporte ?? ""
        nuevaOrden.OrdenCompra = ordenCompra ?? ""
        nuevaOrden.NroPedidos = nroPedidos ?? ""
        nuevaOrden.ObservacionesLugarEntrega = observacionesLugarEntrega ?? ""
        if (puntoVentaId !== undefined) {
            nuevaOrden.PuntoVentaId = puntoVentaId;
        }
        if (nroRemito && nroRemito.trim() !== "") {
            nuevaOrden.NroRemito = nroRemito.trim();
        }
        
        const resultToSave=getRepository(Orden).create(nuevaOrden)
        console.log('[ORDEN DALC] Creando orden para empresa', empresa.Id)
        const nuevaOrdenCreada=await getRepository(Orden).save(resultToSave)
        console.log('[ORDEN DALC] Orden creada', nuevaOrdenCreada.Id)
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
            unaOrdenDetalle.DespachoPlaza = unItem.despachoPlaza ?? ''

            const resultToSave=getRepository(OrdenDetalle).create(unaOrdenDetalle)
            const nuevoDetalleCreado=await getRepository(OrdenDetalle).save(resultToSave)
            console.log('[ORDEN DALC] Detalle creado', nuevoDetalleCreado.Id)
        
            // Verificar si hay posiciones para guardar
            if (!unItem.posicionesUsadas || unItem.posicionesUsadas.length === 0) {
                console.warn('[ORDEN DALC] No hay posiciones para guardar en el detalle', {
                    idOrdenDetalle: nuevoDetalleCreado.Id,
                    idProducto: tienePART ? unItem.idPartida : (tieneLote ? unItem.idProducto : unItem.producto?.Id),
                    tienePART,
                    tieneLote,
                    posicionesUsadas: unItem.posicionesUsadas
                });
                continue;
            }

            for (const unaPosicionUsada of unItem.posicionesUsadas) {
                try {
                    const unaPosicionEnOrdenDetalle = new PosicionEnOrdenDetalle()
                    unaPosicionEnOrdenDetalle.IdPosicion = unaPosicionUsada.Id
                    unaPosicionEnOrdenDetalle.IdOrdenDetalle = nuevoDetalleCreado.Id
                    unaPosicionEnOrdenDetalle.Cantidad = unaPosicionUsada.Unidades
                    
                    // Manejar la asignación del IdProducto según el tipo de flujo
                    if (tieneLote) {
                        unaPosicionEnOrdenDetalle.IdProducto = unItem.idProducto
                    } else if (tienePART) {
                        // Para partidas, usar idPartida en lugar de producto.Id
                        unaPosicionEnOrdenDetalle.IdProducto = unItem.idPartida
                        console.log('[ORDEN DALC] Asignando idPartida a posición:', unItem.idPartida)
                    } else {
                        unaPosicionEnOrdenDetalle.IdProducto = unItem.producto?.Id
                    }
                    
                    unaPosicionEnOrdenDetalle.IdEmpresa = empresa.Id

                    console.log('[ORDEN DALC] Intentando guardar posición en orden detalle:', {
                        idPosicion: unaPosicionUsada.Id,
                        idOrdenDetalle: nuevoDetalleCreado.Id,
                        cantidad: unaPosicionUsada.Unidades,
                        idProducto: unaPosicionEnOrdenDetalle.IdProducto,
                        idEmpresa: empresa.Id
                    });

                    const resultToSave = getRepository(PosicionEnOrdenDetalle).create(unaPosicionEnOrdenDetalle)
                    console.log('[ORDEN DALC] Objeto a guardar en la base de datos:', resultToSave);
                    
                    const nuevaPosicionEnDetalle = await getRepository(PosicionEnOrdenDetalle).save(resultToSave)
                    
                    console.log('[ORDEN DALC] Posición en detalle creada exitosamente', {
                        id: nuevaPosicionEnDetalle.Id,
                        idPosicion: unaPosicionUsada.Id,
                        idOrdenDetalle: nuevoDetalleCreado.Id,
                        cantidad: unaPosicionUsada.Unidades,
                        idProducto: unaPosicionEnOrdenDetalle.IdProducto,
                        idEmpresa: empresa.Id,
                        fecha: new Date().toISOString()
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                    const errorStack = error instanceof Error ? error.stack : undefined;
                    
                    console.error('[ORDEN DALC] Error al guardar posición en orden detalle:', {
                        error: errorMessage,
                        stack: errorStack,
                        detalle: {
                            idPosicion: unaPosicionUsada?.Id,
                            idOrdenDetalle: nuevoDetalleCreado?.Id,
                            idProducto: tienePART ? unItem.idPartida : (tieneLote ? unItem.idProducto : unItem.producto?.Id),
                            idEmpresa: empresa?.Id,
                            tienePART,
                            tieneLote
                        }
                    });
                    
                    // Crear un nuevo error con el mensaje original para mantener el stack trace
                    const newError = new Error(`Error al guardar posición en orden detalle: ${errorMessage}`);
                    if (errorStack) {
                        newError.stack = errorStack;
                    }
                    throw newError; // Relanzar el error para que se maneje más arriba
                }
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

export const destino_getAll_DALC = async (IdEmpresa: any) => {
    const results = await getRepository(Destino).find({where: {IdEmpresa: IdEmpresa}})
    return results
}


export const orden_getByNumeroAndIdEmpresa_DALC = async (Numero: string, IdEmpresa: number) => {
    const results = await getRepository(Orden).findOne({Numero, IdEmpresa})
    return results
}

export const orden_getByNumeroAndIdEmpresaWithEmpresa_DALC = async (Numero: string, IdEmpresa: number) => {
    const result = await getRepository(Orden).findOne({
        where: { Numero, IdEmpresa },
        relations: ["Empresa"]
    })
    return result
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
        return { estado: "ERROR", mensaje: "Orden no encontrada" };
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

export const ordenes_getHistoricoEstados_DALC = async (idOrden: number) => {
    return await ordenEstadoHistorico_getByIdOrden_DALC(idOrden);
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

export const ordenes_getHistoricoMultiplesOrdenes_DALC = async (idsOrdenes: number[]) => {
    if (!idsOrdenes || idsOrdenes.length === 0) {
        return [];
    }

    // Obtener todos los históricos para las órdenes solicitadas
    const historicos = await getRepository(OrdenEstadoHistorico)
        .createQueryBuilder('hist')
        .where('hist.IdOrden IN (:...ids)', { ids: idsOrdenes })
        .orderBy('hist.Fecha', 'DESC')
        .getMany();

    // Agrupar los históricos por IdOrden
    const historicosPorOrden = historicos.reduce((acc, historico) => {
        const ordenId = historico.IdOrden;
        if (!acc[ordenId]) {
            acc[ordenId] = [];
        }
        acc[ordenId].push(historico);
        return acc;
    }, {} as Record<number, OrdenEstadoHistorico[]>);

    // Asegurarnos de que todas las órdenes tengan un array, incluso si no tienen históricos
    return idsOrdenes.map(id => ({
        ordenId: id,
        historicos: historicosPorOrden[id] || []
    }));
}


export const ordenes_SalidaOrdenes_DALC = async (body: any) => {
    let disposicionExitosa = false;
    console.log('[SALIDA_ORDEN] Iniciando proceso de salida de orden', {
        timestamp: new Date().toISOString(),
        body: {
            Cabeceras: {
                IdEmpresa: body.Cabeceras.IdEmpresa,
                IdOrden: body.Cabeceras.IdOrden,
                Comprobante: body.Cabeceras.Comprobante,
                Usuario: body.Cabeceras.Usuario,
                Textil: body.Cabeceras.Textil,
                StockPosicionado: body.Cabeceras.StockPosicionado,
                TieneLote: body.Cabeceras.TieneLote,
                TienePART: body.Cabeceras.TienePART
            },
            DetalleCount: body.Cabeceras.Detalle?.length || 0
        }
    });
    
    let registros = body;
    const idEmpresa = body.Cabeceras.IdEmpresa;
    const idOrden = body.Cabeceras.IdOrden;
    const comprobante = body.Cabeceras.Comprobante;
    const usuario = body.Cabeceras.Usuario;
    const fecha = body.Cabeceras.Fecha;
    const textil = body.Cabeceras.Textil;
    const stockPosicionado = body.Cabeceras.StockPosicionado;
    const tieneLote = body.Cabeceras.TieneLote;
    const tienePART = body.Cabeceras.TienePART;

    if (tienePART) {
        for (const det of registros.Cabeceras.Detalle) {
            if (!det.idPartida || !det.IdPosicion) {
                console.error(`[SALIDA_ORDEN] Faltan campos idPartida o IdPosicion`, det);
                return { estado: "ERROR", mensaje: "Debe enviar idPartida e IdPosicion para cada item cuando TienePART es true." };
            }
        }
    }
    console.log('[SALIDA_ORDEN] Inicializando variables de control');
    let posicionProducto;
    let idOrderDetalle; 
    let result;
    let todosTienenStock = false;
    let mensaje;
    let cantidadPosicion = 0;
    let lotesDetalle;
    
    console.log('[SALIDA_ORDEN] Configuración de la orden:', {
        idEmpresa,
        idOrden,
        comprobante,
        usuario,
        textil,
        stockPosicionado,
        tieneLote,
        tienePART
    });

    console.log(`[SALIDA_ORDEN] Obteniendo datos de la orden ${idOrden}`);
    const orden = await orden_getById_DALC(Number(idOrden));
    console.log('[SALIDA_ORDEN] Datos de la orden:', orden);
    
    console.log(`[SALIDA_ORDEN] Obteniendo detalles de la orden ${idOrden}`);
    const idOrderDetalleGet2 = await ordenDetalle_getByIdOrdenAndProducto_DALC(idOrden);
    console.log(`[SALIDA_ORDEN] Detalles de la orden (sin partida):`, idOrderDetalleGet2);
    
    const idOrderDetalleGet3 = await ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC(idOrden);
    console.log(`[SALIDA_ORDEN] Detalles de la orden (con partida):`, idOrderDetalleGet3);

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
            console.log(`[SALIDA_ORDEN] Buscando producto por barcode: ${registro.Barcode} para empresa ${idEmpresa}`);
            const producto = await producto_getByBarcodeAndEmpresa_DALC(String(registro.Barcode), idEmpresa);
            if (!producto) {
                const errorMsg = `No se pudo encontrar el producto con barcode: ${registro.Barcode}`;
                console.error(`[SALIDA_ORDEN] ${errorMsg}`);
                return { estado: "ERROR", mensaje: errorMsg };
            }
            console.log(`[SALIDA_ORDEN] Producto encontrado:`, {
                id: producto.Id,
                nombre: producto.Nombre || 'Sin nombre',
                barcode: producto.Barcode
            });
            console.log('[SALIDA] Buscando partida:', {
                empresa: idEmpresa,
                partida: registro.partida,
                barcode: registro.Barcode,
                idProducto: registro.idProducto
            });
            const productos = await getProductoByPartidaAndEmpresaAndProducto_DALC(idEmpresa, registro.partida, producto.Barcode)
            console.log('[SALIDA] Resultado de búsqueda de partida:', {
                partida: registro.partida,
                idProducto: registro.idProducto,
                cantidadProductos: productos?.length,
                productos: productos
            })

            // iteramos todas las posiciones en las que esta un producto para saber cuanto stock posicionado tenemos disponible
            if(productos && productos.length > 0){
                const producto = productos[0]
                const stock = producto.Stock
                console.log('[STOCK VALIDATION] Producto encontrado en partida:', {
                    partida: registro.partida,
                    productoId: producto.IdProducto,
                    barcode: producto.Barcode,
                    stockTotal: stock,
                    posiciones: producto.Posiciones
                });
                
                for(const cantidadPorPosicion of producto.Posiciones){
                    console.log('[STOCK VALIDATION] Posición encontrada:', {
                        posicionId: cantidadPorPosicion.Id,
                        descripcion: cantidadPorPosicion.Descripcion,
                        unidades: cantidadPorPosicion.Unidades,
                        lote: cantidadPorPosicion.Lote,
                        existe: cantidadPorPosicion.Existe
                    });
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
            console.log(`[STOCK VALIDATION] Validando stock posicionado para partida ${registro.partida}, barcode ${registro.Barcode}`);
            console.log(`[STOCK VALIDATION] - Cantidad requerida: ${registro.Cantidad}`);
            console.log(`[STOCK VALIDATION] - Stock total en partida: ${producto.Stock}`);
            console.log(`[STOCK VALIDATION] - Stock posicionado: ${cantidadPosicion}`);
            console.log(`[STOCK VALIDATION] - Posiciones encontradas:`, producto.Posiciones);
            
            // Verificar si hay posiciones con stock
            const posicionesConStock = producto.Posiciones.filter(p => p.Unidades > 0);
            console.log(`[STOCK VALIDATION] - Posiciones con stock: ${posicionesConStock.length} de ${producto.Posiciones.length}`);
            
            // DEBUG: Mostrar información detallada del producto y sus posiciones
            console.log('[STOCK DEBUG] Detalle completo del producto:', JSON.stringify(producto, null, 2));
            console.log(`[STOCK DEBUG] Cantidad posicionada total: ${cantidadPosicion}, Cantidad requerida: ${registro.Cantidad}`);
            
            if (producto.Posiciones && producto.Posiciones.length > 0) {
                console.log('[STOCK DEBUG] Detalle de posiciones:');
                producto.Posiciones.forEach((pos, idx) => {
                    console.log(`[STOCK DEBUG]   Posición ${idx + 1}:`, {
                        Id: pos.Id,
                        Nombre: pos.Nombre,
                        Unidades: pos.Unidades,
                        Disponible: pos.Unidades > 0
                    });
                });
            } else {
                console.log('[STOCK DEBUG] No se encontraron posiciones para el producto');
            }
            
            posicionesConStock.forEach((p, i) => {
                console.log(`[STOCK VALIDATION]   Posición ${i+1}: ID=${p.Id}, Nombre=${p.Nombre || 'N/A'}, Unidades=${p.Unidades}`);
            });
            
            if(stockPosicionado){
                console.log(`[STOCK VALIDATION] Validando stock posicionado (${cantidadPosicion}) vs cantidad requerida (${registro.Cantidad})`);
                if(cantidadPosicion < registro.Cantidad){
                    const barcodeMensaje = productos && productos[0] ? productos[0].Barcode : ""
                    console.error(`[STOCK VALIDATION] Error: Stock insuficiente. Se necesitan ${registro.Cantidad} unidades pero solo hay ${cantidadPosicion} posicionadas`);
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
        let disposicionExitosa = false;
        
        if(tieneLote){
           //Iteramos detalle para obtener cada producto
            for (const unRegistro of registros.Cabeceras.Detalle){
                console.log(`[SALIDA_ORDEN] Desposicionamiento LOTE -> IdProducto: ${unRegistro.IdProducto}, idPartida: ${unRegistro.idPartida}, IdPosicion: ${unRegistro.IdPosicion}`);
                
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
                console.log('[SALIDA_ORDEN] Iniciando proceso para partidas');
                
                for (const unRegistro of registros.Cabeceras.Detalle) {
                    console.log(`[SALIDA_ORDEN] Procesando item:`, {
                        barcode: unRegistro.Barcode,
                        partida: unRegistro.partida,
                        cantidad: unRegistro.Cantidad,
                        idPartida: unRegistro.idPartida,
                        idPosicion: unRegistro.IdPosicion
                    });

                    // 1. Obtener información del producto
                    const producto = await producto_getByBarcodeAndEmpresa_DALC(String(unRegistro.Barcode), idEmpresa);
                    if (!producto) {
                        const errorMsg = `No se encontró producto con barcode: ${unRegistro.Barcode}`;
                        console.error('[SALIDA_ORDEN] Error:', errorMsg);
                        return { estado: "ERROR", mensaje: errorMsg };
                    }

                    console.log('[SALIDA_ORDEN] Producto encontrado:', {
                        id: producto.Id,
                        barcode: producto.Barcode,
                        nombre: producto.Nombre
                    });

                    // 2. Obtener información de la partida
                    const partidas = await getProductoByPartidaAndEmpresaAndProducto_DALC(
                        idEmpresa, 
                        unRegistro.partida, 
                        producto.Barcode
                    );

                    if (!partidas || partidas.length === 0) {
                        const errorMsg = `No se encontró la partida ${unRegistro.partida} para el producto ${producto.Barcode}`;
                        console.error('[SALIDA_ORDEN] Error:', errorMsg);
                        return { estado: "ERROR", mensaje: errorMsg };
                    }

                    const partida = partidas[0];
                    console.log('[SALIDA_ORDEN] Partida encontrada:', {
                        idPartida: partida.Id,
                        numeroPartida: partida.Partida,
                        stockActual: partida.Stock,
                        idProducto: partida.IdProducto
                    });

                    // 3. Validar stock suficiente
                    if (partida.Stock < unRegistro.Cantidad) {
                        const errorMsg = `Stock insuficiente en partida ${partida.Partida}. Disponible: ${partida.Stock}, Solicitado: ${unRegistro.Cantidad}`;
                        console.error('[SALIDA_ORDEN] Error:', errorMsg);
                        return { estado: "ERROR", mensaje: errorMsg };
                    }

                    // 4. Calcular nuevo stock
                    const nuevoStock = partida.Stock - unRegistro.Cantidad;
                    console.log('[SALIDA_ORDEN] Actualizando stock:', {
                        stockAnterior: partida.Stock,
                        cantidadADescontar: unRegistro.Cantidad,
                        nuevoStock: nuevoStock
                    });

                    // 5. Actualizar stock en partida
                    console.log('[SALIDA_ORDEN] Actualizando partida con datos:', {
                        partidaId: partida.Id,
                        nuevoStock: nuevoStock
                    });
                    const partidaActualizada = await partida_editOne_DALC(partida, { Stock: nuevoStock });
                    console.log('[SALIDA_ORDEN] Partida actualizada:', partidaActualizada);

                    // 6. Actualizar stock posicionado si es necesario
                    if (stockPosicionado) {
                        console.log('[SALIDA_ORDEN] Actualizando stock posicionado...');
                        for(const detalle of idOrderDetalleGet3) {
                            if(partida.Id === detalle.IdPartida) {
                                idOrderDetalle = detalle.IdOrdendetalle;
                                if(idOrderDetalle) {
                                    const ordenDetallePosicion = await ordenDetallePosiciones_getByIdOrdenAndIdEmpresa_DALC(
                                        idOrderDetalle, 
                                        idEmpresa
                                    );

                                    for(const detallePosicion of ordenDetallePosicion) {
                                        console.log('[SALIDA_ORDEN] Descontando de posición:', {
                                            idPosicion: detallePosicion.IdPosicion,
                                            cantidad: detallePosicion.Cantidad
                                        });

                                        const result = await producto_desposicionar_paqueteria_DALC(
                                            partida.Id,  // ID de la partida
                                            detallePosicion.IdPosicion,
                                            detallePosicion.Cantidad,
                                            idEmpresa
                                        );

                                        if(result?.status !== 'OK') {
                                            const errorMsg = `Error al desposicionar partida ${partida.Partida} en posición ${detallePosicion.IdPosicion}`;
                                            console.error('[SALIDA_ORDEN] Error:', errorMsg);
                                            return { estado: "ERROR", mensaje: errorMsg };
                                        }
                                    }
                                }
                            }
                        }
                    }

                    try {
                        // 7. Registrar movimiento de stock
                        console.log('[SALIDA_ORDEN] Registrando movimiento de stock...', {
                            idProducto: partida.IdProducto,  // ID del producto padre
                            barcode: producto.Barcode,
                            partida: partida.Partida,
                            unidades: unRegistro.Cantidad
                        });

                        const movimiento = await createMovimientosStock_DALC({
                            Orden: comprobante,
                            IdProducto: partida.IdProducto,  // ID del producto padre
                            Unidades: parseInt(unRegistro.Cantidad),
                            Tipo: 1,  // 1 = Salida
                            IdEmpresa: parseInt(idEmpresa),
                            fecha: new Date(),
                            codprod: producto.Barcode,  // Barcode del producto
                            Usuario: usuario,
                            Lote: partida.Partida  // Número de partida
                        });

                        console.log('[SALIDA_ORDEN] Movimiento registrado:', movimiento);

                        // 8. Actualizar estado de la orden
                        if(orden) {
                            console.log(`[SALIDA_ORDEN] Actualizando estado de la orden ${orden.Id} a "Preparada"`);
                            await orden_editEstado_DALC(orden, 2, usuario);  // 2 = Preparada
                            await orden_datosPreparado_DALC(orden, fecha, usuario);
                            disposicionExitosa = true;
                        }
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                        console.error('[SALIDA_ORDEN] Error al registrar movimiento de stock:', errorMessage);
                        return { estado: "ERROR", mensaje: `Error al registrar el movimiento de stock: ${errorMessage}` };
                    }
                }
            }
            else {
                // Iteramos detalle para obtener cada producto
                for (const unRegistro of registros.Cabeceras.Detalle) {
                    console.log(`[SALIDA_ORDEN] Desposicionamiento SIN-PART -> IdProducto: ${unRegistro.IdProducto}, idPartida: ${unRegistro.idPartida}, IdPosicion: ${unRegistro.IdPosicion}`);
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
                            console.error(`[ERROR] ${mensaje}`);
                            return { estado: "ERROR", mensaje: mensaje };
                        }
                    } else {
                        // Lógica para cuando no hay stock posicionado
                        try {
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
                                    disposicionExitosa = true;
                                }
                            }
                        } catch (error: unknown) {
                            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                            console.error('[SALIDA_ORDEN] Error al actualizar stock no posicionado:', errorMessage);
                            return { estado: "ERROR", mensaje: `Error al actualizar el stock no posicionado: ${errorMessage}` };
                        }
                    }
                }
            }
        }
    
    console.log('[SALIDA_ORDEN] Proceso de salida de orden completado exitosamente');
    return orden;
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