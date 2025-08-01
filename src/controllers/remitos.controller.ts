import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { orden_getById_DALC, orden_actualizarEstado_DALC } from "../DALC/ordenes.dalc";
import { remito_crear_DALC, remito_getById_DALC, remito_getByNumero_DALC, remito_getByOrden_DALC, remito_actualizarEstado_DALC, remitos_getByEmpresa_DALC } from '../DALC/remitos.dalc';
import {
    ordenDetalle_getByIdOrdenAndProducto_DALC,
    ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC
} from '../DALC/ordenesDetalle.dalc';
import { 
    remitoEstadoHistorico_insert_DALC, 
    remitoEstadoHistorico_getByIdRemito_DALC 
} from "../DALC/remitosEstadoHistorico.dalc";
import { empresa_getById_DALC } from "../DALC/empresas.dalc";
import { PuntoVenta } from "../entities/PuntoVenta";
import { Remito } from "../entities/Remito";
import { RemitoItem } from "../entities/RemitoItem";
import { SincronizacionEstadosService } from "../services/sincronizacionEstados.service";
import { ESTADOS_ORDEN, ESTADOS_REMITO, MAPA_ESTADOS_ORDEN_A_REMITO } from "../constants/estados";
import { Orden } from "../entities/Orden";
import { remitoPdfService } from "../services/remitoPdfService";
import fs from 'fs';
import path from 'path';
import { emailService } from '../services/email.service';
import { renderEmailTemplate } from '../helpers/emailTemplates';

// Extender la interfaz Request de Express para incluir la propiedad usuario
declare global {
    namespace Express {
        interface Request {
            usuario?: {
                username: string;
                [key: string]: any;
            };
        }
    }
}

