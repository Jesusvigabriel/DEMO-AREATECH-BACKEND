import axios from "axios";
import qs from 'qs';

import { producto_getByBarcodeAndEmpresa_DALC, producto_editByBarcodeAndEmpresa_DALC, producto_add_DALC } from "../../../DALC/productos.dalc";

import { yiqi_articulo } from "../../../entities/yiqi/Articulo";
import { Producto } from "../../../entities/Producto";

export const getProductos_DALC = async (url:string, token:string, skip:string, page:string) => {
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

/**
 * Funcion que Obtiene los Productos desde Yiqi
 * @param {string} tiendaUrl
 * @param {string} tokenTienda
 * @returns
 */
export const obtieneProductos_DALC = async (tiendaUrl:string, tokenTienda:string) => {
    const productosParcial = [];

    let skip = 0;
    let page = 1;

    // Se solicitan los productos a Yiqi.
    const result = await getProductos_DALC( tiendaUrl , tokenTienda, skip.toString(), page.toString());

    // console.log(result)
    // console.log(result.data)
    const cantidadTotalArticulos=result.data.total
    console.log("Cantidad total de productos a leer de Yiqi", cantidadTotalArticulos)

    // Se recorre la respuesta y se agregan los resultados al array de Productos.
    for (let index = 0; index < result.data.data.length; index++) {
        const element = result.data.data[index];
        // console.log("Un articulo obtenido", element);        
        productosParcial.push(element)
        
    };
    
    let datos = result.data.data.length;
    
    // while (datos === 50) {
    while (productosParcial.length<cantidadTotalArticulos) {
        skip += 1
        page += 1
        console.log("Vamos a leer la página ", page);
        
        // Se realizan la peticiones de productos.
        const result = await getProductos_DALC(tiendaUrl, tokenTienda, skip.toString(), page.toString())
        // Se agregan los resultados al Array de productos.
        for (let index = 0; index < result.data.data.length; index++) {
            const element = result.data.data[index];
            // console.log("Un articulo obtenido", element);        
            productosParcial.push(element)

        }
        // Se asigna el nuevo valor de la variable datos.
        datos = result.data.data.length
        console.log("___Llevamos leidos", productosParcial.length, "artículos");
    };

    console.log("Leidos todos los productos de Yiqi")

    // Se ajustan los resultados para enviar la respuesta.
    return filtraDatosProductos(productosParcial)

}

/**
 * Función para Agregar Productos desde Yiqi
 * @param {Array} productos
 * @param {number} idTienda
 * @returns {Array}
 */
export const addProductos_DALC = async ( tiendaUrlProductos: string, token:string ,idTienda:number) => {
    // tienda.urlProductos,token.data.access_token
    console.log('Empiezo a obtener productos de Yiqi ....')
    const productos = await obtieneProductos_DALC(tiendaUrlProductos, token)
    console.log('Terminé de obtener productos de Yiqi ....')

    const result = []
    // Se recorre el arreglo de productos pasado por parametro,
    for (let index = 0; index < productos.length; index++) {
        const element = productos[index];
        const producto = await producto_getByBarcodeAndEmpresa_DALC(element.Barcode, idTienda);
        console.log(`Recorriendo producto ${index +1} de ${productos.length} - ${element.Barcode} - ${element.Nombre} - ${element.SKU}`)

        if(producto){
            // Se revisan que las propiedades del producto sean iguales tanto en Yiqi como en Area
            const propiedades = revisaCambios(element, producto)
            let data
            if(propiedades){
                console.log("___Requiere actualización");                
                data = await producto_editByBarcodeAndEmpresa_DALC(element.Barcode, idTienda, propiedades)
            } else {
                console.log("__NO requiere actualización");                
                data = {
                    SKU: element.SKU,
                    Barcode: element.Barcode,
                    Nombre: element.Nombre,
                    Status: 'Sin actualizaciones'
                }
                
            }
            result.push(data)
            
        } else {
            console.log("__NO existía, requiere creado");                
            // Si el producto no existe en la base de Area se instancia el producto a Agregar
            const newProducto = new Producto()
            newProducto.CodeEmpresa = idTienda.toString();
            newProducto.IdEmpresa = idTienda;
            newProducto.Barcode = element.Barcode;
            newProducto.Nombre = element.Nombre;
            const data = await producto_add_DALC(newProducto)
            result.push(data)

        }
    }
    // Se retorna el arreglo result
    return result


}


/**
 * Funcion para ajustar datos para respuesta
 * @param productos
 * @returns
 */
 const filtraDatosProductos = (productos:any) => {
    const result =[]
    for (let index = 0; index < productos.length; index++) {
        const element:any = productos[index];
        if(element.MATE_ID_UNIVERSAL != undefined){
            const producto = new yiqi_articulo()
            producto.SKU = element.MATE_CODIGO;
            producto.Nombre = element.MATE_NOMBRE;
            producto.Barcode = element.MATE_ID_UNIVERSAL
            result.push(producto)
        }
    }
    return result
}


// Funcion que revisa el detalle de los Productos Cargados en Tienda Nube con el detalle de Area
const revisaCambios =  (productoEnYiqi:any, productoEnArea:any) => {
    let cambios = false
    const propiedades:any = {}
    // Valida el SKU -- CodeEmpresa
    if(productoEnYiqi.SKU != productoEnArea.CodeEmpresa){
        propiedades.CodeEmpresa = productoEnYiqi.SKU;
        cambios = true;
    }

    // Valida el Nombre
    if(productoEnYiqi.Nombre != productoEnArea.Nombre){
        propiedades.Nombre = productoEnYiqi.Nombre;
        cambios = true;
    }

    if(cambios === false) {
        return
    } else {
        return propiedades
    }

}