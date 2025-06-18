import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("productos_historico")
export class ProductoHistorico {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "IdProducto"})
    IdProducto: number

    @Column()
    Accion: string

    @Column()
    Usuario: string

    @Column()
    Fecha: Date

    @Column()
    Detalle: string
}
