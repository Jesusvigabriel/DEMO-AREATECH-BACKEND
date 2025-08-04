import { getRepository } from "typeorm";
import { EmailServer } from "../entities/EmailServer";

export const emailServer_getByEmpresa = async (idEmpresa: number) => {
    console.log('[EmailServerDALC] Buscando servidor para empresa', idEmpresa);
    const servidor = await getRepository(EmailServer).findOne({ where: { IdEmpresa: idEmpresa } as any });
    console.log('[EmailServerDALC] Servidor encontrado', { Id: servidor?.Id, Host: servidor?.Host, FromEmail: servidor?.FromEmail });
    return servidor;
};

export const emailServer_upsert = async (idEmpresa: number, data: Partial<EmailServer>) => {
    console.log('=== INICIO emailServer_upsert ===');
    console.log('ID Empresa:', idEmpresa);
    console.log('Datos a guardar:', {
        ...data,
        Password: data.Password ? '*** Contraseña oculta ***' : 'No proporcionada',
        Username: data.Username || 'No proporcionado'
    });
    
    const repo = getRepository(EmailServer);
    const now = new Date();
    
    try {
        // Buscar registro existente
        console.log('Buscando servidor existente para la empresa ID:', idEmpresa);
        let existente = await repo.findOne({ where: { IdEmpresa: idEmpresa } as any });
        
        if (existente) {
            console.log('Servidor existente encontrado. ID:', existente.Id);
            console.log('Actualizando registro existente...');
            
            const updateData = {
                ...data,
                FechaModificacion: now
            };
            
            console.log('Datos para actualizar:', {
                ...updateData,
                Password: updateData.Password ? '*** Contraseña oculta ***' : 'No se actualiza'
            });
            
            await repo.update(existente.Id, updateData);
            const updated = await repo.findOne(existente.Id);
            console.log('Registro actualizado exitosamente');
            return updated;
        } else {
            console.log('No existe un servidor para esta empresa. Creando uno nuevo...');
            const nuevo = repo.create({
                ...data,
                IdEmpresa: idEmpresa,
                FechaCreacion: now,
                FechaModificacion: now
            } as any);
            
            console.log('Nuevo registro a crear:', {
                ...nuevo,
                Password: '*** Contraseña oculta ***',
                Username: (nuevo as any).Username || 'No proporcionado'
            });
            
            const resultado = await repo.save(nuevo);
            console.log('Nuevo registro creado con ID:', (resultado as any).Id);
            return resultado;
        }
    } catch (error) {
        console.error('Error en emailServer_upsert:', error);
        if (error instanceof Error) {
            console.error('Mensaje de error:', error.message);
            if ('stack' in error) {
                console.error('Stack trace:', error.stack);
            }
        }
        throw error; // Relanzar el error para manejarlo en el controlador
    } finally {
        console.log('=== FIN emailServer_upsert ===');
    }
};

export const emailServer_delete = async (idEmpresa: number) => {
    const repo = getRepository(EmailServer);
    const existente = await repo.findOne({ where: { IdEmpresa: idEmpresa } as any });
    if (existente) {
        await repo.delete(existente.Id);
    }
};
