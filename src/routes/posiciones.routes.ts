import {Router} from 'express'
const router=Router()

import {
    getPosiciones, 
    getPosicionesPorNombre,
    getByID,
    getContentByID,
    vaciarPosicion,
    getContenidosDePosiciones_byNombres,
    setPosicion,
    getPosicionesConPosicionadoNegativo,
    newPosicion,
    eliminarPosicion,
    getPosicionByIdProducto,
    getPosicionAnteriorByIdProducto,
    getPosicionesByIdProducto,
    getDetallePosicionByIdProducto,
    editFechaPos_Prod,
    getDetallePosicionesProductoByIdProducto,
    getAllPosicionesByIdEmpresa,
    getPosicionesByIdProductoAndLote,
    getPosicionesByLote,
    getPosicionesByLoteDetalle,
    getPosicionesConDetalleByEmpresa, 
    getAllByEmpresaConProductos
} from "../controllers/posiciones.controller"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/posiciones", getPosiciones)
router.get(prefixAPI+"/posiciones/getAll", getPosiciones)
router.get(prefixAPI+"/posiciones/byNombre/:nombre", getPosicionesPorNombre)
router.get(prefixAPI+"/posiciones/byId/:id", getByID)
router.put(prefixAPI+"/posiciones/vaciar/:id", vaciarPosicion)
router.get(prefixAPI+"/posiciones/getContentById/:id", getContentByID)
router.get(prefixAPI+"/posiciones/getAllPosicionesByIdEmpresa/:idEmpresa", getAllPosicionesByIdEmpresa)
router.get(prefixAPI+"/ordenes/detallePosicionAndProductoByIdProducto/:idProducto", getDetallePosicionesProductoByIdProducto)
router.get(prefixAPI+"/posiciones/conPosicionadoNegativo", getPosicionesConPosicionadoNegativo)
router.get(prefixAPI+"/posiciones/byidYEmpresa/:idProducto/:idEmpresa", getPosicionByIdProducto)
router.get(prefixAPI+"/posiciones/getPosicionesByIdYEmpresa/:idProducto/:idEmpresa", getPosicionesByIdProducto)
router.get(prefixAPI+"/posiciones/getPosicionesByIdYEmpresaAndLote/:idProducto/:idEmpresa/:lote", getPosicionesByIdProductoAndLote)
router.get(prefixAPI+"/posiciones/getPosicionesByLote/:idEmpresa/:lote", getPosicionesByLote)
router.get(prefixAPI+"/posiciones/getPosicionesByLoteDetalle/:idEmpresa", getPosicionesByLoteDetalle)
router.get(prefixAPI+"/posicionesAnteriores/byidYEmpresa/:idProducto/:idEmpresa", getPosicionAnteriorByIdProducto)
router.get(prefixAPI+"/posiciones/getDetallePosicionByIdYEmpresa/:idProducto/:idEmpresa", getDetallePosicionByIdProducto)
router.get(prefixAPI + "/posiciones/getAllByEmpresaConDetalle/:idEmpresa", getPosicionesConDetalleByEmpresa)
router.get(prefixAPI + "/posiciones/getAllByEmpresaConProductos/:idEmpresa", getAllByEmpresaConProductos);

router.post(prefixAPI+"/posiciones/newOne/:nombre", newPosicion)

router.put(prefixAPI+"/posiciones/:id", setPosicion)

router.delete(prefixAPI+"/posicion/deleteOneByID/:id", eliminarPosicion)

// router.patch(prefixAPI+"/posiciones/getContenidoPosiciones", getContenidosDePosiciones)
router.get(prefixAPI+"/posiciones/getContenidoPosiciones/:posiciones", getContenidosDePosiciones_byNombres)

//Edito la fecha de la Pos_Prod.
router.patch(prefixAPI+"/posiciones/editPosProd/:id/:fecha", editFechaPos_Prod)

export default router