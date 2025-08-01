import { Request } from 'express';

/**
 * Maneja la autenticación tanto para Basic Auth como para JWT.
 * @param req Request de Express
 * @returns Objeto con idEmpresa y username extraídos de la autenticación
 * @throws Error si la autenticación es inválida o inexistente
 */
export const handleAuth = (req: Request): { idEmpresa: number; username: string } => {
    const authHeader = req.headers.authorization;

    // Si hay header de autenticación básica
    if (authHeader && authHeader.startsWith('Basic ')) {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [usernameBasic, password] = credentials.split(':');

        // Credenciales permitidas
        const validCredentials = [
            ['A54APIDev', 'A54API4470Dev!'],
            ['A54APIProd', 'A54API4470Prod!'],
            ['A54APIProdUniversal', 'A54API4470ProdUniversal!'],
        ];

        const isValid = validCredentials.some(([user, pass]) => user === usernameBasic && pass === password);

        if (isValid) {
            return { idEmpresa: 259, username: 'sistema' };
        }
        throw new Error('Credenciales inválidas');
    }
    // Si hay usuario autenticado vía JWT
    if (req.user) {
        return {
            idEmpresa: req.user.idEmpresa,
            username: req.user.username,
        };
    }

    throw new Error('Se requiere autenticación');
};
