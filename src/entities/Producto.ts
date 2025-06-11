import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, AfterLoad, getRepository, ManyToMany, ManyToOne, createQueryBuilder, getConnection} from "typeorm"
import {Stock} from '../entities/Stock'
import { OrdenDetalle } from "./OrdenDetalle"
import { Posicion } from "./Posicion"
import { PosicionProducto } from "./PosicionProducto"
import {ProductoPosicionado} from '../interfaces/ProductoPosicionado'

@Entity("productos")

export class Producto {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "empresa"})
    IdEmpresa: number

    @Column({name: "barrcode"})
    Barcode: string
    @AfterLoad()
    trimBarcode = async () => {
        this.Barcode=this.Barcode.trim()
    }

    @Column({name: "Descripcion"})
    Nombre: string

    @Column()
    CodeEmpresa: string

    Stock: number

    // Posiciones: Array<Object>
    // Posiciones: Array<{Nombre: String, Id: number, Unidades: number}>
    Posiciones: Array<ProductoPosicionado>

    StockPosicionado: number

    StockSinPosicionar: number

    StockComprometido: number

    StockDisponible: number 

    @AfterLoad()
    obtenerPosiciones = async () => {
        const stockFisico=await getRepository(Stock).findOne({Producto: this.Id})
        if (stockFisico!=null) {
            this.Stock=stockFisico?.Unidades!
        } else {
            this.Stock=0
        }

        const totalComprometido=await createQueryBuilder("orderdetalle", "det")
            .select("sum(unidades) as total")
            .innerJoin("ordenes", "ord", "det.ordenId = ord.Id")
            .where("det.productId = :idProducto", {idProducto: this.Id})
            .andWhere("ord.empresa = :idEmpresa", {idEmpresa: this.IdEmpresa})
            .andWhere("ord.estado = 1")
            .getRawOne()

        this.StockComprometido=totalComprometido.total==null ? 0 : parseInt(totalComprometido.total)
        this.StockDisponible=this.Stock - this.StockComprometido

        const posicionesOcupadas=await getRepository(PosicionProducto)
            .createQueryBuilder()
            .select("posicionId, sum(unidades * if(existe, -1, 1)) as total, asigned")
            .where("productId = :idProducto", {idProducto: this.Id})
            .andWhere("empresaId = :idEmpresa", {idEmpresa: this.IdEmpresa})
            .groupBy("posicionId")
            .having("total<>0")
            .orderBy("asigned","ASC")
            .getRawMany()
                
        const posiciones=[] 
        this.StockPosicionado=0
        for (const unaPosicionOcupada of posicionesOcupadas) {
            const posicion=await getRepository(Posicion).findOne({Id: unaPosicionOcupada.posicionId})
            // const unaPosicion={Id: posicion?.Id as number, Nombre: posicion?.Nombre as string, Unidades: unaPosicionOcupada.total}
            const unaPosicion: ProductoPosicionado = {Id: posicion?.Id as number, Nombre: posicion?.Nombre as string, Unidades: Number(unaPosicionOcupada.total), Fecha: unaPosicionOcupada.asigned as Date}
            posiciones.push(unaPosicion)
            this.StockPosicionado += parseInt(unaPosicionOcupada.total)
        }

        this.Posiciones=posiciones 
        this.StockSinPosicionar = stockFisico?.Unidades! - this.StockPosicionado
        //this.Stock = this.StockIncrustado.Unidades

        this.StockDisponible = this.Stock - this.StockComprometido
    }


    @Column({name: "Stock_Unitario"})
    StockUnitario: boolean
    
    @Column()
    Alto: number
    
    @Column()
    Ancho: number
    
    @Column()
    Largo: number
    
    @Column()
    Peso: number

    @Column()
    Precio: number
   
    @Column({name: "volumen"})
    Volumen: number

    BoxNumber: string
    
    Partida: string
    
    DeliveryBatch: string

    Bultos: number

    @Column({name: "unXcaja"})
    UnXCaja: number

    @Column({name: "usuarioAlta"})
    UsuarioAlta: string

    @Column({name: "usuarioModificacion"})
    UsuarioModificacion: string
    //PorCaja: number originalmente con este nombre pero no guardaba los datos

    /*
    @OneToOne( () => Stock, Stock => Stock.Producto, {eager: true})
    @JoinColumn({name: 'Id', referencedColumnName: 'Producto'})
    StockIncrustado: Stock
    */  
   
}