import { getRepository } from "typeorm";
import { EmailProcesoConfig } from "../entities/EmailProcesoConfig";

export const emailProcesoConfig_getByEmpresa = async (idEmpresa: number) => {
    return await getRepository(EmailProcesoConfig).find({ where: { IdEmpresa: idEmpresa } });
};

export const emailProcesoConfig_get = async (idEmpresa: number, proceso: string) => {
    return await getRepository(EmailProcesoConfig).findOne({ where: { IdEmpresa: idEmpresa, Proceso: proceso } as any });
};

export const emailProcesoConfig_upsert = async (data: Partial<EmailProcesoConfig>) => {
    const repo = getRepository(EmailProcesoConfig);
    const now = new Date();

    if (data.Id) {
        data.FechaModificacion = now;
        await repo.update(data.Id, data);
        return await repo.findOne({ where: { Id: data.Id } });
    } else {
        const nuevo = repo.create({
            ...data,
            FechaCreacion: now,
            FechaModificacion: now,
            Activo: data.Activo !== undefined ? data.Activo : true
        } as any);
        return await repo.save(nuevo);
    }
};

export const emailProcesoConfig_delete = async (id: number) => {
    const repo = getRepository(EmailProcesoConfig);
    await repo.delete(id);
};
