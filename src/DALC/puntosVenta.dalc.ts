import { getRepository } from "typeorm";
import { PuntoVenta } from "../entities/PuntoVenta";

export const puntoVenta_getByEmpresa_DALC = async (idEmpresa: number) => {
    return await getRepository(PuntoVenta).find({ where: { IdEmpresa: idEmpresa } });
};

export const puntoVenta_getInternoByEmpresa_DALC = async (idEmpresa: number) => {
    return await getRepository(PuntoVenta).findOne({ where: { IdEmpresa: idEmpresa, Externo: false } });
};

export const puntoVenta_crearExterno_DALC = async (body: Partial<PuntoVenta>) => {
    const repo = getRepository(PuntoVenta);
    const nuevo = repo.create(body);
    return await repo.save(nuevo);
};

export const puntoVenta_incrementSequence_DALC = async (id: number) => {
    await getRepository(PuntoVenta)
        .createQueryBuilder()
        .update(PuntoVenta)
        .set({ LastSequence: () => "last_sequence + 1" })
        .where("id = :id", { id })
        .execute();
    return await getRepository(PuntoVenta).findOne(id);
};
