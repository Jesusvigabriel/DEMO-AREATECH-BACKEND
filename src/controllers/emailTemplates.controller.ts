import { Request, Response } from "express";
import { handleAuth } from "../helpers/auth";
import {
    template_getByTipo,
    template_upsert,
    template_activate,
    template_getAll,
    template_getByEmpresa,
    template_getById,
    template_delete
} from "../DALC/emailTemplates.dalc";
import { empresa_getById_DALC } from "../DALC/empresas.dalc";

export const getByTipo = async (req: Request, res: Response): Promise<Response> => {
    console.log('=== INICIO getByTipo ===');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Parámetros:', req.params);
    
    try {
        const { tipo } = req.params;
        console.log(`Buscando plantilla de tipo: ${tipo}`);
        
        const template = await template_getByTipo(tipo);
        
        if (!template) {
            console.log(`No se encontró plantilla para el tipo: ${tipo}`);
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Plantilla no encontrada")
            );
        }
        
        console.log('Plantilla encontrada:', {
            id: template.Id,
            tipo: template.Tipo,
            titulo: template.Titulo,
            activa: template.Activo
        });
        
        return res.json(require("lsi-util-node/API").getFormatedResponse(template));
    } catch (error) {
        console.error('Error al obtener plantilla por tipo:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", "Error al obtener la plantilla")
        );
    }
};

export const alta = async (req: Request, res: Response): Promise<Response> => {
    const transactionId = Date.now();
    console.log(`[${transactionId}] === INICIO alta plantilla ===`);
    console.log(`[${transactionId}] Headers:`, JSON.stringify(req.headers));
    console.log(`[${transactionId}] Body recibido:`, {
        ...req.body,
        Cuerpo: req.body.Cuerpo ? '[CONTENIDO HTML]' : 'VACÍO'
    });
    
    try {
        const { idEmpresa, username } = handleAuth(req);
        const { Tipo, Titulo, Cuerpo } = req.body;
        
        console.log(`[${transactionId}] Usuario autenticado:`, { 
            empresaId: idEmpresa, 
            username 
        });

        // Validar datos requeridos
        if (!Tipo || !Titulo || !Cuerpo) {
            const errorMsg = "Faltan campos requeridos: Tipo, Titulo o Cuerpo";
            console.error(`[${transactionId}] ${errorMsg}`);
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    errorMsg
                )
            );
        }

        // Verificar si ya existe una plantilla con el mismo tipo para esta empresa
        console.log(`[${transactionId}] Verificando plantilla existente con tipo: ${Tipo}`);
        const existingTemplate = await template_getByTipo(Tipo);
        
        if (existingTemplate) {
            console.log(`[${transactionId}] Plantilla existente encontrada:`, {
                id: existingTemplate.Id,
                empresaId: existingTemplate.IdEmpresa,
                tipo: existingTemplate.Tipo
            });
            
            if (existingTemplate.IdEmpresa === idEmpresa) {
                const errorMsg = `Ya existe una plantilla con el tipo '${Tipo}' para esta empresa`;
                console.error(`[${transactionId}] ${errorMsg}`);
                return res.status(400).json(
                    require("lsi-util-node/API").getFormatedResponse(
                        "",
                        errorMsg
                    )
                );
            }
        }

        const templateData = {
            ...req.body,
            IdEmpresa: idEmpresa,
            UsuarioCreacion: username,
            Activo: req.body.Activo !== undefined ? req.body.Activo : true
        };

        console.log(`[${transactionId}] Datos a guardar:`, {
            ...templateData,
            Cuerpo: templateData.Cuerpo ? '[CONTENIDO HTML]' : 'VACÍO'
        });

        console.log(`[${transactionId}] Guardando plantilla...`);
        const result = await template_upsert(templateData);
        
        if (!result) {
            const errorMsg = 'No se pudo guardar la plantilla';
            console.error(`[${transactionId}] ${errorMsg}`);
            throw new Error(errorMsg);
        }
        
        // Preparar respuesta exitosa
        const responseData = {
            id: result.Id,
            tipo: result.Tipo,
            titulo: result.Titulo,
            activo: result.Activo,
            fechaCreacion: result.FechaCreacion
        };
        
        console.log(`[${transactionId}] Plantilla creada exitosamente:`, responseData);
        
        return res.status(201).json(
            require("lsi-util-node/API").getFormatedResponse(
                responseData,
                "Plantilla creada exitosamente"
            )
        );
        
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`[${transactionId}] Error al crear plantilla:`, errorMsg);
        
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse(
                "",
                `Error al crear la plantilla: ${errorMsg}`
            )
        );
    }
};

export const editar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username } = handleAuth(req);
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse("", "ID de plantilla inválido")
            );
        }

        const templateData = {
            ...req.body,
            Id: id,
            UsuarioModificacion: username || 'sistema'
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

/**
 * Obtiene todas las plantillas de correo de una empresa específica
 * @param req Request con el ID de la empresa en los parámetros
 * @param res Response con las plantillas encontradas
 */
export const getByEmpresa = async (req: Request, res: Response): Promise<Response> => {
    console.log('=== INICIO getByEmpresa ===');
    console.log('ID Empresa:', req.params.idEmpresa);
    
    try {
        const idEmpresa = parseInt(req.params.idEmpresa, 10);
        
        if (isNaN(idEmpresa)) {
            console.error('Error: ID de empresa inválido');
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse(
                    "",
                    "ID de empresa inválido"
                )
            );
        }

        // Verificar que la empresa exista
        const empresa = await empresa_getById_DALC(idEmpresa);
        if (!empresa) {
            console.error(`Error: No se encontró la empresa con ID ${idEmpresa}`);
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
            );
        }

        console.log(`Buscando plantillas para la empresa ID: ${idEmpresa}`);
        const plantillas = await template_getByEmpresa(idEmpresa);
        
        console.log(`Se encontraron ${plantillas.length} plantillas`);
        return res.json(
            require("lsi-util-node/API").getFormatedResponse(plantillas)
        );
    } catch (error) {
        console.error('Error al obtener plantillas por empresa:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse(
                "",
                "Error al obtener las plantillas"
            )
        );
    } finally {
        console.log('=== FIN getByEmpresa ===');
    }
};

export const activar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const auth = handleAuth(req);

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
        if (result.IdEmpresa !== auth.idEmpresa) {
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

export const getAll = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const templates = await template_getAll();
        return res.json(require("lsi-util-node/API").getFormatedResponse(templates));
    } catch (error) {
        console.error('Error al listar plantillas:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", "Error al listar plantillas")
        );
    }
};

// La función getByEmpresa está definida más arriba con logging mejorado y validación de empresa

export const eliminar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = Number(req.params.id);
        const template = await template_getById(id);
        if (!template) {
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Plantilla inexistente")
            );
        }
        await template_delete(id);
        return res.json(require("lsi-util-node/API").getFormatedResponse(template, "Plantilla eliminada"));
    } catch (error) {
        console.error('Error al eliminar plantilla:', error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", "Error al eliminar la plantilla")
        );
    }
};

export const uploadImagen = async (req: Request, res: Response): Promise<Response> => {
    if (!req.file) {
        return res.status(400).json(
            require("lsi-util-node/API").getFormatedResponse("", "No se envió archivo")
        );
    }
    const url = `${req.protocol}://${req.get('host')}/email-images/${req.file.filename}`;
    return res.json(require("lsi-util-node/API").getFormatedResponse({ url }));
};
