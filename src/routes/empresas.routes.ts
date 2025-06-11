import {Router} from 'express'
const router=Router()

import {
    getAllEmpresas,
    getById,
    getConfiguracionById,
    putConfiguracionEmpresa,
    setEmpresaActivar,
    setEmpresaActivarAutogestion,
    setEmpresaActivarMostrarTyC,
    setEmpresaAutogestionOpciones,
    empresa_getAlmacenajePeriodo,
    getConfiguracionAll,
    empresa_editOne_configuracion,
    putConfiguracionEmpresaHistorico,
    getConfiguracionesById,
    setEmpresa,
    putEmpresa,
    empresa_editOne_configuracionHistorico
} from "../controllers/empresas.controller"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/empresas", getAllEmpresas)
router.get(prefixAPI+"/empresa/:Id", getById)

router.put(prefixAPI+"/empresa/activar/:id/:activa", setEmpresaActivar)
router.put(prefixAPI+"/empresa/activarAutogestion/:id/:activa", setEmpresaActivarAutogestion)
router.put(prefixAPI+"/empresa/activarMostrarTyC/:id/:activa", setEmpresaActivarMostrarTyC)
router.put(prefixAPI+"/empresa/registrarAutogestionOpciones/:id/:opciones", setEmpresaAutogestionOpciones)
router.patch(prefixAPI+"/empresa/saveEmpresa/:id", setEmpresa)
router.put(prefixAPI+"/empresa/newOne", putEmpresa)

router.get(prefixAPI+"/empresa/configuracion/:Id", getConfiguracionById)
router.get(prefixAPI+"/empresa/configuracionesEmpresa/:idEmpresa/:fechaDesde/:fechaHasta", getConfiguracionesById)
router.get(prefixAPI+"/empresas/getAllConfiguracion", getConfiguracionAll)
router.put(prefixAPI+"/empresa/configuracion/:idEmpresa", putConfiguracionEmpresa)
router.put(prefixAPI+"/Empresa/ConfiguracionHistorico/:idEmpresa", putConfiguracionEmpresaHistorico)
router.patch(prefixAPI+"/empresas/editOneConfiguracion/:id", empresa_editOne_configuracion )
router.patch(prefixAPI+"/empresas/editOneConfiguracionHistorico/:id", empresa_editOne_configuracionHistorico )


router.get(prefixAPI+"/empresas/getAlmacenajePeriodo/:idEmpresa/:fechaDesde/:fechaHasta", empresa_getAlmacenajePeriodo)

export default router