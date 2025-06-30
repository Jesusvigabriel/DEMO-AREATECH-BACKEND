import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Remito } from "./Remito";
import { Orden } from "./Orden";

@Entity("remito_items")
export class RemitoItem {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ name: "remito_id" })
    IdRemito: number;

    @ManyToOne(() => Remito)
    @JoinColumn({ name: "remito_id" })
    Remito: Remito;

    @Column({ name: "orden_id" })
    IdOrden: number;

    @ManyToOne(() => Orden)
    @JoinColumn({ name: "orden_id" })
    Orden: Orden;

    @Column({ name: "code_empresa" })
    CodeEmpresa: string;

    @Column()
    Cantidad: number;

    @Column()
    Importe: number;

    @Column()
    Barcode: string;

    @Column({ name: "despacho_plaza" })
    DespachoPlaza: string;

    @Column()
    Partida: string;
}
