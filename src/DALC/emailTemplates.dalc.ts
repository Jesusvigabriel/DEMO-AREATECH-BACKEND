import { getRepository } from "typeorm";
import { EmailTemplate } from "../entities/EmailTemplate";

export const template_getByEmpresa = async (idEmpresa: number) => {
    return await getRepository(EmailTemplate).find({ 
        where: { IdEmpresa: idEmpresa },
        order: { FechaCreacion: 'DESC' }
    });
};

export const template_getByTipo = async (tipo: string) => {
    return await getRepository(EmailTemplate).findOne({ 
        where: { Tipo: tipo } 
    });
};

export const template_upsert = async (data: Partial<EmailTemplate>) => {
    const repo = getRepository(EmailTemplate);
    const now = new Date();
    
    if (data.Id) {
        // Actualizar
        data.FechaModificacion = now;
        await repo.update(data.Id, data);
        return await repo.findOne({ where: { Id: data.Id } });
    } else {
        // Crear nuevo
        const nuevo = repo.create({
            ...data,
            FechaCreacion: now,
            FechaModificacion: now,
            Activo: data.Activo !== undefined ? data.Activo : true
        });
        return await repo.save(nuevo);
    }
};

export const template_activate = async (id: number, activo: boolean) => {
    const repo = getRepository(EmailTemplate);
    await repo.update(id, { 
        Activo: activo,
        FechaModificacion: new Date()
    });
    return await repo.findOne({ where: { Id: id } });
};
