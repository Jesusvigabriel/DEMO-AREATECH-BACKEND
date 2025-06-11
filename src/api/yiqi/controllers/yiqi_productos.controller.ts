import { Request, Response  } from "express";

import { datosTienda } from "../helpers/tiendas.helpers";

import { getTokenYiqi_DALC } from "../DALC/yiqi.DALC";
import {obtieneProductos_DALC, addProductos_DALC } from "../DALC/yiqi.productos.DALC";

/**
 * Obtiene los Productos de una Tienda en YIQI
 * @param req 
 * @param res 
 * @returns 
 */
export const getProductosYiqi = async (req: Request, res: Response): Promise<Response> => {
    // Se obtiene los datos de la tienda en Yiqi.
    const tienda = datosTienda(parseInt(req.params.idStore))
    if(tienda){
        // Se solicita el Token de la tienda.
        const token = await getTokenYiqi_DALC(tienda.userYiqi, tienda.pass)
        if(token){
            const productosEnYiqi = await obtieneProductos_DALC(tienda.urlProductos,token.data.access_token )
            return res.json(require("lsi-util-node/API").getFormatedResponse(productosEnYiqi)) 
        }
        // Respuesta por falta de respuesta de Yiqi.
        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Error de conexión a Yiqi"));
    }
    // Respuesta de datos de tienda no encontrados.
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con Yiqi"));
};


export const sincronizaProductos = async (req: Request, res: Response):Promise<Response> =>{
    // Se obtiene los datos de la tienda en Yiqi.
    const tienda = datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const token = await getTokenYiqi_DALC(tienda.userYiqi, tienda.pass)
        if(token){
            // const productosEnYiqi = await obtieneProductos_DALC( )
            addProductos_DALC(tienda.urlProductos,token.data.access_token, parseInt(req.params.idStore))
            return res.json(require("lsi-util-node/API").getFormatedResponse('Proceso sincronización de productos iniciado')) 
        }
        // Respuesta por falta de respuesta de Yiqi.
        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Error de conexión a Yiqi"));
    }
    // Respuesta de datos de tienda no encontrados.
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con Yiqi"));

}















