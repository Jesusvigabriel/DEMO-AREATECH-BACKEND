import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("historico_pos_prod")

export class HistoricoPosiciones {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "empresaId"})
    IdEmpresa: number

    @Column({name: "posicionId"})
    IdPosicion: number

    @Column({name: "productId"})
    IdProducto: number

    @Column()
    Unidades: number

    @Column({name: "fecha_reposicion"})
    Fecha: Date
    
    @Column({name: "lote"})
    Lote: string
    
    @Column({name: "usuario"})
    Usuario: string
}