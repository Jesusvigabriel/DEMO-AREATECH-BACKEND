import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Empresa } from "./Empresa";
import { PuntoVenta } from "./PuntoVenta";
import { Orden } from "./Orden";
import { RemitoItem } from "./RemitoItem";

@Entity("remitos")
export class Remito {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ name: "empresa_id" })
    IdEmpresa: number;

    @ManyToOne(() => Empresa)
    @JoinColumn({ name: "empresa_id" })
    Empresa: Empresa;

    @Column({ name: "punto_venta_id" })
    IdPuntoVenta: number;

    @ManyToOne(() => PuntoVenta)
    @JoinColumn({ name: "punto_venta_id" })
    PuntoVenta: PuntoVenta;

    @Column()
    Fecha: Date;

    @Column({ name: "orden_id" })
    IdOrden: number;

    @ManyToOne(() => Orden, { eager: true })
    @JoinColumn({ name: "orden_id" })
    Orden: Orden;

    @OneToMany(() => RemitoItem, item => item.Remito)
    Items: RemitoItem[];

    @Column({ name: "remito_number" })
    RemitoNumber: string;

    @Column({ name: "cai" })
    Cai: string;

    @Column({ name: "cai_vencimiento" })
    CaiVencimiento: Date;

    @Column({ name: "barcode_value" })
    BarcodeValue: string;

    @Column({ name: "total_hojas" })
    TotalHojas: number;

    @Column({ nullable: true })
    Estado: string;

    @Column({ name: "usuario_creacion", length: 100, nullable: true })
    UsuarioCreacion: string;

    @CreateDateColumn({ name: "created_at", type: "timestamp" })
    FechaCreacion: Date;

    @Column({ name: "usuario_modificacion", length: 100, nullable: true })
    UsuarioModificacion: string;

    @UpdateDateColumn({ name: "fecha_modificacion", type: "timestamp", nullable: true })
    FechaModificacion: Date;
}
