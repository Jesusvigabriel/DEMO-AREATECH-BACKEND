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

    @Column()
    Numero: string;

    @Column({ name: "nombre_fantasia" })
    NombreFantasia: string;

    @Column()
    Domicilio: string;

    @Column()
    Cai: string;

    @Column({ name: "cai_vencimiento" })
    CaiVencimiento: Date;

    @Column()
    Externo: boolean;

    @Column()
    Activo: boolean;
}
