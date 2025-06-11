import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("posiciones")

export class Posicion {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "descripcion"})
    Nombre: string

    @Column({name: "fecha_inventario"})
    FechaInventario: string

    @Column({name: "usuario_inventario"})
    UsuarioInventario: string
}