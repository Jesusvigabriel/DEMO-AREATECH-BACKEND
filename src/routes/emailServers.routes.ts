import { Router } from 'express';
import { getByEmpresa, upsert, eliminar, test } from '../controllers/emailServers.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.get(`${prefixAPI}/emailServer/:idEmpresa`, getByEmpresa);
router.post(`${prefixAPI}/emailServer/:idEmpresa`, upsert);
router.delete(`${prefixAPI}/emailServer/:idEmpresa`, eliminar);
router.post(`${prefixAPI}/emailServer/test/:idEmpresa`, test);

export default router;
