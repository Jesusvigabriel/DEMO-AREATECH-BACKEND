import { Router } from 'express';
import {
    alta,
    editar,
    getByTipo,
    activar,
    getAll,
    getByEmpresa,
    eliminar,
    uploadImagen
} from '../controllers/emailTemplates.controller';
import upload from '../helpers/emailUpload';

const router = Router();
const prefixAPI = '/apiv3';

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
