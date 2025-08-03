import { getRepository, In } from "typeorm";
import { EmailProcesoConfig } from "../entities/EmailProcesoConfig";
import { EMAIL_PROCESOS } from "../constants/procesosEmail";

const PROCESOS_VALIDOS = Object.values(EMAIL_PROCESOS);

export const emailProcesoConfig_getByEmpresa = async (idEmpresa: number) => {
    return await getRepository(EmailProcesoConfig).find({ where: { IdEmpresa: idEmpresa } });
};

export const emailProcesoConfig_get = async (idEmpresa: number, proceso: string | string[]) => {
    const procesos = Array.isArray(proceso) ? proceso : [proceso];
    return await getRepository(EmailProcesoConfig).findOne({ where: { IdEmpresa: idEmpresa, Proceso: In(procesos) } as any });
};

export const emailProcesoConfig_upsert = async (data: Partial<EmailProcesoConfig>) => {
    const repo = getRepository(EmailProcesoConfig);
    const now = new Date();

    if (!data.Proceso || !PROCESOS_VALIDOS.includes(data.Proceso)) {
        throw new Error('Proceso de email no permitido');
    }

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
