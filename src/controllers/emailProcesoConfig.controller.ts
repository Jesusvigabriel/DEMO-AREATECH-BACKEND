import { Request, Response } from "express";
import { handleAuth } from "../helpers/auth";
import {
    emailProcesoConfig_getByEmpresa,
    emailProcesoConfig_upsert,
    emailProcesoConfig_delete,
    emailProcesoConfig_getById
} from "../DALC/emailProcesoConfig.dalc";
import { emailService } from '../services/email.service';

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
        const mensaje = error instanceof Error ? error.message : 'Error al crear la configuración';
        const status = mensaje === 'Proceso de email no permitido' ? 400 : 500;
        return res.status(status).json(require("lsi-util-node/API").getFormatedResponse("", mensaje));
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
        const mensaje = error instanceof Error ? error.message : 'Error al actualizar la configuración';
        const status = mensaje === 'Proceso de email no permitido' ? 400 : 500;
        return res.status(status).json(require("lsi-util-node/API").getFormatedResponse("", mensaje));
    }
};

export const probar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { idEmpresa } = handleAuth(req);
        const id = Number(req.params.id);
        const config = await emailProcesoConfig_getById(id);
        if (!config || config.IdEmpresa !== idEmpresa) {
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Configuración no encontrada"));
        }
        const destinatario = config.Destinatarios && config.Destinatarios.trim().length > 0
            ? config.Destinatarios
            : req.body.destinatarioTest;
        if (!destinatario) {
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Debe indicar destinatario"));
        }
        const resultado = await emailService.sendEmail({
            idEmpresa: config.IdEmpresa,
            destinatarios: destinatario,
            titulo: 'Prueba de envío',
            cuerpo: 'Email de prueba',
            idEmailServer: config.IdEmailServer,
            idEmailTemplate: config.IdEmailTemplate
        });
        return res.json(require("lsi-util-node/API").getFormatedResponse(resultado));
    } catch (error) {
        console.error('Error en probar:', error);
        const mensaje = error instanceof Error ? error.message : 'Error al enviar correo de prueba';
        return res.status(500).json(require("lsi-util-node/API").getFormatedResponse("", mensaje));
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
