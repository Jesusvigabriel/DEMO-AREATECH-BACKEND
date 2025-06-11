import axios from "axios";
import { Request, Response  } from "express";

import { tiendanube_articulo } from "../../../entities/tiendanube/Articulo";

import {get_TiendaByIdTiendaNube_DALC} from "../DALC/tienda.dalc";
import { producto_getByBarcodeAndEmpresa_DALC, producto_editByBarcodeAndEmpresa_DALC, producto_add_DALC } from "../../../DALC/productos.dalc"
import { Producto } from "../../../entities/Producto";

// Controllador para obtener los Productos de la tienda 
export const getProductosTienda = async (req: Request, res: Response): Promise<Response> => {
    const data = await getTienda(parseInt(req.params.idStore))
    if(data){
        const result = await obtieneParseaProductosTN(data.id_tiendaNube, data.accessTienda)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Datos de la Tienda inválidos"));
};

// Sincroniza productos
export const sincronizaProductos = async (req: Request, res: Response): Promise<Response> => {
    const data = await getTienda(parseInt(req.params.idStore))
    if(data){
        if(data.id_tiendaArea === parseInt(req.params.idEmpresaEnArea) ){
            const productosTienda = await obtieneParseaProductosTN(data.id_tiendaNube, data.accessTienda)
            const result = await comparaProductos(productosTienda, data.id_tiendaArea)
            return res.json(require("lsi-util-node/API").getFormatedResponse(result)) 
        }
        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Datos de la Tienda inválidos"));
    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Datos de la Tienda inválidos"));

}

// Devuelve los datos de la tienda
const getTienda = async (idStore: number) => await get_TiendaByIdTiendaNube_DALC(idStore);

// Obtiene los productos de una tienda en Tienda Nube
const getDataProductosTienda = async (idTienda: number , tokenTienda: string) => {
    return await axios({
        method: 'GET',
        url: `https://api.tiendanube.com/v1/${idTienda}/products`,
        headers : {
            authentication: `bearer${tokenTienda}`
        }
    })
}

// Recorre los prodcutos y solo devuelve los datos solicatdos
const filtraDatosProductos = async (list: any) => {
    const result = []
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        const product : tiendanube_articulo = {
            Id: element.id,
            Nombre: element.name.es,
            SKU: element.variants[0].sku,
            Barcode: element.variants[0].barcode,
            Peso: element.variants[0].weight,
            Alto: element.variants[0].height,
            Ancho: element.variants[0].width,
            Profundidad: element.variants[0].depth,
        }
        result.push(product) 
    }

    return result

}

// Obtiene y parsea los Productos de una tienda
const obtieneParseaProductosTN = async (idTiendaNube: number, tokenTiendaNube: string) => {
    const productos = await getDataProductosTienda( idTiendaNube , tokenTiendaNube);
    return await filtraDatosProductos(productos.data)
}

// Compara los Productos que hay en Tienda Nube con los que hay en Area
const comparaProductos = async (productosTienda: any, idTiendaArea:number) => {
  const result = []

  for (let index = 0; index < productosTienda.length; index++) {
    const element = productosTienda[index];
    // Si en tienda Nube existe el Barcode lo tomamos, sino lo ignoramos
    if(element.Barcode){
      const producto:any = await producto_getByBarcodeAndEmpresa_DALC(element.Barcode, idTiendaArea)
      let data
      if(producto){  
        const propiedades = await revisaCambios(element, producto)    
        if(propiedades) {
          data = await producto_editByBarcodeAndEmpresa_DALC( element.Barcode, idTiendaArea, propiedades)
        }else {
          data = {
            SKU: element.SKU,
            Barcode: element.Barcode,
            Nombre: element.Nombre,
            Status: 'Sin actualizaciones'
          }
        }
        result.push(data)
      } else {
          // const newProducto = {
          //   IdEmpresa: idTiendaArea,
          //   Barcode: element.Barcode,
          //   CodeEmpresa: element.SKU,
          //   Nombre: element.Nombre,
          //   Alto: element.Alto,
          //   Ancho: element.Ancho,
          //   Largo: element.Largo,
          //   Peso: element.Peso
          // }
          const newProducto = new Producto()
          newProducto.IdEmpresa=idTiendaArea,
          newProducto.Barcode= element.Barcode
          newProducto.CodeEmpresa= element.SKU
          newProducto.Nombre= element.Nombre
          newProducto.Alto= element.Alto
          newProducto.Ancho= element.Ancho
          newProducto.Largo= element.Largo
          newProducto.Peso= element.Peso
          const data = await producto_add_DALC(newProducto)
          result.push(data)
      }
    }
  }

    return result
}

// Funcion que revisa el detalle de los Productos Cargados en Tienda Nube con el detalle de Area
const revisaCambios = async (productoEnTiendaNube:any, productoEnArea:any) => {
    let cambios = false
    const propiedades:any = {}
    // Valida el SKU -- CodeEmpresa
    if(productoEnTiendaNube.SKU != productoEnArea.CodeEmpresa){
        propiedades.CodeEmpresa = productoEnTiendaNube.SKU;
        cambios = true;
    }
    // Valida el Nombre
    if(productoEnTiendaNube.Nombre != productoEnArea.Nombre){
        propiedades.Nombre = productoEnTiendaNube.Nombre;
        cambios = true;
    }
    // Valida el Alto
    if(productoEnTiendaNube.Alto != productoEnArea.Alto){
        propiedades.Alto = productoEnTiendaNube.Alto;
        cambios = true
    }
    // Valida el Ancho
    if(productoEnTiendaNube.Ancho != productoEnArea.Ancho){
        propiedades.Ancho = productoEnTiendaNube.Ancho;
        cambios = true
    }
    // Valida la Profundidad -- Largo 
    if(productoEnTiendaNube.Profundidad != productoEnArea.Largo){
        propiedades.Largo = productoEnTiendaNube.Profundidad ;
        cambios = true
    }
    // Valida el Peso
    if(productoEnTiendaNube.Peso != productoEnArea.Peso){
        propiedades.Peso = productoEnTiendaNube.Peso;
        cambios = true
    }

    if(cambios === false) {
        return
    } else {
        return propiedades
    }
   

}


