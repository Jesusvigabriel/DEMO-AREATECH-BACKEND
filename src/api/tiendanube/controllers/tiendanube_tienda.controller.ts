import axios from "axios";
import { Request, Response  } from "express";

import {get_TiendaByIdTiendaNube_DALC} from "../DALC/tienda.dalc";

const apiId: number = 3110;
const secretId: string = 'DYJSvAdtVqz0Ty7DqisUsvzBQ2QnhRz3MZSfqbz1HJT5kyZN'

export const installApp = async (req: Request, res: Response): Promise<Response> => {
    const data = await getUserTiendaNube(apiId, secretId, req.query.code)
    if(data.data.error){
        return res.send(data.data.error_description)
    }
    return res.send('Datos Recibidos')
};

// Funcion que obtiene los datos los datos del Usuario en Tienda Nube
const getUserTiendaNube = async (apiId : number, secretId: string, code: any)  => {
    return await axios({
        method: 'POST',
        url: 'https://www.tiendanube.com/apps/authorize/token',
        data: {
            "client_id": apiId,
            "client_secret": secretId,
            "grant_type": "authorization_code",
            "code": `${code}`
        }
    })
}


// Funcion para obtener los datos de la tienda 
export const getDataTienda = async (req: Request, res: Response): Promise<Response> => {
    const data = await get_TiendaByIdTiendaNube_DALC(req.params.idStore)
    if(data){
        const tienda = await getDatosTienda(data.id_tiendaNube, data.accessTienda)
        const datosTienda = {
            name: tienda.data.name.es,
            email: tienda.data.mail,
            contact_email: tienda.data.contact_email,
            telefono: tienda.data.phone,
            business_name: tienda.data.business_name,
            direccion: tienda.data.business_address,

        }
        return res.json(require("lsi-util-node/API").getFormatedResponse(datosTienda))

    }
    return res.status(401).json(require("lsi-util-node/API").getFormatedResponse("","Datos de la Tienda inválidos"));
};

// Obtiene los datos de la tienda en Tienda Nube
const getDatosTienda = async (idTienda: number, tokenTienda: string) => {
    return await axios({
        method: 'GET',
        url: `https://api.tiendanube.com/v1/${idTienda}/store`,
        headers : {
            authentication: `bearer${tokenTienda}`
        }
    })
}