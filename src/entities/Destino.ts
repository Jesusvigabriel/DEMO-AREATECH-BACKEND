import {Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne} from "typeorm"
import { Empresa } from "./Empresa"

@Entity("destinos")
export class Destino {
    @PrimaryGeneratedColumn()
    Id: number

    @Column()
    Nombre: string

    @Column({name: "direccion"})
    Domicilio: string

    @Column()
    Localidad: string

    @Column({name: "postal"})
    CodigoPostal: string

    @Column()
    Observaciones: string

    @Column({name: "empresa"})
    IdEmpresa: number

    @ManyToOne( () => Empresa)
    @JoinColumn({name: "empresa"})
    Empresa: Empresa

}