import { getRepository, Between } from "typeorm";
import { Remito } from "../entities/Remito";
import { RemitoItem } from "../entities/RemitoItem";

export const remito_getById_DALC = async (id: number) => {
    const result = await getRepository(Remito).findOne(id, { relations: ["Empresa", "PuntoVenta", "Items", "Items.Orden"] });
    return result;
};

export const remito_items_getByRemito_DALC = async (idRemito: number) => {
    const result = await getRepository(RemitoItem).find({ where: { IdRemito: idRemito }, relations: ["Orden"] });
    return result;
};

export const remito_getByOrden_DALC = async (idOrden: number) => {
    return await getRepository(Remito).findOne({
        where: { IdOrden: idOrden },
        relations: ["Empresa", "PuntoVenta"],
    });
};

export const remito_getByNumero_DALC = async (numero: string) => {
    try {
        // Usar QueryBuilder para tener más control sobre las relaciones
        const remito = await getRepository(Remito)
            .createQueryBuilder('remito')
            .leftJoinAndSelect('remito.Empresa', 'empresa')
            .leftJoinAndSelect('remito.PuntoVenta', 'puntoVenta')
            .where('remito.remito_number = :numero', { numero })
            .getOne();

        if (!remito) return null;

        // Cargar los items del remito por separado
        const items = await getRepository(RemitoItem)
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.Orden', 'orden')
            .where('item.remito_id = :remitoId', { remitoId: remito.Id })
            .getMany();

        return { ...remito, Items: items };
    } catch (error) {
        console.error("Error en remito_getByNumero_DALC:", error);
        throw error;
    }
};

export const remitos_getByEmpresa_DALC = async (
    idEmpresa: number,
    desde?: string,
    hasta?: string
) => {
    const repo = getRepository(Remito);
    const where: any = { IdEmpresa: idEmpresa };
    if (desde && hasta) {
        where.Fecha = Between(
            `${desde} 00:00:00`,
            `${hasta} 23:59:59`
        );
    }
    const result = await repo.find({ where, order: { Fecha: "ASC" } });
    return result;
};

export const remito_crear_DALC = async (
    remito: Partial<Remito>,
    items: Partial<RemitoItem>[] = []
) => {
    const repoRemito = getRepository(Remito);
    const nuevoRemito = repoRemito.create(remito);
    console.log('[REMITO DALC] Guardando remito', nuevoRemito);
    const guardado = await repoRemito.save(nuevoRemito);
    console.log('[REMITO DALC] Remito generado con id', guardado.Id);
    if (items.length > 0) {
        const repoItem = getRepository(RemitoItem);
        const itemsAguardar = items.map((it) => ({ ...it, IdRemito: guardado.Id }));
        const regs = repoItem.create(itemsAguardar as any);
        await repoItem.save(regs);
        console.log('[REMITO DALC] Items guardados:', itemsAguardar.length);
    } else {
        console.log('[REMITO DALC] Remito sin items a guardar');
    }
    return guardado;
};

export const remito_actualizarEstado_DALC = async (
    idRemito: number,
    estado: string,
    usuario: string
): Promise<Remito> => {
    const repo = getRepository(Remito);
    const remito = await repo.findOne(idRemito);
    
    if (!remito) {
        throw new Error("Remito no encontrado");
    }

    remito.Estado = estado;
    remito.UsuarioModificacion = usuario;
    remito.FechaModificacion = new Date();
    
    return await repo.save(remito);
};
