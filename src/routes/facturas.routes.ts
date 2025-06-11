import { Router } from "express";

import { 
    factura_generarNueva_controller
} from "../controllers/facturas.controller"

const router = Router()

const prefixAPI='/apiv3'

router.post(`${prefixAPI}/facturas/generarNueva`, factura_generarNueva_controller)

export default router