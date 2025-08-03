import { Router } from 'express';
import { getByEmpresa, crear, editar, eliminar, probarEnvio } from '../controllers/emailProcesoConfig.controller';

const router = Router();
const prefixAPI = '/apiv3';

// Ruta existente
router.get(`${prefixAPI}/emailProcesoConfig/:idEmpresa`, getByEmpresa);
// Ruta adicional para compatibilidad con el frontend
router.get(`${prefixAPI}/emailProcesoConfig/byEmpresa/:idEmpresa`, getByEmpresa);

router.post(`${prefixAPI}/emailProcesoConfig`, crear);
router.patch(`${prefixAPI}/emailProcesoConfig/:id`, editar);
router.delete(`${prefixAPI}/emailProcesoConfig/:id`, eliminar);


// Ruta para probar el envío de correo
router.post(`${prefixAPI}/emailProcesoConfig/:id/probar`, probarEnvio);

export default router;
