import {Router} from 'express'
const router=Router()

import {
    localidades_getByCodigoPostal,
    localidades_getById
} from "../controllers/localidades.controller"

const prefixAPI="/apiv3"

router.get(prefixAPI+"/localidades/getById/:Id", localidades_getById)
router.get(prefixAPI+"/localidades/getByCodigoPostal/:codigoPostal", localidades_getByCodigoPostal)

export default router