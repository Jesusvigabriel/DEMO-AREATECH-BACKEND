import {Router} from 'express'
const router=Router()

import {
    createMovimientosStock,
    eliminarMovimientoStock,
    getMovimientoByOrdenBarcodeAndEmpresa,
    validaMovimientosStock,
    conciliarMovimientosStock,
    informarIngresoStock,
    validarMovimientos
    
} from "../controllers/movimientosStock.controller"

const prefixAPI="/apiv3"

router.put(prefixAPI+"/movimientos/crearMovimiento", createMovimientosStock)
router.post(prefixAPI+"/movimientos/eliminarMovimientoStock/:id", eliminarMovimientoStock)
router.get(prefixAPI+"/movimientos/getMovimientoByOrdenBarcodeAndEmpresa/:id/:orden/:barcode", getMovimientoByOrdenBarcodeAndEmpresa)
router.post(prefixAPI+"/movimientos/validaMovimiento/:idOrden/:idEmpresa/:barrcodes", validaMovimientosStock)
router.post(prefixAPI+"/movimientos/validarMovimientos/:comprobante/:idEmpresa/:barrcodes", validarMovimientos)
router.post(prefixAPI+"/movimientos/conciliarStock/:id/:tipoForzado", conciliarMovimientosStock)
router.put(prefixAPI+"/movimientos/informarIngresoStock" , informarIngresoStock)
 

export default router