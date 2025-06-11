import {Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne} from "typeorm"
import { Empresa } from "./Empresa"

@Entity("localidades")
export class Localidad {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "localidad"})
    Nombre: string

    @Column({name: "cp"})
    CodigoPostal: number

}