import { Router } from 'express';
import { alta, editar, getByCodigo, activar } from '../controllers/emailTemplates.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.get(`${prefixAPI}/emailTemplate/:codigo`, getByCodigo);
router.post(`${prefixAPI}/emailTemplate`, alta);
router.patch(`${prefixAPI}/emailTemplate/:id`, editar);
router.put(`${prefixAPI}/emailTemplate/activate/:id/:activo`, activar);

export default router;
