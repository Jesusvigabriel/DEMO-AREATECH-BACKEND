import { Request, Response  } from "express";

import { datosTienda } from "../helpers/tiendas.helpers";

import { getTokenYiqi_DALC } from "../DALC/yiqi.DALC";
import { obtieneVentas_DALC, sincronizaVentas_DALC } from "../DALC/yiqi.ventas.DALC";



export const getVentasYiqi = async (req: Request, res: Response): Promise<Response> => {
    // Se obtiene los datos de la tienda en Yiqi.

    const {logger}=require("../../../helpers/logger")

    logger.info("Log de info")



    const tienda = datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const token = await getTokenYiqi_DALC(tienda.userYiqi, tienda.pass)
        if(token){
            const ventasYiqi = await obtieneVentas_DALC(tienda.urlVentas, token.data.access_token)
            return res.json(require("lsi-util-node/API").getFormatedResponse(ventasYiqi)) 
        }
        // Respuesta por falta de respuesta de Yiqi.
        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Error de conexión a Yiqi"));
    }
    // Respuesta de datos de tienda no encontrados.
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con Yiqi"));
}

export const sincronizaVentas = async (req: Request, res: Response): Promise<Response> =>{
    // Se obtiene los datos de la tienda en Yiqi.

    const {logger}=require("../../../helpers/logger")

    logger.info("---")
    logger.info("---")
    logger.info("---")
    logger.info("*** Inicio proceso de sincronización de ventas de Yiqi ***")

    const tienda = datosTienda(parseInt(req.params.idStore))
    if(tienda){
        const token = await getTokenYiqi_DALC(tienda.userYiqi, tienda.pass)
        if(token){
            const ventas = await sincronizaVentas_DALC(tienda.urlVentas, token.data.access_token, parseInt(req.params.idStore))

            logger.info("*** Termine proceso de sincronización de ventas de Yiqi ***")
            logger.info("---")
            logger.info("---")
            logger.info("---")
        

            return res.json(require("lsi-util-node/API").getFormatedResponse(ventas)) 
        }
        // Respuesta por falta de respuesta de Yiqi.
        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Error de conexión a Yiqi"));

    }
    // Respuesta de datos de tienda no encontrados.
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","La tienda no esta registrada con Yiqi"));
    
}




