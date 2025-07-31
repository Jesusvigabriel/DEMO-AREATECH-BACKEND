import { Router } from 'express';
import { alta, editar, getByTipo, activar } from '../controllers/emailTemplates.controller';

const router = Router();
const prefixAPI = '/apiv3';

// Obtener plantilla por tipo
router.get(`${prefixAPI}/emailTemplate/:tipo`, getByTipo);

// Crear nueva plantilla
router.post(`${prefixAPI}/emailTemplate`, alta);

// Actualizar plantilla existente
router.patch(`${prefixAPI}/emailTemplate/:id`, editar);

// Activar/desactivar plantilla
router.put(`${prefixAPI}/emailTemplate/activate/:id/:activo`, activar);

export default router;
