import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { orden_getById_DALC } from "../DALC/ordenes.dalc";
import { remito_getById_DALC, remito_items_getByRemito_DALC } from "../DALC/remitos.dalc";
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

    const pvRepo = getRepository(PuntoVenta);
    let puntoVenta = await pvRepo.findOne({ where: { IdEmpresa: empresa.Id, EsInterno: true } });
    let numero: string;
    if (puntoVenta) {
        const sec = puntoVenta.LastSequence + 1;
        numero = `${puntoVenta.Prefijo}${sec}`;
        await pvRepo.createQueryBuilder()
            .update(PuntoVenta)
            .set({ LastSequence: () => "last_sequence + 1" })
            .where("id = :id", { id: puntoVenta.Id })
            .execute();
    } else {
        puntoVenta = await pvRepo.findOne({ where: { IdEmpresa: empresa.Id, EsInterno: false } });
        if (!puntoVenta) {
            return res.status(400).json(require("lsi-util-node/API").getFormatedResponse("", "Punto de venta inexistente"));
        }
        numero = `${puntoVenta.Prefijo}${Date.now()}`;
    }

    const remitoRepo = getRepository(Remito);
    const nuevoRemito = remitoRepo.create({
        IdEmpresa: empresa.Id,
        IdPuntoVenta: puntoVenta.Id,
        Numero: numero,
        Fecha: new Date()
    });
    const remitoGuardado = await remitoRepo.save(nuevoRemito);

    const itemRepo = getRepository(RemitoItem);
    const item = itemRepo.create({ IdRemito: remitoGuardado.Id, IdOrden: orden.Id });
    await itemRepo.save(item);

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
