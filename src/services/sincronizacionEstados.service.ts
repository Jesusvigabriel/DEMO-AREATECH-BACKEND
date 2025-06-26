import { getRepository } from "typeorm";
import { OrdenRemitoEstado } from "../entities/OrdenRemitoEstado";

export class SincronizacionEstadosService {
    private static instance: SincronizacionEstadosService;

    private constructor() {}

    public static getInstance(): SincronizacionEstadosService {
        if (!SincronizacionEstadosService.instance) {
            SincronizacionEstadosService.instance = new SincronizacionEstadosService();
        }
        return SincronizacionEstadosService.instance;
    }

    public async registrarSincronizacion(
        idOrden: number,
        idRemito: number,
        estadoOrden: number,
        estadoRemito: string,
        usuario: string
    ): Promise<OrdenRemitoEstado> {
        const repo = getRepository(OrdenRemitoEstado);
        
        const registro = new OrdenRemitoEstado();
        registro.id_orden = idOrden;
        registro.id_remito = idRemito;
        registro.estado_orden = estadoOrden;
        registro.estado_remito = estadoRemito;
        registro.fecha_sincronizacion = new Date();
        registro.usuario = usuario;

        return await repo.save(registro);
    }

    public async obtenerUltimaSincronizacion(
        idOrden: number,
        idRemito: number
    ): Promise<OrdenRemitoEstado | undefined> {
        const repo = getRepository(OrdenRemitoEstado);
        
        return await repo.findOne({
            where: { id_orden: idOrden, id_remito: idRemito },
            order: { fecha_sincronizacion: "DESC" }
        });
    }
}
