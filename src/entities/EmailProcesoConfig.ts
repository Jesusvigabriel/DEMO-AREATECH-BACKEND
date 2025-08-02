import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity("email_proceso_config")
export class EmailProcesoConfig {
    @PrimaryGeneratedColumn()
    Id: number

    @Column()
    IdEmpresa: number

    @Column()
    Proceso: string

    @Column({ nullable: true })
    IdEmailServer: number

    @Column({ nullable: true })
    IdEmailTemplate: number

    @Column({ type: "text", nullable: true })
    Destinatarios: string

    @Column({ default: true })
    Activo: boolean

    @Column({ name: "UsuarioCreacion" })
    UsuarioCreacion: string

    @Column({ type: "datetime", name: "FechaCreacion" })
    FechaCreacion: Date

    @Column({ name: "UsuarioModificacion", nullable: true })
    UsuarioModificacion?: string

    @Column({ type: "datetime", name: "FechaModificacion", nullable: true })
    FechaModificacion?: Date
}
