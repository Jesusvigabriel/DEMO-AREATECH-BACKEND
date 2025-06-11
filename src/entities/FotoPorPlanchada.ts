import {Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne} from "typeorm"
import { Guia } from "./Guia"

@Entity("fotos_por_planchada")
export class FotoPorPlanchada {
    @PrimaryGeneratedColumn()
    Id: number

    @ManyToOne( () => Guia)
    @JoinColumn({name: "id_planchada"})
    Guia: Guia

    @Column()
    Hash: string

}