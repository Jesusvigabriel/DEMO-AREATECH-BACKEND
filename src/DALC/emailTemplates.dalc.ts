import { getRepository } from "typeorm";
import { EmailTemplate } from "../entities/EmailTemplate";

/**
 * Obtiene todas las plantillas de una empresa ordenadas por fecha de creación descendente
 * @param idEmpresa ID de la empresa
 * @returns Lista de plantillas de correo
 */
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

export const template_getAll = async () => {
    return await getRepository(EmailTemplate).find();
};

/**
 * Obtiene una plantilla por su ID
 * @param id ID de la plantilla
 * @returns Plantilla de correo o undefined si no se encuentra
 */
export const template_getById = async (id: number) => {
    return await getRepository(EmailTemplate).findOne({ where: { Id: id } });
};

export const template_delete = async (id: number) => {
    const repo = getRepository(EmailTemplate);
    const existing = await repo.findOne({ where: { Id: id } });
    if (existing) {
        await repo.delete(id);
    }
    return existing;
};
