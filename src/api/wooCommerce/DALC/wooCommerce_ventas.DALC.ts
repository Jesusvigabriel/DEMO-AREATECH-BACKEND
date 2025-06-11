import axios from "axios";

// DALC Destino
import { busca_agregaDestino_DALC } from "../../../DALC/destinos.dalc";
// DALC Ordenes
import { ordenes_getByIdIntAndEmpresa_DALC, ordenes_addOrden_DALC } from "../../../DALC/ordenes.dalc";
// DALC Ordenes Detalle
import { generaDetalleOrden_DALC } from "../../../DALC/ordenesDetalle.dalc";
// DALC Productos
import {  producto_getByBarcodeAndEmpresa_DALC } from "../../../DALC/productos.dalc";

// Entidades
import { Orden } from "../../../entities/Orden";


import { obtieneProducto_DALC  } from "../DALC/wooCommerce_articulos.DALC";


// Realiza la peticion de productos
export const getVentas_DALC = async (url:string, username:string, password: string, page:number) => {
    return axios ({
        method: 'GET',
        url: `${url}${page}`,
        auth: {
            username: username,
            password: password
        },
    })
}

// Se obtiene las ventas
export const obtieneSincronizaVentas_DALC = async (datosTienda:any, idTiendaArea:number, sincroniza:boolean) => {
    const {urlVentas, username, password} = datosTienda

    const fechaActual = new Date();
    let periodoEnDias = 5
    
    let inicia = true;
    let page = 1

    const ventasParcial = [];

    while(inicia === true){
        let ventasEnWoocommerce =[]
        // Se solicitan las ventas
        const result = await getVentas_DALC(urlVentas, username, password, page);

        for (let index = 0; index < result.data.length; index++) {
            const element = result.data[index];
            const fechaModificada = new Date(element.date_modified)
            const restaFechas = fechaActual.getTime() - fechaModificada.getTime() 
            const dias = Math.round(restaFechas/ (1000*60*60*24))
            if(dias < periodoEnDias){
                ventasEnWoocommerce.push(element)
            } 
        }

        for (let index = 0; index < ventasEnWoocommerce.length; index++) {
            const element = ventasEnWoocommerce[index];
            ventasParcial.push(element)
            
        }

        // Se evalua los datos de la ultima venta del arreglo de result
        const lastVenta = result.data[result.data.length-1]
        const fechaModificadaLastVenta = new Date(lastVenta.date_modified) 
        const restaFechas = fechaActual.getTime() - fechaModificadaLastVenta.getTime();
        const diasLastVenta = Math.round(restaFechas/ (1000*60*60*24));

        if(diasLastVenta < periodoEnDias){
            page += 1;
            ventasEnWoocommerce =[]

        } else {
            inicia = false
        }

        
    }
    // Se parsean las ventas
    const ventas = await parseaVentasWooCommerce(ventasParcial, datosTienda, idTiendaArea)

    if(sincroniza === false){
        return ventas
    }
    // Se sincronizan las ventas
    if(sincroniza === true){
        const resultadoSincroniza = await sincronizaVentas_DALC(ventas, idTiendaArea)
        return resultadoSincroniza
    }

}


export const sincronizaVentas_DALC = async (ventasParcial: any, idTiendaArea:number ) => {
    const result = []
    for (let index = 0; index < ventasParcial.length; index++) {
        const ventaEnWoocommerce = ventasParcial[index];
        const checkOrden = await ordenes_getByIdIntAndEmpresa_DALC(idTiendaArea, ventaEnWoocommerce.id);
        if(!checkOrden){
            const newOrden = new Orden();
            newOrden.IdEmpresa = idTiendaArea;
            newOrden.Tipo = 1;
            newOrden.Numero = ventaEnWoocommerce.id;
            newOrden.IdIntegracion = ventaEnWoocommerce.id;
            newOrden.Eventual = await busca_agregaDestino_DALC( ventaEnWoocommerce, idTiendaArea);
            newOrden.ValorDeclarado = ventaEnWoocommerce.total;
            newOrden.Estado = 1;
            newOrden.Observaciones = `Venta WooCommerce: ${ventaEnWoocommerce.id} a Cliente: ${ventaEnWoocommerce.customer.name}`;
            
            // Se agrega la Orden
            const orden = await ordenes_addOrden_DALC(newOrden);
            const ordenDetalle = []

            if(orden){
                for (let index = 0; index < ventaEnWoocommerce.detalleProductos.length; index++) {
                    const producto = ventaEnWoocommerce.detalleProductos[index];
                    // Se busca el producto dentro de la base de AREA
                    const productoEnArea:any = await producto_getByBarcodeAndEmpresa_DALC(producto.Barcode, idTiendaArea);
                    // Se genera el detalle de la orden 
                    const detalleOrden = await generaDetalleOrden_DALC(productoEnArea, orden.Id, producto.cantidad )
                    ordenDetalle.push(detalleOrden)
                }

            }
            result.push({
                "orden": orden,
                "orden detalle": ordenDetalle
            })

        }
        
    }
    if(result.length === 0){
        return `Todas las ventas de la tienda ${idTiendaArea} en WooCommerce estan sincronizadas`
    } else {
        return result
    }
    

}


// Se parsean las ventas que se obtiene de Woocommerce
export const parseaVentasWooCommerce =  async (ventasParcial: any, datosTienda:any, idTiendaArea:number ) => {
    const ventas = [];

    for (let index = 0; index < ventasParcial.length; index++) {
        const element = ventasParcial[index];
        if(element.status === 'completed'){
            const orden:any = {
                id : element.id,
                estado: element.status,
                total: element.total,
                fechaCreacion: element.date_created,
                fechaModificacion: element.date_modified,
                shippingAddress : {
                    name: `${element.shipping.first_name} ${element.shipping.last_name}`,
                    address: element.shipping.address_1,
                    address_2: element.shipping.address_2,
                    locality: element.shipping.city,
                    zipCode: element.shipping.postcode,
                },
                customer: {
                    name: `${element.billing.first_name} ${element.billing.last_name}`,
                    company: element.billing.company,
                    address: element.billing.address_1,
                    address_2: element.billing.address_2,
                    city: element.billing.city,
                    postcode: element.billing.postcode,
                    email: element.billing.email,
                    phone: element.billing.phone,

                },
                
            }

            orden.detalleProductos = []
            for (let index = 0; index < element.line_items.length; index++) {
                const temp = element.line_items[index];
                const producto = await obtieneProducto_DALC(datosTienda, temp.variation_id, idTiendaArea)
                const detalleProducto = {
                    IdEmpresa: producto.IdEmpresa,
                    Barcode: producto.Barcode,
                    CodeEmpresa: producto.CodeEmpresa,
                    Nombre: producto.Nombre,
                    Alto: producto.Alto,
                    Ancho: producto.Ancho,
                    Largo: producto.Largo,
                    Peso: producto.Peso,
                    cantidad: temp.quantity
                }
                orden.detalleProductos.push(detalleProducto)
            }

            ventas.push(orden)
        }

        
    }

    return ventas
}