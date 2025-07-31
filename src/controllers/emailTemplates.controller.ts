import { Request, Response } from "express";
import {
    template_getByTipo,
    template_upsert,
    template_activate
} from "../DALC/emailTemplates.dalc";

export const getByTipo = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { tipo } = req.params;
        const template = await template_getByTipo(tipo);
        
        if (!template) {
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Plantilla no encontrada")
            );
        }
        
        return res.json(require("lsi-util-node/API").getFormatedResponse(template));
    } catch (error) {
        console.error('Error al obtener plantilla por tipo:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", "Error al obtener la plantilla")
        );
    }
};

export const alta = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Verificar autenticación
        if (!req.user) {
            return res.status(401).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    "No autorizado"
                )
            );
        }

        // Validar datos requeridos
        const { Tipo, Titulo, Cuerpo } = req.body;
        if (!Tipo || !Titulo || !Cuerpo) {
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    "Faltan campos requeridos: Tipo, Titulo o Cuerpo"
                )
            );
        }

        // Verificar si ya existe una plantilla con el mismo tipo para esta empresa
        const existingTemplate = await template_getByTipo(Tipo);
        if (existingTemplate && existingTemplate.IdEmpresa === req.user.idEmpresa) {
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    `Ya existe una plantilla con el tipo '${Tipo}' para esta empresa`
                )
            );
        }

        const templateData = {
            ...req.body,
            IdEmpresa: req.user.idEmpresa,
            UsuarioCreacion: req.user.username,
            Activo: req.body.Activo !== undefined ? req.body.Activo : true
        };

        const result = await template_upsert(templateData);
        return res.status(201).json(
            require("lsi-util-node/API").getFormatedResponse(
                result,
                "Plantilla creada correctamente"
            )
        );
    } catch (error) {
        console.error('Error al crear plantilla:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse(
                "",
                "Error al crear la plantilla: " + (error instanceof Error ? error.message : 'Error desconocido')
            )
        );
    }
};

export const editar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse("", "ID de plantilla inválido")
            );
        }

        const templateData = {
            ...req.body,
            Id: id,
            UsuarioModificacion: req.user?.username || 'sistema'
        };

        // No permitir cambiar el IdEmpresa al editar
        if ('IdEmpresa' in templateData) {
            delete templateData.IdEmpresa;
        }

        const result = await template_upsert(templateData);
        return res.json(require("lsi-util-node/API").getFormatedResponse(result));
    } catch (error) {
        console.error('Error al actualizar plantilla:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", "Error al actualizar la plantilla")
        );
    }
};

export const activar = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Verificar autenticación
        if (!req.user) {
            return res.status(401).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    "No autorizado"
                )
            );
        }

        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    "ID de plantilla inválido"
                )
            );
        }

        const activo = req.params.activo === "true";
        const result = await template_activate(id, activo);
        
        if (!result) {
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    "Plantilla no encontrada"
                )
            );
        }

        // Verificar que la plantilla pertenezca a la empresa del usuario
        if (result.IdEmpresa !== req.user.idEmpresa) {
            return res.status(403).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    "No tienes permiso para modificar esta plantilla"
                )
            );
        }

        return res.json(
            require("lsi-util-node/API").getFormatedResponse(
                result,
                `Plantilla ${activo ? 'activada' : 'desactivada'} correctamente`
            )
        );
    } catch (error) {
        console.error('Error al cambiar el estado de la plantilla:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse(
                "",
                `Error al ${req.params.activo === 'true' ? 'activar' : 'desactivar'} la plantilla`
            )
        );
    }
};
