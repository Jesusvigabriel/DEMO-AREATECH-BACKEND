import { getRepository } from "typeorm";
import { RemitoEstadoHistorico } from "../entities/RemitoEstadoHistorico";
import { auditoria_insert_DALC } from "./auditoria.dalc";

export const remitoEstadoHistorico_insert_DALC = async (
    idRemito: number,
    estado: string,
    usuario: string,
    fecha: Date
) => {
    const nuevo = new RemitoEstadoHistorico();
    nuevo.IdRemito = idRemito;
    nuevo.Estado = estado;
    nuevo.Usuario = usuario;
    nuevo.Fecha = fecha;
    const registro = getRepository(RemitoEstadoHistorico).create(nuevo);
    const result = await getRepository(RemitoEstadoHistorico).save(registro);
    await auditoria_insert_DALC("Remito", idRemito, estado, usuario, fecha);
    return result;
};

export const remitoEstadoHistorico_getByIdRemito_DALC = async (idRemito: number) => {
    const results = await getRepository(RemitoEstadoHistorico).find({
        where: { IdRemito: idRemito },
        order: { Fecha: "ASC" },
    });
    return results;
};