export const crearRemitoDesdeOrden = async (req: Request, res: Response): Promise<Response> => {
    const idOrden = Number(req.params.idOrden);
    const orden = await orden_getById_DALC(idOrden);
    if (!orden) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Orden inexistente"));
    }

    const empresa = orden.Empresa;
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"));
    }

    if (!empresa.UsaRemitos) {
        console.log('[REMITO] Empresa', empresa.Id, 'no usa remitos');
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa no utiliza remitos"));
    }
    console.log('[REMITO] Empresa', empresa.Id, 'usa remitos');

    const pvRepo = getRepository(PuntoVenta);
    let puntoVenta = await pvRepo.findOne({ where: { IdEmpresa: empresa.Id, Externo: false, Activo: true } });
    let numero: string | undefined;
    if (puntoVenta) {
        const sec = puntoVenta.LastSequence + 1;
        const secStr = String(sec).padStart(8, '0');
        numero = `${puntoVenta.Numero}-${secStr}`;
        console.log('[REMITO] Numero generado', numero, 'para punto de venta', puntoVenta.Id);
        await pvRepo.createQueryBuilder()
            .update(PuntoVenta)
            .set({ LastSequence: () => "last_sequence + 1" })
            .where("id = :id", { id: puntoVenta.Id })
            .execute();
    } else {
        numero = req.body.remito_number || orden.NroRemito;
        console.log('[REMITO] Numero recibido', numero);
        if (!numero) {
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "remito_number requerido"));
        }
        if (orden.PuntoVentaId) {
            puntoVenta = await pvRepo.findOne({ where: { Id: orden.PuntoVentaId } });
        }
    }

    let items: Partial<RemitoItem>[];

    if (Array.isArray(req.body.remito_items) && req.body.remito_items.length > 0) {
        items = req.body.remito_items.map((it: any) => ({
            ...it,
            // Ya no usamos orden.DespachoPlaza ya que se movió a los detalles
            DespachoPlaza: it.DespachoPlaza || ''
        }));
    } else {
        const detalles = empresa.PART
            ? await ordenDetalle_getByIdOrdenAndProductoAndPartida_DALC(idOrden)
            : await ordenDetalle_getByIdOrdenAndProducto_DALC(idOrden);

        items = detalles.map((d: any) => ({
            IdOrden: orden.Id,
            CodeEmpresa: d.CodeEmpresa ?? '',
            Cantidad: d.Unidades,
            Importe: d.Precio,
            Barcode: d.Barcode,
            // Usamos el valor de DespachoPlaza del detalle, con un valor por defecto vacío si no existe
            DespachoPlaza: d.DespachoPlaza ?? '',
            Partida: d.Partida ?? ''
        }));
    }

    const totalHojas = Math.max(1, Math.ceil(items.length / 20));

    const nuevoRemito: Partial<Remito> = {
        IdEmpresa: empresa.Id,
        IdPuntoVenta: puntoVenta ? puntoVenta.Id : undefined,
        Fecha: new Date(),
        IdOrden: orden.Id,
        RemitoNumber: numero!,
        TotalHojas: totalHojas,
    };

    if (puntoVenta) {
        nuevoRemito.Cai = puntoVenta.Cai;
        nuevoRemito.CaiVencimiento = puntoVenta.CaiVencimiento;
        nuevoRemito.BarcodeValue = `${puntoVenta.Numero}${numero}`.replace(/[^0-9]/g, '');
    }
    console.log(
        '[REMITO] Creando remito para orden',
        orden.Id,
        'numero',
        numero,
        'items',
        items.length
    );
    const remitoGuardado = await remito_crear_DALC(nuevoRemito, items);
    console.log('[REMITO] Remito creado correctamente', remitoGuardado.Id);

    // Actualizar el campo NroRemito en la orden
    if (remitoGuardado.RemitoNumber) {
        try {
            await getRepository(Orden).update(orden.Id, {
                NroRemito: remitoGuardado.RemitoNumber,
                UsuarioModificacion: orden.Usuario || 'sistema',
                FechaModificacion: new Date(),
            });
            console.log(
                '[REMITO] Actualizado NroRemito en orden',
                orden.Id,
                'a',
                remitoGuardado.RemitoNumber
            );
        } catch (error) {
            console.error('[REMITO] Error al actualizar NroRemito en la orden:', error);
            // No lanzamos el error para no fallar la creación del remito
        }
    }

    await remitoEstadoHistorico_insert_DALC(
        remitoGuardado.Id,
        "CREADO",
        orden.Usuario ? orden.Usuario : "",
        new Date()
    );

    // Cargar el remito completo para su uso posterior
    const remito = await remito_getById_DALC(remitoGuardado.Id);

    if (remito && empresa.StockPosicionado && empresa.PART && empresa.UsaRemitos) {
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempPath = path.join(tempDir, `remito-${remito.Id}.pdf`);

        try {
            const pdfBuffer = await remitoPdfService.generatePdfFromRemito(remito);
            fs.writeFileSync(tempPath, pdfBuffer);

            const valores = {
                numeroRemito: remito.RemitoNumber,
                numeroOrden: String(orden.Numero),
                descargaRemito: `${process.env.BASE_URL || 'http://localhost:8128'}/apiv3/remitos/${remito.Id}/pdf`
            };

            const plantilla = await renderEmailTemplate('ENVIO REMITO', valores);

            const destinatarios = [
                empresa.ContactoDeposito,
                empresa.ContactoOficina
            ]
                .filter((d) => d && d.trim().length > 0)
                .join(',');

            console.log('[REMITO] Enviar a:', destinatarios, 'con valores:', valores);

            if (plantilla && destinatarios) {
                await emailService.sendEmail({
                    idEmpresa: empresa.Id,
                    destinatarios,
                    titulo: plantilla.asunto,
                    cuerpo: plantilla.cuerpo,
                    adjuntos: [{ filename: `remito-${remito.RemitoNumber}.pdf`, path: tempPath }]
                });
                console.log('[REMITO] Email enviado para remito', remito.Id);
            }
        } catch (error) {
            console.error('[REMITO] Error al enviar remito por email:', error);
        } finally {
            try {
                await fs.promises.unlink(tempPath);
            } catch (err) {
                // Ignore
            }
        }
    }

    return res.json(require("lsi-util-node/API").getFormatedResponse(remitoGuardado));
};

export const getRemitoById = async (req: Request, res: Response): Promise<Response> => {
    const idRemito = Number(req.params.id);
    const remito = await remito_getById_DALC(idRemito);
    if (!remito) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Remito inexistente"));
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(remito));
};

export const getRemitoByNumero = async (req: Request, res: Response): Promise<Response> => {
    const numero = req.params.numero;
    const remito = await remito_getByNumero_DALC(numero);
    if (!remito) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Remito inexistente"));
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(remito));
};

export const getRemitoByOrden = async (req: Request, res: Response): Promise<Response> => {
    const idOrden = Number(req.params.idOrden);
    const remito = await remito_getByOrden_DALC(idOrden);
    if (!remito) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Remito inexistente"));
    }
    return res.json(require("lsi-util-node/API").getFormatedResponse(remito));
};

export const listRemitosByEmpresa = async (req: Request, res: Response): Promise<Response> => {
    const idEmpresa = Number(req.params.idEmpresa);
    const empresa = await empresa_getById_DALC(idEmpresa);
    if (!empresa) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"));
    }
    const desde = req.params.desde;
    const hasta = req.params.hasta;
    const remitos = await remitos_getByEmpresa_DALC(idEmpresa, desde, hasta);
    return res.json(require("lsi-util-node/API").getFormatedResponse(remitos));
};

