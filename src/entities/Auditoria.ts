import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity("auditoria")
export class Auditoria {
    @PrimaryGeneratedColumn()
    Id: number

    @Column()
    Entidad: string

    @Column()
    IdRegistro: number

    @Column()
    Accion: string

    @Column()
    Usuario: string

    @Column()
    Fecha: Date
}
