import { Router } from 'express'
const router = Router()

import { getAuditoria } from "../controllers/auditoria.controller"

const prefixAPI = "/apiv3"

router.get(`${prefixAPI}/auditoria/:entidad/:idRegistro?`, getAuditoria)

export default router
