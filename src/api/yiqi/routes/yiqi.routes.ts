import { Router } from "express";

import { getProductosYiqi, sincronizaProductos } from "../controllers/yiqi_productos.controller";
import { getVentasYiqi, sincronizaVentas } from "../controllers/yiqi_ventas.controller";

const router = Router();

const prefixApi = '/apiv3/yiqi'

//Ruta para Obtener los Productos de una tienda en Yiqi
// router.get(`${prefixApi}/productos/obtener/:idStore`, getProductosYiqi)

// //Ruta para Sincronizar los Productos de una tieneda en Yiqi
// router.put(`${prefixApi}/productos/sincronizar/:idStore`, sincronizaProductos)

// //Ruta para Obtener las Ventas de una tienda en Yiqi
// router.get(`${prefixApi}/ventas/obtener/:idStore`, getVentasYiqi)

// // Ruta para Sincornizar las ventas de una tienda en Yiqi
// router.put(`${prefixApi}/ventas/sincronizar/:idStore`, sincronizaVentas)






export default router