import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne} from "typeorm"
import { Orden } from "./Orden"
import { Producto } from "./Producto"

@Entity("orderdetalle")
export class OrdenDetalle {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "ordenId"})
    IdOrden: number

    @ManyToOne( () => Orden)
    @JoinColumn({name: "ordenId"})
    Orden: Orden

    @Column({name: "productId"})
    IdProducto: number

    @OneToOne( () => Producto)
    @JoinColumn({name: 'productId'})
    Producto: Producto

    @Column()
    Unidades: number

    @Column()
    Precio: number
    
    @Column({name: "lote"})
    Lote: string
    
    @Column({name: "loteCompleto"})
    LoteCompleto: boolean


}