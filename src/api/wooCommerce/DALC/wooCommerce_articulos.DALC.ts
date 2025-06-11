import axios from "axios";

import { Producto } from "../../../entities/Producto";

import { producto_getByBarcodeAndEmpresa_DALC, producto_editByBarcodeAndEmpresa_DALC, producto_add_DALC } from "../../../DALC/productos.dalc";

// Realiza la peticion de productos
export const getProductos_DALC = async (url:string, username:string, password: string, page:number) => {
    return axios ({
        method: 'GET',
        url: `${url}${page}`,
        auth: {
            username: username,
            password: password
        },
    })
}

// Realiza la petición de los datos de un Producto
export const getProducto_DALC = async (url:string, idProducto:number, username: string, password: string) => {
    return axios ({
        method: 'GET',
        url: `${url}${idProducto}`,
        auth: {
            username: username,
            password: password
        },
    })

}

// Realiza la petición de los datos de 100 Producto productos
export const obtieneSincronizaProductosWoo_DALC = async (datosTienda:any, sincroniza: boolean) => {
    const {urlProductosCien, username, password, idTiendaArea} = datosTienda;
    const fechaActual = new Date();

    const aux = 100
    let page = 1
    let inicia = true;
    let periodoEnDias = 1

    const resultado = [];

    while(inicia == true){
        let productosPadres = []
        const result = await getProductos_DALC(urlProductosCien, username, password, page)
        console.log(`Se inicia consulta ${page}`)
        for (let index = 0; index < result.data.length; index++) {
            const element = result.data[index];
            const fechaModificada = new Date(element.date_modified)
            const restaFechas = fechaActual.getTime() - fechaModificada.getTime() 
            const dias = Math.round(restaFechas/ (1000*60*60*24))
            if(dias < periodoEnDias){
                productosPadres.push(element)
            } 
        }
        console.log(`Obteniendo variaciones de Productos de la consulta ${page}`)
        const productosHijos = await obtieneVariacion_DALC(productosPadres, datosTienda);
        if(sincroniza === false){
            for (let jota = 0; jota < productosHijos.length; jota++) {
                resultado.push(productosHijos[jota])
            }
        }

        if(sincroniza === true){
            console.log(`Inicia Sincronización de Productos del Grupo: ${page}`)
            const sincroniza = await sincronizaProductos_DALC(productosHijos, idTiendaArea)
            for (let i = 0; i < sincroniza.length; i++) {
               resultado.push(sincroniza[i])  
            }
            for (let jota = 0; jota < productosHijos.length; jota++) {
                resultado.push(productosHijos[jota])
            }
            console.log(`Proceso de Sincronización de Productos del grupo ${page} finalizado`)
        }

        if(result.data.length == aux) {
            productosPadres = []
            page += 1
        }else {
            inicia = false
        }
    }

    return resultado
    





    


}

// Obtiene / Sincroniza Todos los Productos
export const obtieneSincronizaProductos_DALC = async (datosTienda: any, sincroniza:boolean) => {
    const {urlProductos, username, password, idTiendaArea} = datosTienda
    // Constante Auxiliar para evaluar condición para frenar el While
    const aux = 1
    // const aux = 0

    let page = 1
    let inicia = true;
    const resultado = []
    while (inicia === true){
        let productosPadres = [];
        
        const result = await getProductos_DALC(urlProductos, username, password, page)
        for (let index = 0; index < result.data.length; index++) {
            const element = result.data[index];
            productosPadres.push(element)
    
        };
        
        const productosHijos = await obtieneVariacion_DALC(productosPadres, datosTienda)
        if(sincroniza === false){
            for (let jota = 0; jota < productosHijos.length; jota++) {
                resultado.push(productosHijos[jota])
            }
        } else {
            console.log(`Inicia Sincronización de Productos del Grupo: ${page}`)
            const sincroniza = await sincronizaProductos_DALC(productosHijos, idTiendaArea)
            for (let i = 0; i < sincroniza.length; i++) {
               resultado.push(sincroniza[i])  
            }
            for (let jota = 0; jota < productosHijos.length; jota++) {
                resultado.push(productosHijos[jota])
            }
            console.log(`Proceso de Sincronización de Productos del grupo ${page} finalizado`)
        }

        if(result.data.length == aux) {
            inicia = true
            productosPadres = []
            page += 1
        }else {
            inicia = false
        }
    }

    console.log(`----- Proceso Terminado ----`)

    return resultado


}

