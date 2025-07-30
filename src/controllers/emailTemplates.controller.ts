import { Request, Response } from "express";
import {
    template_getByTipo,
    template_upsert,
    template_activate
} from "../DALC/emailTemplates.dalc";

export const getByCodigo = async (req: Request, res: Response): Promise<Response> => {
    const template = await template_getByTipo(req.params.codigo);
    if (!template) {
        return res.status(404).json(
            require("lsi-util-node/API").getFormatedResponse("", "Plantilla inexistente")
        );
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(template));
};

export const alta = async (req: Request, res: Response): Promise<Response> => {
    const result = await template_upsert(req.body);
    return res.json(require("lsi-util-node/API").getFormatedResponse(result));
};

export const editar = async (req: Request, res: Response): Promise<Response> => {
    const result = await template_upsert({ ...req.body, Id: Number(req.params.id) });
    return res.json(require("lsi-util-node/API").getFormatedResponse(result));
};

export const activar = async (req: Request, res: Response): Promise<Response> => {
    const result = await template_activate(
        Number(req.params.id),
        req.params.activo === "true"
    );
    return res.json(require("lsi-util-node/API").getFormatedResponse(result));
};
