import { Router } from "express";

import { installApp, getDataTienda, } from "../controllers/tiendanube_tienda.controller";
import { getProductosTienda, sincronizaProductos} from "../controllers/tiendanube_articulos.controller";
import { getVentasTienda, getLastVentasTienda, sincronizaVentas, deleteOrdenes } from "../controllers/tiendanube_ventas.controller";

const router = Router();

const prefixApi = '/apiv3/tiendanube'

// Ruta para Inicial para recibir los datos del Usuario en Tienda Nube
router.get(`${prefixApi}`, installApp)

// Ruta para Recibir los datos de la tienda en Tienda Nube
router.get(`${prefixApi}/tienda/:idStore`, getDataTienda)

// Ruta para obtener los Productos de la tienda en Tienda Nube
router.get(`${prefixApi}/productos/:idStore`, getProductosTienda)

// Ruta para obtener todas las Ventas de un tienda en Tienda Nube
router.get(`${prefixApi}/ventas/:idStore`, getVentasTienda)

// Ruta para obtener todas las ventas mayores a un determinado ID
router.get(`${prefixApi}/ventas/:idStore/:fecha`, getLastVentasTienda)

// Ruta para Sincronizar los productos de una determinada Tienda
router.put(`${prefixApi}/productos/sincronizar/:idStore/:idEmpresaEnArea`, sincronizaProductos)

//FIXME: Ruta para Sincronizar las ventas de una una determinada Tienda
router.put(`${prefixApi}/ventas/sincronizar/:idStore/:idEmpresaEnArea`, sincronizaVentas)

// Ruta par eliminar Ventas Integradas
router.delete(`${prefixApi}/ordenes/delete/:idStore`, deleteOrdenes)


export default router;
