import { Request, Response  } from "express";

import { 
    get_VentasFromTN_DALC,
    parseaVentas_DALC,
    sync_VentasFromTN_DALC
} from "../DALC/ventas.DALC"

import { ordenes_getByEmpresa_DALC, ordenes_addOrden_DALC, ordenes_getByIdIntAndEmpresa_DALC, ordenes_delete_DALC } from "../../../DALC/ordenes.dalc";

import {get_TiendaByIdTiendaNube_DALC} from "../DALC/tienda.dalc";


// Controller: para obtener los ventas de una tienda
export const getVentasTienda = async (req: Request, res: Response): Promise<Response> => {
    const data = await get_TiendaByIdTiendaNube_DALC(req.params.idStore)
    if(data){
        const ventas = await get_VentasFromTN_DALC(data.id_tiendaNube, data.accessTienda)
        const result = await parseaVentas_DALC(ventas.data, "-1")
        result.sort((a,b) => (a.completedAt > b.completedAt) ? -1 : 1)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Datos de la Tienda inválidos"));
};

// Controller: que obtiene las ventas mayores a un numero de Id pasado por Parametro
export const getLastVentasTienda = async (req: Request, res: Response): Promise<Response> => {
    const data = await get_TiendaByIdTiendaNube_DALC(req.params.idStore)
    if(data){
        const ventas = await get_VentasFromTN_DALC(data.id_tiendaNube, data.accessTienda)
        const result = await parseaVentas_DALC(ventas.data, req.params.fecha)
        result.sort((a,b) => (a.completedAt > b.completedAt) ? -1 : 1)
        return res.send(result)
    }
    return res.send('No hay tienda')
};

// Controller: Sincroniza Ventas
export const sincronizaVentas = async (req: Request, res: Response): Promise <Response> => {
    const data = await get_TiendaByIdTiendaNube_DALC(req.params.idStore)
    if(data?.id_tiendaArea === parseInt(req.params.idEmpresaEnArea) ){
        const ventasTN = await get_VentasFromTN_DALC(data.id_tiendaNube, data.accessTienda);

        if(ventasTN.data){
            const result = await sync_VentasFromTN_DALC(ventasTN.data, data.id_tiendaArea)
            return res.json(require("lsi-util-node/API").getFormatedResponse(result))
        }

        return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Error en la conexión con Tienda Nube."));

    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Datos de la Tienda inválidos"));

}


export const deleteOrdenes = async(req: Request, res: Response) => {
    ordenes_delete_DALC(parseInt(req.params.idStore))
    return res.send('Borrado')
}
