import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("stock")

export class Stock {
    @PrimaryGeneratedColumn()
    Id: number

    @Column()
    Producto: number

    @Column()
    Unidades: number

    @Column()
    Empresa: number
}