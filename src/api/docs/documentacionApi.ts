import {Router} from 'express'
const router=Router()

/**
 * @openapi
 *  components:
 *      schema:
 *          Guia:
 *              type: object
 *              properties:
 *                  Comprobante:
 *                      type: integer
 *                  Remitos:
 *                      type: integer
 *                  Estado:
 *                      type: string
 *                  NombreDestino:
 *                      type: string
 *                  EmailDestinatario:
 *                      type: string
 *                  Domicilio:
 *                      type: string
 *                  CodigoPostal:
 *                      type: integer
 *                  Localidad:
 *                      type: string
 *                  Bultos:
 *                      type: integer
 *                  Kilos:
 *                      type: integer
 *                  Volumen:
 *                      type: integer
 *          Error:
 *              type: object
 *              properties:
 *                  status:
 *                      type: string
 *                  errors:
 *                      type: string
 *                 
 */


//ruta para obtener guias
/**
 * @openapi
 * /apiv3/guia/{guide}/{token}:
 *   get:
 *     tags:
 *       - Guide
 *     summary: Delivery status
 *     parameters:
 *       - name: guide
 *         in: path
 *         description: The guide number to search for
 *         required: true
 *         schema:
 *           type: integer
 *       - name: token
 *         in: path
 *         description: Authentication token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#components/schema/Guia'
 *       404:
 *          description: Invalid guide or token supplied
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                          $ref: '#components/schema/Error'
 */
router.get("/apiv3/guia/:guia/:token")

/**
 * @openapi
 * /apiv3/ordenes/byEmpresaPeriodoConDestinos/{idEmpresa}/{fechaDesde}/{fechaHasta}:
 *   get:
 *     tags:
 *       - Ordenes
 *     summary: Lista ordenes de una empresa y rango de fechas con detalles de destino y productos
 *     parameters:
 *       - name: idEmpresa
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: fechaDesde
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: fechaHasta
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             example:
*               - IdOrden: 1
*                 Numero: "100"
*                 NombreDestino: "Casa Central"
*                 Barcode: "PROD1"
*                 Unidades: 10
*/
router.get("/apiv3/ordenes/byEmpresaPeriodoConDestinos/:idEmpresa/:fechaDesde/:fechaHasta")

/**
 * @openapi
 * /apiv3/ordenes/detalleOrdenByNumeroAndIdEmpresa/{numero}/{idEmpresa}:
 *   get:
 *     tags:
 *       - Ordenes
 *     summary: Obtiene una orden y su detalle por número y empresa
 *     parameters:
 *       - name: numero
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: idEmpresa
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             example:
 *               idOrden: 10
 *               comprobante: "150"
 *               estado: 1
 *               codigoPostalTransporte: "1406"
 *               Detalle: []
 */
router.get("/apiv3/ordenes/detalleOrdenByNumeroAndIdEmpresa/:numero/:idEmpresa")

/**
 * @openapi
 * /apiv3/remitos/fromOrden/{idOrden}:
 *   post:
 *     tags:
 *       - Remitos
 *     summary: Crea un remito a partir de una orden
 *     parameters:
 *       - name: idOrden
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           example:
 *             remito_number: "0001-00000001"
 *             # remito_items puede omitirse si la orden tiene partidas
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
router.post("/apiv3/remitos/fromOrden/:idOrden")

/**
 * @openapi
 * /apiv3/remitos/fromOrden/{idOrden}:
 *   get:
 *     tags:
 *       - Remitos
 *     summary: Obtiene el remito generado a partir de una orden
 *     parameters:
 *       - name: idOrden
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
router.get("/apiv3/remitos/fromOrden/:idOrden")

/**
 * @openapi
 * /apiv3/remitos/{id}:
 *   get:
 *     tags:
 *       - Remitos
 *     summary: Obtiene un remito por su identificador
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
router.get("/apiv3/remitos/:id")

/**
 * @openapi
 * /apiv3/remitos/byNumero/{numero}:
 *   get:
 *     tags:
 *       - Remitos
 *     summary: Obtiene un remito por su número
 *     parameters:
 *       - name: numero
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
router.get("/apiv3/remitos/byNumero/:numero")

/**
 * @openapi
 * /apiv3/remitos/byOrden/{idOrden}:
 *   get:
 *     tags:
 *       - Remitos
 *     summary: Obtiene el remito asignado a una orden
 *     parameters:
 *       - name: idOrden
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
router.get("/apiv3/remitos/byOrden/:idOrden")

/**
 * @openapi
 * /apiv3/remitos/byEmpresa/{idEmpresa}/{desde}/{hasta}:
 *   get:
 *     tags:
 *       - Remitos
 *     summary: Lista los remitos de una empresa en un rango de fechas
 *     parameters:
 *       - name: idEmpresa
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: desde
 *         in: path
 *         required: false
 *         schema:
 *           type: string
 *       - name: hasta
 *         in: path
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
router.get("/apiv3/remitos/byEmpresa/:idEmpresa/:desde?/:hasta?")

/**
 * @openapi
 * /apiv3/remitos/historico/{idRemito}:
 *   get:
 *     tags:
 *       - Remitos
 *     summary: Devuelve el histórico de estados de un remito
 *     parameters:
 *       - name: idRemito
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
router.get("/apiv3/remitos/historico/:idRemito")
