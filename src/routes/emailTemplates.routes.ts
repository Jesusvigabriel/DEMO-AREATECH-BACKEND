import { Router, Request, Response, NextFunction } from 'express';
import {
    alta,
    editar,
    getByTipo,
    activar,
    getByEmpresa,
    getAll,
    eliminar,
    uploadImagen
} from '../controllers/emailTemplates.controller';
import upload from '../helpers/emailUpload';

// Middleware de logging
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log('=== SOLICITUD RECIBIDA ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Query params:', JSON.stringify(req.query));
    
    if (req.method !== 'GET') {
        console.log('Body:', JSON.stringify(req.body));
    }
    
    // Guardar el método original de respuesta json
    const originalJson = res.json;
    
    // Sobrescribir el método json para registrar la respuesta
    res.json = function(body) {
        console.log('=== RESPUESTA ENVIADA ===');
        console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);
        console.log('Response body:', JSON.stringify(body));
        return originalJson.call(this, body);
    };
    
    next();
};

const router = Router();
const prefixAPI = '/apiv3';

// Aplicar middleware de logging a todas las rutas
router.use(requestLogger);

// Listar todas las plantillas
router.get(`${prefixAPI}/emailTemplates`, getAll);

// Obtener plantillas por empresa
router.get(`${prefixAPI}/emailTemplates/byEmpresa/:idEmpresa`, getByEmpresa);

// Obtener plantilla por tipo
router.get(`${prefixAPI}/emailTemplate/:tipo`, getByTipo);

// Crear nueva plantilla
router.post(`${prefixAPI}/emailTemplates`, alta);

// Actualizar plantilla existente
router.patch(`${prefixAPI}/emailTemplates/:id`, editar);

// Activar/desactivar plantilla
router.patch(`${prefixAPI}/emailTemplates/:id/activate/:activo`, activar);

// Eliminar plantilla
router.delete(`${prefixAPI}/emailTemplates/:id`, eliminar);

// Subir imagen para plantilla
router.post(`${prefixAPI}/emailTemplates/upload`, upload.single('image'), uploadImagen);

export default router;
