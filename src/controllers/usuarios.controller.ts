import { Request, Response } from "express";
import { usuario_getById_DALC, 
    usuario_getByUsernameAndPassword_DALC,
    usuario_edit_DALC,
    usuario_getAll_DALC,
    usuario_DALC,
    usuario_getByEmail_DALC // 🆕 import
} from "../DALC/usuarios.dalc";
import { getRepository } from "typeorm";
import { Usuario } from "../entities/Usuario";
import admin from "../firebase-admin";
import { empresa_getById_DALC } from "../DALC/empresas.dalc";
import { Empresa } from "../entities/Empresa";

export const getById = async (req: Request, res: Response): Promise<Response> => {
    const result = await usuario_getById_DALC(parseInt(req.params.id));
    
    if (result != null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result));
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Usuario inexistente"));
    }
};

export const getAll = async (req: Request, res: Response): Promise<Response> => {
    const usuarios = await usuario_getAll_DALC();
    
    if (usuarios != null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(usuarios));
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al obtener Usuarios"));
    }
};

export const putUsuario = async (req: Request, res: Response): Promise<Response> => {
    const result = await usuario_DALC(req.body);
    return res.json(require("lsi-util-node/API").getFormatedResponse(result, "Usuario Creado Correctamente"));
};

export const editUsuario = async (req: Request, res: Response): Promise<Response> => {    
    const idUsuario = (parseInt(req.params.id)) ? parseInt(req.params.id) : 0;
    const usuario = await usuario_getById_DALC(idUsuario);

    if (usuario) {
        const result = await usuario_edit_DALC(req.body, idUsuario);
        return res.json(require("lsi-util-node/API").getFormatedResponse(result));
    }
    return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Usuario inexistente"));  
};

export const getByUsernameAndPassword = async (req: Request, res: Response): Promise<Response> => {
    const result = await usuario_getByUsernameAndPassword_DALC(req.params.username, req.params.password);
    
    if (result != null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result));
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Username y/o password incorrectas"));
    }
};

// 🆕 Nuevo controlador para buscar usuario por email
export const getByEmail = async (req: Request, res: Response): Promise<Response> => {
    const email = req.params.email;
    const usuario = await usuario_getByEmail_DALC(email);

    if (usuario) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(usuario));
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Usuario no registrado"));
    }
};

export const loginWithGoogle = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const email = decodedToken.email;

        // 1. Buscar usuario por email
        const usuario = await getRepository(Usuario).findOne({ 
            where: { Email: email }
        });

        if (!usuario) {
            return res.status(401).json(
                require("lsi-util-node/API").getFormatedResponse("", "Usuario no registrado")
            );
        }

        // 2. Cargar empresa manualmente (para mantener mismo formato que login tradicional)
        let empresa = new Empresa();
        if (usuario.IdEmpresa > 0) {
            const empresaData = await empresa_getById_DALC(usuario.IdEmpresa);
            if (empresaData) empresa = empresaData;
        }

        // 3. Construir respuesta idéntica al login tradicional
        const responseData = {
            ...usuario,
            IdEmpresa: usuario.IdEmpresa || 0,
            Nombre_Empresa: usuario.Nombre_Empresa || null,
            Terminos_Condiciones: usuario.Terminos_Condiciones || 0,
            Deshabilitado: usuario.Deshabilitado || 0,
            Empresa: empresa
        };

        return res.json(
            require("lsi-util-node/API").getFormatedResponse(responseData)
        );

    } catch (error) {
        console.error("Error en loginWithGoogle:", error);
        return res.status(401).json(
            require("lsi-util-node/API").getFormatedResponse("", "Error de autenticación con Google")
        );
    }
};
