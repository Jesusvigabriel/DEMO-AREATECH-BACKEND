import {Entity, Column, PrimaryGeneratedColumn, getRepository, JoinColumn, ManyToOne} from "typeorm"
import { LoteDetalle } from "./LoteDetalle"

@Entity("lote")

export class Lote {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: 'embarque'})
    Embarque: string

    @Column({name: 'lote'})
    Lote: string
   
    @Column({name: 'unidades'})
    Unidades: number
   
    @Column({name: 'ingreso'})
    Ingreso: boolean

    @Column({name: 'idEmpresa'})
    IdEmpresa: number

    StockDisponible: number
    
    Stock: number

    StockComprometido: number

    SerialNumber: string

    PartNumber: string

}
