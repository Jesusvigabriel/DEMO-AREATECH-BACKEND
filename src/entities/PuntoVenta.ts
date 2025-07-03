import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("puntos_venta")
export class PuntoVenta {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ name: "empresa_id" })
    IdEmpresa: number;

    @Column({ name: "externo" })
    Externo: boolean;


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
    Activo: boolean;
}
