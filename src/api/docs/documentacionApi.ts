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
