import {Router} from 'express'
const router=Router()

import {
    getByID,
    getByPeriodo,
    generarNueva,
    anularOrden,
    anularOrdenById,
    informarEmisionEtiqueta,
    ordenesByEmpresaId,
    getPreparadasNoGuias,
    setRetiraCliente,
    getByPeriodoEmpresa,
    getByPeriodoEmpresaSoloPreparadasYNoPreorden,
    setBultos,
    orden_setPreOrden,
    getAllDestinoByIdEmpresa,
    getBultosByIdOrden,
    getCantByPeriodo,
    getCantByPeriodoEmpresa,
    getByEmpresaPeriodoConDestinos,
    getPendientes,
    setEstado,
    getByNumeroAnIdEmpresa,
    getDetalleOrdenByNumeroAnIdEmpresa,
    eliminarOrden,
    getOrdenes,
    saleOrder,
    getDetalleOrdenByID,
    getDetallePosicionesOrdenByID,
    getDetalleOrdenAndProductoById,
    getPosicionPorOrdendetalleByIdOrden,
    editCantidadImpresion,
    getOrdenDetalleByIdProducto,
    getPreparadasNoGuiasByIdEmpresa,
    contadorBultosDia,
    getDetalleOrdenAndProductoAndPartidaById,
    getProductosYPosicionesByOrden,
    getHistoricoEstadosOrden,
    getHistoricoMultiplesOrdenes,
    getOrdenesEliminadas
} from "../controllers/ordenes.controller"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/ordenes/byId/:id", getByID)
router.get(prefixAPI+"/ordenes/detalleOrdenById/:id", getDetalleOrdenByID)
router.get(prefixAPI+"/ordenes/detalleOrdenAndProductoById/:id", getDetalleOrdenAndProductoById)
router.get(prefixAPI+"/ordenes/detalleOrdenAndProductoAndPartidaById/:id", getDetalleOrdenAndProductoAndPartidaById)
router.get(prefixAPI+"/ordenes/detallePosicionesOrdenById/:id/:idEmpresa", getDetallePosicionesOrdenByID)
router.get(prefixAPI+"/ordenes/byNumeroAndIdEmpresa/:numero/:idEmpresa", getByNumeroAnIdEmpresa)
router.get(prefixAPI+"/ordenes/detalleOrdenByNumeroAndIdEmpresa/:numero/:idEmpresa", getDetalleOrdenByNumeroAnIdEmpresa)
router.get(prefixAPI+"/ordenes/Destinos/:idEmpresa", getAllDestinoByIdEmpresa)
router.get(prefixAPI+"/ordenes/byPeriodo/:fechaDesde/:fechaHasta", getByPeriodo)
router.get(prefixAPI+"/ordenes/getCantByPeriodo/:fechaDesde/:fechaHasta", getCantByPeriodo)
router.get(prefixAPI+"/ordenes/byPeriodoEmpresa/:fechaDesde/:fechaHasta/:idEmpresa", getByPeriodoEmpresa)
router.get(prefixAPI+"/ordenes/getOrdenDetalleByIdProducto/:idProducto", getOrdenDetalleByIdProducto)
router.get(prefixAPI+"/ordenes/byPeriodoEmpresaSoloPreparadasYNoPreorden/:fechaDesde/:fechaHasta/:idEmpresa", getByPeriodoEmpresaSoloPreparadasYNoPreorden)
router.get(prefixAPI+"/ordenes/getCantByPeriodoEmpresa/:fechaDesde/:fechaHasta/:idEmpresa", getCantByPeriodoEmpresa)
router.get(prefixAPI+"/ordenes/byEmpresaPeriodoConDestinos/:idEmpresa/:fechaDesde/:fechaHasta", getByEmpresaPeriodoConDestinos)
router.get(prefixAPI+"/ordenes/get/preparadasNoGuias", getPreparadasNoGuias)
router.get(prefixAPI+"/ordenes/get/preparadasNoGuiasByIdEmpresa/:idEmpresa", getPreparadasNoGuiasByIdEmpresa)
router.get(prefixAPI+"/ordenes/getPendientes", getPendientes)
router.get(prefixAPI+"/ordenes/getOrdenes", getOrdenes)
router.get(prefixAPI+"/ordenes/contadorBultosDia/:idEmpresa/:fecha", contadorBultosDia)
router.get("/apiv3/ordenes/productos-posiciones/:idOrden", getProductosYPosicionesByOrden);
router.get(prefixAPI+"/ordenes/historico/:idOrden", getHistoricoEstadosOrden)
router.get(prefixAPI+"/ordenes/historico-multiple", getHistoricoMultiplesOrdenes)
router.get(prefixAPI+"/ordenes/eliminadas", getOrdenesEliminadas)


router.post(prefixAPI+"/orden", generarNueva)

router.patch(prefixAPI+"/orden/saleOrder/:idEmpresa", saleOrder) 
router.patch(prefixAPI+"/orden/anularOrdenById/:idOrden/:usuario/:numeroOrden/:idEmpresa", anularOrdenById) 

router.put(prefixAPI+"/orden/anular/:id", anularOrden)
router.put(prefixAPI+"/orden/informarEtiquetaImpresa/:id", informarEmisionEtiqueta)
router.put(prefixAPI+"/orden/marcarRetiraCliente/:id/:fecha", setRetiraCliente)
router.put(prefixAPI+"/orden/setPreorden/:id/:preOrden/:fecha/:usuario", orden_setPreOrden)
router.put(prefixAPI+"/orden/setCantidadBultos/:id/:idEmpresa/:cantidad", setBultos)
router.get(prefixAPI+"/orden/getCantidadBultos/:id", getBultosByIdOrden)
router.put(prefixAPI+"/orden/setEstado/:id/:estado/", setEstado)
router.put(prefixAPI+"/ordenes/editCantidadImpresion/:orden/:impresion", editCantidadImpresion)

router.delete(prefixAPI+"/orden/deleteOneById/:id", eliminarOrden)

router.get(`${prefixAPI}/ordenes/byIdEmpresa/:idEmpresa`, ordenesByEmpresaId)

export default router
