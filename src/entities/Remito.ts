import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { PuntoVenta } from "./PuntoVenta";

@Entity("remitos")
export class Remito {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ name: "id_empresa" })
    IdEmpresa: number;

    @ManyToOne(() => Empresa)
    @JoinColumn({ name: "id_empresa" })
    Empresa: Empresa;

    @Column({ name: "id_punto_venta" })
    IdPuntoVenta: number;

    @ManyToOne(() => PuntoVenta)
    @JoinColumn({ name: "id_punto_venta" })
    PuntoVenta: PuntoVenta;

    @Column()
    Numero: string;

    @Column()
    Fecha: Date;
}
