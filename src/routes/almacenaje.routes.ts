import { Router } from "express";

import { 
    get_IngresosAlmacenajeByIdEmpresa,
    get_EgresosAlmacenajeByIdEmpresa,
    get_AlmacenadoByIdEmpresa,
    get_movimientosPorPeriodo,
    get_movimientosPorPeriodo_totalizadosPorEmpresa,
    get_Movimientos_ByEmpresaAndOrden,
    get_ingresosPorPeriodo,
    get_ingresosPorPeriodoEmpresa,
    get_movimientosPorPeriodo_totalizadosPorEmpresaPrevio,
    get_movimientosPorPeriodoAndLote,
    get_movimientosPorPeriodoAndPartida,
    get_IngresosConPosicionByEmpresa
} from "../controllers/almacenaje.controllers";

const router = Router()

const prefixAPI='/apiv3'

router.get(`${prefixAPI}/almacenaje/getMovimientosPorPeriodo/:fechaDesde/:fechaHasta/:idEmpresa/:idProducto`, get_movimientosPorPeriodo)
router.get(`${prefixAPI}/almacenaje/getMovimientosPorPeriodoAndLote/:fechaDesde/:fechaHasta/:idEmpresa/:idProducto/:lote`, get_movimientosPorPeriodoAndLote)
router.get(`${prefixAPI}/almacenaje/getMovimientosPorPeriodoAndPartida/:fechaDesde/:fechaHasta/:idEmpresa/:idProducto/:part`, get_movimientosPorPeriodoAndPartida)
router.get(`${prefixAPI}/almacenaje/getMovimientosPorPeriodoTotalizadosPorEmpresa/:fechaDesde/:fechaHasta/:idEmpresa`, get_movimientosPorPeriodo_totalizadosPorEmpresa)
router.get(`${prefixAPI}/almacenaje/getMovimientosPorPeriodoTotalizadosPorEmpresaPrevio/:fechaDesde/:fechaHasta/:idEmpresa`, get_movimientosPorPeriodo_totalizadosPorEmpresaPrevio)
router.get(`${prefixAPI}/almacenaje/getMovimientosByEmpresaAndOrden/:idEmpresa/:orden`, get_Movimientos_ByEmpresaAndOrden)


router.get(`${prefixAPI}/almacenaje/getIn/:idEmpresa/:fechaDesde/:fechaHasta`, get_IngresosAlmacenajeByIdEmpresa)
router.get(`${prefixAPI}/almacenaje/getInPorPeriodo/:fechaDesde/:fechaHasta`, get_ingresosPorPeriodo)
router.get(`${prefixAPI}/almacenaje/getInPorPeriodoEmpresa/:fechaDesde/:fechaHasta/:idEmpresa`, get_ingresosPorPeriodoEmpresa)
router.get(`${prefixAPI}/almacenaje/getInConPosicion/:idEmpresa/:fechaDesde/:fechaHasta`, get_IngresosConPosicionByEmpresa)

router.get(`${prefixAPI}/almacenaje/getOut/:idEmpresa/:fechaDesde/:fechaHasta`, get_EgresosAlmacenajeByIdEmpresa)
//TODO: Reparar Fechas
router.get(`${prefixAPI}/almacenaje/getAlmacenado/:idEmpresa/:fechaDesde/:fechaHasta`, get_AlmacenadoByIdEmpresa)

export default router
