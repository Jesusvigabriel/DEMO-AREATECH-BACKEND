import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("posiciones_por_orderdetalle")

export class PosicionEnOrdenDetalle {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "id_posicion"})
    IdPosicion: number

    @Column({name: "id_orderdetalle"})
    IdOrdenDetalle: number

    @Column()
    Cantidad: number

    @Column({name: "id_producto"})
    IdProducto: number

    @Column({name: "id_empresa"})
    IdEmpresa: number

}