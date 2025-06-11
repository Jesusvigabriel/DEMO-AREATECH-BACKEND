import { Request, Response  } from "express";

import { datosTienda } from "../helpers/tiendas.helpers";

import { obtieneSincronizaVentas_DALC } from "../DALC/wooCommerce_ventas.DALC";

// Obtiene las Ventas
export const getVentas = async (req: Request, res: Response): Promise<Response> => {
    const tienda = await datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const ventasEnWoocommerce = await obtieneSincronizaVentas_DALC(tienda, parseInt(req.params.idStore), false )
        return res.json(require("lsi-util-node/API").getFormatedResponse(ventasEnWoocommerce)) 
       
    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con WooCommerce"));
};

// Obtiene y Sincroniza Ventas
export const sincronizaVentas = async (req: Request, res: Response): Promise<Response> => {
    const tienda = await datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const ventasEnWoocommerce = await obtieneSincronizaVentas_DALC(tienda, parseInt(req.params.idStore), true )
        return res.json(require("lsi-util-node/API").getFormatedResponse(ventasEnWoocommerce)) 
       
    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con WooCommerce"));
}