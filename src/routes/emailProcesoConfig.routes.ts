import { Router } from 'express';
import { getByEmpresa, crear, editar, eliminar } from '../controllers/emailProcesoConfig.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.get(`${prefixAPI}/emailProcesoConfig/:idEmpresa`, getByEmpresa);
router.post(`${prefixAPI}/emailProcesoConfig`, crear);
router.patch(`${prefixAPI}/emailProcesoConfig/:id`, editar);
router.delete(`${prefixAPI}/emailProcesoConfig/:id`, eliminar);

export default router;
