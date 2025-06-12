import { Router } from 'express'
import { getAuditoriaByEntidad, getAuditoriaByEntidadId } from '../controllers/auditoria.controller'

const router = Router()
const prefixAPI = '/apiv3'

router.get(prefixAPI + '/auditoria/:entidad/:id', getAuditoriaByEntidadId)
router.get(prefixAPI + '/auditoria/:entidad', getAuditoriaByEntidad)

export default router
