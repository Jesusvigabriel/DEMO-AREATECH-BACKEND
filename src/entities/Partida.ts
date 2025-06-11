import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, AfterLoad, getRepository, ManyToMany, ManyToOne, createQueryBuilder, getConnection} from "typeorm"
import {Stock} from '../entities/Stock'
import { OrdenDetalle } from "./OrdenDetalle"
import { Posicion } from "./Posicion"
import { PosicionProducto } from "./PosicionProducto"
import {ProductoPosicionado} from '../interfaces/ProductoPosicionado'


@Entity("partidas")

export class Partida {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "idEmpresa"})
    IdEmpresa: number

    @Column({name: "numeroPartida"})
    Partida: string

    @Column({name: "idProducto"})
    IdProducto: number

    @Column({name: "fechaCreacion"})
    Fecha: Date

    @Column({name: "unidades"})
    Stock: number
    
    @Column({name: "usuarioAlta"})
    Usuario: string

    StockPosicionado: number

    StockSinPosicionar: number

    StockComprometido: number

    StockDisponible: number 

    Posiciones: Array<ProductoPosicionado>

    Nombre: string

    Alto: string

    Ancho: string

    Barcode: string

    Largo: string

    Peso: string

    UnxCaja: string

    @AfterLoad()
    obtenerPosiciones = async () => {

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
        this.StockSinPosicionar = this.Stock - this.StockPosicionado

        this.StockDisponible = this.Stock - this.StockComprometido
        console.log(this.IdProducto)
        const datos = await createQueryBuilder("partidas","part")
        .select("part.id, part.idEmpresa as IdEmpresa, prod.barrCode as Barcode, prod.descripcion as Nombre, prod.alto as Alto, prod.ancho as Ancho, prod.largo as Largo, prod.peso as Peso, prod.unXcaja as UnXCaja")
        .innerJoin("productos", "prod", "part.idProducto = prod.id")
        .where("part.idEmpresa = :idEmpresa", {idEmpresa: this.IdEmpresa})
        .where("part.idProducto = :idProducto", {idProducto: this.IdProducto})
        .execute()
        console.log(datos)
            this.Alto = datos[0].Alto
            this.Ancho = datos[0].Ancho
            this.Largo = datos[0].Largo
            this.Peso = datos[0].Peso
            this.Barcode = datos[0].Barcode
            this.Nombre = datos[0].Nombre
            this.UnxCaja = datos[0].UnxCaja
        
    }
}