import { Request, Response } from "express";
import {
    emailServer_getByEmpresa,
    emailServer_upsert,
    emailServer_delete
} from "../DALC/emailServers.dalc";
import { empresa_getById_DALC } from "../DALC/empresas.dalc";
import nodemailer from "nodemailer";

export const getByEmpresa = async (req: Request, res: Response): Promise<Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa));
    if (!empresa) {
        return res.status(404).json(
            require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
        );
    }
    const servidor = await emailServer_getByEmpresa(empresa.Id);
    if (!servidor) {
        return res.status(404).json(
            require("lsi-util-node/API").getFormatedResponse("", "Servidor inexistente")
        );
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(servidor));
};

export const upsert = async (req: Request, res: Response): Promise<Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa));
    if (!empresa) {
        return res.status(404).json(
            require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
        );
    }
    const result = await emailServer_upsert(empresa.Id, req.body);
    return res.json(require("lsi-util-node/API").getFormatedResponse(result));
};

export const eliminar = async (req: Request, res: Response): Promise<Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa));
    if (!empresa) {
        return res.status(404).json(
            require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
        );
    }
    const result = await emailServer_delete(empresa.Id);
    return res.json(require("lsi-util-node/API").getFormatedResponse(result));
};

export const test = async (req: Request, res: Response): Promise<Response> => {
    const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa));
    if (!empresa) {
        return res.status(404).json(
            require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
        );
    }
    const servidor = await emailServer_getByEmpresa(empresa.Id);
    if (!servidor) {
        return res.status(404).json(
            require("lsi-util-node/API").getFormatedResponse("", "Servidor inexistente")
        );
    }
    try {
        const transporter = nodemailer.createTransport({
            host: servidor.Host,
            port: servidor.Puerto,
            secure: servidor.Seguro,
            auth: { user: servidor.Usuario, pass: servidor.Password }
        });
        await transporter.sendMail({
            from: `"${servidor.DesdeNombre}" <${servidor.DesdeEmail}>`,
            to: req.body.to || servidor.Usuario,
            subject: "Prueba de servidor de correo",
            text: "Mensaje de prueba"
        });
        return res.json(
            require("lsi-util-node/API").getFormatedResponse(true, "Email enviado")
        );
    } catch (error) {
        console.error("Error enviando email de prueba", error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", "Error enviando email de prueba")
        );
    }
};
