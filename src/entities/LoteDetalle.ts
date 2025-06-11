import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, AfterLoad, getRepository, createQueryBuilder} from "typeorm"
import { Producto } from "./Producto"
import { PosicionProducto } from "./PosicionProducto"
import { Posicion } from "./Posicion"
import { ProductoPosicionado } from "../interfaces/ProductoPosicionado"

@Entity("lote_detalle")

export class LoteDetalle {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: 'barcode'})
    Barcode: string

    @Column({name: 'idProducto'})
    IdProducto: number
   
    @Column({name: 'unidades'})
    Unidades: number
   
    @Column({name: 'descripcion'})
    Descripcion: string

    @Column({name: 'idPosicion'})
    IdPosicion: number

    @Column({name: 'lote'})
    Lote: string

    @Column({name: 'embarque'})
    Embarque: string
    
    @Column({name: 'idEmpresa'})
    IdEmpresa: number
    
    @Column({name: 'ingreso'})
    Ingreso: boolean

    @ManyToOne( () => Producto)
    @JoinColumn({name: "idProducto"})
    Producto: Producto

    Stock: number

    // Posiciones: Array<Object>
    // Posiciones: Array<{Nombre: String, Id: number, Unidades: number}>
    Posiciones: Array<ProductoPosicionado>

    StockPosicionado: number

    StockSinPosicionar: number

    StockComprometido: number

    StockDisponible: number 

    StockDisponibleTotal: number 

    StockPosicionadoDisponible: number

    PosProdPosicionId: number

    PartNumber: String
}
