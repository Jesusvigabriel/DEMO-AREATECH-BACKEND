import { getRepository, In } from "typeorm";
import { EmailProcesoConfig } from "../entities/EmailProcesoConfig";
import { EMAIL_PROCESOS } from "../constants/procesosEmail";

const PROCESOS_VALIDOS = Object.values(EMAIL_PROCESOS);

export const emailProcesoConfig_getByEmpresa = async (idEmpresa: number) => {
    console.log('emailProcesoConfig_getByEmpresa', { idEmpresa });
    const result = await getRepository(EmailProcesoConfig).find({ where: { IdEmpresa: idEmpresa } });
    console.log('emailProcesoConfig_getByEmpresa result', result.map(r => ({
        Id: r.Id,
        Proceso: r.Proceso,
        Destinatarios: r.Destinatarios,
        IdEmailServer: r.IdEmailServer,
        IdEmailTemplate: r.IdEmailTemplate
    })));
    return result;
};

export const emailProcesoConfig_get = async (idEmpresa: number, proceso: string | string[]) => {
    console.log('emailProcesoConfig_get', { idEmpresa, proceso });
    const procesos = Array.isArray(proceso) ? proceso : [proceso];
    const result = await getRepository(EmailProcesoConfig).findOne({ where: { IdEmpresa: idEmpresa, Proceso: In(procesos) } as any });
    if (result) {
        console.log('emailProcesoConfig_get result', {
            Id: result.Id,
            Proceso: result.Proceso,
            Destinatarios: result.Destinatarios,
            IdEmailServer: result.IdEmailServer,
            IdEmailTemplate: result.IdEmailTemplate
        });
    } else {
        console.log('emailProcesoConfig_get result', result);
    }
    return result;
};

export const emailProcesoConfig_getById = async (id: number) => {
    return await getRepository(EmailProcesoConfig).findOne({ where: { Id: id } });
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
