import {Router} from 'express'
const router=Router()

import {
    getById,
    getEntregasPorFecha,
    getAll,
    putChofer,
    editChofer
} from "../controllers/choferes.controlles"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/chofer/getAll", getAll)
router.put(prefixAPI+"/chofer/newOne", putChofer)
router.get(prefixAPI+"/chofer/:Id", getById)
router.get(prefixAPI+"/chofer/getEntregasFecha/:Id/:Fecha", getEntregasPorFecha)

router.patch(prefixAPI+"/chofer/editOneById/:Id", editChofer)

export default router