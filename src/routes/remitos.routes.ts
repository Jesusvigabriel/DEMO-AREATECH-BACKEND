import { Router } from 'express';
import { crearRemitoDesdeOrden, getRemitoById, getRemitoByNumero, getRemitoByOrden, listRemitosByEmpresa, getHistoricoEstadosRemito, getRemitoPdf, enviarMailRemito } from '../controllers/remitos.controller';

const router = Router();
const prefixAPI = '/apiv3';

router.post(`${prefixAPI}/remitos/fromOrden/:idOrden`, crearRemitoDesdeOrden);
router.get(`${prefixAPI}/remitos/fromOrden/:idOrden`, getRemitoByOrden);
router.get(`${prefixAPI}/remitos/:id`, getRemitoById);
router.get(`${prefixAPI}/remitos/:id/pdf`, getRemitoPdf);
router.get(`${prefixAPI}/remitos/byNumero/:numero`, getRemitoByNumero);
router.get(`${prefixAPI}/remitos/byOrden/:idOrden`, getRemitoByOrden);
router.get(`${prefixAPI}/remitos/byEmpresa/:idEmpresa/:desde?/:hasta?`, listRemitosByEmpresa);
router.get(`${prefixAPI}/remitos/historico/:idRemito`, getHistoricoEstadosRemito);
router.post(`${prefixAPI}/remitos/enviarMail`, enviarMailRemito);

export default router;
