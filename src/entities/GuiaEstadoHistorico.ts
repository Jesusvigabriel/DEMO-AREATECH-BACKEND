import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("guias_estados_historico")
export class GuiaEstadoHistorico {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "IdGuia"})
    IdGuia: number

    @Column()
    Estado: string

    @Column()
    Usuario: string

    @Column()
    Fecha: Date
}
