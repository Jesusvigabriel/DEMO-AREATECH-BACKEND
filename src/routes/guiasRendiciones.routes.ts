import {Router} from 'express'
const router=Router()

import {
    get_RendicionById
} from "../controllers/guiasRendiciones.controller"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/rendiciones/getOneById/:IdRendicion", get_RendicionById)

export default router