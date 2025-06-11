import { Request, Response  } from "express";

import { datosTienda } from "../helpers/tiendas.helpers";

import { obtieneSincronizaProductos_DALC, obtieneSincronizaProductosWoo_DALC } from "../DALC/wooCommerce_articulos.DALC";


// Controlador para obtener los productos que fueron modificados en los ultimos 3 dias
export const getProductos = async (req: Request, res: Response): Promise<Response> => {
    const tienda = await datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const productosEnWoocommerce = await obtieneSincronizaProductosWoo_DALC(tienda, false)
        return res.json(require("lsi-util-node/API").getFormatedResponse(productosEnWoocommerce)) 

    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con WooCommerce"));
}

// Controlador para sincronizzr los productos que fueron modificadors en el ultimo dia
export const sincronizaProductos = async (req: Request, res: Response): Promise<Response> => {
    const tienda = await datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const productosEnWoocommerce = await obtieneSincronizaProductosWoo_DALC(tienda, true)
        return res.json(require("lsi-util-node/API").getFormatedResponse(productosEnWoocommerce)) 

    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con WooCommerce"));
}



// Controllador para obtener TODOS los Productos de la tienda en WOOCOMMERCE
export const getAllProductosTienda = async (req: Request, res: Response): Promise<Response> => {
    const tienda = await datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const productosEnWoocommerce = await obtieneSincronizaProductos_DALC(tienda, false)
        return res.json(require("lsi-util-node/API").getFormatedResponse(productosEnWoocommerce)) 
    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con WooCommerce"));
};

// Controlador para Sincronizar TODOS los Productos de la tienda en WOOCOMMERCE
export const sincronizaAllProductosTienda = async (req: Request, res:Response): Promise<Response> => {
    const tienda = await datosTienda(parseInt(req.params.idStore))
    if(tienda){
        obtieneSincronizaProductos_DALC(tienda, true)
        return res.json(require("lsi-util-node/API").getFormatedResponse('Se ha iniciado con la sincronización de todos los productos')) 
    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con WooCommerce"));
   
}


// export const deleteProductos = async (req: Request, res: Response): Promise<Response> => {
//     const result = await productos_delete_DALC(parseInt(req.params.idStore))
//     return res.json(require("lsi-util-node/API").getFormatedResponse(result)) 
// }