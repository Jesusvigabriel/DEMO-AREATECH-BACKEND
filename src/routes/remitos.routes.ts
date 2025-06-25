import { Router } from 'express';
import { crearRemitoDesdeOrden, getRemitoById, getRemitoByOrden, listRemitosByEmpresa, getHistoricoEstadosRemito } from '../controllers/remitos.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.post(`${prefixAPI}/remitos/fromOrden/:idOrden`, crearRemitoDesdeOrden);
router.get(`${prefixAPI}/remitos/:id`, getRemitoById);
router.get(`${prefixAPI}/remitos/byOrden/:idOrden`, getRemitoByOrden);
router.get(`${prefixAPI}/remitos/byEmpresa/:idEmpresa/:desde?/:hasta?`, listRemitosByEmpresa);
router.get(`${prefixAPI}/remitos/historico/:idRemito`, getHistoricoEstadosRemito);

export default router;
