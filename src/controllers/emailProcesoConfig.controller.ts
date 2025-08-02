import { Request, Response } from "express";
import { handleAuth } from "../helpers/auth";
import {
    emailProcesoConfig_getByEmpresa,
    emailProcesoConfig_upsert,
    emailProcesoConfig_delete
} from "../DALC/emailProcesoConfig.dalc";

export const getByEmpresa = async (req: Request, res: Response): Promise<Response> => {
    try {
        const auth = handleAuth(req);
        const idEmpresa = Number(req.params.idEmpresa);
        if (auth.idEmpresa !== idEmpresa) {
            return res.status(403).json(require("lsi-util-node/API").getFormatedResponse("", "No autorizado"));
        }
        const configs = await emailProcesoConfig_getByEmpresa(idEmpresa);
        return res.json(require("lsi-util-node/API").getFormatedResponse(configs));
    } catch (error) {
        console.error('Error en getByEmpresa:', error);
        return res.status(500).json(require("lsi-util-node/API").getFormatedResponse("", "Error al obtener configuraciones"));
    }
};

export const crear = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { idEmpresa, username } = handleAuth(req);
        const data = {
            ...req.body,
            IdEmpresa: idEmpresa,
            UsuarioCreacion: username
        };
        const result = await emailProcesoConfig_upsert(data);
        return res.status(201).json(require("lsi-util-node/API").getFormatedResponse(result));
    } catch (error) {
        console.error('Error en crear:', error);
        return res.status(500).json(require("lsi-util-node/API").getFormatedResponse("", "Error al crear la configuración"));
    }
};

export const editar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, idEmpresa } = handleAuth(req);
        const id = Number(req.params.id);
        const data = {
            ...req.body,
            Id: id,
            IdEmpresa: idEmpresa,
            UsuarioModificacion: username
        };
        const result = await emailProcesoConfig_upsert(data);
        return res.json(require("lsi-util-node/API").getFormatedResponse(result));
    } catch (error) {
        console.error('Error en editar:', error);
        return res.status(500).json(require("lsi-util-node/API").getFormatedResponse("", "Error al actualizar la configuración"));
    }
};

export const eliminar = async (req: Request, res: Response): Promise<Response> => {
    try {
        handleAuth(req);
        const id = Number(req.params.id);
        await emailProcesoConfig_delete(id);
        return res.json(require("lsi-util-node/API").getFormatedResponse("Configuración eliminada"));
    } catch (error) {
        console.error('Error en eliminar:', error);
        return res.status(500).json(require("lsi-util-node/API").getFormatedResponse("", "Error al eliminar la configuración"));
    }
};
