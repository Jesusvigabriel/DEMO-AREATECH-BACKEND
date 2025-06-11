import axios from "axios";
import qs from 'qs';

// DALC de Ordenes
import { ordenes_addOrden_DALC, ordenes_getByIdIntAndEmpresa_DALC } from "../../../DALC/ordenes.dalc";
// DALC de Destino
import { busca_agregaDestino_DALC } from "../../../DALC/destinos.dalc";
// DALC de Productos
import { producto_getByBarcodeAndEmpresa_DALC, producto_getBySKUAndEmpresa_DALC } from "../../../DALC/productos.dalc";
// DALC de Detalle de Orden
import { generaDetalleOrden_DALC } from "../../../DALC/ordenesDetalle.dalc";

// Entidades
import { Orden } from "../../../entities/Orden";

export const obtieneVentas_DALC = async (tiendaUrl:string, tokenTienda:string) => {
    // Se declara un array de Ventas Parcial de ventas vacio.
    const ventasParcial = [];

    // Se inicia las variables de paginación.
    let skip = 0;
    let page = 1; 

    // Se solicitan las ventas a Yiqi.
    const result = await getVentas_DALC( tiendaUrl , tokenTienda, skip.toString(), page.toString());

    // console.log("Result de la primera llamada", result.data.data.length, "Primer elemento", result.data.data[0])

    // Se recorre la respuesta y se agregan los resultados al array de Ventas.
    for (let index = 0; index < result.data.data.length; index++) {
        const element = result.data.data[index];

        // console.log(element);
        if (element.PEDI_FECHA>="2021-09-28") {
            ventasParcial.push(element)
        }
    };

    // console.log("Luego de la primera llamada", ventasParcial.length)

    // Se inicia la varible datos asignando como resultado inicial el largo de la solicitud de Ventas a Yiqi.
    let datos = result.data.data.length;

    // console.log("Datos para la primera proxima llamada", datos)
    
    // Mientras la variable datos sea igual a 50.
    while (datos === 50) {
        // Se incrementa en uno la paginación.
        skip += 1
        page += 1
        // Se realizan la peticiones de Ventas.
        const result = await getVentas_DALC(tiendaUrl, tokenTienda, skip.toString(), page.toString())
        
        // console.log("Llamada con page", page, "Cantidad", result.data.data.length, "Primero", result.data.data[0])
        // Se agregan los resultados al Array de Ventas.
        for (let index = 0; index < result.data.data.length; index++) {
            const element = result.data.data[index];
            ventasParcial.push(element)
            
        }
        // Se asigna el nuevo valor de la variable datos.
        datos = result.data.data.length
        // console.log("Datos para una siguiente llamada", datos)
    };

    // Se ajustan los resultados para enviar la respuesta.
    // console.log(ventasParcial.length)
    const ventas = await parseaVentas(ventasParcial)
    // Se ordenan los resultados por Fecha 
    ventas.sort((a,b) => (a.fecha > b.fecha) ? -1 : 1)
    return {cantidad: ventas.length, ventas}

}

