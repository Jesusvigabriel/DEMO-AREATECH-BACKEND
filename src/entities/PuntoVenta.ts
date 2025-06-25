import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("puntos_venta")
export class PuntoVenta {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ name: "id_empresa" })
    IdEmpresa: number;

    @Column({ name: "es_interno" })
    EsInterno: boolean;

    @Column()
    Prefijo: string;

    @Column({ name: "last_sequence" })
    LastSequence: number;
}