// Obtiene las variaciones de un producto
export const obtieneVariacion_DALC = async (productosPadres: any, datosTienda: any) => {
    const productosHijos = []
    const {urlProducto, username, password, idTiendaArea} = datosTienda
    console.log(productosPadres.length)
    for (let jota = 0; jota < productosPadres.length; jota++) {
        const padre = productosPadres[jota];
        console.log(jota)
        for (let index = 0; index < padre.variations.length; index++) {
            const element = padre.variations[index];
            const producto = await getProducto_DALC(urlProducto, element, username, password)
            if(producto.data.sku != undefined || producto.data.sku != ''){
                const productoParseado = await parseaProducto(producto.data, idTiendaArea)
                productosHijos.push(productoParseado)
            }
        }
    }

    return productosHijos
}

// Funcion que sincroniza los Productos
export const sincronizaProductos_DALC = async (productosEnWoocommerce:any, idTienda:number ) => {

    const result = []
    let totalDeProductos = productosEnWoocommerce.length

    for (let index = 0; index < productosEnWoocommerce.length; index++) {
        const element = productosEnWoocommerce[index];
        const producto = await producto_getByBarcodeAndEmpresa_DALC(element.Barcode, idTienda);
        console.log(`Total de Productos: ${totalDeProductos} - Recorriendo el Producto: ${index+1}`)
        if(producto){
            const propiedades = revisaCambios(element, producto)
            let data
            console.log(`El producto existe`)
            if(propiedades){
                data = await producto_editByBarcodeAndEmpresa_DALC(element.Barcode, idTienda, propiedades)
                console.log(`Se ha editado el producto`)
            } else {
                data = {
                    SKU: element.CodeEmpresa,
                    Barcode: element.Barcode,
                    Nombre: element.Nombre,
                    Status: 'Sin actualizaciones'
                }
            }

            result.push(data)

        } else {
            console.log(`El producto No existe`)
            const newProducto = new Producto()
            newProducto.CodeEmpresa = element.Barcode;
            newProducto.IdEmpresa = idTienda;
            newProducto.Barcode =  element.Barcode;
            newProducto.Nombre = element.Nombre;
            newProducto.Largo = element.Largo;
            newProducto.Peso = element.Peso;
            newProducto.Ancho =  element.Ancho;
            newProducto.Alto = element.Alto ;

            const data = await producto_add_DALC(newProducto)
            console.log(`Se a agregado el producto`)
            result.push(data)
        }
    }
    
    return result
}

const parseaProducto = async (productoEnWoocommerce:any, idTienda: number) => {
    const producto = new Producto()

    producto.IdEmpresa = idTienda
    producto.Barcode = productoEnWoocommerce.sku;
    producto.CodeEmpresa = productoEnWoocommerce.sku;
    producto.Nombre = productoEnWoocommerce.name,
    producto.Alto = productoEnWoocommerce.dimensions.height;
    producto.Ancho = productoEnWoocommerce.dimensions.width;
    producto.Largo = productoEnWoocommerce.dimensions.length;
    producto.Peso = productoEnWoocommerce.weight;

    return producto

}

// Funcion que revisa el detalle de los Productos Cargados en Tienda Nube con el detalle de Area
const revisaCambios =  (productosEnWoocommerce:any, productoEnArea:any) => {
    let cambios = false
    const propiedades:any = {}
    // Valida el SKU -- CodeEmpresa
    if(productosEnWoocommerce.CodeEmpresa != productoEnArea.CodeEmpresa){
        propiedades.CodeEmpresa = productosEnWoocommerce.CodeEmpresa;
        cambios = true;
    }

    // Valida el Nombre
    if(productosEnWoocommerce.Nombre != productoEnArea.Nombre){
        propiedades.Nombre = productosEnWoocommerce.Nombre;
        cambios = true;
    }

    if(cambios === false) {
        return
    } else {
        return propiedades
    }

}


// Obtiene el detalle de un Producto
export const obtieneProducto_DALC = async (datosTienda:any, idProducto:number, idTiendaArea:number) => {
    const {urlProducto, username, password} = datosTienda;
    const result = await getProducto_DALC(urlProducto, idProducto, username, password)
    const producto = await parseaProducto(result.data, idTiendaArea )
    return producto
}

