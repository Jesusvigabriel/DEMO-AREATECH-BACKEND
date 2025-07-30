import { getRepository } from "typeorm";
import { EmailTemplate } from "../entities/EmailTemplate";

export const template_getByTipo = async (codigo: string) => {
    return await getRepository(EmailTemplate).findOne({ where: { Codigo: codigo } });
};

export const template_upsert = async (data: Partial<EmailTemplate>) => {
    const repo = getRepository(EmailTemplate);
    if (data.Id) {
        await repo.update(data.Id, data);
        return await repo.findOne(data.Id);
    }
    const nuevo = repo.create(data);
    return await repo.save(nuevo);
};

export const template_activate = async (id: number, activo: boolean) => {
    const repo = getRepository(EmailTemplate);
    await repo.update(id, { Activo: activo } as any);
    return await repo.findOne(id);
};
