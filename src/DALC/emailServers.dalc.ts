import { getRepository } from "typeorm";
import { EmailServer } from "../entities/EmailServer";

export const emailServer_getByEmpresa = async (idEmpresa: number) => {
    return await getRepository(EmailServer).findOne({ where: { IdEmpresa: idEmpresa } as any });
};

export const emailServer_upsert = async (idEmpresa: number, data: Partial<EmailServer>) => {
    const repo = getRepository(EmailServer);
    let existente = await repo.findOne({ where: { IdEmpresa: idEmpresa } as any });
    if (existente) {
        await repo.update(existente.Id, data);
        return await repo.findOne(existente.Id);
    }
    const nuevo = repo.create({ ...data, IdEmpresa: idEmpresa } as any);
    return await repo.save(nuevo);
};

export const emailServer_delete = async (idEmpresa: number) => {
    const repo = getRepository(EmailServer);
    const existente = await repo.findOne({ where: { IdEmpresa: idEmpresa } as any });
    if (existente) {
        await repo.delete(existente.Id);
    }
};
