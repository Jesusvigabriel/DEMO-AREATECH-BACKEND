import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("flota")
export class Chofer {
    @PrimaryGeneratedColumn({name: "numero"})
    Id: number

    @Column({name: "chofer"})
    Nombre: string

    @Column()
    Tarifa: number

    @Column()
    Patente: string

    @Column()
    Estado: string

    @Column()
    Categoria: string

    @Column()
    Disponible: string

    @Column()
    Peso: string
    
    @Column()
    Volumen: string

    @Column()
    GPS: string

}