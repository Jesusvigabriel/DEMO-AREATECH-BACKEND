import { Router } from 'express';
import { crearRemitoDesdeOrden } from '../controllers/remitos.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.post(`${prefixAPI}/remitos/fromOrden/:idOrden`, crearRemitoDesdeOrden);

export default router;
