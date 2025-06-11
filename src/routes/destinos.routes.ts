import {Router} from 'express'
const router=Router()

import {
    getById
} from "../controllers/destinos.controlles"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/destinos/getOneById/:id", getById)

export default router