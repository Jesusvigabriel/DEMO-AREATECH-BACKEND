import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Orden } from "./Orden";
import { Remito } from "./Remito";

@Entity("orden_remito_estados")
export class OrdenRemitoEstado {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ name: "id_orden" })
    id_orden: number;

    @ManyToOne(() => Orden)
    @JoinColumn({ name: "id_orden" })
    Orden: Orden;

    @Column({ name: "id_remito" })
    id_remito: number;

    @ManyToOne(() => Remito)
    @JoinColumn({ name: "id_remito" })
    Remito: Remito;

    @Column({ name: "estado_orden" })
    estado_orden: number;

    @Column({ name: "estado_remito", length: 50 })
    estado_remito: string;

    @Column({ name: "fecha_sincronizacion" })
    fecha_sincronizacion: Date;

    @Column({ length: 100 })
    usuario: string;
}
