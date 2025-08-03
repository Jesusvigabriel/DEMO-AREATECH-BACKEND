import { Router } from 'express';
import { getByEmpresa, crear, editar, eliminar, probar } from '../controllers/emailProcesoConfig.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.get(`${prefixAPI}/emailProcesoConfig/:idEmpresa`, getByEmpresa);
router.post(`${prefixAPI}/emailProcesoConfig`, crear);
router.patch(`${prefixAPI}/emailProcesoConfig/:id`, editar);
router.delete(`${prefixAPI}/emailProcesoConfig/:id`, eliminar);
router.post(`${prefixAPI}/emailProcesoConfig/:id/probar`, probar);

export default router;
