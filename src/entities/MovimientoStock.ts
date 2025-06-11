import {Entity, Column, PrimaryGeneratedColumn, AfterLoad, JoinColumn, ManyToOne, Timestamp} from "typeorm"
import { producto_getByIdAndEmpresa_DALC } from "../DALC/productos.dalc";

@Entity("movimientos")
export class MovimientosStock {
    @PrimaryGeneratedColumn()
    Id: number

    @Column()
    Orden: string

    @Column({name: "variacion"})
    IdProducto: number

    @Column()
    Unidades: number

    @Column()
    Tipo: number

    ValorDeclarado: number
    @AfterLoad()
    completarValorDeclarado = () => {
        this.ValorDeclarado=0
    }

    @Column({name: "id_empresa"})
    IdEmpresa: number

    @Column({name:"fecha"})
    Fecha: Date

    @Column()
    codprod: string

    @Column({name:"usuario"})
    Usuario: string

    @Column({name:"lote"})
    Lote: string


}