export const getHistoricoEstadosRemito = async (req: Request, res: Response): Promise<Response> => {
    const historico = await remitoEstadoHistorico_getByIdRemito_DALC(Number(req.params.id));
    return res.json(require("lsi-util-node/API").getFormatedResponse(historico));
};

export const getRemitoPdf = async (req: Request, res: Response): Promise<void> => {
    try {
        const idRemito = Number(req.params.id);
        console.log(`[getRemitoPdf] Obteniendo remito con ID: ${idRemito}`);
        
        const remito = await remito_getById_DALC(idRemito);
        
        if (!remito) {
            console.error(`[getRemitoPdf] Remito con ID ${idRemito} no encontrado`);
            res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Remito inexistente"));
            return;
        }

        console.log(`[getRemitoPdf] Datos completos del remito:`, JSON.stringify(remito, null, 2));
        console.log(`[getRemitoPdf] Cantidad de ítems: ${remito.Items?.length || 0}`);
        
        if (remito.Items && remito.Items.length > 0) {
            console.log(`[getRemitoPdf] Primer ítem:`, JSON.stringify(remito.Items[0], null, 2));
        }

        // Generar el PDF
        console.log(`[getRemitoPdf] Generando PDF...`);
        const pdfBuffer = await remitoPdfService.generatePdfFromRemito(remito);
        
        // Configurar los headers de la respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="remito-${remito.RemitoNumber || remito.Id}.pdf"`);
        
        // Enviar el PDF
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Error al generar el PDF del remito:', error);
        res.status(500).json(require("lsi-util-node/API").getFormatedResponse("", "Error al generar el PDF del remito"));
    }
};

export const actualizarEstadoRemito = async (req: Request, res: Response): Promise<Response> => {
    const idRemito = Number(req.params.id);
    const { estado } = req.body;
    const usuario = req.usuario?.username || 'sistema';

    try {
        // Validar estado
        if (!Object.values(ESTADOS_REMITO).includes(estado)) {
            return res.status(400).json(
                require("lsi-util-node/API").getFormatedResponse("", "Estado de remito no válido")
            );
        }

        // Actualizar estado del remito
        const remitoActualizado = await remito_actualizarEstado_DALC(idRemito, estado, usuario);
        
        // Registrar en el historial
        await remitoEstadoHistorico_insert_DALC(idRemito, estado, usuario, new Date());

        // Obtener el remito con la orden asociada
        const remito = await getRepository(Remito).findOne({
            where: { Id: idRemito },
            relations: ["Orden"]
        });

        if (remito && remito.Orden) {
            const sincronizacionService = SincronizacionEstadosService.getInstance();
            
            // Buscar el estado de orden correspondiente
            const estadoOrdenEntry = Object.entries(MAPA_ESTADOS_ORDEN_A_REMITO).find(
                ([_, v]) => v === estado
            );

            if (estadoOrdenEntry) {
                const [ordenEstado] = estadoOrdenEntry;
                
                // Actualizar estado de la orden
                const ordenEstadoResult = await orden_actualizarEstado_DALC(
                    remito.Orden.Id,
                    parseInt(ordenEstado, 10),
                    usuario
                );
                if (
                    ordenEstadoResult &&
                    (ordenEstadoResult as any).estado === "ERROR"
                ) {
                    return res.status(404).json(
                        require("lsi-util-node/API").getFormatedResponse(
                            "",
                            (ordenEstadoResult as any).mensaje
                        )
                    );
                }

                // Registrar la sincronización
                await sincronizacionService.registrarSincronizacion(
                    remito.Orden.Id,
                    idRemito,
                    parseInt(ordenEstado, 10),
                    estado,
                    usuario
                );
            }
        }

        return res.json(
            require("lsi-util-node/API").getFormatedResponse(remitoActualizado)
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error("Error al actualizar estado del remito:", error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", errorMessage)
        );
    }
};

export const getSincronizacionEstados = async (req: Request, res: Response): Promise<Response> => {
    const { idOrden, idRemito } = req.query;
    
    if (!idOrden || !idRemito) {
        return res.status(400).json(
            require("lsi-util-node/API").getFormatedResponse("", "Se requieren idOrden e idRemito")
        );
    }

    try {
        const sincronizacionService = SincronizacionEstadosService.getInstance();
        const sincronizacion = await sincronizacionService.obtenerUltimaSincronizacion(
            Number(idOrden),
            Number(idRemito)
        );

        return res.json(
            require("lsi-util-node/API").getFormatedResponse(sincronizacion || {})
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error("Error al obtener sincronización de estados:", error);
        return res.status(500).json(
            require("lsi-util-node/API").getFormatedResponse("", errorMessage)
        );
    }
};
