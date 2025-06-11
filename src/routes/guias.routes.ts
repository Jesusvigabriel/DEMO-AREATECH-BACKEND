import {Router} from 'express'
const router=Router()

import {
    getByComprobante,
    getById,
    getByFecha,
    setGuiaEntregada,
    getHashFotoNoEntregado,
    addFotoEntrega,
    calculaValor,
    getSinRendirByIdEmpresa,
    setRegistrarRendicionesByEmpresa,
    crearNuevaGuiaDesdeOrden,
    crearNuevaGuiaDesdeExcel,
    getAllEnPlanchada,
    getPlanchadaByComprobanteAndToken,
    setActualizarFecha,
    getByPeriodoEmpresa,
    guia_editOne,
    guias_revisarRetroactivasPorFlete,
    guias_repararCRR_controller,
    getByRemito,
    getByGuiaAndToken,
    getByPeriodoEmpresaFecha,
    getByPeriodoIdEmpresa
} from "../controllers/guias.controller"

import {
    get_fotosByGuia
} from "../controllers/guiasFotos.controller"

const prefixAPI="/apiv3"



router.get(prefixAPI+"/guia/:Id", getById)
router.get(prefixAPI+"/guia/fotosDocumentacionEntrega/:IdGuia", get_fotosByGuia )
router.get(prefixAPI+"/guia/byComprobante/:Comprobante", getByComprobante)
router.get(prefixAPI+"/guias/byFechaSoloDespachadas/:Fecha", getByFecha)
router.get(prefixAPI+"/guias/getAllEnPlanchada", getAllEnPlanchada)
router.get(prefixAPI+"/guias/getPlanchadaByComprobanteAndToken/:comprobante/:token", getPlanchadaByComprobanteAndToken)
router.get(prefixAPI+"/guias/getRemitos/:idEmpresa/:idRemito", getByRemito)
router.put(prefixAPI+"/guias/setAllActualizarFecha/:fecha/:idsGuias", setActualizarFecha)

router.get(prefixAPI+"/guias/byPeriodoEmpresa/:fechaDesde/:fechaHasta/:idEmpresa", getByPeriodoEmpresa)
router.get(prefixAPI+"/guias/byPeriodoEmpresa/:fechaDesde/:fechaHasta", getByPeriodoEmpresa)
router.get(prefixAPI+"/guias/byPeriodoIdEmpresa/:fechaDesde/:fechaHasta/:idEmpresa", getByPeriodoIdEmpresa)
router.get(prefixAPI+"/guias/byPeriodoIdEmpresa/:fechaDesde/:fechaHasta", getByPeriodoIdEmpresa)
router.get(prefixAPI+"/guias/getByPeriodoEmpresaFecha/:fechaDesde/:fechaHasta/:idEmpresa", getByPeriodoEmpresaFecha)
router.get(prefixAPI+"/guias/getByPeriodoEmpresaFecha/:fechaDesde/:fechaHasta", getByPeriodoEmpresaFecha)

router.get(prefixAPI+"/guias/sinRendirPorEmpresa/:idEmpresa", getSinRendirByIdEmpresa)
router.post(prefixAPI+"/guias/registrarRendicion/:idEmpresa/:idsGuias/:usuario", setRegistrarRendicionesByEmpresa)

router.post(prefixAPI+"/guias/newFromOrden/:idOrden", crearNuevaGuiaDesdeOrden)
router.post(prefixAPI+"/guias/newFromExcel", crearNuevaGuiaDesdeExcel)

router.put(prefixAPI+"/guia/:id", setGuiaEntregada)
router.put(prefixAPI+"/guia/getHashFotoNoEntregado/:idGuia/:idChofer/:fecha", getHashFotoNoEntregado)

router.patch(prefixAPI+"/guias/editOne/:id", guia_editOne)

router.put(`${prefixAPI}/guia/fotoDocumentacionEntrega/:idGuia/:hash`, addFotoEntrega )

router.get(`${prefixAPI}/guia/calcularValor/:idOrden/:tipoServicio`, calculaValor)

router.get(`${prefixAPI}/guias/revisarRetroactivamentePorFlete`, guias_revisarRetroactivasPorFlete)
router.get(`${prefixAPI}/guias/repararCRR`, guias_repararCRR_controller)
router.get(prefixAPI+"/guia/:guia/:token", getByGuiaAndToken)


export default router