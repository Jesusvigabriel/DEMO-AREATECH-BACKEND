import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm"
import { Empresa } from "./Empresa"
import { Guia } from "./Guia"
@Entity("guias_rendiciones")

export class GuiaRendicion {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "id_empresa"})
    IdEmpresa: number

    Empresa: Empresa
    
    @Column({default: ''})
    Usuario: string

    Guias: Guia[]

}