import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm"
import { Guia } from "./Guia"
@Entity("fotos_por_planchada")

export class GuiaFoto {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "id_planchada"})
    IdGuia: number

    @ManyToOne( () => Guia)
    @JoinColumn({name: "id_planchada"})
    Guia: Guia

    @Column()
    Hash: string

}