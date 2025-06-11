import { Router } from "express";

import { getProductos, sincronizaProductos,  getAllProductosTienda, sincronizaAllProductosTienda } from "../controllers/woocommerce_articulos.controllers";

import { getVentas, sincronizaVentas } from "../controllers/woocommerce_ventas.contollers";

const router = Router();

const prefixApi = '/apiv3/woocommerce';


router.get(`${prefixApi}/productos/:idStore`, getProductos)

router.put(`${prefixApi}/productos/sincronizar/:idStore`, sincronizaProductos)

router.get(`${prefixApi}/productos_all/:idStore`, getAllProductosTienda)

router.put(`${prefixApi}/productos/sincronizar_all/:idStore`, sincronizaAllProductosTienda)

router.get(`${prefixApi}/ventas/:idStore`, getVentas)

router.put(`${prefixApi}/ventas/sincronizar/:idStore`, sincronizaVentas)

// router.delete(`${prefixApi}/productos/:idStore`, deleteProductos )








export default router