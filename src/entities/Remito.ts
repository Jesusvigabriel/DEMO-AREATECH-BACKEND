import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { PuntoVenta } from "./PuntoVenta";
import { Orden } from "./Orden";

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

    @Column({ name: "IdOrden" })
    IdOrden: number;

    @ManyToOne(() => Orden, { eager: true })
    @JoinColumn({ name: "IdOrden" })
    Orden: Orden;

    @Column({ name: "RemitoNumber" })
    RemitoNumber: string;

    @Column({ name: "Cai" })
    Cai: string;

    @Column({ name: "CaiVencimiento" })
    CaiVencimiento: Date;

    @Column({ name: "BarcodeValue" })
    BarcodeValue: string;

    @Column({ name: "TotalHojas" })
    TotalHojas: number;

    @Column({ nullable: true })
    Estado: string;

    @Column({ name: "usuario_creacion", length: 100, nullable: true })
    UsuarioCreacion: string;

    @CreateDateColumn({ name: "fecha_creacion", type: "timestamp" })
    FechaCreacion: Date;

    @Column({ name: "usuario_modificacion", length: 100, nullable: true })
    UsuarioModificacion: string;

    @UpdateDateColumn({ name: "fecha_modificacion", type: "timestamp", nullable: true })
    FechaModificacion: Date;
}
