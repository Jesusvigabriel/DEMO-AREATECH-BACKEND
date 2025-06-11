import {Router} from 'express'
const router=Router()

import {
    getByBarcodeAndEmpresa, 
    getAllByEmpresa, 
    reposicionamiento,
    getByIdAndIdEmpresa,
    getAllByIdPosicion,
    getPosiciones,
    get_Varios_ByBarcodesAndEmpresa,
    set_desposicionar,
    set_posicionar,
    producto_delete_byId,
    updateUnidadesArticulo,
    producto_editOne_configuracion,
    producto_addNew,
    repararTextilKatalina,
    set_posicionar_excel,
    getAllProductosByEmpresa,
    updateUnidadesProducto,
    getAllLotes,
    getAllLotesDetalle,
    getLoteByBarcodeAndEmpresa,
    putLoteByBarcodeAndEmpresa,
    getLotesDetalle,
    update_posicionByLoteAndIdPosicion,
    getLoteDetalleProducto,
    getLote,
    getAllLotesSoloDetalle,
    getOnlyLoteDetalle,
    getOnlyLote,
    getPosicionesByProductoAndLote,
    getAllLotesV2,
    getComprometidoLote,
    getLotesDetalleV2,
    reposicionamientoExcelMasivo,
    getAllLotesStock,
    getProductoByPartidaAndEmpresaAndProducto,
    getAllPartidasByIdEmpresa,
    updateUnidadesPartida,
    set_posicionar_excel_partida,
    getAllPartidas,                                                                                                    
    getProductoByPartidaAndEmpresaAndProductov2,
    getProductoByPartidaAndEmpresaAndBarcode,
    getByCodeEmpresaAndEmpresa
} from "../controllers/productos.controller"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/productos/byBarcodeYEmpresa/:Barcode/:IdEmpresa", getByBarcodeAndEmpresa)
router.get(prefixAPI+"/productos/byCodeEmpresaYEmpresa/:Barcode/:IdEmpresa", getByCodeEmpresaAndEmpresa)
router.get(prefixAPI+"/productos/loteByBarcodeYEmpresa/:Barcode/:IdEmpresa", getLoteByBarcodeAndEmpresa)
router.patch(prefixAPI+"/productos/putLoteByBarcodeYEmpresa/:Barcode/:IdEmpresa/:loteCompleto/:userName/:comprobante/:fecha", putLoteByBarcodeAndEmpresa)
router.get(prefixAPI+"/productos/varios/byBarcodeYEmpresa/:idEmpresa", get_Varios_ByBarcodesAndEmpresa)
router.get(prefixAPI+"/productos/byId/:Id/:IdEmpresa", getByIdAndIdEmpresa)
router.get(prefixAPI+"/productos/allByEmpresa/:IdEmpresa", getAllByEmpresa)
router.get(prefixAPI+"/productos/allProductosByEmpresa/:IdEmpresa", getAllProductosByEmpresa)
router.get(prefixAPI+"/productos/allByIdPosicion/:IdPosicion", getAllByIdPosicion)
router.get(prefixAPI+"/productos/getPosiciones/:Id", getPosiciones)
router.post(prefixAPI+"/productos/getComprometidoLote/:idEmpresa/:lote", getComprometidoLote)
router.get(prefixAPI+"/productos/PosicionesPorProductoAndLote/:producto/:posicion/:lote",getPosicionesByProductoAndLote)
router.get(prefixAPI+"/productos/getProductoByPartidaAndEmpresaAndProducto/:idEmpresa/:partida/:barcode",getProductoByPartidaAndEmpresaAndProducto)
router.get(prefixAPI+"/productos/getProductoByPartidaAndEmpresaAndBarcode/:idEmpresa/:partida/:barcode",getProductoByPartidaAndEmpresaAndBarcode)
router.get(prefixAPI+"/productos/getProductoByPartidaAndEmpresaAndProductov2/:idEmpresa/:partida/:idProducto",getProductoByPartidaAndEmpresaAndProductov2)
router.get(prefixAPI+"/productos/getAllPartidasByIdEmpresa/:idEmpresa", getAllPartidasByIdEmpresa)
router.get(prefixAPI+"/productos/getAllPartidas/:idEmpresa", getAllPartidas)
router.patch(prefixAPI+"/productos/editStockProdByIdEmpresaAndPart/:partida/:barcode/:idEmpresa",updateUnidadesPartida)

router.post(prefixAPI+"/productos/newOne", producto_addNew)
router.get(prefixAPI+"/productos/allLotes/:idEmpresa", getAllLotes)
router.get(prefixAPI+"/productos/allLotesV2/:idEmpresa", getAllLotesV2)
router.get(prefixAPI+"/productos/getAllLotesStock/:idEmpresa", getAllLotesStock)
router.get(prefixAPI+"/productos/getAllLotesSoloDetalle/:idEmpresa", getAllLotesSoloDetalle)
router.get(prefixAPI+"/productos/getLote/:idEmpresa/:lote", getLote)
router.get(prefixAPI+"/productos/allLotesDetalle/:idEmpresa", getAllLotesDetalle)
router.get(prefixAPI+"/productos/lotesDetalle/:idEmpresa/:lote", getLotesDetalle)
router.get(prefixAPI+"/productos/lotesDetalleV2/:idEmpresa/:lote", getLotesDetalleV2)
router.get(prefixAPI+"/productos/onlyLoteDetalle/:idEmpresa/:lote", getOnlyLoteDetalle)
router.get(prefixAPI+"/productos/onlyLote/:idEmpresa/:lote", getOnlyLote)
router.get(prefixAPI+"/productos/loteDetalleProducto/:idEmpresa/:lote/:idProducto", getLoteDetalleProducto)
router.get(prefixAPI+"/productos/update_posicionByLoteAndIdPosicion/:boxNumber/:idPosicion/:userName", update_posicionByLoteAndIdPosicion)
router.post(prefixAPI+"/productos/reposicionamiento", reposicionamiento)
router.post(prefixAPI+"/producto/desposicionar/:idProducto/:idPosicion/:cantidadADesposicionar", set_desposicionar)
router.post(prefixAPI+"/producto/posicionar/:idEmpresa/:idProducto/:idPosicion/:cantidadAPosicionar", set_posicionar)
router.post(prefixAPI+"/producto/posicionarPartidaExcel/:idEmpresa/:Partida/:barcode/:idPosicion/:cantidadAPosicionar", set_posicionar_excel_partida)
router.post(prefixAPI+"/producto/registraReposicionamientoExcel/:idEmpresa/:idProducto/:idPosicion/:cantidadAPosicionar/:usuario", set_posicionar_excel)
router.post(prefixAPI+"/producto/getAllPartidas/:idEmpresa", getAllPartidas)
router.post(prefixAPI+"/producto/registraReposicionamientoExcelCantidad/:idEmpresa/:idProducto/:posicionOrigen/:posicionDestino/:cantidadAPosicionar/:barcodeProducto/:usuario", reposicionamientoExcelMasivo)

router.patch(prefixAPI+"/producto/editStockArticulo/:id", updateUnidadesArticulo)
router.patch(prefixAPI+"/producto/editStockProdByEmpresa/:barcode/:idEmpresa", updateUnidadesProducto) 
router.patch(prefixAPI+"/producto/editById/:id", producto_editOne_configuracion)


router.patch(prefixAPI+"/productos/repararTextilKatalina", repararTextilKatalina)

router.delete(prefixAPI+"/productos/eliminar/:id", producto_delete_byId)

export default router