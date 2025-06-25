import { getRepository } from "typeorm";
import { Remito } from "../entities/Remito";
import { RemitoItem } from "../entities/RemitoItem";

export const remito_getById_DALC = async (id: number) => {
    const result = await getRepository(Remito).findOne(id, { relations: ["Empresa", "PuntoVenta"] });
    return result;
};

export const remito_items_getByRemito_DALC = async (idRemito: number) => {
    const result = await getRepository(RemitoItem).find({ where: { IdRemito: idRemito }, relations: ["Orden"] });
    return result;
};

export const remito_getByOrden_DALC = async (idOrden: number) => {
    const item = await getRepository(RemitoItem).findOne({
        where: { IdOrden: idOrden },
        relations: ["Remito", "Remito.Empresa", "Remito.PuntoVenta"],
    });
    return item ? item.Remito : null;
};
