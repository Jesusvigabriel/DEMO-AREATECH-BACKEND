import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("stock")

export class Stock {
    @PrimaryGeneratedColumn()
    Id: Number

    @Column()
    Producto: number

    @Column()
    Unidades: number

    @Column()
    Empresa: number
}