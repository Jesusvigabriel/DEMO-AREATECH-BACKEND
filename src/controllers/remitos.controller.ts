import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { orden_getById_DALC } from "../DALC/ordenes.dalc";
import { remito_getById_DALC, remito_items_getByRemito_DALC, remito_getByOrden_DALC, remitos_getByEmpresa_DALC, remito_crear_DALC } from "../DALC/remitos.dalc";
import { remitoEstadoHistorico_insert_DALC, remitoEstadoHistorico_getByIdRemito_DALC } from "../DALC/remitosEstadoHistorico.dalc";
import { empresa_getById_DALC } from "../DALC/empresas.dalc";
import { PuntoVenta } from "../entities/PuntoVenta";
import { Remito } from "../entities/Remito";
import { RemitoItem } from "../entities/RemitoItem";

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
        return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa no utiliza remitos"));
    }

    const pvRepo = getRepository(PuntoVenta);
    let puntoVenta = await pvRepo.findOne({ where: { IdEmpresa: empresa.Id, EsInterno: true, Activo: true } });
    let numero: string | undefined;
    if (puntoVenta) {
        const sec = puntoVenta.LastSequence + 1;
        const secStr = String(sec).padStart(8, '0');
        numero = `${puntoVenta.Numero}-${secStr}`;
        await pvRepo.createQueryBuilder()
            .update(PuntoVenta)
            .set({ LastSequence: () => "last_sequence + 1" })
            .where("id = :id", { id: puntoVenta.Id })
            .execute();
    } else {
        numero = req.body.remito_number || orden.NroRemito;
        if (!numero) {
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "remito_number requerido"));
        }
        if (orden.PuntoVentaId) {
            puntoVenta = await pvRepo.findOne({ where: { Id: orden.PuntoVentaId } });
        }
    }

    const items: Partial<RemitoItem>[] = req.body.remito_items || [];
    const totalHojas = Math.max(1, Math.ceil(items.length / 20));

    const nuevoRemito: Partial<Remito> = {
        IdEmpresa: empresa.Id,
        IdPuntoVenta: puntoVenta ? puntoVenta.Id : undefined,
        Numero: numero!,
        Fecha: new Date(),
        IdOrden: orden.Id,
        RemitoNumber: numero!,
        TotalHojas: totalHojas,
    };
    const remitoGuardado = await remito_crear_DALC(nuevoRemito, items);

    await remitoEstadoHistorico_insert_DALC(remitoGuardado.Id, "CREADO", orden.Usuario ? orden.Usuario : "", new Date());

    return res.json(require("lsi-util-node/API").getFormatedResponse(remitoGuardado));
};

export const getRemitoById = async (req: Request, res: Response): Promise<Response> => {
    const idRemito = Number(req.params.id);
    const remito = await remito_getById_DALC(idRemito);
    if (!remito) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Remito inexistente"));
    }
    const items = await remito_items_getByRemito_DALC(remito.Id);
    return res.json(require("lsi-util-node/API").getFormatedResponse({ ...remito, Items: items }));
};

export const getRemitoByOrden = async (req: Request, res: Response): Promise<Response> => {
    const idOrden = Number(req.params.idOrden);
    const remito = await remito_getByOrden_DALC(idOrden);
    if (!remito) {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Remito inexistente"));
    }
    const items = await remito_items_getByRemito_DALC(remito.Id);
    return res.json(require("lsi-util-node/API").getFormatedResponse({ ...remito, Items: items }));
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
    const idRemito = Number(req.params.idRemito);
    const result = await remitoEstadoHistorico_getByIdRemito_DALC(idRemito);
    return res.json(require("lsi-util-node/API").getFormatedResponse(result));
};
