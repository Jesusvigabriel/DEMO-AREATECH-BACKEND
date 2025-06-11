import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm"
import { Orden } from "./Orden"

@Entity("bultosorden")
export class OrdenBultos {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "ordenId"})
    IdOrden: string

    @Column({name: "empresa"})
    IdEmpresa: number

    @ManyToOne( () => Orden)
    @JoinColumn({name: "ordenId"})
    Orden: Orden

    @Column()
    Bultos: number


}