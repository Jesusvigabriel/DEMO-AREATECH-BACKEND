import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("remitos_estados_historico")
export class RemitoEstadoHistorico {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column({ name: "IdRemito" })
    IdRemito: number;

    @Column()
    Estado: string;

    @Column()
    Usuario: string;

    @Column()
    Fecha: Date;
}
