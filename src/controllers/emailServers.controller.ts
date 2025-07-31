import { Request, Response } from "express";
import {
    emailServer_getByEmpresa,
    emailServer_upsert,
    emailServer_delete
} from "../DALC/emailServers.dalc";
import { empresa_getById_DALC } from "../DALC/empresas.dalc";
import nodemailer from "nodemailer";

// Función auxiliar para manejar la autenticación
const handleAuth = (req: Request) => {
    const authHeader = req.headers.authorization;
    
    // Si hay header de autenticación básica
    if (authHeader && authHeader.startsWith('Basic ')) {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [usernameBasic, password] = credentials.split(':');
        
        // Validar credenciales básicas (mismas que en emailTemplates)
        if (usernameBasic === 'API' && password === 'tu_contraseña_segura') {
            return { idEmpresa: 259, username: 'sistema' };
        }
        throw new Error('Credenciales inválidas');
    } 
    // Si hay usuario autenticado vía JWT
    else if (req.user) {
        return { 
            idEmpresa: req.user.idEmpresa, 
            username: req.user.username 
        };
    }
    
    throw new Error('Se requiere autenticación');
};

export const getByEmpresa = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Verificar autenticación
        const auth = handleAuth(req);
        
        const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa));
        if (!empresa) {
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
            );
        }
        
        // Verificar que el usuario tenga acceso a esta empresa
        if (auth.idEmpresa !== empresa.Id) {
            return res.status(403).json(
                require("lsi-util-node/API").getFormatedResponse("", "No autorizado")
            );
        }
        
        const servidor = await emailServer_getByEmpresa(empresa.Id);
        if (!servidor) {
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Servidor inexistente")
            );
        }
        return res.json(require("lsi-util-node/API").getFormatedResponse(servidor));
    } catch (error) {
        console.error('Error en getByEmpresa:', error);
        return res.status(401).json(
            require("lsi-util-node/API").getFormatedResponse("", 
                error instanceof Error ? error.message : 'Error de autenticación')
        );
    }
};

