import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity("ordenes_auditoria")
export class OrdenAuditoria {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({ name: "ordenId" })
    IdOrden: number

    @Column()
    Accion: string

    @Column()
    Usuario: string

    @Column()
    Fecha: Date
}