export const sincronizaVentas_DALC = async(tiendaUrlVentas: string, token:string ,idTiendaArea:number) => {
    // Se obtiene las ventas
    const {ventas} = await obtieneVentas_DALC(tiendaUrlVentas, token)
        
    // Se agrupan las ventas por datos Completo e Incompletos
    const ventasConDatosCompletos = []
    const ventasConDatosIncompletos = []

    console.log("Ventas obtenidas", ventas.length)
    for (const unaVenta of ventas) {
        // Se extraen los datos de Envio para su validación
        const {name, address, zipCode, locality} = unaVenta.shippingAddress 
        // Se validan que estan todos los datos para el envio
        const validDatosEnvio = (name == null || address==null || zipCode==null || locality ==null) ? false : true
        // Se validan que todos los productos tenga un SKU
        let validDatosProductos = true
        if(validDatosEnvio === true){
            for (const unProducto of unaVenta.products) {
                if(unProducto.SKU == undefined || unProducto.SKU == null){
                    validDatosProductos = false
                }
            }
        } else {
            console.log("Venta ignorada", unaVenta);                            
        }
        // las validaciones son de tipo true se agregan como venta de datos completos.
        if(validDatosProductos === true && validDatosEnvio === true){
            ventasConDatosCompletos.push(unaVenta)
        }else{
            ventasConDatosIncompletos.push(unaVenta)
        }
   
    }

    const result = []

    const {logger}=require("../../../helpers/logger")

    for (const unaVenta of ventasConDatosCompletos) {
        
        logger.info("Venta a procesar")
        logger.info(JSON.stringify(unaVenta))

        //Revisa si la orden esta cargada en la base de Area
        const checkOrden = await  ordenes_getByIdIntAndEmpresa_DALC(idTiendaArea, unaVenta.trackingCode)

        if(!checkOrden){

            logger.info("_Venta NO previamente cargada")
                
            //Verifico que todos los artículos de la orden existan, y que todas tengan stock
            let todosExisten=true
            let todosTienenStock=true
            let msg= ''
            for (const unProducto of unaVenta.products) {
                const productoEnArea = await producto_getBySKUAndEmpresa_DALC(unProducto.SKU, idTiendaArea)
                if(productoEnArea){
                    logger.info("_Producto existe en Area")
                    logger.info("_"+JSON.stringify(productoEnArea))
                    if(productoEnArea.StockDisponible < unProducto.cantidad){
                        msg = `Id: ${productoEnArea.Id} - SKU ${productoEnArea.CodeEmpresa} - Barcode: ${productoEnArea.Barcode} - Stock: ${productoEnArea.Stock} - Comprometido: ${productoEnArea.StockComprometido} - Disponible: ${productoEnArea.StockDisponible} - Pedido: ${unProducto.cantidad}`
                        todosTienenStock=false
                        logger.info("__Sin disponible")
                        logger.info(msg)                        
                    } else {
                        logger.info("__Hay disponibilidad")
                    }
                }else{
                    msg = `Producto no existe en Area - SKU: ${unProducto.SKU}`
                    logger.info("__"+msg)
                    todosExisten=false
                }  
            }

            if(todosExisten && todosTienenStock){
                // Se arma la Orden para Agregar

                logger.info("__Se va a crear la orden nueva")
                const newOrden = new Orden()
                newOrden.IdEmpresa = idTiendaArea
                newOrden.Tipo = 1
                newOrden.Numero = unaVenta.trackingCode
                newOrden.IdIntegracion = unaVenta.trackingCode                
                newOrden.Eventual = await busca_agregaDestino_DALC(unaVenta, idTiendaArea)
                logger.info("__Se obtuvo el Eventual Id "+newOrden.Eventual)

                if (newOrden.Eventual===25154) {
                    logger.info("******************")
                }

                newOrden.ValorDeclarado = unaVenta.total
                newOrden.Estado = 1
                newOrden.Observaciones = `Venta Yiqi: ${unaVenta.trackingCode} a Cliente: ${unaVenta.shippingAddress.name} `;
                newOrden.Fecha = unaVenta.fecha;
                // Se agrega la Orden
                const orden = await ordenes_addOrden_DALC(newOrden)
                logger.info("__Se creó la nueva orden con Id "+orden?.Id)
                const ordenDetalle = []
                if(orden){
                    for (const unProducto of unaVenta.products) {
                        //Se buscan los datos del Producto
                        const productoEnArea:any = await producto_getBySKUAndEmpresa_DALC(unProducto.SKU, idTiendaArea);
                        //Se genera el detalle de la orden
                        const detallOrden = await generaDetalleOrden_DALC(productoEnArea, orden.Id, unProducto.cantidad )
                        ordenDetalle.push(detallOrden)
                    }
                    result.push({"orden": orden,"orden detalle": ordenDetalle})
                }else{
                    result.push({"orden": unaVenta.trackingCode, "msg": "Error al intentar agregar"})
                }
                
            }else{
                console.log("Venta original Yiqi", unaVenta);
                console.log(msg);

                logger.info("__La orden NO se crea - Trackincode: "+unaVenta.trackingCode+" - Detalle: "+msg)
                result.push({"orden": unaVenta.trackingCode, "orden detalle": "Sin detalle o sin stock disponible", msg})
            }
        } else {
            logger.info("_Existía previamente, no la proceso")
        }
        logger.info("__________")
    }

    if(result.length === 0){
        return `Todas las ventas de la tienda ${idTiendaArea} en Yiqi estan sincronizadas`
    } else {
        return result
    }

}


const getVentas_DALC = async (url:string, token:string, skip:string, page:string) => {
    return axios ({
        method: 'POST',
        url: url,
        headers: { 
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`
        },
        data: qs.stringify({
            search: '',
            take: '50',
            skip: skip,
            page: page,
            pageSize: '50'

        })
    })
}

const parseaVentas = async (ventasYiqi:any []) => {
    // Se agrupan los Tracking Code
    const numerosTracking:string[] = ventasYiqi.reduce((acc:any, unaVenta)=> {
        if(!acc.includes(unaVenta.PEDI_TRACKING_CODE)){
            acc.push(unaVenta.PEDI_TRACKING_CODE)
        }
        return acc
    },[])

    let result = []

    for (const unNumeroTracking of numerosTracking) {
        // Se arma el Objeto de venta
        let venta:any = {}
        venta.trackingCode = unNumeroTracking
        venta.total = 0;
        venta.fecha = '';
        venta.products = [];
        venta.observaciones = ''

        for (const unaVenta of ventasYiqi) {
            // Si encuentran los detalles de la venta y se agregan al objeto
            if(unaVenta.PEDI_TRACKING_CODE === unNumeroTracking){
                let subtotal = (unaVenta.PRECIO_UNIT_FINAL * unaVenta.CANTIDAD).toFixed(2);
                venta.total = parseFloat(venta.total) + parseFloat(subtotal) 
                venta.fecha = unaVenta.PEDI_FECHA
                venta.observaciones = unaVenta.OBSERVACIONES
                venta.products.push({
                    SKU: unaVenta.SKU,
                    producto: unaVenta.PRODUCTO,
                    cantidad: unaVenta.CANTIDAD,
                    precioUnitario: unaVenta.PRECIO_UNIT_FINAL
                })
                venta.shippingAddress = {
                    name: unaVenta.CLIENTE,
                    address: unaVenta.DIRECCION_DE_ENTREGA,
                    zipCode: unaVenta.CODIGO_POSTAL,
                    locality: unaVenta.PROVINCIA_ENTREGA
                }
                venta.customer = {
                    name: unaVenta.CLIENTE
                } 
                
            }
        }

        result.push(venta)
    }

    return result
} 