export const upsert = async (req: Request, res: Response): Promise<Response> => {
    console.log('=== INICIO DE PETICIÓN UPSERT EMAIL SERVER ===');
    console.log('URL:', req.originalUrl);
    console.log('Método:', req.method);
    console.log('Params:', req.params);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body recibido:', JSON.stringify({
        ...req.body,
        Password: req.body.Password ? '***' : 'No proporcionada'
    }, null, 2));
    
    try {
        // Verificar autenticación
        const auth = handleAuth(req);
        
        // Verificar que el ID de la empresa en la URL coincida con el del usuario autenticado
        const empresaId = Number(req.params.idEmpresa);
        if (auth.idEmpresa !== empresaId) {
            return res.status(403).json(
                require("lsi-util-node/API").getFormatedResponse("", "No autorizado para esta empresa")
            );
        }
        console.log('Buscando empresa con ID:', req.params.idEmpresa);
        const empresa = await empresa_getById_DALC(Number(req.params.idEmpresa));
        if (!empresa) {
            console.error('Empresa no encontrada con ID:', req.params.idEmpresa);
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
            );
        }
        console.log('Empresa encontrada:', empresa.Id);

        // Mapear campos del frontend (soporta ambos formatos)
        const {
            // Nuevo formato
            Host,
            Port: portFromBody = 587,
            Username,
            Password,
            Secure: secureFromBody = false,
            FromName,
            FromEmail,
            // Formato antiguo
            Puerto = portFromBody,
            Usuario = Username,
            SSL = secureFromBody,
            EmailDesde = FromEmail,
            NombreDesde = FromName
        } = req.body;

        // Usar los valores que vienen en el formato que sea
        const finalHost = Host;
        const finalPort = parseInt(Puerto || portFromBody, 10) || 587;
        const finalUsername = Usuario || Username;
        const finalPassword = Password;
        const finalSecure = Boolean(SSL || secureFromBody);
        const finalFromName = NombreDesde || FromName || finalUsername;
        const finalFromEmail = EmailDesde || FromEmail || finalUsername;
        
        console.log('Datos recibidos del frontend (crudos):', JSON.stringify(req.body, null, 2));
        console.log('Datos procesados:', {
            Host: finalHost || 'No proporcionado',
            Port: finalPort,
            Username: finalUsername ? '*** Usuario proporcionado ***' : 'No proporcionado',
            Password: finalPassword ? '*** Contraseña proporcionada ***' : 'No proporcionada',
            Secure: finalSecure,
            FromName: finalFromName || 'No proporcionado',
            FromEmail: finalFromEmail || 'No proporcionado'
        });
        
        if (!finalHost || !finalUsername || !finalPassword) {
            const errorMsg = `Faltan campos requeridos: ${!finalHost ? 'Host ' : ''}${!finalUsername ? 'Usuario/Username ' : ''}${!finalPassword ? 'Password' : ''}`.trim();
            console.error('Error de validación:', errorMsg);
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse("", `Error de validación: ${errorMsg}`)
            );
        }

        // Crear objeto con los datos procesados
        const emailServerData = {
            Host: finalHost,
            Port: finalPort,
            Username: finalUsername,
            Password: finalPassword,
            Secure: finalSecure,
            FromName: finalFromName,
            FromEmail: finalFromEmail,
            IdEmpresa: empresa.Id
        };

        console.log('Guardando datos:', {
            ...emailServerData,
            Password: '*** Contraseña oculta ***',
            Username: '*** Usuario oculto ***'
        });

        // Guardar o actualizar
        const result = await emailServer_upsert(empresa.Id, emailServerData);
        return res.json(require("lsi-util-node/API").getFormatedResponse(result));
    } catch (error) {
        console.error("Error en upsert de email server:", error);
        
        if (error instanceof Error && 
            (error.message.includes('Credenciales') || error.message.includes('autenticación'))) {
            return res.status(401).json(
                require("lsi-util-node/API").getFormatedResponse("", 
                    error.message || 'Error de autenticación')
            );
        }
        
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", 
                `Error al guardar la configuración del servidor de correo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        );
    }
};

export const eliminar = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Verificar autenticación
        const auth = handleAuth(req);
        
        const empresaId = Number(req.params.idEmpresa);
        
        // Verificar que el usuario tenga acceso a esta empresa
        if (auth.idEmpresa !== empresaId) {
            return res.status(403).json(
                require("lsi-util-node/API").getFormatedResponse("", "No autorizado para esta empresa")
            );
        }
        
        const empresa = await empresa_getById_DALC(empresaId);
        if (!empresa) {
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente")
            );
        }
        
        await emailServer_delete(empresa.Id);
        return res.json(require("lsi-util-node/API").getFormatedResponse("Servidor eliminado correctamente"));
    } catch (error) {
        console.error('Error en eliminar servidor:', error);
        return res.status(401).json(
            require("lsi-util-node/API").getFormatedResponse("", 
                error instanceof Error ? error.message : 'Error de autenticación')
        );
    }
};

export const test = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Verificar autenticación
        const auth = handleAuth(req);
        
        const empresaId = Number(req.params.idEmpresa);
        
        // Verificar que el usuario tenga acceso a esta empresa
        if (auth.idEmpresa !== empresaId) {
            return res.status(403).json(
                require("lsi-util-node/API").getFormatedResponse("", "No autorizado para esta empresa")
            );
        }
        console.log('=== INICIO PRUEBA DE CORREO ===');
        console.log('ID de empresa recibido:', req.params.idEmpresa);
        
        const idEmpresa = Number(req.params.idEmpresa);
        const empresa = await empresa_getById_DALC(idEmpresa);
        
        if (!empresa) {
            console.error('Empresa no encontrada con ID:', idEmpresa);
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "Empresa no encontrada")
            );
        }
        
        const servidor = await emailServer_getByEmpresa(idEmpresa);
        if (!servidor) {
            console.error('No hay configuración de correo para la empresa:', idEmpresa);
            return res.status(404).json(
                require("lsi-util-node/API").getFormatedResponse("", "No hay configuración de correo para esta empresa")
            );
        }
        
        console.log('Configuración de servidor encontrada:', {
            host: servidor.Host,
            port: servidor.Port,
            secure: servidor.Secure,
            username: servidor.Username ? '***' : 'no proporcionado',
            fromName: servidor.FromName,
            fromEmail: servidor.FromEmail
        });
        console.log('Configurando transporte de correo con los siguientes parámetros:', {
            host: servidor.Host,
            port: servidor.Port,
            secure: servidor.Secure,
            auth: {
                user: servidor.Username,
                pass: servidor.Password ? '***contraseña proporcionada***' : 'no proporcionada'
            }
        });

        const transporter = nodemailer.createTransport({
            host: servidor.Host,
            port: servidor.Port,
            secure: servidor.Secure, // true para 465, false para otros puertos
            requireTLS: true, // Forzar TLS
            tls: {
                // No fallar en certificados inválidos (útil para desarrollo)
                rejectUnauthorized: false
            },
            auth: {
                user: servidor.Username,
                pass: servidor.Password
            },
            // Configuración adicional para Gmail
            service: servidor.Host.includes('gmail.com') ? 'gmail' : undefined,
            // Manejo de reintentos
            pool: true,
            maxConnections: 1,
            maxMessages: 5
        });
        console.log('Enviando correo de prueba...');
        const info = await transporter.sendMail({
            from: `"${servidor.FromName}" <${servidor.FromEmail}>`,
            to: req.body.to || servidor.Username,
            subject: "Prueba de servidor de correo",
            text: "Este es un mensaje de prueba enviado desde el sistema de gestión.",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Prueba de servidor de correo</h2>
                    <p>Este es un mensaje de prueba enviado desde el sistema de gestión.</p>
                    <p><strong>Servidor:</strong> ${servidor.Host}:${servidor.Port}</p>
                    <p><strong>Hora de envío:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p style="color: #666; font-size: 0.9em;">
                        Si recibiste este correo por error, por favor ignóralo.
                    </p>
                </div>
            `
        });
        
        console.log('Correo enviado con éxito. Message ID:', info.messageId);
        return res.json(
            require("lsi-util-node/API").getFormatedResponse(
                { messageId: info.messageId },
                "Correo de prueba enviado exitosamente"
            )
        );
    } catch (error: unknown) {
        console.error('=== ERROR EN PRUEBA DE CORREO ===');
        
        let mensajeError = 'Error al enviar el correo de prueba';
        let errorCode = 'UNKNOWN_ERROR';
        let errorMessage = 'Error desconocido';
        let errorStack: string | undefined;
        
        if (error instanceof Error) {
            console.error('Tipo de error:', error.name);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            
            errorMessage = error.message;
            errorStack = error.stack;
            
            // Verificar si es un error de Nodemailer
            const nodemailerError = error as any;
            if (nodemailerError.code) {
                errorCode = nodemailerError.code;
                
                // Mensajes de error más descriptivos
                switch (nodemailerError.code) {
                    case 'EAUTH':
                        mensajeError = 'Error de autenticación. Verifique el usuario y la contraseña.';
                        break;
                    case 'ECONNECTION':
                        mensajeError = 'No se pudo conectar al servidor SMTP. Verifique el host y puerto.';
                        break;
                    case 'ETIMEDOUT':
                        mensajeError = 'Tiempo de espera agotado al conectar con el servidor SMTP.';
                        break;
                    case 'EENVELOPE':
                        mensajeError = 'Error en la dirección de correo electrónico. Verifique los destinatarios.';
                        break;
                    default:
                        mensajeError = `Error del servidor de correo: ${nodemailerError.code}`;
                }
            }
        } else {
            console.error('Error desconocido:', error);
        }
        
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse(
                { 
                    code: errorCode,
                    message: errorMessage,
                    stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
                },
                mensajeError
            )
        );
    }
};
