import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("ordenes_estados_historico")
export class OrdenEstadoHistorico {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "ordenId"})
    IdOrden: number

    @Column()
    Estado: number

    @Column()
    Usuario: string

    @Column()
    Fecha: Date
}
