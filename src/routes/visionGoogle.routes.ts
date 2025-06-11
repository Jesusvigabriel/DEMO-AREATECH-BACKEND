import {Router} from 'express'
const router=Router()
import multer from '../helpers/visionGoogle'
import {
    getNumeroGuiaFoto
    
} from "../controllers/visionGoogle.controller"

const prefixAPI="/apiv3"

router.post(prefixAPI+"/visionGoogle/getNumeroGuiaFoto", multer.array('image'), getNumeroGuiaFoto)


export default router