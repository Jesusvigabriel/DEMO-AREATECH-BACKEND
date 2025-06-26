import { getRepository } from "typeorm";
import { Orden } from "../entities/Orden";
import { Remito } from "../entities/Remito";
import { remito_actualizarEstado_DALC } from "../DALC/remitos.dalc";
import { SincronizacionEstadosService } from "./sincronizacionEstados.service";

export class OrdenesService {
    private static instance: OrdenesService;
    private sincronizacionService = SincronizacionEstadosService.getInstance();

    private constructor() {}

    public static getInstance(): OrdenesService {
        if (!OrdenesService.instance) {
            OrdenesService.instance = new OrdenesService();
        }
        return OrdenesService.instance;
    }

    public async actualizarEstado(
        idOrden: number,
        nuevoEstado: number,
        usuario: string
    ): Promise<Orden> {
        const repo = getRepository(Orden);
        const orden = await repo.findOne(idOrden, { relations: ["Empresa"] });
        
        if (!orden) {
            throw new Error("Orden no encontrada");
        }

        // Validar transición de estado
        await this.validarCambioEstado(orden.Id, nuevoEstado);

        // Actualizar estado de la orden
        orden.Estado = nuevoEstado;
        const ordenActualizada = await repo.save(orden);

        // Sincronizar con remito si existe
        await this.sincronizarConRemito(orden.Id, nuevoEstado, usuario);

        return ordenActualizada;
    }

    private async sincronizarConRemito(
        idOrden: number,
        estadoOrden: number,
        usuario: string
    ): Promise<void> {
        const remito = await getRepository(Remito).findOne({
            where: { IdOrden: idOrden }
        });

        if (remito) {
            const estadoRemito = this.mapearEstadoOrdenARemito(estadoOrden);
            if (estadoRemito) {
                // Actualizar estado del remito
                await remito_actualizarEstado_DALC(remito.Id, estadoRemito, usuario);
                
                // Registrar la sincronización
                await this.sincronizacionService.registrarSincronizacion(
                    idOrden,
                    remito.Id,
                    estadoOrden,
                    estadoRemito,
                    usuario
                );
            }
        }
    }

    private mapearEstadoOrdenARemito(estadoOrden: number): string | null {
        const mapaEstados: { [key: number]: string } = {
            1: 'PENDIENTE',
            2: 'EN_PREPARACION',
            3: 'PREPARADO',
            4: 'EN_CAMINO',
            5: 'ENTREGADO',
            6: 'CANCELADO'
        };
        return mapaEstados[estadoOrden] || null;
    }

    private async validarCambioEstado(idOrden: number, nuevoEstado: number): Promise<void> {
        if (nuevoEstado === 5) { // ENTREGADA
            const remito = await getRepository(Remito).findOne({
                where: { IdOrden: idOrden }
            });

            if (remito && remito.Estado !== 'EN_CAMINO') {
                throw new Error('No se puede marcar como entregada: el remito no está en camino');
            }
        }
    }
}
