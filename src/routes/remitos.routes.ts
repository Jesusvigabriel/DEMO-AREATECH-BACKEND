import { Router } from 'express';
import { crearRemitoDesdeOrden, getRemitoById, getRemitoByOrden } from '../controllers/remitos.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.post(`${prefixAPI}/remitos/fromOrden/:idOrden`, crearRemitoDesdeOrden);
router.get(`${prefixAPI}/remitos/:id`, getRemitoById);
router.get(`${prefixAPI}/remitos/byOrden/:idOrden`, getRemitoByOrden);

export default router;
